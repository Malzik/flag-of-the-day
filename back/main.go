package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"golang.org/x/text/unicode/norm"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"
	"unicode"
)

// Flag represents the structure of a flag
type Flag struct {
	Code  string            `json:"code"`
	Image string            `json:"image"`
	Names map[string]string `json:"name"`
	Hints map[string]string `json:"hints"`
}

// GuessRequest represents the structure of the incoming JSON payload for the guess endpoint
type GuessRequest struct {
	CurrentStep int    `json:"step"`
	Try         int    `json:"try"`
	Guess       string `json:"name"`
	Lang        string `json:"lang"`
}

// GuessResponse represents the structure of the JSON response
type GuessResponse struct {
	CorrectGuess bool    `json:"correctGuess"`
	Hint         *string `json:"hint,omitempty"`
}

// StartGuessResponse represents the structure of the JSON response
type StartGuessResponse struct {
	Images []string `json:"images"`
}

// Flags slice to store the flags loaded from the JSON file
var Flags []Flag

func init() {
	// Load flags from the JSON file at program startup
	loadFlags()
}

func loadFlags() {
	// Read the contents of the flags.json file
	fileContent, err := ioutil.ReadFile("flags.json")
	if err != nil {
		fmt.Println("Error reading flags.json:", err)
		return
	}

	// Unmarshal the JSON content into the Flags slice
	err = json.Unmarshal(fileContent, &Flags)
	if err != nil {
		fmt.Println("Error unmarshaling flags.json:", err)
		return
	}
}

// DrawThreeRandomFlags selects three random flags from the loaded flags
func DrawThreeRandomFlags() []Flag {
	// Seed the random number generator
	rand.Seed(time.Now().UnixNano())

	// Make a copy of the Flags slice to avoid modifying the original slice
	copiedFlags := make([]Flag, len(Flags))
	copy(copiedFlags, Flags)

	// Shuffle the copiedFlags slice using the Fisher-Yates algorithm
	for i := range copiedFlags {
		j := rand.Intn(i + 1)
		copiedFlags[i], copiedFlags[j] = copiedFlags[j], copiedFlags[i]
	}

	// Take the first three flags from the shuffled slice
	return copiedFlags[:3]
}

func AppendCSV(filename string, flags []Flag) error {
	file, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	currentDate := time.Now().Format("2006-01-02")
	row := []string{currentDate}

	flagsJSON, err := json.Marshal(flags)
	if err != nil {
		return err
	}

	row = append(row, string(flagsJSON))

	err = writer.Write(row)
	if err != nil {
		return err
	}

	fmt.Printf("New line for %s as been inserted\n", currentDate)
	return nil
}

// CheckIfFlagsExistForToday checks if flags for the current date have already been saved
func CheckIfFlagsExistForToday(filename string) ([]Flag, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// Créer un reader CSV à partir du fichier
	reader := csv.NewReader(file)

	// Lire toutes les lignes du fichier
	allRows, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	var flags []Flag
	// Iterate over each line
	for _, line := range allRows {
		if len(line) == 0 {
			continue
		}
		// Extract the date from the line
		dateString := strings.TrimSpace(line[0])

		// Parse the date string
		date, err := time.Parse("2006-01-02", dateString)
		if err != nil {
			continue // Skip lines that don't have a valid date
		}

		// Check if the date is today
		today := time.Now().Format("2006-01-02") == date.Format("2006-01-02")
		if today {
			// Extract the flags from the line
			flagsJSON := line[1]
			err := json.Unmarshal([]byte(flagsJSON), &flags)
			if err != nil {
				return nil, err
			}

			return flags, nil
		}
	}

	if len(flags) == 0 {
		// Flags for today do not exist, so draw three new flags and save them
		flags := DrawThreeRandomFlags()
		fmt.Println("Random Flags:", flags)

		err := AppendCSV("drawn_flags.csv", flags)
		if err != nil {
			fmt.Println("Error saving flags to file:", err)
			return nil, err
		}
	}

	return flags, nil
}

func handleStartGuess(c *gin.Context) {
	// Check if flags for today already exist
	flags, err := CheckIfFlagsExistForToday("drawn_flags.csv")
	if err != nil {
		fmt.Println("Error checking if flags exist for today:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	var images []string
	for _, flag := range flags {
		images = append(images, flag.Image)
	}
	response := StartGuessResponse{Images: images}
	c.JSON(http.StatusOK, response)
}

func handleGuess(c *gin.Context) {
	// Check if flags for today already exist
	flags, err := CheckIfFlagsExistForToday("drawn_flags.csv")
	if err != nil {
		fmt.Println("Error checking if flags exist for today:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	// Parse the JSON request body
	var guessRequest GuessRequest
	if err := c.ShouldBindJSON(&guessRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}

	currentFlag := flags[guessRequest.CurrentStep]

	// Perform the logic to check if the guess is correct
	isCorrect := checkGuess(currentFlag, guessRequest.Guess, guessRequest.Lang)

	// Prepare the response
	response := GuessResponse{CorrectGuess: isCorrect, Hint: getHint(currentFlag, guessRequest.Lang, guessRequest.Try)}
	c.JSON(http.StatusOK, response)
}

func checkGuess(flag Flag, guess string, lang string) bool {
	// Implement your logic to check if the guess is correct
	// This is a placeholder implementation, replace it with your actual logic
	return cleanAndCapitalize(flag.Names[lang]) == cleanAndCapitalize(guess)
}

func getHint(flag Flag, lang string, try int) *string {
	var hint *string
	switch try {
	case 1:
		region := flag.Hints["region"]
		hint = &region
	case 2:
		str := []string{flag.Hints["code"], flag.Hints["symbol"]}
		joined := strings.Join(str, " ")
		hint = &joined
	case 3:
		capital := flag.Hints["capital"]
		hint = &capital
	case 4:
		name := flag.Names[lang][0:1]
		hint = &name
	}
	return hint
}

func cleanAndCapitalize(input string) string {
	normalized := norm.NFD.String(input)

	// Remove non-letter characters and capitalize the string
	var cleanedGuess strings.Builder
	for _, char := range normalized {
		if unicode.IsLetter(char) {
			cleanedGuess.WriteRune(char)
		}
	}

	// Capitalize the guess
	return strings.ToLower(cleanedGuess.String())
}

func main() {
	csvFile, err := os.OpenFile("access.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("failed creating file: %s", err)
	}
	csvFile.Close()
	// Create a new Gin router
	r := gin.Default()

	r.SetTrustedProxies([]string{"localhost:3000", "http://flag-of-the-day.localhost", "flag-of-the-day.localhost"})
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Next()
	})

	r.OPTIONS("/*any", func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Status(204)
	})

	// Define the /guess endpoint
	r.GET("/api/startGuess", handleStartGuess)

	// Define the /guess endpoint
	r.POST("/api/guess", handleGuess)

	// Start the HTTP server on port 8080
	r.Run(":8082")
}

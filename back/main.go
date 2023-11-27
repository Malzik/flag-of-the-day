package main

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"golang.org/x/text/unicode/norm"
	"io/ioutil"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"
	"unicode"
)

// Flag represents the structure of a flag
type Flag struct {
	Image string `json:"image"`
	Name  string `json:"name"`
}

// GuessRequest represents the structure of the incoming JSON payload for the guess endpoint
type GuessRequest struct {
	CurrentStep int    `json:"step"`
	Guess       string `json:"name"`
}

// GuessResponse represents the structure of the JSON response
type GuessResponse struct {
	CorrectGuess bool `json:"correctGuess"`
}

// GuessResponse represents the structure of the JSON response
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

// SaveFlagsToFile saves the drawn flags and the date to a text file
func SaveFlagsToFile(flags []Flag, filename string) error {
	// Open the file for writing, creating it if it doesn't exist
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	// Write the date to the file
	_, err = file.WriteString(time.Now().Format("2006-01-02") + ",")
	if err != nil {
		return err
	}

	// Marshal the flags to JSON
	flagsJSON, err := json.Marshal(flags)
	if err != nil {
		return err
	}

	// Write the flags as JSON to the file
	_, err = file.Write(flagsJSON)
	if err != nil {
		return err
	}

	return nil
}

// CheckIfFlagsExistForToday checks if flags for the current date have already been saved
func CheckIfFlagsExistForToday(filename string) ([]Flag, error) {
	fileContent, err := ioutil.ReadFile(filename)
	if err != nil {
		// If the file doesn't exist, treat it as if flags for today do not exist
		return nil, nil
	}

	// Split the file content into lines
	lines := strings.Split(string(fileContent), "\n")

	var flags []Flag
	// Iterate over each line
	for _, line := range lines {
		if len(line) == 0 {
			continue
		}
		// Extract the date from the line
		dateString := strings.TrimSpace(line[:10])

		// Parse the date string
		date, err := time.Parse("2006-01-02", dateString)
		if err != nil {
			continue // Skip lines that don't have a valid date
		}

		// Check if the date is today
		today := time.Now().Format("2006-01-02") == date.Format("2006-01-02")
		if today {
			// Extract the flags from the line
			flagsJSON := line[11:]
			err := json.Unmarshal([]byte(flagsJSON), &flags)
			if err != nil {
				return nil, err
			}

			return flags, nil
		}
	}

	print(flags)
	if len(flags) == 0 {
		// Flags for today do not exist, so draw three new flags and save them
		flags := DrawThreeRandomFlags()
		fmt.Println("Random Flags:", flags)

		err := SaveFlagsToFile(flags, "drawn_flags.txt")
		if err != nil {
			fmt.Println("Error saving flags to file:", err)
			return nil, err
		}
	}

	return flags, nil
}

func handleStartGuess(c *gin.Context) {
	// Check if flags for today already exist
	flags, err := CheckIfFlagsExistForToday("drawn_flags.txt")
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
	flags, err := CheckIfFlagsExistForToday("drawn_flags.txt")
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

	// Perform the logic to check if the guess is correct
	isCorrect := checkGuess(flags, guessRequest.CurrentStep, guessRequest.Guess)

	// Prepare the response
	response := GuessResponse{CorrectGuess: isCorrect}
	c.JSON(http.StatusOK, response)
}

func checkGuess(flags []Flag, step int, guess string) bool {
	// Implement your logic to check if the guess is correct
	// This is a placeholder implementation, replace it with your actual logic
	return cleanAndCapitalize(flags[step].Name) == cleanAndCapitalize(guess)
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
	// Create a new Gin router
	r := gin.Default()

	r.SetTrustedProxies([]string{"localhost:3000"})
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Next()
	})

	r.OPTIONS("/*any", func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Status(204)
	})

	// Define the /guess endpoint
	r.GET("/startGuess", handleStartGuess)

	// Define the /guess endpoint
	r.POST("/guess", handleGuess)

	// Start the HTTP server on port 8080
	r.Run(":8080")
}

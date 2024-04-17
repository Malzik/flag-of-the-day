package main

import (
	"back/config"
	"back/game"
	"back/model"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"
)

// GuessRequest represents the structure of the incoming JSON payload for the guess endpoint
type GuessRequest struct {
	PlayerId string `json:"id"`
	Date     string `json:"date"`
	Guess    string `json:"name"`
	Lang     string `json:"lang"`
}

type ProfileResponse struct {
	Id     string `json:"id"`
	Streak int    `json:"streak"`
}

type GuessResponse struct {
	CorrectGuess bool     `json:"correctGuess"`
	Hint         []string `json:"hint,omitempty"`
	Tries        int      `json:"tries"`
	Win          string   `json:"win"`
}

type StartGuessResponse struct {
	Images     []string `json:"images"`
	Hint       []string `json:"hint,omitempty"`
	IsFinished string   `json:"isFinished,omitempty"`
}

var Flags []model.Flag
var db gorm.DB

func handleProfile(c *gin.Context) {
	var player model.Player
	playerId := c.Query("id")
	if len(playerId) != 0 {
		db.Where("id = ?", playerId).First(&player)
	}
	if player == (model.Player{}) {
		playerId = uuid.New().String()
		db.Create(model.Player{Id: playerId, Streak: 0})
	}
	response := ProfileResponse{Id: playerId, Streak: player.Streak}
	c.JSON(http.StatusOK, response)
}

// DrawThreeRandomFlags selects three random flags from the loaded flags
func DrawThreeRandomFlags() []model.Flag {
	// Seed the random number generator
	rand.Seed(time.Now().UnixNano())

	// Make a copy of the Flags slice to avoid modifying the original slice
	copiedFlags := make([]model.Flag, len(Flags))
	copy(copiedFlags, Flags)

	// Shuffle the copiedFlags slice using the Fisher-Yates algorithm
	for i := range copiedFlags {
		j := rand.Intn(i + 1)
		copiedFlags[i], copiedFlags[j] = copiedFlags[j], copiedFlags[i]
	}

	// Take the first three flags from the shuffled slice
	return copiedFlags[:3]
}

// CheckIfFlagsExistForToday checks if flags for the current date have already been saved
func CheckIfFlagsExistForToday(currentDate string) ([]model.Flag, error) {
	var game model.Game
	if err := db.Preload("Flags").Where("DATE(date) = ?", currentDate).First(&game).Error; err != nil {
		// Flags for today do not exist, so draw three new flags and save them
		flags := DrawThreeRandomFlags()
		fmt.Println("Random Flags:", flags)

		game = model.Game{Date: time.Now()}

		for index, flag := range flags {
			drawFlag := model.DrawFlags{
				Code: flag.Code,
				Step: index,
			}
			game.Flags = append(game.Flags, drawFlag)
		}

		db.Create(&game)
	}

	var flags []model.Flag

	db.Raw(`
		SELECT f.* FROM flags f
		JOIN draw_flags df ON f.code = df.code
		WHERE df.game_id = ?
	`, game.Id).Scan(&flags)

	return flags, nil
}

func handleDate(currentDate string) string {
	if len(currentDate) != 0 {
		date, err := time.Parse("2006-01-02", currentDate)
		if err == nil {
			return date.Format("2006-01-02")
		}
	}
	return time.Now().Format("2006-01-02")
}

func handleStartGuess(c *gin.Context) {
	playerId := c.Query("id")
	lang := c.Query("lang")
	player, playerError := game.CheckPlayer(db, playerId)
	if playerError != nil {
		c.JSON(playerError.Status, gin.H{"error": playerError.Message})
		return
	}
	currentDate := handleDate(c.Query("date"))
	// Check if flags for today already exist
	flags, err := CheckIfFlagsExistForToday(currentDate)
	if err != nil {
		fmt.Println("Error checking if flags exist for today:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	var images []string
	for _, flag := range flags {
		images = append(images, flag.Image)
	}
	isFinished := game.CheckIfGameFinished(db, *player, currentDate)
	response := StartGuessResponse{Images: images, Hint: game.HandleStartGuess(db, flags, *player, game.GetLang(lang), currentDate), IsFinished: isFinished}
	c.JSON(http.StatusOK, response)
}

func handleGuess(c *gin.Context) {
	// Parse the JSON request body
	var guessRequest GuessRequest
	if err := c.ShouldBindJSON(&guessRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}
	player, playerError := game.CheckPlayer(db, guessRequest.PlayerId)
	if playerError != nil {
		c.JSON(playerError.Status, gin.H{"error": playerError.Message})
		return
	}
	if len(guessRequest.Date) == 0 {
		guessRequest.Date = time.Now().Format("2006-01-02")
	}
	// Check if flags for today already exist
	flags, err := CheckIfFlagsExistForToday(guessRequest.Date)
	if err != nil {
		fmt.Println("Error checking if flags exist for today:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	// Prepare the response
	isCorrect, hint, tries := game.HandleGuess(db, flags, guessRequest.Guess, game.GetLang(guessRequest.Lang), guessRequest.Date, *player)
	response := GuessResponse{CorrectGuess: isCorrect, Hint: hint, Tries: tries}
	c.JSON(http.StatusOK, response)
}

func main() {
	db = config.Db()
	db.Preload("Names").Preload("Hints").Find(&Flags)

	//Perform database migration
	err := db.AutoMigrate(&model.Flag{}, &model.FlagName{}, &model.FlagHints{}, &model.Game{}, &model.DrawFlags{}, &model.Player{}, &model.PlayerGame{}, &model.PlayerGuesses{})
	if err != nil {
		log.Fatal(err)
	}

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

	r.GET("/api/profile", handleProfile)
	r.GET("/api/startGuess", handleStartGuess)

	r.POST("/api/guess", handleGuess)

	// Start the HTTP server on port 8080
	r.Run(":8082")
}

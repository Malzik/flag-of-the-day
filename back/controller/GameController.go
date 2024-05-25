package controller

import (
	"back/model"
	"back/service"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type GuessRequest struct {
	PlayerId string `json:"id"`
	Date     string `json:"date"`
	Guess    string `json:"name"`
	Lang     string `json:"lang"`
}

type GameController struct {
	gameService   *service.GameService
	playerService *service.PlayerService
}

func NewGameController(flags []model.Flag) *GameController {
	return &GameController{
		gameService:   service.NewGameService(flags),
		playerService: service.NewPlayerService(),
	}
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

func GetLang(lang string) string {
	if lang != "" {
		return lang
	}
	return "en"
}

func (co *GameController) HandleStartGuess(c *gin.Context) {
	playerId := c.Query("id")
	if len(playerId) == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No playerId provided"})
		return
	}
	lang := c.Query("lang")
	player, playerError := co.playerService.CheckPlayer(playerId)
	if playerError != nil {
		c.JSON(playerError.Status, gin.H{"error": playerError.Message})
		return
	}
	currentDate := handleDate(c.Query("date"))

	startGuessResponse := co.gameService.HandleStartGuess(*player, GetLang(lang), currentDate)

	c.JSON(http.StatusOK, startGuessResponse)
}

func (co *GameController) HandleGuess(c *gin.Context) {
	var guessRequest GuessRequest
	if err := c.ShouldBindJSON(&guessRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}
	player, playerError := co.playerService.CheckPlayer(guessRequest.PlayerId)
	if playerError != nil {
		c.JSON(playerError.Status, gin.H{"error": playerError.Message})
		return
	}
	guessRequest.Date = handleDate(guessRequest.Date)

	guess := co.gameService.HandleGuess(guessRequest.Date, guessRequest.Guess, guessRequest.Lang, *player)
	if guess.IsFinished == "WIN" || guess.IsFinished == "LOOSE" {
		c.JSON(http.StatusOK, model.GuessResponse{
			CorrectGuess: guess.CorrectGuess,
			IsFinished:   guess.IsFinished,
			Answers:      guess.Answers,
			Points:       guess.Points,
		})
		return
	}
	c.JSON(http.StatusOK, model.GuessResponse{
		CorrectGuess: guess.CorrectGuess,
		Hint:         guess.Hint,
		Tries:        guess.Tries,
		Points:       guess.Points,
	})
	return
}

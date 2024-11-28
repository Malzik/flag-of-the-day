package controller

import (
	"back/model"
	"back/service"
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"google.golang.org/api/idtoken"
)

type UpdateNameRequest struct {
	PlayerId string `json:"id"`
	Name     string `json:"name"`
}

type PlayerController struct {
	playerService *service.PlayerService
}

type TokenRequest struct {
	User struct {
		Credential string `json:"credential"`
	} `json:"user"`
	Id string `json:"id"`
}

func NewPlayerController() *PlayerController {
	return &PlayerController{playerService: service.NewPlayerService()}
}

func (co *PlayerController) HandleProfile(c *gin.Context) {
	player := co.playerService.FindById(c.Query("id"))
	history := co.playerService.GetHistory(player)
	response := model.ProfileResponse{
		Id:              player.Id,
		Streak:          player.Streak,
		Points:          player.Points,
		Name:            player.Name,
		History:         history,
		IsGoogleAccount: player.GoogleId != nil,
	}
	c.JSON(http.StatusOK, response)
}

func (co *PlayerController) HandleUpdateName(c *gin.Context) {
	var updateNameRequest UpdateNameRequest
	if err := c.ShouldBindJSON(&updateNameRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}
	player, playerError := co.playerService.CheckPlayer(updateNameRequest.PlayerId)
	if playerError != nil {
		c.JSON(playerError.Status, gin.H{"error": playerError.Message})
		return
	}

	player = co.playerService.UpdateName(player, updateNameRequest.Name)

	c.JSON(http.StatusOK, gin.H{"name": player.Name})
}

func (co *PlayerController) HandleGoogleLoginToken(c *gin.Context) {
	var tokenData TokenRequest
	if err := c.ShouldBindJSON(&tokenData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	payload, err := idtoken.Validate(context.Background(), tokenData.User.Credential, os.Getenv("GOOGLE_CLIENT_ID"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err})
		return
	}

	// Extract user information from the payload
	googleID := payload.Subject
	googlePlayer := co.playerService.FindByGoogleId(googleID)
	if googlePlayer != nil {
		fmt.Println(googlePlayer.Id)
		c.JSON(http.StatusOK, gin.H{
			"playerId": googlePlayer.Id,
		})
		return
	}
	player := co.playerService.FindById(tokenData.Id)
	player.GoogleId = &googleID
	co.playerService.UpdatePlayer(&player)

	c.JSON(http.StatusOK, gin.H{
		"playerId": player.GoogleId,
	})
}

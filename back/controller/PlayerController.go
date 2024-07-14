package controller

import (
	"back/model"
	"back/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UpdateNameRequest struct {
	PlayerId string `json:"id"`
	Name     string `json:"name"`
}

type PlayerController struct {
	playerService *service.PlayerService
}

func NewPlayerController() *PlayerController {
	return &PlayerController{playerService: service.NewPlayerService()}
}

func (co *PlayerController) HandleProfile(c *gin.Context) {
	player := co.playerService.FindById(c.Query("id"))
	history := co.playerService.GetHistory(player)
	response := model.ProfileResponse{
		Id:      player.Id,
		Streak:  player.Streak,
		Points:  player.Points,
		Name:    player.Name,
		History: history,
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

package controller

import (
	"back/model"
	"back/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

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
		History: history,
	}
	c.JSON(http.StatusOK, response)
}

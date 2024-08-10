package controller

import (
	"back/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type LeaderboardController struct {
	leaderboardService *service.LeaderboardService
}

func NewLeaderboardController() *LeaderboardController {
	return &LeaderboardController{leaderboardService: service.NewLeaderboardService()}
}

func (co *LeaderboardController) HandleLeaderboard(c *gin.Context) {
	playerId := c.Query("id")
	response := co.leaderboardService.GetLeaderboard(playerId)
	c.JSON(http.StatusOK, response)
}

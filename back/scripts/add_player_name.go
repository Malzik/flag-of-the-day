package main

import (
	"back/config"
	"back/model"
	"fmt"
	"gorm.io/gorm"
	"math/rand"
)

func main() {
	db := config.Db()
	updatePlayerName(db)

	updateLongestStreak(db)
}

func updatePlayerName(db *gorm.DB) {
	var players []model.Player
	db.Where("name is null").Find(&players)
	for _, player := range players {
		playerName := "Player"
		for i := 0; i < 4; i++ {
			playerName += fmt.Sprintf("%d", rand.Intn(10))
		}
		player.Name = playerName
		db.Save(&player)
	}
}

func updateLongestStreak(db *gorm.DB) {
	var players []model.Player
	db.Find(&players)

	for _, player := range players {
		var playerGames []model.PlayerGame
		db.Joins("JOIN games on games.id = player_games.game_id").Where("player_id = ?", player.Id).Order("games.date desc").Find(&playerGames)
		currentStreak := 0
		longestStreak := 0

		for _, game := range playerGames {
			if game.IsWin == "WIN" {
				currentStreak++
				if currentStreak > longestStreak {
					longestStreak = currentStreak
				}
			} else {
				currentStreak = 0
			}
		}

		player.LongestStreak = longestStreak
		db.Save(&player)
	}
}

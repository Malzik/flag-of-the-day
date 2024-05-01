package game

import (
	"back/model"
	"errors"
	"gorm.io/gorm"
	"net/http"
)

type PlayerError struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
}

func CheckPlayer(db gorm.DB, playerId string) (*model.Player, *PlayerError) {
	if len(playerId) == 0 {
		return nil, &PlayerError{Status: http.StatusUnauthorized, Message: "No playerId provided"}
	}

	var player model.Player
	if err := db.Where("id = ?", playerId).First(&player).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, &PlayerError{Status: http.StatusUnauthorized, Message: "No player found"}
		}
		return nil, &PlayerError{Status: http.StatusInternalServerError, Message: "Database error"}
	}
	return &player, nil
}

func GetLang(lang string) string {
	if lang != "" {
		return lang
	}
	return "en"
}

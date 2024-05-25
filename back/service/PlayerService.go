package service

import (
	"back/config"
	"back/model"
	"back/repository"
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"net/http"
)

type PlayerService struct {
	playerRepository *repository.PlayerRepository
}

func NewPlayerService() *PlayerService {
	return &PlayerService{playerRepository: repository.NewPlayerRepository(config.Db())}
}

func (s *PlayerService) FindById(playerId string) model.Player {
	print("playerId: ", playerId)
	if len(playerId) != 0 {
		player, err := s.playerRepository.GetPlayer(playerId)
		if err == nil {
			return *player
		}
	}
	playerId = uuid.New().String()
	return s.playerRepository.AddPlayer(playerId)
}

func (s *PlayerService) CheckPlayer(playerId string) (*model.Player, *model.PlayerError) {
	player, err := s.playerRepository.GetPlayer(playerId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, &model.PlayerError{Status: http.StatusUnauthorized, Message: "player_not_found"}
		}
		return nil, &model.PlayerError{Status: http.StatusInternalServerError, Message: "database_error"}
	}
	return player, nil
}

func (s *PlayerService) GetHistory(player model.Player) []model.History {
	playerGames := s.playerRepository.GetPlayerGames(player, 3)
	var history []model.History
	for _, playerGame := range playerGames {
		game := s.playerRepository.GetGame(playerGame.GameId)
		drawFlags := s.playerRepository.GetDrawFlags(game.Id)
		playerGuesses := s.playerRepository.GetPlayerGuesses(playerGame.Id)

		var historyFlags []model.HistoryFlag
		points := 0
		for _, drawFlag := range drawFlags {
			var guesses []string
			for _, guess := range playerGuesses {
				if guess.Step == drawFlag.Step {
					json.Unmarshal([]byte(guess.Guesses), &guesses)
					break
				}
			}
			if playerGame.IsWin == "WIN" {
				points += 6 - len(guesses)
			}
			historyFlags = append(historyFlags, model.HistoryFlag{Flag: drawFlag.Flag.Image, Tries: len(guesses)})
		}
		history = append(history, model.History{Result: playerGame.IsWin, Date: game.Date, Points: points, Flags: historyFlags})
	}
	return history
}

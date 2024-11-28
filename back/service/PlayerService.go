package service

import (
	"back/config"
	"back/model"
	"back/repository"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"math/rand"
	"net/http"
	"time"
)

type PlayerService struct {
	playerRepository *repository.PlayerRepository
}

func NewPlayerService() *PlayerService {
	return &PlayerService{playerRepository: repository.NewPlayerRepository(config.Db())}
}

func (s *PlayerService) FindById(playerId string) model.Player {
	if len(playerId) != 0 {
		player, err := s.playerRepository.GetPlayer(playerId)
		if err == nil {
			return *player
		}
	}
	playerId = uuid.New().String()
	rand.Seed(time.Now().UnixNano())
	playerName := "Player"
	for i := 0; i < 4; i++ {
		playerName += fmt.Sprintf("%d", rand.Intn(10))
	}
	return s.playerRepository.AddPlayer(playerId, playerName)
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

func (s *PlayerService) UpdateName(player *model.Player, name string) *model.Player {
	player.Name = name
	s.playerRepository.UpdatePlayer(player)
	return player
}

func (s *PlayerService) FindByGoogleId(googleId string) *model.Player {
	player, err := s.playerRepository.GetPlayerByGoogleId(googleId)
	if err != nil {
		return nil
	}
	return player
}

func (s *PlayerService) UpdatePlayer(player *model.Player) *model.Player {
	s.playerRepository.UpdatePlayer(player)
	return player
}

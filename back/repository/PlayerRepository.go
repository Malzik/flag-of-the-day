package repository

import (
	"back/model"
	"gorm.io/gorm"
)

type PlayerRepository struct {
	db *gorm.DB
}

func NewPlayerRepository(db *gorm.DB) *PlayerRepository {
	return &PlayerRepository{db: db}
}

//func (r *PlayerRepository) GetHistory(playerID string) ([]model.History, error) {
//	// Your existing GetHistory code goes here
//}

func (r *PlayerRepository) GetPlayer(id string) (*model.Player, error) {
	var player model.Player
	if err := r.db.Where("id = ?", id).First(&player).Error; err != nil {
		return nil, err
	}
	return &player, nil
}

func (r *PlayerRepository) AddPlayer(id string) model.Player {
	player := model.Player{Id: id, Streak: 0}
	r.db.Create(&player)
	return player
}

func (r *PlayerRepository) GetGame(id uint) model.Game {
	var game model.Game
	r.db.Where("id = ?", id).First(&game)
	return game
}

func (r *PlayerRepository) GetPlayerGames(player model.Player, i int) []model.PlayerGame {
	var playerGames []model.PlayerGame
	r.db.Where("player_id = ? and is_win IN ('LOOSE', 'WIN')", player.Id).Order("id desc").Limit(i).Find(&playerGames)
	return playerGames

}

func (r *PlayerRepository) GetDrawFlags(id uint) []model.DrawFlags {
	var drawFlags []model.DrawFlags
	r.db.Joins("Flag").Where("game_id = ?", id).Order("step asc").Find(&drawFlags)
	return drawFlags
}

func (r *PlayerRepository) GetPlayerGuesses(id uint) []model.PlayerGuesses {
	var playerGuesses []model.PlayerGuesses
	r.db.Where("player_game_id = ?", id).Find(&playerGuesses)
	return playerGuesses
}

func (r *PlayerRepository) UpdatePlayerPoints(player model.Player, points int) {
	r.db.Model(&player).Update("points", player.Points+points)
}

func AddPlayer(id string) {

}

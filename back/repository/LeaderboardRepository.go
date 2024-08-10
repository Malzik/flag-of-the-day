package repository

import (
	"back/model"
	"gorm.io/gorm"
)

type LeaderboardRepository struct {
	db *gorm.DB
}

func NewLeaderboardRepository(db *gorm.DB) *LeaderboardRepository {
	return &LeaderboardRepository{db: db}
}

func (r *LeaderboardRepository) GetLeaderboardByStreak() []model.Player {
	var players []model.Player
	r.db.Select("name, longest_streak, id").Where("longest_streak > 0").Order("longest_streak DESC").Limit(50).Find(&players)
	return players
}

func (r *LeaderboardRepository) GetLeaderboardByPoints() []model.Player {
	var players []model.Player
	r.db.Select("name, points, id").Where("points > 0").Order("points DESC").Limit(50).Find(&players)
	return players
}

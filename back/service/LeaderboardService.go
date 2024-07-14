package service

import (
	"back/config"
	"back/repository"
)

type LeaderboardService struct {
	leaderboardRepository *repository.LeaderboardRepository
}

type LeaderboardResponse struct {
	Points []pointsResponse `json:"points"`
	Streak []streakResponse `json:"streak"`
}

type pointsResponse struct {
	Name   string `json:"name"`
	Points int    `json:"points"`
}

type streakResponse struct {
	Name   string `json:"name"`
	Streak int    `json:"streak"`
}

func NewLeaderboardService() *LeaderboardService {
	return &LeaderboardService{leaderboardRepository: repository.NewLeaderboardRepository(config.Db())}
}

func (s *LeaderboardService) GetLeaderboard() LeaderboardResponse {
	points := s.leaderboardRepository.GetLeaderboardByPoints()
	streak := s.leaderboardRepository.GetLeaderboardByStreak()

	var pointsLeaderboard []pointsResponse
	var streakLeaderboard []streakResponse
	for i := 0; i < len(points); i++ {
		pointsLeaderboard = append(pointsLeaderboard, pointsResponse{Name: points[i].Name, Points: points[i].Points})
		streakLeaderboard = append(streakLeaderboard, streakResponse{Name: streak[i].Name, Streak: streak[i].LongestStreak})
	}
	return LeaderboardResponse{
		Points: pointsLeaderboard,
		Streak: streakLeaderboard,
	}
}

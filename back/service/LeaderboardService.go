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
	Name      string `json:"name"`
	Points    int    `json:"points"`
	Highlight bool   `json:"highlight"`
}

type streakResponse struct {
	Name      string `json:"name"`
	Streak    int    `json:"streak"`
	Highlight bool   `json:"highlight"`
}

func NewLeaderboardService() *LeaderboardService {
	return &LeaderboardService{leaderboardRepository: repository.NewLeaderboardRepository(config.Db())}
}

func (s *LeaderboardService) GetLeaderboard(playerId string) LeaderboardResponse {
	points := s.leaderboardRepository.GetLeaderboardByPoints()
	streaks := s.leaderboardRepository.GetLeaderboardByStreak()

	var pointsLeaderboard []pointsResponse
	for _, point := range points {
		var highlight = false
		if point.Id == playerId {
			highlight = true
		}
		pointsLeaderboard = append(pointsLeaderboard, pointsResponse{Name: point.Name, Points: point.Points, Highlight: highlight})
	}

	var streakLeaderboard []streakResponse
	for _, streak := range streaks {
		var highlight = false
		if streak.Id == playerId {
			highlight = true
		}
		streakLeaderboard = append(streakLeaderboard, streakResponse{Name: streak.Name, Streak: streak.LongestStreak, Highlight: highlight})
	}
	return LeaderboardResponse{
		Points: pointsLeaderboard,
		Streak: streakLeaderboard,
	}
}

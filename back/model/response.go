package model

type ProfileResponse struct {
	Id              string    `json:"id"`
	Streak          int       `json:"streak"`
	Points          int       `json:"points"`
	Name            string    `json:"name"`
	History         []History `json:"history"`
	IsGoogleAccount bool      `json:"isGoogleAccount"`
}

type GuessResponse struct {
	CorrectGuess bool     `json:"correctGuess,omitempty"`
	Hint         []string `json:"hint,omitempty"`
	Tries        int      `json:"tries,omitempty"`
	Points       int      `json:"points,omitempty"`
	IsFinished   string   `json:"isFinished,omitempty"`
	Answers      []string `json:"answers,omitempty"`
}

type StartGuessResponse struct {
	Images     []string `json:"images"`
	Hint       []string `json:"hint,omitempty"`
	IsFinished string   `json:"isFinished,omitempty"`
	Answers    []string `json:"answers,omitempty"`
}

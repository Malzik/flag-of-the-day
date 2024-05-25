package model

type PlayerError struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
}

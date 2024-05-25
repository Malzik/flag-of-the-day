package service

import (
	"back/config"
	"back/model"
	"back/repository"
	"encoding/json"
	"errors"
	"fmt"
	"golang.org/x/text/unicode/norm"
	"gorm.io/gorm"
	"math/rand"
	"strings"
	"time"
	"unicode"
)

type GameService struct {
	gameRepository   *repository.GameRepository
	playerRepository *repository.PlayerRepository
	Flags            []model.Flag
}

func NewGameService(flags []model.Flag) *GameService {
	return &GameService{
		gameRepository:   repository.NewGameRepository(config.Db()),
		playerRepository: repository.NewPlayerRepository(config.Db()),
		Flags:            flags,
	}
}

func DrawThreeRandomFlags(flags []model.Flag) []model.Flag {
	// Seed the random number generator
	rand.Seed(time.Now().UnixNano())

	// Make a copy of the Flags slice to avoid modifying the original slice
	copiedFlags := make([]model.Flag, len(flags))
	copy(copiedFlags, flags)

	// Shuffle the copiedFlags slice using the Fisher-Yates algorithm
	for i := range copiedFlags {
		j := rand.Intn(i + 1)
		copiedFlags[i], copiedFlags[j] = copiedFlags[j], copiedFlags[i]
	}

	// Take the first three flags from the shuffled slice
	return copiedFlags[:3]
}

func (s *GameService) CheckIfFlagsExistForToday(currentGame *model.Game, err error, date string) []model.Flag {
	if err != nil {
		flags := DrawThreeRandomFlags(s.Flags)
		fmt.Println("Random Flags:", flags)

		date, _ := time.Parse("2006-01-02", date)
		currentGame = &model.Game{Date: date}

		for index, flag := range flags {
			drawFlag := model.DrawFlags{
				Code: flag.Code,
				Step: index,
			}
			currentGame.Flags = append(currentGame.Flags, drawFlag)
		}

		s.gameRepository.CreateGame(currentGame)
	}
	return s.gameRepository.GetFlags(currentGame)
}

func (s *GameService) CheckIfGameFinished(playerGame *model.PlayerGame) string {
	if playerGame == nil {
		return ""
	}
	if len(playerGame.IsWin) != 0 {
		return playerGame.IsWin
	}
	return ""
}

func (s *GameService) HandleStartGuess(player model.Player, lang string, date string) model.StartGuessResponse {
	currentGame, err := s.gameRepository.GetGameByDate(date)
	flags := s.CheckIfFlagsExistForToday(currentGame, err, date)

	var images []string
	for _, flag := range flags {
		images = append(images, flag.Image)
	}

	playerGame := s.gameRepository.GetPlayerGame(player, currentGame)
	if playerGame == nil {
		playerGame = &model.PlayerGame{PlayerId: player.Id, GameId: currentGame.Id}
		s.gameRepository.CreatePlayerGame(playerGame)
	}
	isFinished := s.CheckIfGameFinished(playerGame)
	if isFinished != "" {
		return model.StartGuessResponse{
			Images:     images,
			IsFinished: isFinished,
			Answers:    s.gameRepository.GetDrawFlagsNames(currentGame.Id, lang),
		}
	}

	currentStep, err := s.gameRepository.GetCurrentStep(playerGame)
	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		var guesses []string
		guessesJSON, _ := json.Marshal(guesses)
		currentStep = model.PlayerGuesses{PlayerGameId: playerGame.Id, Step: 0, Guesses: string(guessesJSON)}
		s.gameRepository.CreatePlayerGuesses(&currentStep)
	}
	currentFlag := flags[currentStep.Step]

	var guesses []string
	json.Unmarshal([]byte(currentStep.Guesses), &guesses)

	return model.StartGuessResponse{
		Images:     images,
		IsFinished: isFinished,
		Hint:       s.gameRepository.GetHints(currentFlag, lang, len(guesses)),
	}
}

func cleanAndCapitalize(input string) string {
	normalized := norm.NFD.String(input)

	// Remove non-letter characters and capitalize the string
	var cleanedGuess strings.Builder
	for _, char := range normalized {
		if unicode.IsLetter(char) {
			cleanedGuess.WriteRune(char)
		}
	}

	// Capitalize the guess
	return strings.ToLower(cleanedGuess.String())
}

func (s *GameService) HandleGuess(date string, guess string, lang string, player model.Player) model.GuessResponse {
	currentGame, err := s.gameRepository.GetGameByDate(date)
	flags := s.CheckIfFlagsExistForToday(currentGame, err, date)

	playerGame := s.gameRepository.GetPlayerGame(player, currentGame)
	if len(playerGame.IsWin) != 0 {
		return model.GuessResponse{
			CorrectGuess: false,
			IsFinished:   playerGame.IsWin,
		}
	}
	currentStep, err := s.gameRepository.GetCurrentStep(playerGame)
	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		var guesses []string
		guessesJSON, _ := json.Marshal(guesses)
		currentStep = model.PlayerGuesses{PlayerGameId: playerGame.Id, Step: 0, Guesses: string(guessesJSON)}
		s.gameRepository.CreatePlayerGuesses(&currentStep)
	}
	currentFlag := flags[currentStep.Step]
	var guesses []string
	err = json.Unmarshal([]byte(currentStep.Guesses), &guesses)
	if err != nil {
		return model.GuessResponse{
			CorrectGuess: false,
		}
	}
	guesses = append(guesses, guess)
	guessesJSON, _ := json.Marshal(guesses)
	s.gameRepository.UpdatePlayerGuesses(currentStep, playerGame.Id, string(guessesJSON))

	points := 0
	flagName := s.gameRepository.GetFlagName(currentFlag.Code, lang)
	isCorrect := cleanAndCapitalize(guess) == cleanAndCapitalize(flagName.Name)
	if isCorrect {
		points = 6 - len(guesses)
		s.playerRepository.UpdatePlayerPoints(player, points)
		if currentStep.Step == 2 {
			playerGame.IsWin = "WIN"
			s.gameRepository.UpdatePlayerGame(*playerGame, player, player.Streak+1)
		} else {
			var newGuesses []string
			guessesJSON, _ := json.Marshal(newGuesses)
			nextStep := model.PlayerGuesses{PlayerGameId: playerGame.Id, Step: currentStep.Step + 1, Guesses: string(guessesJSON)}
			s.gameRepository.CreatePlayerGuesses(&nextStep)
		}
	} else if len(guesses) == 5 {
		playerGame.IsWin = "LOOSE"
		s.gameRepository.UpdatePlayerGame(*playerGame, player, 0)
	}
	return model.GuessResponse{
		CorrectGuess: isCorrect,
		IsFinished:   playerGame.IsWin,
		Hint:         s.gameRepository.GetHints(currentFlag, lang, len(guesses)),
		Answers:      s.gameRepository.GetDrawFlagsNames(currentGame.Id, lang),
		Tries:        len(guesses),
		Points:       points,
	}
}

package game

import (
	"back/model"
	"encoding/json"
	"errors"
	"golang.org/x/text/unicode/norm"
	"gorm.io/gorm"
	"strings"
	"unicode"
)

func HandleGuess(db gorm.DB, flags []model.Flag, guess string, lang string, currentDate string, player model.Player) (bool, []string, int) {
	playerGame := getPlayerGame(db, player, currentDate)
	if len(playerGame.IsWin) != 0 {
		return false, nil, 0
	}
	currentStep, err := getCurrentStep(db, playerGame)
	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		var guesses []string
		guessesJSON, _ := json.Marshal(guesses)
		currentStep = model.PlayerGuesses{PlayerGameId: playerGame.Id, Step: 0, Guesses: string(guessesJSON)}
		db.Create(&currentStep)
	}
	currentFlag := flags[currentStep.Step]
	var guesses []string
	err = json.Unmarshal([]byte(currentStep.Guesses), &guesses)
	if err != nil {
		return false, nil, 0
	}
	guesses = append(guesses, guess)
	guessesJSON, _ := json.Marshal(guesses)
	db.Model(&currentStep).Where("step = ?", currentStep.Step).Update("guesses", string(guessesJSON))
	isCorrect := checkGuess(db, currentFlag, guess, lang)

	if isCorrect == true {
		if currentStep.Step == 2 {
			db.Model(&playerGame).Update("is_win", "WIN")
			db.Model(&player).Update("streak", player.Streak+1)
		} else {
			var newGuesses []string
			guessesJSON, _ := json.Marshal(newGuesses)
			nextStep := model.PlayerGuesses{PlayerGameId: playerGame.Id, Step: currentStep.Step + 1, Guesses: string(guessesJSON)}
			db.Create(&nextStep)
		}
		return isCorrect, nil, 0
	} else if len(guesses) == 5 {
		db.Model(&playerGame).Update("is_win", "LOOSE")
		db.Model(&player).Update("streak", 0)
	}

	return isCorrect, getHints(&db, currentFlag, lang, len(guesses)), len(guesses)
}

func HandleStartGuess(db gorm.DB, flags []model.Flag, player model.Player, lang string, currentDate string) []string {
	playerGame := getPlayerGame(db, player, currentDate)
	currentStep, err := getCurrentStep(db, playerGame)
	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		var guesses []string
		guessesJSON, _ := json.Marshal(guesses)
		currentStep = model.PlayerGuesses{PlayerGameId: playerGame.Id, Step: 0, Guesses: string(guessesJSON)}
		db.Create(&currentStep)
	}
	currentFlag := flags[currentStep.Step]

	var guesses []string
	json.Unmarshal([]byte(currentStep.Guesses), &guesses)

	return getHints(&db, currentFlag, lang, len(guesses))
}

func getPlayerGame(db gorm.DB, player model.Player, currentDate string) model.PlayerGame {
	var game model.Game
	db.Where("DATE(date) = ?", currentDate).First(&game)
	var playerGame model.PlayerGame
	if err := db.Where("game_id = ?", game.Id).Where("player_id", player.Id).First(&playerGame).Error; err != nil {
		playerGame = model.PlayerGame{PlayerId: player.Id, GameId: game.Id}

		db.Create(&playerGame)
	}
	return playerGame
}

func getCurrentStep(db gorm.DB, playerGame model.PlayerGame) (model.PlayerGuesses, error) {
	var currentStep model.PlayerGuesses
	err := db.Where("player_game_id = ?", playerGame.Id).Order("step desc").First(&currentStep).Error

	return currentStep, err
}

func checkGuess(db gorm.DB, flag model.Flag, guess string, lang string) bool {
	var flagName model.FlagName
	db.First(&flagName, "code = ? and lang = ?", flag.Code, lang)
	return cleanAndCapitalize(flagName.Name) == cleanAndCapitalize(guess)
}

func getHints(db *gorm.DB, flag model.Flag, lang string, try int) []string {
	var hints []string
	if try > 5 {
		return nil
	}

	for i := 1; i <= try; i++ {
		switch i {
		case 1:
			var dbHint model.FlagHints
			db.Where("code = ? and title = ?", flag.Code, "region").First(&dbHint)
			hints = append(hints, dbHint.Value)
		case 2:
			var dbHints []model.FlagHints
			db.Where("code = ? and title in (?, ?)", flag.Code, "code", "symbol").Order("title asc").Find(&dbHints)
			str := []string{dbHints[0].Value, dbHints[1].Value}
			hints = append(hints, strings.Join(str, " "))
		case 3:
			var dbHint model.FlagHints
			db.Where("code = ? and title = ?", flag.Code, "capital").First(&dbHint)
			hints = append(hints, dbHint.Value)
		case 4:
			var flagName model.FlagName
			db.First(&flagName, "code = ? and lang = ?", flag.Code, lang)
			hints = append(hints, flagName.Name[0:1])
		}
	}

	return hints
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

func CheckIfGameFinished(db gorm.DB, player model.Player, date string) string {
	var game model.Game
	db.Where("DATE(date) = ?", date).First(&game)
	var playerGame model.PlayerGame
	if err := db.Where("game_id = ?", game.Id).Where("player_id", player.Id).First(&playerGame).Error; err != nil {
		return ""
	}
	if len(playerGame.IsWin) != 0 {
		return playerGame.IsWin
	}
	return ""
}

func GetAnswers(db gorm.DB, date string, lang string) []string {
	var game model.Game
	db.Where("DATE(date) = ?", date).First(&game)
	var flags []model.DrawFlags
	db.Where("game_id = ?", game.Id).Order("step asc").Find(&flags)
	var answers []string
	for _, flag := range flags {
		var flagName model.FlagName
		db.Where("code = ? AND lang = ?", flag.Code, lang).First(&flagName)
		answers = append(answers, flagName.Name)
	}
	return answers
}

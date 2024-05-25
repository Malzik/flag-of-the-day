package repository

import (
	"back/model"
	"gorm.io/gorm"
	"strings"
)

type GameRepository struct {
	db *gorm.DB
}

func NewGameRepository(db *gorm.DB) *GameRepository {
	return &GameRepository{db: db}
}

func (r *GameRepository) GetGame(id uint) model.Game {
	var game model.Game
	r.db.Where("id = ?", id).First(&game)
	return game
}

func (r *GameRepository) GetPlayerGames(player model.Player, i int) []model.PlayerGame {
	var playerGames []model.PlayerGame
	r.db.Where("player_id = ?", player.Id).Order("date desc").Limit(i).Find(&playerGames)
	return playerGames

}

func (r *GameRepository) GetPlayerGame(player model.Player, game *model.Game) *model.PlayerGame {
	var playerGame model.PlayerGame
	if err := r.db.Where("game_id = ?", game.Id).Where("player_id", player.Id).First(&playerGame).Error; err != nil {
		return nil
	}
	return &playerGame
}

func (r *GameRepository) GetDrawFlags(id uint) []model.DrawFlags {
	var drawFlags []model.DrawFlags
	r.db.Joins("Flag").Where("game_id = ?", id).Order("step asc").Find(&drawFlags)
	return drawFlags
}

func (r *GameRepository) GetDrawFlagsNames(id uint, lang string) []string {
	var flagNames []string
	r.db.Table("draw_flags").
		Joins("JOIN flags ON draw_flags.code = flags.code").
		Joins("JOIN flag_names ON flags.code = flag_names.code").
		Where("draw_flags.game_id = ? AND flag_names.lang = ?", id, lang).
		Order("draw_flags.step asc").
		Pluck("flag_names.name", &flagNames)
	return flagNames
}

func (r *GameRepository) GetPlayerGuesses(id uint) []model.PlayerGuesses {
	var playerGuesses []model.PlayerGuesses
	r.db.Where("player_game_id = ?", id).Find(&playerGuesses)
	return playerGuesses
}

func (r *GameRepository) GetGameByDate(date string) (*model.Game, error) {
	var game model.Game
	err := r.db.Preload("Flags").Where("DATE(date) = ?", date).First(&game).Error
	return &game, err
}

func (r *GameRepository) CreateGame(game *model.Game) {
	r.db.Create(game)
}

func (r *GameRepository) GetFlags(game *model.Game) []model.Flag {
	var flags []model.Flag
	r.db.Joins("JOIN draw_flags df ON flags.code = df.code").
		Where("df.game_id = ?", game.Id).
		Find(&flags)
	return flags
}

func (r *GameRepository) GetCurrentStep(playerGame *model.PlayerGame) (model.PlayerGuesses, error) {
	var currentStep model.PlayerGuesses
	err := r.db.Where("player_game_id = ?", playerGame.Id).Order("step desc").First(&currentStep).Error

	return currentStep, err
}

func (r *GameRepository) CreatePlayerGuesses(m *model.PlayerGuesses) {
	r.db.Create(m)
}

func (r *GameRepository) CreatePlayerGame(m *model.PlayerGame) {
	r.db.Create(m)
}

func (r *GameRepository) GetHints(flag model.Flag, lang string, try int) []string {
	var hints []string
	if try > 5 {
		return nil
	}

	for i := 1; i <= try; i++ {
		switch i {
		case 1:
			var dbHint model.FlagHints
			r.db.Where("code = ? and title = ?", flag.Code, "region").First(&dbHint)
			hints = append(hints, dbHint.Value)
		case 2:
			var dbHints []model.FlagHints
			r.db.Where("code = ? and title in (?, ?)", flag.Code, "code", "symbol").Order("title asc").Find(&dbHints)
			str := []string{dbHints[0].Value, dbHints[1].Value}
			hints = append(hints, strings.Join(str, " "))
		case 3:
			var dbHint model.FlagHints
			r.db.Where("code = ? and title = ?", flag.Code, "capital").First(&dbHint)
			hints = append(hints, dbHint.Value)
		case 4:
			var flagName model.FlagName
			r.db.First(&flagName, "code = ? and lang = ?", flag.Code, lang)
			hints = append(hints, flagName.Name[0:1])
		}
	}

	return hints
}

func (r *GameRepository) UpdatePlayerGuesses(currentStep model.PlayerGuesses, id uint, guesses string) {
	r.db.Model(&currentStep).Where("step = ? and player_game_id = ?", currentStep.Step, id).Update("guesses", guesses)
}

func (r *GameRepository) GetFlagName(code string, lang string) model.FlagName {
	var flagName model.FlagName
	r.db.First(&flagName, "code = ? and lang = ?", code, lang)
	return flagName
}

func (r *GameRepository) UpdatePlayerGame(playerGame model.PlayerGame, player model.Player, streak int) {
	r.db.Model(&playerGame).Update("is_win", playerGame.IsWin)
	r.db.Model(&player).Update("streak", streak)
}

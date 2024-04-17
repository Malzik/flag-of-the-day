package model

import "time"

type Flag struct {
	Code  string `gorm:"type:varchar(100);primaryKey"`
	Image string
	Names []FlagName  `gorm:"foreignKey:Code;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Hints []FlagHints `gorm:"foreignKey:Code;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

type FlagName struct {
	Code string `gorm:"type:varchar(100);uniqueIndex:idx_code_lang"`
	Lang string `gorm:"type:varchar(100);uniqueIndex:idx_code_lang"`
	Name string
}

type FlagHints struct {
	Code  string `gorm:"type:varchar(100);uniqueIndex:idx_code_key"`
	Title string `gorm:"type:varchar(100);uniqueIndex:idx_code_key"`
	Value string
}

type Game struct {
	Id    uint        `gorm:"primaryKey"`
	Date  time.Time   `gorm:"uniqueIndex:idx_date"`
	Flags []DrawFlags `gorm:"foreignKey:GameId;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

type DrawFlags struct {
	GameId uint   `gorm:"foreignKey:GameId"`
	Code   string `gorm:"foreignKey:Code"`
	Step   int
}

type Player struct {
	Id     string `gorm:"primaryKey"`
	Streak int
}

type PlayerGame struct {
	Id       uint   `gorm:"primaryKey"`
	PlayerId string `gorm:"foreignKey:PlayerId;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	GameId   uint   `gorm:"foreignKey:GameId"`
	IsWin    string
}

type PlayerGuesses struct {
	PlayerGameId uint   `gorm:"foreignKey:PlayerGameId;uniqueIndex:idx_game_step;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Step         int    `gorm:"uniqueIndex:idx_game_step"`
	Guesses      string `gorm:"type:json"`
}

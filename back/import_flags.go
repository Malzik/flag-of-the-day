package main

import (
	"back/config"
	"back/model"
	"encoding/json"
	"fmt"
	"gorm.io/gorm/clause"
	"io/ioutil"
)

// Flag represents the structure of a flag
type Flag2 struct {
	Code  string            `json:"code"`
	Image string            `json:"image"`
	Names map[string]string `json:"name"`
	Hints map[string]string `json:"hints"`
}

var Flags2 []Flag2

func loadFlags2() {
	// Read the contents of the flags.json file
	fileContent, err := ioutil.ReadFile("flags.json")
	if err != nil {
		fmt.Println("Error reading flags.json:", err)
		return
	}

	// Unmarshal the JSON content into the Flags slice
	err = json.Unmarshal(fileContent, &Flags2)
	if err != nil {
		fmt.Println("Error unmarshaling flags.json:", err)
		return
	}
}

func main() {
	db := config.Db()
	loadFlags2()

	for _, flag := range Flags2 {
		newFlag := model.Flag{Code: flag.Code, Image: flag.Image}
		db.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "code"}},
			DoUpdates: clause.AssignmentColumns([]string{"image"}),
		}).Create(&newFlag)

		for lang, name := range flag.Names {
			newName := model.FlagName{Code: flag.Code, Name: name, Lang: lang}
			db.Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "code"}},
				DoUpdates: clause.AssignmentColumns([]string{"lang", "name"}),
			}).Create(&newName)
		}

		for key, hint := range flag.Hints {
			newHint := model.FlagHints{Code: flag.Code, Title: key, Value: hint}
			db.Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "code"}},
				DoUpdates: clause.AssignmentColumns([]string{"title", "value"}),
			}).Create(&newHint)
		}
	}
}

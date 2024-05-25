package main

import (
	"back/config"
	"back/controller"
	"back/model"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"log"
)

var Flags []model.Flag
var db gorm.DB

func main() {
	db = *config.Db()
	db.Preload("Names").Preload("Hints").Find(&Flags)

	//Perform database migration
	err := db.AutoMigrate(&model.Flag{}, &model.FlagName{}, &model.FlagHints{}, &model.Game{}, &model.DrawFlags{}, &model.Player{}, &model.PlayerGame{}, &model.PlayerGuesses{})
	if err != nil {
		log.Fatal(err)
	}

	// Create a new Gin router
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		allowedOrigins := []string{"http://localhost:3000", "http://fotd.localhost", "https://flags.alexis-heroin.ca"}

		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
				break
			}
		}

		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Next()
	})

	r.OPTIONS("/*any", func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		allowedOrigins := []string{"http://localhost:3000", "http://fotd.localhost", "https://flags.alexis-heroin.ca"}

		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
				break
			}
		}
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Status(204)
	})

	playerController := controller.NewPlayerController()
	gameController := controller.NewGameController(Flags)
	r.GET("/api/profile", playerController.HandleProfile)
	r.GET("/api/startGuess", gameController.HandleStartGuess)

	r.POST("/api/guess", gameController.HandleGuess)

	// Start the HTTP server on port 8080
	r.Run(":8082")
}

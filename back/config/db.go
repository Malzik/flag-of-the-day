package config

import (
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"os"
	"sync"
)

var (
	db   *gorm.DB
	err  error
	once sync.Once
)

func Db() gorm.DB {
	once.Do(func() {
		err := godotenv.Load()
		if err != nil {
			panic("Error loading .env file")
		}
		dsn := os.Getenv("DB_DSN")

		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{Logger: logger.Default.LogMode(logger.Info)})
		if err != nil {
			panic(err)
		}
		print("Connection succesful")
	})
	return *db
}

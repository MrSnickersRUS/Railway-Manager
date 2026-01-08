package database

import (
	"railway-dispatcher/internal/config"
	"railway-dispatcher/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init(cfg *config.Config) error {
	var err error
	DB, err = gorm.Open(sqlite.Open(cfg.DBPath), &gorm.Config{})
	if err != nil {
		return err
	}

	return DB.AutoMigrate(
		&models.User{},
		&models.Train{},
		&models.Station{},
		&models.Schedule{},
		&models.AuditLog{},
	)
}

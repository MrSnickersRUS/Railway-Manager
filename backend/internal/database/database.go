package database

import (
	"fmt"
	"railway-dispatcher/internal/config"
	"railway-dispatcher/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init(cfg *config.Config) error {
	var err error
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName)

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
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

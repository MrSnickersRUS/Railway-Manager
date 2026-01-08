package database

import (
	"os"
	"railway-dispatcher/internal/config"
	"railway-dispatcher/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init(cfg *config.Config) error {
	var err error
	var dsn string

	if dbURL := os.Getenv("DATABASE_URL"); dbURL != "" {
		dsn = dbURL
	} else {
		dsn = "host=" + cfg.DBHost + " port=" + cfg.DBPort + " user=" + cfg.DBUser + " password=" + cfg.DBPassword + " dbname=" + cfg.DBName + " sslmode=disable"
	}

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

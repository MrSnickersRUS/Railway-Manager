package main

import (
	"crypto/rand"
	"log"
	"math/big"

	"railway-dispatcher/internal/config"
	"railway-dispatcher/internal/database"
	"railway-dispatcher/internal/handlers"
	"railway-dispatcher/internal/middleware"
	"railway-dispatcher/internal/models"
	"railway-dispatcher/internal/utils"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()
	utils.InitJWT(cfg.JWTSecret)

	if err := database.Init(cfg); err != nil {
		log.Fatal("Ошибка подключения к БД:", err)
	}

	createDefaultAdmin()

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.POST("/api/login", handlers.Login)
	r.POST("/api/register", handlers.Register)
	r.GET("/api/schedules", handlers.GetSchedules)
	r.GET("/api/stations", handlers.GetStations)

	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/me", handlers.Me)

		api.GET("/stats", handlers.GetStats)

		api.GET("/trains", handlers.GetTrains)
		api.GET("/trains/:id", handlers.GetTrain)
		api.POST("/trains", middleware.RequireRole(models.RoleAdmin, models.RoleCarrier, models.RoleDispatcher), handlers.CreateTrain)
		api.PUT("/trains/:id", middleware.RequireRole(models.RoleAdmin, models.RoleCarrier, models.RoleDispatcher), handlers.UpdateTrain)
		api.DELETE("/trains/:id", middleware.RequireRole(models.RoleAdmin), handlers.DeleteTrain)

		api.GET("/schedules/:id", handlers.GetSchedule)
		api.POST("/schedules", middleware.RequireRole(models.RoleAdmin, models.RoleCarrier, models.RoleDispatcher), handlers.CreateSchedule)
		api.PUT("/schedules/:id", middleware.RequireRole(models.RoleAdmin, models.RoleCarrier, models.RoleDispatcher), handlers.UpdateSchedule)
		api.DELETE("/schedules/:id", middleware.RequireRole(models.RoleAdmin, models.RoleCarrier, models.RoleDispatcher), handlers.DeleteSchedule)

		api.GET("/stations/:id", handlers.GetStation)
		api.POST("/stations", middleware.RequireRole(models.RoleAdmin, models.RoleCarrier), handlers.CreateStation)
		api.PUT("/stations/:id", middleware.RequireRole(models.RoleAdmin, models.RoleCarrier), handlers.UpdateStation)
		api.DELETE("/stations/:id", middleware.RequireRole(models.RoleAdmin), handlers.DeleteStation)

		admin := api.Group("/users")
		admin.Use(middleware.RequireRole(models.RoleAdmin))
		{
			admin.GET("", handlers.GetUsers)
			admin.GET("/:id", handlers.GetUser)
			admin.PUT("/:id", handlers.UpdateUser)
			admin.DELETE("/:id", handlers.DeleteUser)
		}

		api.GET("/audit", middleware.RequireRole(models.RoleAdmin), handlers.GetAuditLogs)
	}

	log.Printf("Сервер запущен на порту %s", cfg.ServerPort)
	r.Run(":" + cfg.ServerPort)
}

func createDefaultAdmin() {
	var count int64
	database.DB.Model(&models.User{}).Count(&count)
	if count == 0 {
		login := generateSecureString(8)
		password := generateSecureString(16)
		admin := models.User{
			Login: login,
			Role:  models.RoleAdmin,
		}
		admin.SetPassword(password)
		database.DB.Create(&admin)
		log.Printf("=== ADMIN CREDENTIALS ===")
		log.Printf("Login: %s", login)
		log.Printf("Password: %s", password)
		log.Printf("=========================")
	}
}

func generateSecureString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		b[i] = charset[n.Int64()]
	}
	return string(b)
}

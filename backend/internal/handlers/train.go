package handlers

import (
	"net/http"
	"strconv"

	"railway-dispatcher/internal/database"
	"railway-dispatcher/internal/middleware"
	"railway-dispatcher/internal/models"

	"github.com/gin-gonic/gin"
)

type CreateTrainRequest struct {
	Number      string           `json:"number" binding:"required"`
	Type        models.TrainType `json:"type"`
	WagonCount  int              `json:"wagon_count"`
	MaxSpeed    float64          `json:"max_speed"`
	Description string           `json:"description"`
}

func GetTrains(c *gin.Context) {
	var trains []models.Train
	database.DB.Preload("Owner").Find(&trains)
	c.JSON(http.StatusOK, trains)
}

func GetTrain(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var train models.Train
	if err := database.DB.Preload("Schedules").Preload("Owner").First(&train, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Поезд не найден"})
		return
	}
	c.JSON(http.StatusOK, train)
}

func CreateTrain(c *gin.Context) {
	var req CreateTrainRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверные данные"})
		return
	}

	userID, _ := c.Get("userID")
	userRole, _ := c.Get("userRole")
	uid := userID.(uint)
	role := userRole.(models.Role)

	train := models.Train{
		Number:      req.Number,
		Type:        req.Type,
		WagonCount:  req.WagonCount,
		MaxSpeed:    req.MaxSpeed,
		Description: req.Description,
	}

	if role == models.RoleCarrier || role == models.RoleDispatcher {
		train.OwnerID = &uid
	}

	if train.Type == "" {
		train.Type = models.TrainTypeCargo
	}
	if train.WagonCount == 0 {
		train.WagonCount = 1
	}
	if train.MaxSpeed == 0 {
		train.MaxSpeed = 60
	}

	if err := database.DB.Create(&train).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Поезд с таким номером уже существует"})
		return
	}

	middleware.CreateAuditLog(c, models.ActionCreate, models.EntityTrain, train.ID, nil, train)
	c.JSON(http.StatusCreated, train)
}

func canModifyTrain(c *gin.Context, train *models.Train) bool {
	userID, _ := c.Get("userID")
	userRole, _ := c.Get("userRole")
	uid := userID.(uint)
	role := userRole.(models.Role)

	if role == models.RoleAdmin {
		return true
	}
	if train.OwnerID != nil && *train.OwnerID == uid {
		return true
	}
	return false
}

func UpdateTrain(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var train models.Train
	if err := database.DB.First(&train, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Поезд не найден"})
		return
	}

	if !canModifyTrain(c, &train) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав"})
		return
	}

	oldTrain := train

	var req CreateTrainRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверные данные"})
		return
	}

	train.Number = req.Number
	if req.Type != "" {
		train.Type = req.Type
	}
	if req.WagonCount > 0 {
		train.WagonCount = req.WagonCount
	}
	if req.MaxSpeed > 0 {
		train.MaxSpeed = req.MaxSpeed
	}
	train.Description = req.Description

	database.DB.Save(&train)
	middleware.CreateAuditLog(c, models.ActionUpdate, models.EntityTrain, train.ID, oldTrain, train)

	c.JSON(http.StatusOK, train)
}

func DeleteTrain(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var train models.Train
	if err := database.DB.First(&train, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Поезд не найден"})
		return
	}

	if !canModifyTrain(c, &train) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав"})
		return
	}

	database.DB.Delete(&train)
	middleware.CreateAuditLog(c, models.ActionDelete, models.EntityTrain, train.ID, train, nil)

	c.JSON(http.StatusOK, gin.H{"message": "Поезд удалён"})
}

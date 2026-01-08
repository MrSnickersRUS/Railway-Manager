package handlers

import (
	"net/http"
	"strconv"

	"railway-dispatcher/internal/database"
	"railway-dispatcher/internal/middleware"
	"railway-dispatcher/internal/models"

	"github.com/gin-gonic/gin"
)

type CreateStationRequest struct {
	Name        string             `json:"name" binding:"required"`
	Code        string             `json:"code" binding:"required"`
	Type        models.StationType `json:"type"`
	Latitude    float64            `json:"latitude"`
	Longitude   float64            `json:"longitude"`
	Description string             `json:"description"`
}

func GetStations(c *gin.Context) {
	var stations []models.Station
	database.DB.Preload("CreatedBy").Find(&stations)
	c.JSON(http.StatusOK, stations)
}

func GetStation(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var station models.Station
	if err := database.DB.First(&station, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Станция не найдена"})
		return
	}
	c.JSON(http.StatusOK, station)
}

func CreateStation(c *gin.Context) {
	var req CreateStationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверные данные"})
		return
	}

	userRole, _ := c.Get("userRole")
	userID, _ := c.Get("userID")
	role := userRole.(models.Role)

	if req.Type == models.StationTypeDepot && role != models.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Только Admin может создавать депо"})
		return
	}

	if req.Type == "" {
		req.Type = models.StationTypeRegular
	}

	uid := userID.(uint)
	station := models.Station{
		Name:        req.Name,
		Code:        req.Code,
		Type:        req.Type,
		Latitude:    req.Latitude,
		Longitude:   req.Longitude,
		Description: req.Description,
		CreatedByID: &uid,
	}

	if err := database.DB.Create(&station).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Станция с таким кодом уже существует"})
		return
	}

	middleware.CreateAuditLog(c, models.ActionCreate, "Station", station.ID, nil, station)
	c.JSON(http.StatusCreated, station)
}

func canModifyStation(c *gin.Context, station *models.Station) bool {
	userID, _ := c.Get("userID")
	userRole, _ := c.Get("userRole")
	uid := userID.(uint)
	role := userRole.(models.Role)

	if role == models.RoleAdmin {
		return true
	}
	if station.CreatedByID != nil && *station.CreatedByID == uid {
		return true
	}
	return false
}

func UpdateStation(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var station models.Station
	if err := database.DB.First(&station, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Станция не найдена"})
		return
	}

	if !canModifyStation(c, &station) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав"})
		return
	}

	oldStation := station

	var req CreateStationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверные данные"})
		return
	}

	userRole, _ := c.Get("userRole")
	role := userRole.(models.Role)
	if station.Type == models.StationTypeDepot && role != models.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Только Admin может редактировать депо"})
		return
	}

	station.Name = req.Name
	station.Code = req.Code
	if req.Type != "" {
		station.Type = req.Type
	}
	station.Latitude = req.Latitude
	station.Longitude = req.Longitude
	station.Description = req.Description

	database.DB.Save(&station)
	middleware.CreateAuditLog(c, models.ActionUpdate, "Station", station.ID, oldStation, station)

	c.JSON(http.StatusOK, station)
}

func DeleteStation(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var station models.Station
	if err := database.DB.First(&station, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Станция не найдена"})
		return
	}

	if !canModifyStation(c, &station) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав"})
		return
	}

	database.DB.Delete(&station)
	middleware.CreateAuditLog(c, models.ActionDelete, "Station", station.ID, station, nil)

	c.JSON(http.StatusOK, gin.H{"message": "Станция удалена"})
}

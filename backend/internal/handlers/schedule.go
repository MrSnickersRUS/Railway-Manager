package handlers

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"railway-dispatcher/internal/database"
	"railway-dispatcher/internal/middleware"
	"railway-dispatcher/internal/models"
	"railway-dispatcher/internal/services"

	"github.com/gin-gonic/gin"
)

var validator = &services.ScheduleValidator{}
var physicsValidator = &services.PhysicsValidator{}

type CreateScheduleRequest struct {
	TrainID       uint                  `json:"train_id" binding:"required"`
	TrackNumber   int                   `json:"track_number" binding:"required"`
	DepartureTime time.Time             `json:"departure_time" binding:"required"`
	ArrivalTime   time.Time             `json:"arrival_time" binding:"required"`
	Status        models.ScheduleStatus `json:"status"`
	Recurrence    models.Recurrence     `json:"recurrence"`
	FromStationID *uint                 `json:"from_station_id"`
	ToStationID   *uint                 `json:"to_station_id"`
	RecurCount    int                   `json:"recur_count"`
}

func GetSchedules(c *gin.Context) {
	var schedules []models.Schedule
	database.DB.Preload("Train").Preload("FromStation").Preload("ToStation").Preload("CreatedBy").Find(&schedules)
	c.JSON(http.StatusOK, schedules)
}

func GetSchedule(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var schedule models.Schedule
	if err := database.DB.Preload("Train").Preload("FromStation").Preload("ToStation").Preload("CreatedBy").First(&schedule, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Рейс не найден"})
		return
	}
	c.JSON(http.StatusOK, schedule)
}

func CreateSchedule(c *gin.Context) {
	var req CreateScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверные данные"})
		return
	}

	userID, _ := c.Get("userID")
	uid := userID.(uint)

	schedule := models.Schedule{
		TrainID:       req.TrainID,
		TrackNumber:   req.TrackNumber,
		DepartureTime: req.DepartureTime,
		ArrivalTime:   req.ArrivalTime,
		Status:        req.Status,
		Recurrence:    req.Recurrence,
		FromStationID: req.FromStationID,
		ToStationID:   req.ToStationID,
		CreatedByID:   &uid,
	}

	if schedule.Status == "" {
		schedule.Status = models.StatusScheduled
	}
	if schedule.Recurrence == "" {
		schedule.Recurrence = models.RecurrenceNone
	}

	if err := validator.ValidateSchedule(&schedule); err != nil {
		duration := schedule.ArrivalTime.Sub(schedule.DepartureTime)
		alternatives := validator.FindAlternativeSlots(schedule.TrackNumber, duration, schedule.DepartureTime)
		c.JSON(http.StatusConflict, gin.H{"error": err.Error(), "alternatives": alternatives})
		return
	}

	if err := physicsValidator.ValidateTravelPhysics(&schedule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&schedule).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания рейса"})
		return
	}

	if schedule.Recurrence != models.RecurrenceNone && req.RecurCount > 0 {
		recurring, _ := services.GenerateRecurringSchedules(&schedule, req.RecurCount)
		for _, s := range recurring {
			database.DB.Create(&s)
		}
	}

	middleware.CreateAuditLog(c, models.ActionCreate, models.EntitySchedule, schedule.ID, nil, schedule)
	c.JSON(http.StatusCreated, schedule)
}

func canModifySchedule(c *gin.Context, schedule *models.Schedule) bool {
	userID, _ := c.Get("userID")
	userRole, _ := c.Get("userRole")
	uid := userID.(uint)
	role := userRole.(models.Role)

	var createdByIDValue uint = 0
	if schedule.CreatedByID != nil {
		createdByIDValue = *schedule.CreatedByID
	}
	log.Printf("DEBUG canModifySchedule: userID=%d, role=%s, schedule.ID=%d, schedule.CreatedByID ptr=%v value=%d",
		uid, role, schedule.ID, schedule.CreatedByID, createdByIDValue)

	if role == models.RoleAdmin {
		log.Printf("DEBUG: Admin user, allowing")
		return true
	}
	if schedule.CreatedByID != nil && *schedule.CreatedByID == uid {
		log.Printf("DEBUG: owner match (%d == %d), allowing", *schedule.CreatedByID, uid)
		return true
	}
	log.Printf("DEBUG: no match, denying (CreatedByID=%v, userID=%d)", schedule.CreatedByID, uid)
	return false
}

func UpdateSchedule(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var schedule models.Schedule
	if err := database.DB.First(&schedule, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Рейс не найден"})
		return
	}

	if !canModifySchedule(c, &schedule) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав"})
		return
	}

	oldSchedule := schedule

	var req CreateScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверные данные"})
		return
	}

	schedule.TrainID = req.TrainID
	schedule.TrackNumber = req.TrackNumber
	schedule.DepartureTime = req.DepartureTime
	schedule.ArrivalTime = req.ArrivalTime
	schedule.FromStationID = req.FromStationID
	schedule.ToStationID = req.ToStationID
	if req.Status != "" {
		schedule.Status = req.Status
	}
	if req.Recurrence != "" {
		schedule.Recurrence = req.Recurrence
	}

	if err := validator.ValidateSchedule(&schedule); err != nil {
		duration := schedule.ArrivalTime.Sub(schedule.DepartureTime)
		alternatives := validator.FindAlternativeSlots(schedule.TrackNumber, duration, schedule.DepartureTime)
		c.JSON(http.StatusConflict, gin.H{"error": err.Error(), "alternatives": alternatives})
		return
	}

	if err := physicsValidator.ValidateTravelPhysics(&schedule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Save(&schedule)
	middleware.CreateAuditLog(c, models.ActionUpdate, models.EntitySchedule, schedule.ID, oldSchedule, schedule)

	c.JSON(http.StatusOK, schedule)
}

func DeleteSchedule(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var schedule models.Schedule
	if err := database.DB.First(&schedule, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Рейс не найден"})
		return
	}

	if !canModifySchedule(c, &schedule) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав"})
		return
	}

	database.DB.Delete(&schedule)
	middleware.CreateAuditLog(c, models.ActionDelete, models.EntitySchedule, schedule.ID, schedule, nil)

	c.JSON(http.StatusOK, gin.H{"message": "Рейс удалён"})
}

func GetStats(c *gin.Context) {
	var totalTrains int64
	var activeSchedules int64
	var totalTracks int64
	var totalStations int64

	database.DB.Model(&models.Train{}).Count(&totalTrains)
	database.DB.Model(&models.Schedule{}).Where("status IN ?", []string{"Scheduled", "InProgress"}).Count(&activeSchedules)
	database.DB.Model(&models.Schedule{}).Distinct("track_number").Count(&totalTracks)
	database.DB.Model(&models.Station{}).Count(&totalStations)

	const totalTracksAvailable = 10
	occupancy := float64(totalTracks) / float64(totalTracksAvailable) * 100

	c.JSON(http.StatusOK, gin.H{
		"total_trains":      totalTrains,
		"active_schedules":  activeSchedules,
		"tracks_in_use":     totalTracks,
		"total_stations":    totalStations,
		"occupancy_percent": occupancy,
	})
}

func GetAuditLogs(c *gin.Context) {
	var logs []models.AuditLog
	database.DB.Preload("User").Order("timestamp DESC").Limit(100).Find(&logs)
	c.JSON(http.StatusOK, logs)
}

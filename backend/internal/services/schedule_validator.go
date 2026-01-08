package services

import (
	"errors"
	"time"

	"railway-dispatcher/internal/database"
	"railway-dispatcher/internal/models"

	"gorm.io/gorm"
)

const MaintenanceWindow = 20 * time.Minute

type ScheduleValidator struct{}

func (v *ScheduleValidator) ValidateSchedule(schedule *models.Schedule) error {
	var conflicting models.Schedule
	err := database.DB.Where(
		"track_number = ? AND id != ? AND deleted_at IS NULL AND ((departure_time <= ? AND arrival_time >= ?) OR (departure_time <= ? AND arrival_time >= ?) OR (departure_time >= ? AND arrival_time <= ?))",
		schedule.TrackNumber,
		schedule.ID,
		schedule.DepartureTime, schedule.DepartureTime,
		schedule.ArrivalTime, schedule.ArrivalTime,
		schedule.DepartureTime, schedule.ArrivalTime,
	).First(&conflicting).Error

	if err == nil {
		return errors.New("коллизия: путь уже занят в указанное время")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	var beforeSchedule, afterSchedule models.Schedule

	database.DB.Where(
		"track_number = ? AND id != ? AND arrival_time <= ? AND deleted_at IS NULL",
		schedule.TrackNumber,
		schedule.ID,
		schedule.DepartureTime,
	).Order("arrival_time DESC").First(&beforeSchedule)

	if beforeSchedule.ID != 0 {
		gap := schedule.DepartureTime.Sub(beforeSchedule.ArrivalTime)
		if gap < MaintenanceWindow {
			return errors.New("нарушение тех. окна: требуется минимум 20 минут после предыдущего рейса")
		}
	}

	database.DB.Where(
		"track_number = ? AND id != ? AND departure_time >= ? AND deleted_at IS NULL",
		schedule.TrackNumber,
		schedule.ID,
		schedule.ArrivalTime,
	).Order("departure_time ASC").First(&afterSchedule)

	if afterSchedule.ID != 0 {
		gap := afterSchedule.DepartureTime.Sub(schedule.ArrivalTime)
		if gap < MaintenanceWindow {
			return errors.New("нарушение тех. окна: требуется минимум 20 минут перед следующим рейсом")
		}
	}

	return nil
}

type TimeSlot struct {
	TrackNumber   int       `json:"track_number"`
	DepartureTime time.Time `json:"departure_time"`
	ArrivalTime   time.Time `json:"arrival_time"`
}

func (v *ScheduleValidator) FindAlternativeSlots(trackNumber int, duration time.Duration, nearTime time.Time) []TimeSlot {
	var slots []TimeSlot
	var schedules []models.Schedule

	database.DB.Where("track_number = ? AND deleted_at IS NULL", trackNumber).
		Order("departure_time ASC").Find(&schedules)

	now := time.Now()
	if nearTime.Before(now) {
		nearTime = now
	}

	searchStart := nearTime

	for i := 0; i <= len(schedules) && len(slots) < 3; i++ {
		var slotStart, slotEnd time.Time

		if i == 0 {
			if len(schedules) == 0 {
				slotStart = searchStart
				slotEnd = searchStart.Add(24 * time.Hour)
			} else {
				slotStart = searchStart
				slotEnd = schedules[0].DepartureTime.Add(-MaintenanceWindow)
			}
		} else if i == len(schedules) {
			slotStart = schedules[i-1].ArrivalTime.Add(MaintenanceWindow)
			slotEnd = slotStart.Add(24 * time.Hour)
		} else {
			slotStart = schedules[i-1].ArrivalTime.Add(MaintenanceWindow)
			slotEnd = schedules[i].DepartureTime.Add(-MaintenanceWindow)
		}

		if slotStart.Before(now) {
			slotStart = now.Add(MaintenanceWindow)
		}

		availableDuration := slotEnd.Sub(slotStart)
		if availableDuration >= duration {
			slots = append(slots, TimeSlot{
				TrackNumber:   trackNumber,
				DepartureTime: slotStart,
				ArrivalTime:   slotStart.Add(duration),
			})
		}
	}

	return slots
}

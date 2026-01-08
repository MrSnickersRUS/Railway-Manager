package services

import (
	"errors"
	"time"

	"railway-dispatcher/internal/database"
	"railway-dispatcher/internal/models"
)

type PhysicsValidator struct{}

func (v *PhysicsValidator) ValidateTravelPhysics(schedule *models.Schedule) error {
	if schedule.FromStationID == nil || schedule.ToStationID == nil {
		return nil
	}

	var train models.Train
	if err := database.DB.First(&train, schedule.TrainID).Error; err != nil {
		return errors.New("поезд не найден")
	}

	travelTime := schedule.ArrivalTime.Sub(schedule.DepartureTime).Hours()
	if travelTime <= 0 {
		return errors.New("время прибытия должно быть позже времени отправления")
	}

	return nil
}

func GenerateRecurringSchedules(parent *models.Schedule, count int) ([]models.Schedule, error) {
	if parent.Recurrence == models.RecurrenceNone {
		return nil, nil
	}

	var schedules []models.Schedule
	var interval time.Duration

	switch parent.Recurrence {
	case models.RecurrenceDaily:
		interval = 24 * time.Hour
	case models.RecurrenceWeekly:
		interval = 7 * 24 * time.Hour
	case models.RecurrenceMonthly:
		interval = 30 * 24 * time.Hour
	default:
		return nil, nil
	}

	for i := 1; i <= count; i++ {
		schedule := models.Schedule{
			TrainID:       parent.TrainID,
			TrackNumber:   parent.TrackNumber,
			DepartureTime: parent.DepartureTime.Add(interval * time.Duration(i)),
			ArrivalTime:   parent.ArrivalTime.Add(interval * time.Duration(i)),
			Status:        models.StatusScheduled,
			Recurrence:    models.RecurrenceNone,
			FromStationID: parent.FromStationID,
			ToStationID:   parent.ToStationID,
			ParentID:      &parent.ID,
			CreatedByID:   parent.CreatedByID,
		}
		schedules = append(schedules, schedule)
	}

	return schedules, nil
}

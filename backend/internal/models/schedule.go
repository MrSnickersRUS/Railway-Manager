package models

import (
	"time"

	"gorm.io/gorm"
)

type ScheduleStatus string

const (
	StatusScheduled  ScheduleStatus = "Scheduled"
	StatusInProgress ScheduleStatus = "InProgress"
	StatusCompleted  ScheduleStatus = "Completed"
	StatusCancelled  ScheduleStatus = "Cancelled"
)

type Recurrence string

const (
	RecurrenceNone    Recurrence = "none"
	RecurrenceDaily   Recurrence = "daily"
	RecurrenceWeekly  Recurrence = "weekly"
	RecurrenceMonthly Recurrence = "monthly"
)

type Schedule struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	TrainID       uint           `gorm:"not null;index" json:"train_id"`
	TrackNumber   int            `gorm:"not null" json:"track_number"`
	DepartureTime time.Time      `gorm:"not null" json:"departure_time"`
	ArrivalTime   time.Time      `gorm:"not null" json:"arrival_time"`
	Status        ScheduleStatus `gorm:"not null;default:Scheduled" json:"status"`
	Recurrence    Recurrence     `gorm:"not null;default:none" json:"recurrence"`
	FromStationID *uint          `gorm:"index" json:"from_station_id"`
	ToStationID   *uint          `gorm:"index" json:"to_station_id"`
	ParentID      *uint          `gorm:"index" json:"parent_id"`
	CreatedByID   *uint          `gorm:"index" json:"created_by_id"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	Train       Train    `gorm:"foreignKey:TrainID" json:"train,omitempty"`
	FromStation *Station `gorm:"foreignKey:FromStationID" json:"from_station,omitempty"`
	ToStation   *Station `gorm:"foreignKey:ToStationID" json:"to_station,omitempty"`
	CreatedBy   *User    `gorm:"foreignKey:CreatedByID" json:"created_by,omitempty"`
}

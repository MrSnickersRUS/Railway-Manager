package models

import (
	"time"

	"gorm.io/gorm"
)

type StationType string

const (
	StationTypeRegular StationType = "Regular"
	StationTypeDepot   StationType = "Depot"
)

type Station struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"uniqueIndex;not null" json:"name"`
	Code        string         `gorm:"uniqueIndex;not null" json:"code"`
	Type        StationType    `gorm:"not null;default:Regular" json:"type"`
	Latitude    float64        `json:"latitude"`
	Longitude   float64        `json:"longitude"`
	Description string         `json:"description"`
	CreatedByID *uint          `gorm:"index" json:"created_by_id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	CreatedBy *User `gorm:"foreignKey:CreatedByID" json:"created_by,omitempty"`
}

func (s *Station) IsDepot() bool {
	return s.Type == StationTypeDepot
}

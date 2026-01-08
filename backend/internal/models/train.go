package models

import (
	"time"

	"gorm.io/gorm"
)

type TrainType string

const (
	TrainTypeCargo    TrainType = "Cargo"    // Грузовой
	TrainTypeService  TrainType = "Service"  // Служебный
	TrainTypePassager TrainType = "Passager" // Пассажирский
)

type Train struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Number      string         `gorm:"uniqueIndex;not null" json:"number"`
	Type        TrainType      `gorm:"not null;default:Cargo" json:"type"`
	WagonCount  int            `gorm:"not null;default:1" json:"wagon_count"` // Кол-во вагонов
	MaxSpeed    float64        `gorm:"not null;default:60" json:"max_speed"`  // Макс. скорость км/ч
	OwnerID     *uint          `gorm:"index" json:"owner_id"`                 // ID владельца (Carrier)
	Description string         `json:"description"`                           // Описание
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	Owner     *User      `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Schedules []Schedule `gorm:"foreignKey:TrainID" json:"schedules,omitempty"`
}

package models

import "time"

type AuditAction string

const (
	ActionCreate AuditAction = "Create"
	ActionUpdate AuditAction = "Update"
	ActionDelete AuditAction = "Delete"
)

type AuditEntity string

const (
	EntityUser     AuditEntity = "User"
	EntityTrain    AuditEntity = "Train"
	EntitySchedule AuditEntity = "Schedule"
)

type AuditLog struct {
	ID        uint        `gorm:"primaryKey" json:"id"`
	UserID    uint        `gorm:"index" json:"user_id"`
	Action    AuditAction `gorm:"not null" json:"action"`
	Entity    AuditEntity `gorm:"not null" json:"entity"`
	EntityID  uint        `json:"entity_id"`
	OldValue  string      `gorm:"type:text" json:"old_value"`
	NewValue  string      `gorm:"type:text" json:"new_value"`
	IP        string      `json:"ip"`
	Timestamp time.Time   `gorm:"autoCreateTime" json:"timestamp"`

	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

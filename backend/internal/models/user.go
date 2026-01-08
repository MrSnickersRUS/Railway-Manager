package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Role string

const (
	RoleAdmin      Role = "Admin"      // Полный доступ + создание депо
	RoleCarrier    Role = "Carrier"    // Добавление/редактирование своих рейсов, добавление станций
	RoleCompany    Role = "Company"    // Только просмотр рейсов и расписания
	RoleDispatcher Role = "Dispatcher" // Устаревшая роль, эквивалент Carrier
	RoleViewer     Role = "Viewer"     // Только просмотр (эквивалент Company)
)

type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Login        string         `gorm:"uniqueIndex;not null" json:"login"`
	PasswordHash string         `gorm:"not null" json:"-"`
	Role         Role           `gorm:"not null;default:Viewer" json:"role"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	Trains []Train `gorm:"foreignKey:OwnerID" json:"trains,omitempty"`
}

func (u *User) SetPassword(password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.PasswordHash = string(hash)
	return nil
}

func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
	return err == nil
}

func (u *User) CanModify() bool {
	return u.Role == RoleAdmin || u.Role == RoleCarrier || u.Role == RoleDispatcher
}

func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

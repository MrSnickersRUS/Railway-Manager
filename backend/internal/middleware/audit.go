package middleware

import (
	"encoding/json"

	"railway-dispatcher/internal/database"
	"railway-dispatcher/internal/models"

	"github.com/gin-gonic/gin"
)

func LogAudit(action models.AuditAction, entity models.AuditEntity, entityID uint, oldValue, newValue interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if c.Writer.Status() >= 200 && c.Writer.Status() < 300 {
			userID, _ := c.Get("userID")

			oldJSON, _ := json.Marshal(oldValue)
			newJSON, _ := json.Marshal(newValue)

			audit := models.AuditLog{
				UserID:   userID.(uint),
				Action:   action,
				Entity:   entity,
				EntityID: entityID,
				OldValue: string(oldJSON),
				NewValue: string(newJSON),
				IP:       c.ClientIP(),
			}

			database.DB.Create(&audit)
		}
	}
}

func CreateAuditLog(c *gin.Context, action models.AuditAction, entity models.AuditEntity, entityID uint, oldVal, newVal interface{}) {
	userID, exists := c.Get("userID")
	if !exists {
		userID = uint(0)
	}

	oldJSON, _ := json.Marshal(oldVal)
	newJSON, _ := json.Marshal(newVal)

	audit := models.AuditLog{
		UserID:   userID.(uint),
		Action:   action,
		Entity:   entity,
		EntityID: entityID,
		OldValue: string(oldJSON),
		NewValue: string(newJSON),
		IP:       c.ClientIP(),
	}

	database.DB.Create(&audit)
}

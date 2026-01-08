package middleware

import (
	"net/http"

	"railway-dispatcher/internal/models"

	"github.com/gin-gonic/gin"
)

func RequireRole(allowedRoles ...models.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("userRole")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Роль не определена"})
			return
		}

		userRole := role.(models.Role)
		for _, allowed := range allowedRoles {
			if userRole == allowed {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав"})
	}
}

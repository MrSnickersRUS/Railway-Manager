package handlers

import (
	"net/http"
	"strconv"

	"railway-dispatcher/internal/database"
	"railway-dispatcher/internal/middleware"
	"railway-dispatcher/internal/models"

	"github.com/gin-gonic/gin"
)

func GetUsers(c *gin.Context) {
	var users []models.User
	database.DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

func GetUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	c.JSON(http.StatusOK, user)
}

type UpdateUserRequest struct {
	Login    string      `json:"login"`
	Password string      `json:"password"`
	Role     models.Role `json:"role"`
}

func UpdateUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	oldUser := user

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверные данные"})
		return
	}

	if req.Login != "" {
		user.Login = req.Login
	}
	if req.Password != "" {
		user.SetPassword(req.Password)
	}
	if req.Role != "" {
		user.Role = req.Role
	}

	database.DB.Save(&user)
	middleware.CreateAuditLog(c, models.ActionUpdate, models.EntityUser, user.ID, oldUser, user)

	c.JSON(http.StatusOK, user)
}

func DeleteUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	database.DB.Delete(&user)
	middleware.CreateAuditLog(c, models.ActionDelete, models.EntityUser, user.ID, user, nil)

	c.JSON(http.StatusOK, gin.H{"message": "Пользователь удалён"})
}

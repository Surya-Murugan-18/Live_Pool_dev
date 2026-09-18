package routes

import (
	"net/http"

	"livepoll/backend/config"
	"livepoll/backend/handlers"
	"livepoll/backend/middleware"

	"github.com/gin-gonic/gin"
)

func Register(r *gin.Engine, h *handlers.Handler, c config.Config) {
	// Health check
	r.GET("/health", func(x *gin.Context) {
		x.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := r.Group("/api")

	// -------------------------------------------------------------------------
	// Public routes — no auth required
	// -------------------------------------------------------------------------
	api.POST("/auth/signup", h.Signup)
	api.POST("/auth/login", h.Login)
	api.GET("/polls/:id", h.Get)
	api.POST("/polls/:id/vote", h.Vote)
	api.GET("/polls/:id/stream", h.Socket)

	// -------------------------------------------------------------------------
	// Private routes — JWT required
	// -------------------------------------------------------------------------
	private := api.Group("", middleware.Auth(c.JWTSecret))

	// Auth / profile
	private.GET("/auth/me", h.Me)
	private.PATCH("/auth/profile", h.UpdateProfile)
	private.PATCH("/auth/avatar", h.UpdateAvatar)
	private.PATCH("/auth/password", h.ChangePassword)
	private.DELETE("/auth/account", h.DeleteAccount)

	// Polls
	private.GET("/polls", h.List)
	private.POST("/polls", h.Create)
	private.PATCH("/polls/:id/close", h.Close)
	private.DELETE("/polls/:id", h.DeletePoll)
}

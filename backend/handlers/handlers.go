package handlers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"

	"livepoll/backend/config"
	"livepoll/backend/middleware"
	"livepoll/backend/models"
	"livepoll/backend/realtime"
)

type Handler struct {
	cfg   config.Config
	db    *mongo.Database
	redis *redis.Client
	hub   *realtime.Hub
}

func New(c config.Config, db *mongo.Database, r *redis.Client, h *realtime.Hub) *Handler {
	return &Handler{c, db, r, h}
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

func (h *Handler) Signup(c *gin.Context) {
	var in struct{ Name, Email, Password string }
	if c.ShouldBindJSON(&in) != nil || strings.TrimSpace(in.Name) == "" || len(in.Password) < 8 {
		c.JSON(400, gin.H{"error": "invalid signup data"})
		return
	}
	email := strings.ToLower(strings.TrimSpace(in.Email))
	var exists models.User
	if h.db.Collection("users").FindOne(c, emailFilter(email)).Decode(&exists) == nil {
		c.JSON(409, gin.H{"error": "email already registered"})
		return
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	u := models.User{
		Name:         strings.TrimSpace(in.Name),
		Email:        email,
		PasswordHash: string(hash),
		CreatedAt:    time.Now(),
	}
	res, err := h.db.Collection("users").InsertOne(c, u)
	if err != nil {
		c.JSON(500, gin.H{"error": "could not create account"})
		return
	}
	u.ID = res.InsertedID.(primitive.ObjectID)
	h.respondAuth(c, u)
}

func (h *Handler) Login(c *gin.Context) {
	var in struct{ Email, Password string }
	if c.ShouldBindJSON(&in) != nil {
		c.JSON(400, gin.H{"error": "invalid login data"})
		return
	}
	var u models.User
	if err := h.db.Collection("users").FindOne(c, emailFilter(strings.ToLower(strings.TrimSpace(in.Email)))).Decode(&u); err != nil ||
		bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(in.Password)) != nil {
		c.JSON(401, gin.H{"error": "invalid email or password"})
		return
	}
	h.respondAuth(c, u)
}

func (h *Handler) respondAuth(c *gin.Context, u models.User) {
	t, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": u.ID.Hex(),
		"exp": time.Now().Add(7 * 24 * time.Hour).Unix(),
	}).SignedString([]byte(h.cfg.JWTSecret))
	c.JSON(200, gin.H{"token": t, "user": u})
}

func (h *Handler) Me(c *gin.Context) {
	var u models.User
	if h.db.Collection("users").FindOne(c, bson.M{"_id": middleware.UserID(c)}).Decode(&u) != nil {
		c.JSON(404, gin.H{"error": "not found"})
		return
	}
	c.JSON(200, u)
}

// UpdateProfile — PATCH /api/auth/profile
// Accepts: { name: string }
// Returns: updated User object
func (h *Handler) UpdateProfile(c *gin.Context) {
	var in struct {
		Name string `json:"name"`
	}
	if c.ShouldBindJSON(&in) != nil || strings.TrimSpace(in.Name) == "" {
		c.JSON(400, gin.H{"error": "name is required"})
		return
	}
	uid := middleware.UserID(c)
	res, err := h.db.Collection("users").UpdateOne(
		c,
		bson.M{"_id": uid},
		bson.M{"$set": bson.M{"name": strings.TrimSpace(in.Name)}},
	)
	if err != nil || res.MatchedCount == 0 {
		c.JSON(500, gin.H{"error": "could not update profile"})
		return
	}
	h.Me(c)
}

// UpdateAvatar — PATCH /api/auth/avatar
// Accepts: { avatarUrl: string } — a base64 data-URI, max 200 KB
// Returns: updated User object
func (h *Handler) UpdateAvatar(c *gin.Context) {
	var in struct {
		AvatarUrl string `json:"avatarUrl"`
	}
	if c.ShouldBindJSON(&in) != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}

	// Basic validation: must be a data-URI or empty string (to clear avatar)
	if in.AvatarUrl != "" && !strings.HasPrefix(in.AvatarUrl, "data:image/") {
		c.JSON(400, gin.H{"error": "avatarUrl must be a base64 image data-URI"})
		return
	}

	// Enforce a 200 KB limit on the stored data-URI
	const maxBytes = 200 * 1024
	if len(in.AvatarUrl) > maxBytes {
		c.JSON(400, gin.H{"error": "image is too large — max 200 KB after resizing"})
		return
	}

	uid := middleware.UserID(c)
	res, err := h.db.Collection("users").UpdateOne(
		c,
		bson.M{"_id": uid},
		bson.M{"$set": bson.M{"avatarUrl": in.AvatarUrl}},
	)
	if err != nil || res.MatchedCount == 0 {
		c.JSON(500, gin.H{"error": "could not update avatar"})
		return
	}
	h.Me(c)
}

// ChangePassword — PATCH /api/auth/password
// Accepts: { current: string, new: string }
func (h *Handler) ChangePassword(c *gin.Context) {
	var in struct {
		Current string `json:"current"`
		New     string `json:"new"`
	}
	if c.ShouldBindJSON(&in) != nil || len(strings.TrimSpace(in.New)) < 8 {
		c.JSON(400, gin.H{"error": "new password must be at least 8 characters"})
		return
	}
	var u models.User
	if h.db.Collection("users").FindOne(c, bson.M{"_id": middleware.UserID(c)}).Decode(&u) != nil {
		c.JSON(404, gin.H{"error": "user not found"})
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(in.Current)) != nil {
		c.JSON(401, gin.H{"error": "current password is incorrect"})
		return
	}
	if in.Current == in.New {
		c.JSON(400, gin.H{"error": "new password must be different from current password"})
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(in.New), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "could not update password"})
		return
	}
	_, err = h.db.Collection("users").UpdateOne(
		c,
		bson.M{"_id": u.ID},
		bson.M{"$set": bson.M{"passwordHash": string(hash)}},
	)
	if err != nil {
		c.JSON(500, gin.H{"error": "could not update password"})
		return
	}
	c.JSON(200, gin.H{"message": "password updated successfully"})
}

// DeleteAccount — DELETE /api/auth/account
// Accepts: { password: string } for confirmation
// Cascades deletion to all owned polls and their votes
func (h *Handler) DeleteAccount(c *gin.Context) {
	var in struct {
		Password string `json:"password"`
	}
	if c.ShouldBindJSON(&in) != nil || in.Password == "" {
		c.JSON(400, gin.H{"error": "password confirmation is required"})
		return
	}
	uid := middleware.UserID(c)
	var u models.User
	if h.db.Collection("users").FindOne(c, bson.M{"_id": uid}).Decode(&u) != nil {
		c.JSON(404, gin.H{"error": "user not found"})
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(in.Password)) != nil {
		c.JSON(401, gin.H{"error": "incorrect password"})
		return
	}

	// Cascade: delete votes for all owned polls
	cur, err := h.db.Collection("polls").Find(c, bson.M{"ownerId": uid})
	if err == nil {
		var polls []models.Poll
		_ = cur.All(c, &polls)
		pollIDs := make([]primitive.ObjectID, 0, len(polls))
		for _, p := range polls {
			pollIDs = append(pollIDs, p.ID)
		}
		if len(pollIDs) > 0 {
			_, _ = h.db.Collection("votes").DeleteMany(c, bson.M{"pollId": bson.M{"$in": pollIDs}})
		}
	}

	_, _ = h.db.Collection("polls").DeleteMany(c, bson.M{"ownerId": uid})
	_, _ = h.db.Collection("users").DeleteOne(c, bson.M{"_id": uid})

	c.JSON(200, gin.H{"message": "account deleted"})
}

// ---------------------------------------------------------------------------
// Polls
// ---------------------------------------------------------------------------

func emailFilter(email string) bson.M { return bson.M{"email": email} }

func (h *Handler) List(c *gin.Context) {
	cur, _ := h.db.Collection("polls").Find(c, bson.M{"ownerId": middleware.UserID(c)})
	var out []models.Poll
	_ = cur.All(c, &out)
	if out == nil {
		out = []models.Poll{}
	}
	c.JSON(200, out)
}

func (h *Handler) Create(c *gin.Context) {
	var in struct {
		Question     string   `json:"question"`
		Options      []string `json:"options"`
		AllowOneVote bool     `json:"allowOneVote"`
	}
	if c.ShouldBindJSON(&in) != nil || len(strings.TrimSpace(in.Question)) < 3 || len(in.Options) < 2 {
		c.JSON(400, gin.H{"error": "invalid poll data"})
		return
	}
	opts := make([]models.Option, 0, len(in.Options))
	for _, label := range in.Options {
		label = strings.TrimSpace(label)
		if label == "" {
			c.JSON(400, gin.H{"error": "options cannot be empty"})
			return
		}
		opts = append(opts, models.Option{ID: primitive.NewObjectID().Hex(), Label: label})
	}
	p := models.Poll{
		OwnerID:      middleware.UserID(c),
		Question:     strings.TrimSpace(in.Question),
		Options:      opts,
		Status:       "active",
		AllowOneVote: in.AllowOneVote,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	res, err := h.db.Collection("polls").InsertOne(c, p)
	if err != nil {
		c.JSON(500, gin.H{"error": "could not create poll"})
		return
	}
	p.ID = res.InsertedID.(primitive.ObjectID)
	c.JSON(201, p)
}

func (h *Handler) Get(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(404, gin.H{"error": "poll not found"})
		return
	}
	var p models.Poll
	if h.db.Collection("polls").FindOne(c, bson.M{"_id": id}).Decode(&p) != nil {
		c.JSON(404, gin.H{"error": "poll not found"})
		return
	}
	c.JSON(200, p)
}

func (h *Handler) Close(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid poll id"})
		return
	}
	res, err := h.db.Collection("polls").UpdateOne(
		c,
		bson.M{"_id": id, "ownerId": middleware.UserID(c)},
		bson.M{"$set": bson.M{"status": "closed", "updatedAt": time.Now()}},
	)
	if err != nil || res.MatchedCount == 0 {
		c.JSON(404, gin.H{"error": "poll not found"})
		return
	}
	h.Get(c)
}

// DeletePoll — DELETE /api/polls/:id
// Only the poll owner may delete. Also deletes all votes for this poll.
func (h *Handler) DeletePoll(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid poll id"})
		return
	}
	// Verify ownership before deleting
	res, err := h.db.Collection("polls").DeleteOne(
		c,
		bson.M{"_id": id, "ownerId": middleware.UserID(c)},
	)
	if err != nil {
		c.JSON(500, gin.H{"error": "could not delete poll"})
		return
	}
	if res.DeletedCount == 0 {
		c.JSON(404, gin.H{"error": "poll not found"})
		return
	}
	// Cascade delete all votes for this poll
	_, _ = h.db.Collection("votes").DeleteMany(c, bson.M{"pollId": id})
	c.JSON(200, gin.H{"message": "poll deleted"})
}

func (h *Handler) Vote(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid poll id"})
		return
	}
	var in struct {
		OptionID string `json:"optionId"`
	}
	if c.ShouldBindJSON(&in) != nil || in.OptionID == "" {
		c.JSON(400, gin.H{"error": "option required"})
		return
	}
	var p models.Poll
	if h.db.Collection("polls").FindOne(c, bson.M{"_id": id}).Decode(&p) != nil || p.Status != "active" {
		c.JSON(409, gin.H{"error": "poll is closed or missing"})
		return
	}
	valid := false
	for _, o := range p.Options {
		if o.ID == in.OptionID {
			valid = true
		}
	}
	if !valid {
		c.JSON(400, gin.H{"error": "invalid option"})
		return
	}
	key := c.ClientIP() + ":" + id.Hex()
	if p.AllowOneVote {
		n, _ := h.db.Collection("votes").CountDocuments(c, bson.M{"pollId": id, "voterKey": key})
		if n > 0 {
			c.JSON(409, gin.H{"error": "you have already voted"})
			return
		}
	}
	_, err = h.db.Collection("votes").InsertOne(c, models.Vote{
		PollID:    id,
		OptionID:  in.OptionID,
		VoterKey:  key,
		CreatedAt: time.Now(),
	})
	if err != nil {
		c.JSON(500, gin.H{"error": "could not save vote"})
		return
	}
	_, _ = h.db.Collection("polls").UpdateOne(
		c,
		bson.M{"_id": id, "options.id": in.OptionID},
		bson.M{"$inc": bson.M{"options.$.votes": 1}},
	)
	h.Get(c)
	var updated models.Poll
	_ = h.db.Collection("polls").FindOne(c, bson.M{"_id": id}).Decode(&updated)
	total := 0
	for _, o := range updated.Options {
		total += o.Votes
	}
	h.hub.Publish(context.Background(), id.Hex(), gin.H{
		"pollId":     id.Hex(),
		"optionId":   in.OptionID,
		"votes":      updated.Options,
		"totalVotes": total,
	})
}

// ---------------------------------------------------------------------------
// WebSocket
// ---------------------------------------------------------------------------

func (h *Handler) Socket(c *gin.Context) {
	id := c.Param("id")
	up := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return r.Header.Get("Origin") == h.cfg.FrontendURL || h.cfg.FrontendURL == "*"
		},
	}
	conn, err := up.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	client := h.hub.Client(conn, id)
	h.hub.Add(client)
	defer h.hub.Remove(client)
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			return
		}
	}
}

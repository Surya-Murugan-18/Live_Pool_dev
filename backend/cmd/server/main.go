package main

import (
	"context"
	"log"
	"time"

	"livepoll/backend/config"
	"livepoll/backend/handlers"
	"livepoll/backend/realtime"
	"livepoll/backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		log.Fatal(err)
	}

	if err = mongoClient.Ping(ctx, nil); err != nil {
		log.Fatal(err)
	}

	db := mongoClient.Database(cfg.Database)

	// Ensure indexes for correctness and query performance
	if err = ensureIndexes(ctx, db); err != nil {
		log.Printf("warning: could not create indexes: %v", err)
	}

	rdb := redis.NewClient(&redis.Options{
		Addr: cfg.RedisURL,
	})

	if err = rdb.Ping(context.Background()).Err(); err != nil {
		log.Fatal(err)
	}

	hub := realtime.NewHub(rdb)
	go hub.Run()

	h := handlers.New(cfg, db, rdb, hub)

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			cfg.FrontendURL,
			"http://localhost:3000",
			"http://localhost:5173",
			"http://localhost:8080",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	routes.Register(router, h, cfg)

	log.Printf("LivePoll API listening on :%s", cfg.Port)

	if err := router.Run("0.0.0.0:" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}

// ensureIndexes creates required MongoDB indexes if they do not already exist.
func ensureIndexes(ctx context.Context, db *mongo.Database) error {
	// users: unique index on email
	_, err := db.Collection("users").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return err
	}

	// polls: index on ownerId for fast list queries
	_, err = db.Collection("polls").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "ownerId", Value: 1}},
	})
	if err != nil {
		return err
	}

	// votes: compound index for dedup checks
	_, err = db.Collection("votes").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "pollId", Value: 1},
			{Key: "voterKey", Value: 1},
		},
	})
	return err
}

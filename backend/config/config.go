package config

import "os"

type Config struct { MongoURI, Database, RedisURL, JWTSecret, Port, FrontendURL string }
func Load() Config { return Config{env("MONGO_URI","mongodb://localhost:27017"), env("MONGO_DATABASE","livepoll"), env("REDIS_URL","localhost:6379"), env("JWT_SECRET","change-me"), env("PORT","8080"), env("FRONTEND_URL","http://localhost:5173")} }
func env(k, fallback string) string { if v:=os.Getenv(k); v!="" { return v }; return fallback }

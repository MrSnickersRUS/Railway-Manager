package config

import "os"

type Config struct {
	ServerPort string
	DBPath     string
	JWTSecret  string
}

func Load() *Config {
	return &Config{
		ServerPort: getEnv("SERVER_PORT", "8080"),
		DBPath:     getEnv("DB_PATH", "railway.db"),
		JWTSecret:  getEnv("JWT_SECRET", "super-secret-key-change-in-production"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

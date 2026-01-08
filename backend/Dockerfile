# Backend сборка
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Зависимости
COPY go.mod go.sum ./
RUN go mod download

# Исходники
COPY . .

# Сборка
RUN CGO_ENABLED=1 GOOS=linux go build -o server ./cmd/server

# Runtime
FROM alpine:3.19

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]

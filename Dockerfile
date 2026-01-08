FROM golang:1.21-alpine AS builder

RUN apk add --no-cache gcc musl-dev

WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .

RUN CGO_ENABLED=1 GOOS=linux go build -o railway-dispatcher ./cmd/server

FROM alpine:3.19

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=builder /app/railway-dispatcher .

ENV SERVER_PORT=8080
ENV JWT_SECRET=production-secret-change-me
ENV DB_PATH=/app/data/railway.db

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["./railway-dispatcher"]

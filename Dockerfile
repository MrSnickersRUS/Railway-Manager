FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

FROM golang:1.23-alpine AS backend-builder
ENV GOTOOLCHAIN=auto

WORKDIR /app

COPY backend/ ./

RUN go mod download

RUN go build -o server ./cmd/server

FROM alpine:latest

WORKDIR /root/

RUN apk --no-cache add ca-certificates

COPY --from=backend-builder /app/server .
COPY --from=frontend-builder /frontend/dist ./frontend

EXPOSE 8080

CMD ["./server"]

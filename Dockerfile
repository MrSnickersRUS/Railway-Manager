FROM golang:1.23-alpine AS builder
ENV GOTOOLCHAIN=auto

WORKDIR /app

COPY backend/ ./

RUN go mod download

RUN go build -o server ./cmd/server

FROM alpine:latest

WORKDIR /root/

RUN apk --no-cache add ca-certificates

COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]

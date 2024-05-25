# Start from the official Go image to build the binary
FROM golang:1.22.3-alpine AS builder

# Set the working directory in the builder container
WORKDIR /usr/src/app

# Copy the local package files to the container's workspace
COPY . .

# Build the Go application
RUN go build -o main main.go

# Use a minimal alpine image for the final stage
FROM alpine:latest

# Set the working directory in the final stage container
WORKDIR /app

# Set the GIN_MODE environment variable to release
ENV GIN_MODE=release

# Copy the binary from the builder stage
COPY --from=builder /usr/src/app/main /app/

# Copy the .env file from your local machine to the Docker image
COPY --from=builder /usr/src/app/.env /app/

# Expose port 8082 to the outside world
EXPOSE 8082

# Command to run the executable
CMD ["./main"]

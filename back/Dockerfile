# Use an official Go runtime as a parent image
FROM golang:1.18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the local package files to the container's workspace
COPY . .

# Build the Go application
RUN go build -o main main.go

# Expose port 8080 to the outside world
EXPOSE 8082

# Command to run the executable
CMD ["./main"]

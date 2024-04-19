package main

import (
	"fmt"
	"net"
	"time"

	// Include gRPC libraries (replace with actual import paths)
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// Define mock network traffic data structure
type PacketInfo struct {
	SourceIP   string
	DestIP     string
	SourcePort int
	DestPort   int
	Protocol   string
}

// Mock gRPC server for data export
type MockEBPFServer struct {
	// Add fields to store mock data or statistics
}

func (s *MockEBPFServer) GetNetworkStats(stream pb.ServerStream) error {
	// Simulate data generation
	packets := []PacketInfo{
		{"10.0.0.1", "8.8.8.8", 53, 443, "TCP"},
		{"192.168.1.10", "10.0.0.2", 80, 80, "HTTP"},
		// Add more sample packets
	}

	for _, packet := range packets {
		// Send mock data to stream with some delay for demo purposes
		if err := stream.Send(&packet); err != nil {
			return err
		}
		time.Sleep(time.Second)
	}
	return nil
}

func main() {
	lis, err := net.Listen("tcp", ":50051") // Replace with desired port
	if err != nil {
		panic(err)
	}

	server := grpc.NewServer()
	pb.RegisterMockEBPFServer(server, &MockEBPFServer{})

	fmt.Println("Mock eBPF Agent listening on port 50051")
	if err := server.Serve(lis); err != nil {
		panic(err)
	}
}

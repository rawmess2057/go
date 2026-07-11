package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type ActionMetadata struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Label       string `json:"label"`
}

func main() {
	http.HandleFunc("/api/actions/donate", handleDonateAction)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "Gobounty Solana Blink API is live!")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Printf("Server running on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleDonateAction(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		// Return Blink metadata
		metadata := ActionMetadata{
			Title:       "Donate to Gobounty",
			Description: "Support the Gobounty project on Solana",
			Icon:        "https://your-icon-url.com/icon.png",
			Label:       "Send SOL",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(metadata)
		return
	}

	if r.Method == "POST" {
		// Handle transaction here (create + sign transaction)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"transaction": "base64-encoded-tx-here"}`)
	}
}

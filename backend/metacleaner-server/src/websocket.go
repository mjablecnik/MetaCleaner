package main

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // origin validation handled by CORS middleware
	},
}

// WebSocketHub manages WebSocket connections per job ID.
type WebSocketHub struct {
	mu    sync.Mutex
	conns map[string][]*websocket.Conn
}

// NewWebSocketHub creates an empty hub.
func NewWebSocketHub() *WebSocketHub {
	return &WebSocketHub{conns: make(map[string][]*websocket.Conn)}
}

// Register adds conn to the set of connections listening for jobID.
func (h *WebSocketHub) Register(jobID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.conns[jobID] = append(h.conns[jobID], conn)
}

// Unregister removes conn from the set for jobID.
func (h *WebSocketHub) Unregister(jobID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	conns := h.conns[jobID]
	filtered := conns[:0]
	for _, c := range conns {
		if c != conn {
			filtered = append(filtered, c)
		}
	}
	if len(filtered) == 0 {
		delete(h.conns, jobID)
	} else {
		h.conns[jobID] = filtered
	}
}

// Broadcast sends a JSON-encoded event to all connections registered for jobID.
// Dead connections are silently removed.
func (h *WebSocketHub) Broadcast(jobID string, event ProgressEvent) {
	data, err := json.Marshal(event)
	if err != nil {
		return
	}

	h.mu.Lock()
	conns := make([]*websocket.Conn, len(h.conns[jobID]))
	copy(conns, h.conns[jobID])
	h.mu.Unlock()

	var dead []*websocket.Conn
	for _, c := range conns {
		if err := c.WriteMessage(websocket.TextMessage, data); err != nil {
			dead = append(dead, c)
		}
	}

	for _, c := range dead {
		h.Unregister(jobID, c)
		c.Close()
	}
}

// handleJobProgress upgrades the connection to WebSocket and streams events
// for the job identified by the {id} path parameter.
func handleJobProgress(hub *WebSocketHub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		jobID := r.PathValue("id")
		if jobID == "" {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "Missing job ID")
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			// upgrader already wrote an HTTP error response
			return
		}

		hub.Register(jobID, conn)
		defer func() {
			hub.Unregister(jobID, conn)
			conn.Close()
		}()

		// Read loop — discard messages, detect client disconnect.
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				break
			}
		}
	}
}

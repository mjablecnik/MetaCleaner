package source

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)


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

// batchUnregister removes all dead connections for jobID in a single lock acquisition.
func (h *WebSocketHub) batchUnregister(jobID string, dead []*websocket.Conn) {
	if len(dead) == 0 {
		return
	}
	deadSet := make(map[*websocket.Conn]struct{}, len(dead))
	for _, c := range dead {
		deadSet[c] = struct{}{}
	}

	h.mu.Lock()
	conns := h.conns[jobID]
	live := conns[:0]
	for _, c := range conns {
		if _, isDead := deadSet[c]; !isDead {
			live = append(live, c)
		}
	}
	if len(live) == 0 {
		delete(h.conns, jobID)
	} else {
		h.conns[jobID] = live
	}
	h.mu.Unlock()

	for _, c := range dead {
		c.Close()
	}
}

// Broadcast sends a JSON-encoded event to all connections registered for jobID.
// Dead connections are removed in a single batch lock acquisition.
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

	h.batchUnregister(jobID, dead)
}

// HandleJobProgress upgrades the connection to WebSocket and streams events
// for the job identified by the {id} path parameter. The JWT must be passed
// as a ?token= query parameter (browsers cannot set custom headers on WebSocket).
func HandleJobProgress(hub *WebSocketHub, auth *AuthMiddleware, frontendOrigin string) http.HandlerFunc {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			origin := r.Header.Get("Origin")
			return origin == "" || origin == frontendOrigin
		},
	}
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.URL.Query().Get("token")
		if token == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "missing token")
			return
		}
		if _, err := auth.validateJWT(token); err != nil {
			if ae, ok := err.(*authError); ok {
				WriteError(w, http.StatusUnauthorized, ae.code, ae.message)
			} else {
				WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "unauthorized")
			}
			return
		}

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

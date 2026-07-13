package source

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// wsTicketTTL is how long a progress ticket remains valid before the WebSocket upgrade.
	wsTicketTTL = 30 * time.Second
	// maxWSConnsPerJob is the maximum concurrent WebSocket connections allowed per job.
	maxWSConnsPerJob = 5
	// maxWSConnsPerUser is the maximum concurrent WebSocket connections per authenticated user.
	maxWSConnsPerUser = 3
	// maxWSConnsGlobal is the hard ceiling on total WebSocket connections across all users/jobs.
	maxWSConnsGlobal = 200
	// wsReadLimit is the maximum frame size accepted from the client (bytes).
	// The progress endpoint expects no meaningful client payload.
	wsReadLimit = 512
	// wsPingInterval is how often the server sends a ping to keep the connection alive.
	wsPingInterval = 30 * time.Second
	// wsPongTimeout is how long the server waits for a pong before closing the connection.
	wsPongTimeout = 60 * time.Second
)

// wsTicketEntry holds the data bound to a single-use progress ticket.
type wsTicketEntry struct {
	userID    string
	jobID     string
	expiresAt time.Time
}

// WSTicketStore mints and consumes short-lived single-use progress tickets.
// The bearer JWT never appears in the WebSocket URL (and therefore in proxy logs);
// instead, the client POSTs to /api/jobs/{id}/ws-ticket (authenticated), receives a
// 30-second opaque ticket, and passes that as ?ticket= on the upgrade request.
type WSTicketStore struct {
	mu      sync.Mutex
	tickets map[string]wsTicketEntry
}

// NewWSTicketStore creates an empty ticket store.
func NewWSTicketStore() *WSTicketStore {
	return &WSTicketStore{tickets: make(map[string]wsTicketEntry)}
}

// Mint creates a 16-byte random ticket scoped to userID and jobID.
func (s *WSTicketStore) Mint(userID, jobID string) (string, error) {
	raw := make([]byte, 16)
	if _, err := rand.Read(raw); err != nil {
		return "", err
	}
	ticket := hex.EncodeToString(raw)
	s.mu.Lock()
	s.tickets[ticket] = wsTicketEntry{
		userID:    userID,
		jobID:     jobID,
		expiresAt: time.Now().Add(wsTicketTTL),
	}
	s.mu.Unlock()
	return ticket, nil
}

// Consume validates and atomically deletes a ticket. Returns (userID, true) on success.
// Expired tickets and tickets belonging to a different job are rejected.
func (s *WSTicketStore) Consume(ticket, jobID string) (string, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	entry, ok := s.tickets[ticket]
	delete(s.tickets, ticket) // always delete — single-use
	if !ok || entry.jobID != jobID || time.Now().After(entry.expiresAt) {
		return "", false
	}
	return entry.userID, true
}

// HandleMintWSTicket handles POST /api/jobs/{id}/ws-ticket — mints a short-lived
// single-use progress ticket scoped to the job. The client uses this ticket in the
// WebSocket URL as ?ticket= within 30 seconds, keeping the bearer JWT out of proxy logs.
func HandleMintWSTicket(store *WSTicketStore, db *SupabaseClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := UserIDFromContext(r.Context())
		if userID == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "authentication required")
			return
		}
		jobID := r.PathValue("id")
		if jobID == "" || !uuidV4Pattern.MatchString(jobID) {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "invalid job ID")
			return
		}
		job, err := db.GetJob(r.Context(), jobID, userID)
		if err != nil || job == nil {
			WriteError(w, http.StatusNotFound, ErrJobNotFound, "job not found or access denied")
			return
		}
		ticket, err := store.Mint(userID, jobID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, ErrDatabaseError, "failed to mint ticket")
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"ticket": ticket})
	}
}

// wsConn wraps a WebSocket connection with a per-connection mutex to serialize writes.
// gorilla/websocket's WriteMessage is not goroutine-safe and panics ("concurrent write
// to websocket connection") when two goroutines write simultaneously. Routing all writes
// through this struct's write() method prevents the race between Broadcast (driven by
// the pipeline worker) and the per-connection ping goroutine.
type wsConn struct {
	conn   *websocket.Conn
	mu     sync.Mutex
	userID string // used by hub to decrement per-user count on disconnect
}

func (c *wsConn) write(msgType int, data []byte) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.conn.WriteMessage(msgType, data)
}

func (c *wsConn) close() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.conn.Close()
}

// WebSocketHub manages WebSocket connections per job ID.
type WebSocketHub struct {
	mu         sync.Mutex
	conns      map[string][]*wsConn
	userConns  map[string]int             // userID → active connection count
	totalConns int                        // global connection count
	waiters    map[string][]chan struct{} // channels closed when first client registers for a job
}

// NewWebSocketHub creates an empty hub.
func NewWebSocketHub() *WebSocketHub {
	return &WebSocketHub{
		conns:     make(map[string][]*wsConn),
		userConns: make(map[string]int),
		waiters:   make(map[string][]chan struct{}),
	}
}

// WaitForRegistration returns a channel that is closed when the first WebSocket
// client registers for the given jobID, or after the timeout — whichever comes first.
// This allows the pipeline to wait for the frontend to connect before broadcasting.
func (h *WebSocketHub) WaitForRegistration(jobID string, timeout time.Duration) <-chan struct{} {
	ch := make(chan struct{})

	h.mu.Lock()
	// If there's already a connection for this job, signal immediately
	if len(h.conns[jobID]) > 0 {
		h.mu.Unlock()
		close(ch)
		return ch
	}
	h.waiters[jobID] = append(h.waiters[jobID], ch)
	h.mu.Unlock()

	// Timeout fallback — don't block forever if WS never connects (e.g. CLI client)
	go func() {
		time.Sleep(timeout)
		select {
		case <-ch:
			// Already closed by Register
		default:
			close(ch)
		}
		// Clean up waiter
		h.mu.Lock()
		waiters := h.waiters[jobID]
		filtered := waiters[:0]
		for _, w := range waiters {
			if w != ch {
				filtered = append(filtered, w)
			}
		}
		if len(filtered) == 0 {
			delete(h.waiters, jobID)
		} else {
			h.waiters[jobID] = filtered
		}
		h.mu.Unlock()
	}()

	return ch
}

// Register wraps conn in a wsConn (for serialized writes), adds it to the set of
// connections listening for jobID, and returns the wrapper. Returns nil, false if any
// of the per-job, per-user, or global connection caps have been reached.
func (h *WebSocketHub) Register(jobID, userID string, conn *websocket.Conn) (*wsConn, bool) {
	h.mu.Lock()
	if len(h.conns[jobID]) >= maxWSConnsPerJob ||
		h.userConns[userID] >= maxWSConnsPerUser ||
		h.totalConns >= maxWSConnsGlobal {
		h.mu.Unlock()
		return nil, false
	}
	wc := &wsConn{conn: conn, userID: userID}
	h.conns[jobID] = append(h.conns[jobID], wc)
	h.userConns[userID]++
	h.totalConns++
	// Signal all waiters that a client has connected
	waiters := h.waiters[jobID]
	delete(h.waiters, jobID)
	h.mu.Unlock()

	for _, ch := range waiters {
		select {
		case <-ch:
			// Already closed (timeout)
		default:
			close(ch)
		}
	}
	return wc, true
}

// Unregister removes the connection identified by conn from the set for jobID
// and decrements the per-user and global connection counts.
func (h *WebSocketHub) Unregister(jobID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	conns := h.conns[jobID]
	filtered := conns[:0]
	for _, wc := range conns {
		if wc.conn != conn {
			filtered = append(filtered, wc)
		} else {
			if h.userConns[wc.userID] > 0 {
				h.userConns[wc.userID]--
				if h.userConns[wc.userID] == 0 {
					delete(h.userConns, wc.userID)
				}
			}
			if h.totalConns > 0 {
				h.totalConns--
			}
		}
	}
	if len(filtered) == 0 {
		delete(h.conns, jobID)
	} else {
		h.conns[jobID] = filtered
	}
}

// batchUnregister removes all dead connections for jobID in a single lock acquisition
// and decrements the per-user and global connection counts.
func (h *WebSocketHub) batchUnregister(jobID string, dead []*wsConn) {
	if len(dead) == 0 {
		return
	}
	deadSet := make(map[*wsConn]struct{}, len(dead))
	for _, wc := range dead {
		deadSet[wc] = struct{}{}
	}

	h.mu.Lock()
	conns := h.conns[jobID]
	live := conns[:0]
	for _, wc := range conns {
		if _, isDead := deadSet[wc]; !isDead {
			live = append(live, wc)
		} else {
			if h.userConns[wc.userID] > 0 {
				h.userConns[wc.userID]--
				if h.userConns[wc.userID] == 0 {
					delete(h.userConns, wc.userID)
				}
			}
			if h.totalConns > 0 {
				h.totalConns--
			}
		}
	}
	if len(live) == 0 {
		delete(h.conns, jobID)
	} else {
		h.conns[jobID] = live
	}
	h.mu.Unlock()

	for _, wc := range dead {
		wc.close()
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
	conns := make([]*wsConn, len(h.conns[jobID]))
	copy(conns, h.conns[jobID])
	h.mu.Unlock()

	var dead []*wsConn
	for _, wc := range conns {
		if err := wc.write(websocket.TextMessage, data); err != nil {
			dead = append(dead, wc)
		}
	}

	h.batchUnregister(jobID, dead)
}

// HandleJobProgress upgrades the connection to WebSocket and streams events
// for the job identified by the {id} path parameter. Authentication uses a
// short-lived single-use ticket (?ticket=) minted by HandleMintWSTicket rather
// than the bearer JWT, so the access token never appears in proxy/access logs.
func HandleJobProgress(hub *WebSocketHub, ticketStore *WSTicketStore, frontendOrigin string) http.HandlerFunc {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			origin := r.Header.Get("Origin")
			return origin == "" || origin == frontendOrigin
		},
	}
	return func(w http.ResponseWriter, r *http.Request) {
		jobID := r.PathValue("id")
		if jobID == "" || !uuidV4Pattern.MatchString(jobID) {
			WriteError(w, http.StatusBadRequest, ErrInvalidRequest, "Invalid job ID")
			return
		}

		ticket := r.URL.Query().Get("ticket")
		if ticket == "" {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "missing ticket")
			return
		}
		sub, ok := ticketStore.Consume(ticket, jobID)
		if !ok {
			WriteError(w, http.StatusUnauthorized, ErrAuthUnauthorized, "invalid or expired ticket")
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			// upgrader already wrote an HTTP error response
			return
		}

		// Cap frame size and enforce a read deadline refreshed by pong replies.
		conn.SetReadLimit(wsReadLimit)
		conn.SetReadDeadline(time.Now().Add(wsPongTimeout)) //nolint:errcheck
		conn.SetPongHandler(func(string) error {
			conn.SetReadDeadline(time.Now().Add(wsPongTimeout)) //nolint:errcheck
			return nil
		})

		wc, ok := hub.Register(jobID, sub, conn)
		if !ok {
			conn.WriteMessage(websocket.CloseMessage, //nolint:errcheck
				websocket.FormatCloseMessage(websocket.CloseTryAgainLater, "too many connections"))
			conn.Close()
			return
		}
		defer func() {
			hub.Unregister(jobID, conn)
			conn.Close()
		}()

		// Send periodic pings so we can detect dead connections via read deadline.
		// Writes are routed through wc.write() to serialize with Broadcast — gorilla/websocket
		// panics on concurrent writes, and the ping goroutine races with progress broadcasts.
		go func() {
			ticker := time.NewTicker(wsPingInterval)
			defer ticker.Stop()
			for range ticker.C {
				if err := wc.write(websocket.PingMessage, nil); err != nil {
					return
				}
			}
		}()

		// Read loop — discard messages, detect client disconnect.
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				break
			}
		}
	}
}

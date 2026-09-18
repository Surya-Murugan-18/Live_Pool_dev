package realtime

import ( "context"; "encoding/json"; "log"; "sync"; "github.com/gorilla/websocket"; "github.com/redis/go-redis/v9" )
type Client struct { conn *websocket.Conn; pollID string }
type Hub struct { redis *redis.Client; clients map[*Client]bool; mu sync.RWMutex; register chan *Client; unregister chan *Client }
func NewHub(r *redis.Client) *Hub { return &Hub{redis:r, clients:map[*Client]bool{}, register:make(chan *Client), unregister:make(chan *Client)} }
func (h *Hub) Run() { pub := h.redis.PSubscribe(context.Background(), "poll:*:votes"); ch:=pub.Channel(); go func(){ for msg:=range ch { var p struct{ PollID string `json:"pollId"` }; if json.Unmarshal([]byte(msg.Payload), &p)==nil { h.mu.RLock(); for c:=range h.clients { if c.pollID==p.PollID { _=c.conn.WriteMessage(websocket.TextMessage, []byte(msg.Payload)) } }; h.mu.RUnlock() } } }(); for { select { case c:=<-h.register: h.mu.Lock(); h.clients[c]=true; h.mu.Unlock(); case c:=<-h.unregister: h.mu.Lock(); delete(h.clients,c); h.mu.Unlock(); _=c.conn.Close() } } }
func (h *Hub) Add(c *Client) { h.register<-c }
func (h *Hub) Remove(c *Client) { h.unregister<-c }
func (h *Hub) Client(conn *websocket.Conn, pollID string) *Client { return &Client{conn:conn,pollID:pollID} }
func (h *Hub) Publish(ctx context.Context, pollID string, payload any) { b,err:=json.Marshal(payload); if err==nil { if err=h.redis.Publish(ctx,"poll:"+pollID+":votes",b).Err(); err!=nil { log.Printf("redis publish: %v",err) } } }

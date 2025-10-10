# 🔌 APRATIM'S AI 2.0 - API Documentation

Complete API reference for APRATIM'S AI 2.0 backend services.

## 🌐 Base URL

```
Development: http://localhost:5000
Production: https://your-api-domain.com
```

## 🔑 Authentication

Currently, the API uses a simple approach. For production, implement proper authentication:

```javascript
// Add to request headers
{
  "Authorization": "Bearer your-jwt-token",
  "Content-Type": "application/json"
}
```

## 📡 WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000')

socket.on('connect', () => {
  console.log('Connected to APRATIM'S AI 2.0')
})
```

### Events

#### Send Message
```javascript
socket.emit('message', {
  message: 'Hello, APRATIM!',
  chatId: 'chat-123',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000
})
```

#### Receive AI Response
```javascript
// Streaming response chunks
socket.on('ai-chunk', (data) => {
  console.log('Chunk:', data.content)
  if (data.done) {
    console.log('Response complete')
  }
})

// Full response
socket.on('ai-response', (data) => {
  console.log('Full response:', data.content)
  console.log('Model used:', data.model)
  console.log('Token usage:', data.usage)
})
```

#### Typing Indicators
```javascript
// Send typing status
socket.emit('typing', { isTyping: true })

// Receive typing status
socket.on('user-typing', (data) => {
  console.log('User typing:', data.isTyping)
})

// AI typing indicator
socket.on('typing', (data) => {
  console.log('AI typing:', data.isTyping)
})
```

## 🗨️ Chat API

### Get All Chats
```http
GET /api/chat
```

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `limit` (optional): Number of chats to return (default: 50)
- `offset` (optional): Number of chats to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "chat-123",
      "title": "My Chat",
      "messages": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "isPinned": false,
      "metadata": {
        "model": "gpt-4",
        "temperature": 0.7,
        "maxTokens": 2000
      }
    }
  ]
}
```

### Get Specific Chat
```http
GET /api/chat/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "chat-123",
    "title": "My Chat",
    "messages": [
      {
        "id": "msg-123",
        "content": "Hello!",
        "role": "user",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "isTyping": false
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "isPinned": false
  }
}
```

### Create New Chat
```http
POST /api/chat
```

**Request Body:**
```json
{
  "title": "New Chat",
  "userId": "user-123",
  "metadata": {
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 2000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "chat-123",
    "title": "New Chat",
    "messages": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "isPinned": false
  }
}
```

### Update Chat
```http
PUT /api/chat/:id
```

**Request Body:**
```json
{
  "title": "Updated Chat Title",
  "isPinned": true,
  "metadata": {
    "model": "claude-3-opus",
    "temperature": 0.8
  }
}
```

### Delete Chat
```http
DELETE /api/chat/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

### Add Message to Chat
```http
POST /api/chat/:id/messages
```

**Request Body:**
```json
{
  "content": "Hello, APRATIM!",
  "role": "user",
  "isTyping": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "msg-123",
    "content": "Hello, APRATIM!",
    "role": "user",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "isTyping": false
  }
}
```

### Update Message
```http
PUT /api/chat/:id/messages/:messageId
```

**Request Body:**
```json
{
  "content": "Updated message content"
}
```

### Delete Message
```http
DELETE /api/chat/:id/messages/:messageId
```

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

### Clear All Chats
```http
DELETE /api/chat
```

**Response:**
```json
{
  "success": true,
  "message": "All chats cleared successfully"
}
```

## 🤖 AI API

### Generate AI Response
```http
POST /api/ai/generate
```

**Request Body:**
```json
{
  "message": "Explain quantum computing",
  "chatId": "chat-123",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 2000,
  "stream": false
}
```

**Response (Non-streaming):**
```json
{
  "success": true,
  "data": {
    "content": "Quantum computing is a revolutionary approach to computation...",
    "model": "gpt-4",
    "usage": {
      "promptTokens": 10,
      "completionTokens": 500,
      "totalTokens": 510
    }
  }
}
```

**Response (Streaming):**
```
data: {"content": "Quantum", "done": false}

data: {"content": " computing", "done": false}

data: {"content": " is a revolutionary", "done": false}

data: {"content": "", "done": true}
```

### Get Available Models
```http
GET /api/ai/models
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "provider": "OpenAI",
      "description": "Most capable model for complex reasoning",
      "maxTokens": 4000,
      "cost": "high"
    },
    {
      "id": "gpt-3.5-turbo",
      "name": "GPT-3.5 Turbo",
      "provider": "OpenAI",
      "description": "Fast and efficient for most tasks",
      "maxTokens": 4000,
      "cost": "medium"
    },
    {
      "id": "claude-3-opus",
      "name": "Claude 3 Opus",
      "provider": "Anthropic",
      "description": "Advanced reasoning and analysis",
      "maxTokens": 4000,
      "cost": "high"
    },
    {
      "id": "claude-3-sonnet",
      "name": "Claude 3 Sonnet",
      "provider": "Anthropic",
      "description": "Balanced performance and speed",
      "maxTokens": 4000,
      "cost": "medium"
    },
    {
      "id": "gemini-pro",
      "name": "Gemini Pro",
      "provider": "Google",
      "description": "Google's most capable model",
      "maxTokens": 4000,
      "cost": "medium"
    }
  ]
}
```

### Get AI Capabilities
```http
GET /api/ai/capabilities
```

**Response:**
```json
{
  "success": true,
  "data": {
    "features": [
      "Natural language understanding",
      "Code generation and explanation",
      "Creative writing and storytelling",
      "Mathematical problem solving",
      "Data analysis and visualization",
      "Translation between languages",
      "Summarization and extraction",
      "Question answering",
      "Conversation and chat",
      "Image analysis (when available)",
      "Voice interaction (when available)",
      "Real-time streaming responses"
    ],
    "limitations": [
      "Knowledge cutoff date",
      "Cannot browse the internet in real-time",
      "May not have access to very recent events",
      "Cannot execute code or access external systems",
      "May occasionally produce inaccurate information"
    ],
    "supportedFormats": [
      "Plain text",
      "Markdown",
      "Code (multiple languages)",
      "JSON",
      "XML",
      "CSV",
      "LaTeX"
    ]
  }
}
```

## 🏥 Health Check

### API Health
```http
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "2.0.0"
}
```

## 📊 Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `AI_SERVICE_ERROR` | 502 | AI service unavailable |

### Example Error Responses

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid input data",
    "code": "VALIDATION_ERROR",
    "details": "Message content is required"
  }
}
```

**Rate Limited:**
```json
{
  "success": false,
  "error": {
    "message": "Too many requests, please try again later",
    "code": "RATE_LIMITED",
    "retryAfter": 60
  }
}
```

## 🔧 Rate Limiting

### Limits
- **API Requests**: 100 requests per 15 minutes per IP
- **Chat Messages**: 5 messages per minute per IP
- **WebSocket Connections**: 10 concurrent connections per IP

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📝 Examples

### Complete Chat Flow

```javascript
// 1. Create a new chat
const createChat = async () => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'My AI Chat',
      metadata: { model: 'gpt-4' }
    })
  })
  return response.json()
}

// 2. Add a message
const addMessage = async (chatId, content) => {
  const response = await fetch(`/api/chat/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      role: 'user'
    })
  })
  return response.json()
}

// 3. Get AI response
const getAIResponse = async (message) => {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      model: 'gpt-4',
      temperature: 0.7,
      stream: false
    })
  })
  return response.json()
}

// 4. Complete flow
const chatFlow = async () => {
  const chat = await createChat()
  await addMessage(chat.data.id, 'Hello, APRATIM!')
  const aiResponse = await getAIResponse('Hello, APRATIM!')
  console.log(aiResponse.data.content)
}
```

### WebSocket Chat

```javascript
const socket = io('http://localhost:5000')

// Send message
const sendMessage = (message, chatId) => {
  socket.emit('message', {
    message,
    chatId,
    model: 'gpt-4',
    temperature: 0.7
  })
}

// Handle responses
socket.on('ai-chunk', (data) => {
  if (data.done) {
    console.log('Response complete')
  } else {
    console.log('Chunk:', data.content)
  }
})

socket.on('typing', (data) => {
  console.log('AI typing:', data.isTyping)
})
```

## 🔐 Security

### Headers
Always include proper headers:
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer your-token',
  'X-Requested-With': 'XMLHttpRequest'
}
```

### CORS
The API supports CORS for the configured origins:
```javascript
// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend-domain.com'
]
```

---

**API Documentation for APRATIM'S AI 2.0** 🚀
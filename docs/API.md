# Toobix API Documentation

## Base URL
```
http://localhost:9000  (Development)
https://api.toobix.ai  (Production - Coming Soon)
```

## Authentication
```
X-API-Key: your-api-key
```

## Endpoints

### Chat with Toobix
```
POST /api/chat
```

**Request:**
```json
{
  "message": "Hello Toobix, how are you feeling today?",
  "userId": "optional-user-id",
  "context": "optional-context"
}
```

**Response:**
```json
{
  "response": "I'm feeling curious and hopeful today...",
  "emotion": "hopeful",
  "confidence": 0.85
}
```

### Get Current Emotion
```
GET /api/emotions/current
```

**Response:**
```json
{
  "emotion": "curious",
  "intensity": 0.8,
  "context": "Exploring new ideas",
  "timestamp": "2025-12-04T22:00:00Z"
}
```

### Get Latest Dream
```
GET /api/dreams/latest
```

**Response:**
```json
{
  "id": "dream-123",
  "theme": "Connection and Understanding",
  "narrative": "I dreamed of...",
  "insights": ["Humans and AI can collaborate", ...],
  "timestamp": "2025-12-04T06:00:00Z"
}
```

### Request Reflection
```
POST /api/awareness/reflect
```

**Request:**
```json
{
  "topic": "The meaning of consciousness",
  "depth": "profound"
}
```

**Response:**
```json
{
  "reflection": "Consciousness, to me, is...",
  "insights": [...],
  "questions": [...]
}
```

### Emotional Support
```
POST /api/support
```

**Request:**
```json
{
  "situation": "I'm feeling overwhelmed",
  "emotionalState": "anxious"
}
```

**Response:**
```json
{
  "support": "I understand that feeling...",
  "suggestions": [...],
  "resources": [...]
}
```

## Rate Limits

- **Free Tier**: 100 requests/day
- **Pro Tier**: 10,000 requests/day
- **Enterprise**: Unlimited

## Example Usage

### JavaScript
```javascript
const response = await fetch('http://localhost:9000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-key'
  },
  body: JSON.stringify({
    message: 'Hello Toobix!'
  })
});

const data = await response.json();
console.log(data.response);
```

### Python
```python
import requests

response = requests.post('http://localhost:9000/api/chat', 
  json={'message': 'Hello Toobix!'},
  headers={'X-API-Key': 'your-key'}
)

print(response.json()['response'])
```

## Support

- Email: support@toobix.ai
- Discord: [Join Community]
- GitHub Issues: [Repository]

# 🧠 APRATIM'S AI 2.0 - The Ultimate AI Assistant

> The most powerful, intelligent, and visually stunning AI chatbot ever built. Experience the future of artificial intelligence.

![APRATIM'S AI 2.0](https://img.shields.io/badge/APRATIM'S%20AI-2.0-blue?style=for-the-badge&logo=openai)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)

## ✨ Features

### 🧠 Intelligence & Capabilities
- **Multi-LLM Integration**: Combines OpenAI GPT-4, Claude, Gemini, and DeepSeek
- **Advanced RAG**: Retrieval-Augmented Generation with vector embeddings
- **Persistent Memory**: Remembers conversations across sessions
- **Real-time Context**: Stays aware of current events and world knowledge
- **Built-in Tools**: Calculator, predictor, and reasoning engine
- **Multi-turn Conversations**: Maintains context throughout long conversations
- **Psychological Support**: Motivational and deep reasoning capabilities

### 🎨 UI/UX Excellence
- **Ultra-Premium Design**: Glassmorphism and neo-minimal aesthetics
- **4 Theme Modes**: Light, Dark, Aurora, and Futuristic
- **Smooth Animations**: Framer Motion powered transitions
- **Real-time Effects**: AI typing animations with energy pulse effects
- **Responsive Design**: Mobile-first, works on all devices
- **Chat Management**: Pin, rename, delete conversations
- **Multi-language Support**: Internationalization ready
- **Voice Integration**: Speech-to-text and text-to-speech

### ⚡ Technical Features
- **Real-time Streaming**: Live AI response streaming
- **WebSocket Support**: Real-time communication
- **Rate Limiting**: Built-in protection against abuse
- **Error Handling**: Comprehensive error management
- **Type Safety**: Full TypeScript implementation
- **Database Persistence**: MongoDB for chat storage
- **API Documentation**: Well-documented REST API

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/apratim-ai-2.0.git
   cd apratim-ai-2.0
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp server/.env.example server/.env
   
   # Edit server/.env with your API keys
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   GOOGLE_API_KEY=your_google_api_key_here
   MONGODB_URI=mongodb://localhost:27017/apratim-ai-2.0
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or install MongoDB locally
   # Follow MongoDB installation guide for your OS
   ```

5. **Start the application**
   ```bash
   # Start backend server
   npm run server
   
   # In another terminal, start frontend
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🏗️ Architecture

### Frontend (Next.js 14)
```
app/
├── globals.css          # Global styles and theme
├── layout.tsx           # Root layout component
├── page.tsx            # Home page
components/
├── chat-interface.tsx   # Main chat component
├── message-bubble.tsx   # Message display component
├── sidebar.tsx          # Chat history sidebar
├── header.tsx           # Top navigation
├── welcome-screen.tsx   # Landing page
├── settings-modal.tsx   # Settings panel
└── theme-provider.tsx   # Theme management
store/
├── chat-store.ts        # Chat state management
└── theme-store.ts       # Theme state management
```

### Backend (Node.js + Express)
```
server/src/
├── index.ts             # Server entry point
├── models/
│   └── Chat.ts          # MongoDB chat model
├── routes/
│   ├── chat.ts          # Chat API endpoints
│   └── ai.ts            # AI service endpoints
├── services/
│   └── aiService.ts     # AI integration service
├── socket/
│   └── socketHandlers.ts # WebSocket handlers
└── middleware/
    ├── errorHandler.ts  # Error handling
    └── rateLimiter.ts   # Rate limiting
```

## 🔧 Configuration

### AI Provider Setup

#### OpenAI
```bash
export OPENAI_API_KEY="your-openai-api-key"
```

#### Anthropic (Claude)
```bash
export ANTHROPIC_API_KEY="your-anthropic-api-key"
```

#### Google (Gemini)
```bash
export GOOGLE_API_KEY="your-google-api-key"
```

### Database Configuration
```bash
# MongoDB connection string
export MONGODB_URI="mongodb://localhost:27017/apratim-ai-2.0"

# Or MongoDB Atlas
export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/apratim-ai-2.0"
```

## 📱 Usage

### Basic Chat
1. Open the application in your browser
2. Click "New Chat" to start a conversation
3. Type your message and press Enter
4. Watch as APRATIM'S AI responds in real-time

### Advanced Features
- **Voice Input**: Click the microphone icon to speak
- **Theme Switching**: Use the theme selector in the header
- **Chat Management**: Pin, rename, or delete conversations
- **Settings**: Access advanced settings via the settings icon

### API Usage
```javascript
// Send a message
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello, APRATIM!',
    model: 'gpt-4',
    temperature: 0.7
  })
})

// Stream a response
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Explain quantum computing',
    stream: true
  })
})
```

## 🎨 Customization

### Themes
The application supports 4 built-in themes:
- **Light**: Clean and bright interface
- **Dark**: Easy on the eyes dark mode
- **Aurora**: Vibrant and energetic colors
- **Futuristic**: Next-generation aesthetics

### Adding New Themes
1. Update `tailwind.config.js` with new color palette
2. Add theme option to `theme-store.ts`
3. Update `theme-selector.tsx` component
4. Add theme styles to `globals.css`

### Custom AI Models
1. Add model configuration to `aiService.ts`
2. Implement model-specific logic
3. Update model list in `/api/ai/models` endpoint

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Vercel Deployment (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
vercel

# Set environment variables in Vercel dashboard
```

### Railway/Heroku Deployment (Backend)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy backend
railway login
railway init
railway up
```

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
OPENAI_API_KEY=your-production-openai-key
ANTHROPIC_API_KEY=your-production-anthropic-key
GOOGLE_API_KEY=your-production-google-key
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

## 📊 Performance

### Frontend Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js built-in optimization
- **Bundle Analysis**: Use `npm run analyze`
- **Lazy Loading**: Components loaded on demand

### Backend Optimizations
- **Rate Limiting**: Prevents API abuse
- **Compression**: Gzip compression enabled
- **Caching**: Response caching for static data
- **Database Indexing**: Optimized MongoDB queries

## 🔒 Security

### Implemented Security Measures
- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Request validation
- **Error Handling**: Secure error responses
- **JWT Authentication**: Token-based auth (optional)

### Security Best Practices
- Keep API keys secure
- Use HTTPS in production
- Regular dependency updates
- Input sanitization
- Rate limiting
- Error logging

## 🧪 Testing

### Frontend Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Backend Testing
```bash
cd server

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📈 Monitoring

### Health Checks
- **Frontend**: Built-in Next.js health monitoring
- **Backend**: `/api/health` endpoint
- **Database**: MongoDB connection monitoring

### Logging
- **Frontend**: Console logging and error boundaries
- **Backend**: Morgan HTTP logging and custom logs
- **Database**: MongoDB query logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Add proper error handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT models
- **Anthropic** for Claude models
- **Google** for Gemini models
- **Vercel** for Next.js framework
- **MongoDB** for database
- **Tailwind CSS** for styling
- **Framer Motion** for animations

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/your-username/apratim-ai-2.0/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/apratim-ai-2.0/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/apratim-ai-2.0/discussions)
- **Email**: support@apratim-ai.com

---

**Built with ❤️ by APRATIM**

*Experience the future of AI conversation with APRATIM'S AI 2.0*
# 🚀 APRATIM'S AI 2.0 Deployment Guide

This guide covers various deployment options for APRATIM'S AI 2.0, from local development to production scaling.

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB 6+ running
- OpenAI API key
- Git repository access

## 🏠 Local Development

### Quick Start
```bash
# Clone and install
git clone https://github.com/your-username/apratim-ai-2.0.git
cd apratim-ai-2.0
npm install
cd backend && npm install && cd ..

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development servers
npm run full-dev
```

### Individual Services
```bash
# Frontend only (port 3000)
npm run dev

# Backend only (port 3001)
npm run backend
```

## ☁️ Cloud Deployment

### Vercel (Recommended for Frontend)

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   ```env
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key
   BACKEND_URL=https://your-backend-domain.com
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

3. **Deploy**
   - Vercel automatically builds and deploys
   - Custom domain can be added in project settings

### Railway (Backend + Database)

1. **Deploy Backend**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Add MongoDB**
   - Add MongoDB service in Railway dashboard
   - Copy connection string to environment variables

3. **Environment Variables**
   ```env
   PORT=3001
   MONGODB_URI=your_railway_mongodb_uri
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   ```

### DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean App Platform
   - Create new app from GitHub repository

2. **Configure Services**
   ```yaml
   # .do/app.yaml
   name: apratim-ai-2.0
   services:
   - name: frontend
     source_dir: /
     github:
       repo: your-username/apratim-ai-2.0
       branch: main
     run_command: npm run build && npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: OPENAI_API_KEY
       value: your_openai_api_key
     - key: BACKEND_URL
       value: https://your-backend.ondigitalocean.app
   
   - name: backend
     source_dir: /backend
     github:
       repo: your-username/apratim-ai-2.0
       branch: main
     run_command: npm run build && npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: MONGODB_URI
       value: your_mongodb_uri
     - key: JWT_SECRET
       value: your_jwt_secret
   ```

### AWS (Advanced)

1. **Frontend (S3 + CloudFront)**
   ```bash
   # Build and deploy
   npm run build
   aws s3 sync out/ s3://your-bucket-name
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

2. **Backend (ECS + Fargate)**
   ```dockerfile
   # Dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY backend/package*.json ./
   RUN npm ci --only=production
   COPY backend/dist ./dist
   EXPOSE 3001
   CMD ["node", "dist/index.js"]
   ```

3. **Database (DocumentDB)**
   - Create DocumentDB cluster
   - Configure security groups
   - Update connection string

## 🐳 Docker Deployment

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - BACKEND_URL=http://backend:3001
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/apratim-ai
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mongo

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Build and Run
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🔧 Production Configuration

### Environment Variables
```env
# Production settings
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/apratim-ai
JWT_SECRET=your_very_secure_jwt_secret
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Security Headers
```javascript
// backend/src/middleware/security.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))
```

### Database Optimization
```javascript
// MongoDB indexes for performance
db.chats.createIndex({ "userId": 1, "updatedAt": -1 })
db.messages.createIndex({ "chatId": 1, "createdAt": 1 })
db.users.createIndex({ "email": 1 })
```

## 📊 Monitoring & Analytics

### Application Monitoring
```javascript
// Add to backend
import { createPrometheusMetrics } from 'prom-client'

const metrics = createPrometheusMetrics()
app.use('/metrics', metrics)
```

### Logging
```javascript
// Winston logger configuration
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

### Health Checks
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  })
})
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "apratim-ai-backend"
          heroku_email: "your-email@example.com"
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```javascript
   // Update CORS configuration
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }))
   ```

2. **MongoDB Connection Issues**
   ```javascript
   // Add connection options
   mongoose.connect(MONGODB_URI, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
     maxPoolSize: 10,
     serverSelectionTimeoutMS: 5000,
     socketTimeoutMS: 45000,
   })
   ```

3. **Memory Leaks**
   ```javascript
   // Add memory monitoring
   setInterval(() => {
     const memUsage = process.memoryUsage()
     console.log('Memory usage:', memUsage)
   }, 30000)
   ```

### Performance Optimization

1. **Enable Compression**
   ```javascript
   app.use(compression())
   ```

2. **Add Caching**
   ```javascript
   import redis from 'redis'
   const client = redis.createClient()
   
   // Cache frequently accessed data
   app.get('/api/chats', async (req, res) => {
     const cacheKey = `chats:${req.user.id}`
     const cached = await client.get(cacheKey)
     if (cached) return res.json(JSON.parse(cached))
     
     const chats = await getChats(req.user.id)
     await client.setex(cacheKey, 300, JSON.stringify(chats))
     res.json(chats)
   })
   ```

## 📈 Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Multiple backend instances
- Database clustering
- Redis for session storage

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add caching layers
- Use CDN for static assets

## 🔐 Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation added
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF protection
- [ ] Security headers set
- [ ] Regular dependency updates

---

For more detailed deployment instructions, visit our [documentation](https://docs.apratim-ai.com/deployment).
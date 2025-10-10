# 🚀 APRATIM'S AI 2.0 - Deployment Guide

This guide covers various deployment options for APRATIM'S AI 2.0.

## 📋 Prerequisites

- Node.js 18+
- MongoDB 6+
- Docker (optional)
- Domain name (for production)
- SSL certificates (for production)

## 🐳 Docker Deployment (Recommended)

### Quick Start with Docker Compose

1. **Clone and setup**
   ```bash
   git clone https://github.com/your-username/apratim-ai-2.0.git
   cd apratim-ai-2.0
   ```

2. **Environment configuration**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your API keys
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Production Docker Setup

1. **Update docker-compose.yml for production**
   ```yaml
   # Add environment variables
   environment:
     NODE_ENV: production
     MONGODB_URI: mongodb://admin:secure-password@mongodb:27017/apratim-ai-2.0?authSource=admin
     OPENAI_API_KEY: ${OPENAI_API_KEY}
     # ... other variables
   ```

2. **Configure Nginx for SSL**
   ```bash
   # Generate SSL certificates
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout ssl/key.pem -out ssl/cert.pem
   ```

3. **Deploy with SSL**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## ☁️ Cloud Deployment

### Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel

1. **Connect GitHub repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Environment variables in Vercel**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

#### Backend on Railway

1. **Connect GitHub repository**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Environment variables in Railway**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/apratim-ai-2.0
   OPENAI_API_KEY=your-key
   ANTHROPIC_API_KEY=your-key
   GOOGLE_API_KEY=your-key
   JWT_SECRET=your-secret
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

### AWS Deployment

#### Frontend on AWS Amplify

1. **Connect repository to Amplify**
2. **Build settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```

#### Backend on AWS ECS

1. **Create ECS cluster**
2. **Deploy with Fargate**
3. **Configure load balancer**
4. **Set up RDS for MongoDB**

### Google Cloud Platform

#### Frontend on Firebase Hosting

```bash
# Install Firebase CLI
npm i -g firebase-tools

# Build and deploy
npm run build
firebase deploy
```

#### Backend on Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/apratim-ai-backend

# Deploy to Cloud Run
gcloud run deploy --image gcr.io/PROJECT_ID/apratim-ai-backend
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create cluster**
   - Choose region closest to your users
   - Select appropriate tier
   - Configure network access

2. **Database configuration**
   ```javascript
   // Connection string
   mongodb+srv://username:password@cluster.mongodb.net/apratim-ai-2.0?retryWrites=true&w=majority
   ```

3. **Security setup**
   - Enable authentication
   - Configure IP whitelist
   - Set up database users

### Self-hosted MongoDB

1. **Install MongoDB**
   ```bash
   # Ubuntu/Debian
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

2. **Configure MongoDB**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

## 🔒 Security Configuration

### SSL/TLS Setup

1. **Let's Encrypt (Free)**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Get certificate
   sudo certbot --nginx -d your-domain.com
   ```

2. **Commercial SSL**
   - Purchase SSL certificate
   - Install on server
   - Configure Nginx

### Security Headers

```nginx
# Add to nginx.conf
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### Environment Security

```bash
# Use strong passwords
JWT_SECRET=$(openssl rand -base64 32)

# Rotate API keys regularly
# Use environment-specific configurations
# Enable audit logging
```

## 📊 Monitoring & Logging

### Application Monitoring

1. **Health checks**
   ```bash
   # Frontend health
   curl http://localhost:3000/api/health
   
   # Backend health
   curl http://localhost:5000/api/health
   ```

2. **Log monitoring**
   ```bash
   # View logs
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

### Performance Monitoring

1. **Database monitoring**
   - MongoDB Atlas monitoring
   - Query performance analysis
   - Index optimization

2. **Application metrics**
   - Response times
   - Error rates
   - Resource usage

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy APRATIM'S AI 2.0

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

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Your deployment commands
```

## 🚨 Troubleshooting

### Common Issues

1. **Database connection failed**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Check connection string
   echo $MONGODB_URI
   ```

2. **API key errors**
   ```bash
   # Verify API keys
   echo $OPENAI_API_KEY
   echo $ANTHROPIC_API_KEY
   ```

3. **CORS errors**
   ```bash
   # Check CORS_ORIGIN setting
   echo $CORS_ORIGIN
   ```

### Performance Issues

1. **Slow responses**
   - Check database indexes
   - Monitor API rate limits
   - Optimize queries

2. **High memory usage**
   - Monitor container resources
   - Optimize application code
   - Scale horizontally

## 📈 Scaling

### Horizontal Scaling

1. **Load balancer setup**
   ```nginx
   upstream backend {
       server backend1:5000;
       server backend2:5000;
       server backend3:5000;
   }
   ```

2. **Database scaling**
   - MongoDB replica sets
   - Read replicas
   - Sharding

### Vertical Scaling

1. **Increase resources**
   - More CPU cores
   - More RAM
   - Faster storage

2. **Optimize application**
   - Code optimization
   - Caching strategies
   - Database optimization

## 🔧 Maintenance

### Regular Tasks

1. **Security updates**
   ```bash
   # Update dependencies
   npm audit fix
   
   # Update Docker images
   docker-compose pull
   docker-compose up -d
   ```

2. **Database maintenance**
   ```bash
   # Backup database
   mongodump --uri="mongodb://localhost:27017/apratim-ai-2.0"
   
   # Restore database
   mongorestore --uri="mongodb://localhost:27017/apratim-ai-2.0"
   ```

3. **Log rotation**
   ```bash
   # Configure logrotate
   sudo nano /etc/logrotate.d/apratim-ai
   ```

## 📞 Support

For deployment issues:
- Check logs: `docker-compose logs`
- Review documentation
- Open GitHub issue
- Contact support

---

**Happy Deploying! 🚀**
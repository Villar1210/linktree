# 📦 Deployment Guide - Lumiar Platform

Guia completo para deploy da plataforma Lumiar em diferentes ambientes.

## 🌐 Ambientes de Deploy

### 1️⃣ **Development** (Local)
- **URL**: http://localhost:5000
- **Database**: SQLite local
- **Debug**: Habilitado
- **Cache**: Desabilitado

### 2️⃣ **Staging** (Homologação)
- **URL**: https://staging.lumiar.com.br
- **Database**: PostgreSQL/MySQL
- **Debug**: Habilitado (logs detalhados)
- **Cache**: Redis

### 3️⃣ **Production** (Produção)
- **URL**: https://lumiar.com.br
- **Database**: PostgreSQL/MySQL
- **Debug**: Desabilitado
- **Cache**: Redis
- **CDN**: CloudFlare

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash lumiar
RUN chown -R lumiar:lumiar /app
USER lumiar

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/lumiar
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ./static/images:/app/static/images
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=lumiar
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Build e Run

```bash
# Build da aplicação
docker-compose build

# Iniciar serviços
docker-compose up -d

# Ver logs
docker-compose logs -f web

# Parar serviços
docker-compose down
```

## ☁️ Cloud Providers

### 1. **AWS Deployment**

#### AWS ECS + Fargate

```yaml
# task-definition.json
{
  "family": "lumiar-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "lumiar-web",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/lumiar:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "FLASK_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/lumiar-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Deploy Script

```bash
#!/bin/bash
# deploy-aws.sh

# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

docker build -t lumiar .
docker tag lumiar:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/lumiar:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/lumiar:latest

# Update ECS service
aws ecs update-service --cluster lumiar-cluster --service lumiar-service --force-new-deployment
```

### 2. **Google Cloud Platform**

#### Cloud Run

```yaml
# cloudrun.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: lumiar-app
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "false"
    spec:
      containerConcurrency: 80
      containers:
      - image: gcr.io/PROJECT-ID/lumiar:latest
        ports:
        - containerPort: 5000
        env:
        - name: FLASK_ENV
          value: "production"
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
```

#### Deploy Script

```bash
#!/bin/bash
# deploy-gcp.sh

# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/lumiar

# Deploy to Cloud Run
gcloud run deploy lumiar-app \
  --image gcr.io/PROJECT-ID/lumiar \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1
```

### 3. **Azure Container Instances**

```yaml
# azure-container-group.yaml
apiVersion: 2021-10-01
location: East US
name: lumiar-app
properties:
  containers:
  - name: lumiar-web
    properties:
      image: your-registry.azurecr.io/lumiar:latest
      ports:
      - port: 5000
      resources:
        requests:
          cpu: 1
          memoryInGb: 1
  osType: Linux
  restartPolicy: Always
  ipAddress:
    type: Public
    ports:
    - protocol: tcp
      port: 5000
```

## 🌍 Heroku Deployment

### Procfile

```
web: gunicorn --bind 0.0.0.0:$PORT app:app
release: python scripts/migrate.py
```

### heroku.yml

```yaml
build:
  docker:
    web: Dockerfile
run:
  web: gunicorn --bind 0.0.0.0:$PORT app:app
```

### Deploy Commands

```bash
# Login no Heroku
heroku login

# Criar app
heroku create lumiar-platform

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Adicionar Redis
heroku addons:create heroku-redis:hobby-dev

# Configurar variáveis
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=your-secret-key

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

## 🔧 Web Servers

### 1. **Nginx Configuration**

```nginx
# nginx.conf
upstream lumiar_app {
    server web:5000;
}

server {
    listen 80;
    server_name lumiar.com.br www.lumiar.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name lumiar.com.br www.lumiar.com.br;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Static Files
    location /static/ {
        alias /app/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main Application
    location / {
        proxy_pass http://lumiar_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. **Apache Configuration**

```apache
# apache.conf
<VirtualHost *:80>
    ServerName lumiar.com.br
    ServerAlias www.lumiar.com.br
    Redirect permanent / https://lumiar.com.br/
</VirtualHost>

<VirtualHost *:443>
    ServerName lumiar.com.br
    ServerAlias www.lumiar.com.br

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/cert.pem
    SSLCertificateKeyFile /etc/ssl/private/key.pem

    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"

    # Static Files
    Alias /static /app/static
    <Directory "/app/static">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </Directory>

    # Proxy to Application
    ProxyPreserveHost On
    ProxyPass /static !
    ProxyPass / http://localhost:5000/
    ProxyPassReverse / http://localhost:5000/
</VirtualHost>
```

## 📊 Monitoring & Logging

### Application Monitoring

```python
# monitoring.py
import logging
from flask import Flask
from prometheus_flask_exporter import PrometheusMetrics

def setup_monitoring(app: Flask):
    # Prometheus metrics
    metrics = PrometheusMetrics(app)
    
    # Custom metrics
    metrics.info('app_info', 'Application info', version='1.0.0')
    
    # Logging configuration
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s %(name)s %(message)s'
    )
    
    return metrics
```

### Docker Compose with Monitoring

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

## 🔐 Environment Variables

### Production Environment

```bash
# .env.production
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/lumiar
REDIS_URL=redis://localhost:6379/0

# WhatsApp Integration
WHATSAPP_API_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id

# Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
FACEBOOK_PIXEL_ID=your-pixel-id

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@lumiar.com.br
SMTP_PASSWORD=your-email-password

# Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=lumiar-uploads

# SSL
SSL_CERT_PATH=/etc/ssl/certs/cert.pem
SSL_KEY_PATH=/etc/ssl/private/key.pem
```

## 🚀 CI/CD Pipeline

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
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest
    - name: Run tests
      run: pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to production
      run: |
        # Add your deployment script here
        echo "Deploying to production..."
```

## 🔧 Performance Optimization

### Production Settings

```python
# config.py
import os

class ProductionConfig:
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Cache
    CACHE_TYPE = 'redis'
    CACHE_REDIS_URL = os.environ.get('REDIS_URL')
    
    # Session
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Security
    WTF_CSRF_TIME_LIMIT = 3600
    WTF_CSRF_SSL_STRICT = True
```

### Gunicorn Configuration

```python
# gunicorn.conf.py
bind = "0.0.0.0:5000"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
preload_app = True
```

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] **Tests**: Todos os testes passando
- [ ] **Security**: Secrets configurados
- [ ] **Database**: Migrations aplicadas
- [ ] **SSL**: Certificados válidos
- [ ] **DNS**: Domínio configurado
- [ ] **Monitoring**: Alertas configurados

### Post-Deployment

- [ ] **Health Check**: Endpoint respondendo
- [ ] **Performance**: Tempos de resposta normais
- [ ] **Logs**: Sem erros críticos
- [ ] **Analytics**: Tracking funcionando
- [ ] **Backup**: Sistema funcionando
- [ ] **Documentation**: Atualizada

---

*Deploy realizado com sucesso! 🚀*
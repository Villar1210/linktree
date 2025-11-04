# 📡 API Documentation - Lumiar Platform

## Overview

Esta documentação descreve as APIs futuras e endpoints planejados para a plataforma Lumiar.

## 🔗 Base URL

```
https://lumiar.com.br/api/v1
```

## 🛡️ Authentication

```http
Authorization: Bearer <token>
Content-Type: application/json
```

## 📋 Endpoints Planejados

### 🏢 Empreendimentos

#### GET /empreendimentos
Lista todos os empreendimentos disponíveis

```http
GET /api/v1/empreendimentos
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Residencial Aurora",
      "tipo": "apartamento",
      "status": "disponível",
      "preco": "A partir de R$ 280.000",
      "localizacao": "Jardim das Flores, São Paulo"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 10
}
```

#### GET /empreendimentos/{id}
Detalhes de um empreendimento específico

```http
GET /api/v1/empreendimentos/1
```

### 📊 Analytics

#### POST /analytics/track
Registra eventos de tracking

```http
POST /api/v1/analytics/track
Content-Type: application/json

{
  "event": "whatsapp_click",
  "source": "property_card",
  "property_id": 1,
  "timestamp": "2024-11-04T10:30:00Z"
}
```

### 💼 Leads

#### POST /leads
Cria um novo lead

```http
POST /api/v1/leads
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "(11) 99999-9999",
  "interesse": "Residencial Aurora",
  "mensagem": "Gostaria de mais informações"
}
```

## 🔄 Webhook Integration

### WhatsApp Business API

```http
POST /webhooks/whatsapp
Content-Type: application/json

{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15550559999",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "messages": [
              {
                "from": "CUSTOMER_PHONE_NUMBER",
                "id": "MESSAGE_ID",
                "timestamp": "TIMESTAMP",
                "text": {
                  "body": "MESSAGE_BODY"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

## 📈 Rate Limiting

- **Rate Limit**: 100 requests per minute
- **Burst Limit**: 500 requests per hour
- **Headers**: 
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## 🚨 Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2024-11-04T10:30:00Z"
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `UNAUTHORIZED` | Invalid or missing token | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

## 🔧 SDK Examples

### JavaScript/Node.js

```javascript
const LumiarAPI = require('@lumiar/api-client');

const client = new LumiarAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://lumiar.com.br/api/v1'
});

// Listar empreendimentos
const empreendimentos = await client.empreendimentos.list();

// Criar lead
const lead = await client.leads.create({
  nome: 'João Silva',
  email: 'joao@email.com',
  telefone: '(11) 99999-9999'
});
```

### Python

```python
from lumiar_api import LumiarClient

client = LumiarClient(
    api_key='your-api-key',
    base_url='https://lumiar.com.br/api/v1'
)

# Listar empreendimentos
empreendimentos = client.empreendimentos.list()

# Criar lead
lead = client.leads.create(
    nome='João Silva',
    email='joao@email.com',
    telefone='(11) 99999-9999'
)
```

## 🧪 Testing

### Postman Collection

```bash
# Importar collection
curl -O https://lumiar.com.br/api/postman/lumiar-api.json
```

### cURL Examples

```bash
# Listar empreendimentos
curl -X GET "https://lumiar.com.br/api/v1/empreendimentos" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Criar lead
curl -X POST "https://lumiar.com.br/api/v1/leads" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "(11) 99999-9999"
  }'
```

## 🔒 Security

### HTTPS Only
- All API endpoints require HTTPS
- HTTP requests are automatically redirected

### CORS Policy
```javascript
// Allowed origins
const allowedOrigins = [
  'https://lumiar.com.br',
  'https://www.lumiar.com.br',
  'https://app.lumiar.com.br'
];
```

### Request Validation
- All input data is validated and sanitized
- SQL injection protection
- XSS prevention

## 📊 Monitoring

### Health Check

```http
GET /api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-11-04T10:30:00Z",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "external_apis": "healthy"
  }
}
```

## 📚 Additional Resources

- **OpenAPI Spec**: https://lumiar.com.br/api/docs/openapi.json
- **Swagger UI**: https://lumiar.com.br/api/docs
- **API Status**: https://status.lumiar.com.br
- **Support**: api-support@lumiar.com.br

---

*Documentação em desenvolvimento - Versão 1.0.0*
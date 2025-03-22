5# Operations Guide

This guide provides comprehensive information for deploying, monitoring, maintaining, and scaling the Enterprise Agentic AI Executive Platform in production environments.

## Table of Contents

- [Deployment Strategies](#deployment-strategies)
- [Infrastructure Requirements](#infrastructure-requirements)
- [Security Considerations](#security-considerations)
- [Monitoring and Observability](#monitoring-and-observability)
- [Backup and Recovery](#backup-and-recovery)
- [Scaling Procedures](#scaling-procedures)
- [Performance Tuning](#performance-tuning)
- [Maintenance Procedures](#maintenance-procedures)
- [Incident Response](#incident-response)
- [Compliance and Governance](#compliance-and-governance)

## Deployment Strategies

### Deployment Options

The Enterprise Agentic AI Executive Platform supports multiple deployment models:

#### 1. Standalone API Server

Deploy as a RESTful API service:

```bash
# Production deployment using Gunicorn with Uvicorn workers
gunicorn -w 4 -k uvicorn.workers.UvicornWorker src.api.main:app
```

Configuration:
- 4-8 workers for standard deployments
- Configure behind a reverse proxy (Nginx, Apache)
- Set up SSL termination at the proxy level

#### 2. Containerized Deployment

Docker-based deployment for scalability:

```bash
# Build the Docker image
docker build -t ai-executive-platform:latest .

# Run with production configuration
docker run -p 8000:8000 \
  --env-file prod.env \
  --volume /data/ai-executive:/app/data \
  ai-executive-platform:latest
```

Docker Compose setup for multi-container deployments:

```yaml
# docker-compose.yml
version: '3.8'
services:
  ai-executive:
    build: .
    restart: always
    ports:
      - "8000:8000"
    env_file:
      - prod.env
    volumes:
      - ai-executive-data:/app/data
    depends_on:
      - redis
      - db
  
  redis:
    image: redis:alpine
    restart: always
    volumes:
      - redis-data:/data
  
  db:
    image: postgres:13
    restart: always
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  ai-executive-data:
  redis-data:
  postgres-data:
```

#### 3. Kubernetes Deployment

For enterprise-scale deployments:

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-executive-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-executive
  template:
    metadata:
      labels:
        app: ai-executive
    spec:
      containers:
      - name: ai-executive
        image: ai-executive-platform:latest
        ports:
        - containerPort: 8000
        env:
        - name: LOG_LEVEL
          value: "INFO"
        - name: LLM_PROVIDER
          valueFrom:
            secretKeyRef:
              name: ai-executive-secrets
              key: llm_provider
        # Additional environment variables...
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 15
```

Service configuration:

```yaml
# kubernetes/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ai-executive-service
spec:
  selector:
    app: ai-executive
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
```

Horizontal Pod Autoscaler:

```yaml
# kubernetes/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-executive-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-executive-platform
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

#### 4. Serverless Deployment

For event-driven usage patterns:

```yaml
# serverless.yml
service: ai-executive-platform

provider:
  name: aws
  runtime: python3.11
  memorySize: 2048
  timeout: 30
  environment:
    LOG_LEVEL: INFO
    LLM_PROVIDER: ${ssm:/ai-executive/llm_provider}
    OPENAI_API_KEY: ${ssm:/ai-executive/openai_api_key~true}
    # Additional environment variables...

functions:
  make_decision:
    handler: src.serverless.handler.make_decision
    events:
      - http:
          path: decisions
          method: post
          cors: true
  
  get_decision:
    handler: src.serverless.handler.get_decision
    events:
      - http:
          path: decisions/{id}
          method: get
          cors: true
```

### Production Environment Configuration

#### Environment Variables

Critical production settings:

```
# Production environment variables
NODE_ENV=production
LOG_LEVEL=INFO
ENABLE_REQUEST_LOGGING=true
ENABLE_AUDIT_TRAIL=true
REQUEST_TIMEOUT_SECONDS=120
MAX_CONCURRENT_DECISIONS=50
CACHE_EXPIRATION_SECONDS=86400

# Security settings
API_KEY_REQUIRED=true
JWT_AUTH_ENABLED=true
JWT_SECRET=your_secure_jwt_secret
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# LLM configuration
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o
OPENAI_ORG_ID=your_org_id
OPENAI_REQUEST_TIMEOUT=60

# Redis configuration (for caching)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

#### Configuration Files

`config/production.json`:

```json
{
  "system": {
    "name": "Enterprise AI Executive Platform",
    "version": "1.0.0",
    "environment": "production"
  },
  "api": {
    "rate_limiting": {
      "enabled": true,
      "requests_per_minute": 60,
      "burst": 10
    },
    "timeout_seconds": 120,
    "max_request_size_mb": 10
  },
  "executives": {
    "enabled": ["strategy", "finance", "ethics", "legal", "risk", "technology"],
    "custom_path": "/app/custom/executives"
  },
  "frameworks": {
    "enabled": ["bayesian", "mcda", "cynefin", "ooda"],
    "custom_path": "/app/custom/frameworks"
  },
  "consensus": {
    "threshold": 0.7,
    "min_participation": 0.8,
    "max_resolution_attempts": 3,
    "enable_veto": true
  },
  "governance": {
    "human_escalation_threshold": 0.3,
    "log_decisions": true,
    "audit_trail_path": "/app/data/audit_trails",
    "compliance_checks_enabled": true
  },
  "performance": {
    "llm_cache_enabled": true,
    "llm_cache_size_mb": 1024,
    "parallel_execution_enabled": true,
    "max_parallel_executives": 10
  },
  "security": {
    "api_key_validation": true,
    "jwt_validation": true,
    "role_based_access_control": true
  }
}
```

## Infrastructure Requirements

### Compute Resources

#### Recommended Server Specifications

| Deployment Size | CPU      | RAM   | Storage | Network                 |
|-----------------|----------|-------|---------|-------------------------|
| Small           | 4 cores  | 16 GB | 100 GB  | 100 Mbps               |
| Medium          | 8 cores  | 32 GB | 250 GB  | 500 Mbps               |
| Large           | 16+ cores| 64 GB | 500 GB  | 1 Gbps                 |
| Enterprise      | 32+ cores| 128 GB| 1 TB    | 10 Gbps                |

#### Cloud Instance Recommendations

**AWS**:
- Small: t3.xlarge
- Medium: m5.2xlarge
- Large: c5.4xlarge
- Enterprise: c5n.9xlarge

**Azure**:
- Small: Standard_D4_v3
- Medium: Standard_D8_v3
- Large: Standard_F16s_v2
- Enterprise: Standard_F32s_v2

**GCP**:
- Small: n2-standard-4
- Medium: n2-standard-8
- Large: c2-standard-16
- Enterprise: c2-standard-30

### Supporting Infrastructure

#### Database

For tracking decisions and maintaining state:
- PostgreSQL 13+ for relational data
- MongoDB for document storage (optional)

Configuration:
- Separate database server for medium/large deployments
- Connection pooling with pgBouncer
- Regular backups with point-in-time recovery

#### Caching Layer

For improved performance:
- Redis 6+ for caching and rate limiting
- Elasticache in AWS environments
- Distributed Redis cluster for large deployments

#### Load Balancing

For distributed deployments:
- NGINX or HAProxy for simple deployments
- AWS ELB/ALB for AWS deployments
- Azure Load Balancer for Azure deployments
- Google Cloud Load Balancing for GCP deployments

#### Storage

For logs, audit trails, and persistent data:
- SSD storage for databases
- Network storage for shared files
- Object storage (S3, Azure Blob, GCS) for audit trails and backups

## Security Considerations

### Authentication and Authorization

#### API Authentication

Implement multi-layered authentication:

```python
# Example of API Key + JWT authentication middleware

@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    # API Key validation
    api_key = request.headers.get("X-API-Key")
    if not api_key or not validate_api_key(api_key):
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid or missing API key"}
        )
    
    # JWT validation for user-specific permissions
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "")
        try:
            payload = jwt.decode(
                token, 
                settings.JWT_SECRET,
                algorithms=["HS256"]
            )
            request.state.user = payload
        except jwt.PyJWTError:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid authentication token"}
            )
    
    # Continue with request
    return await call_next(request)
```

#### Role-Based Access Control

Define roles and permissions:

```json
{
  "roles": {
    "admin": {
      "description": "Full system access",
      "permissions": ["read:*", "write:*", "execute:*"]
    },
    "decision_maker": {
      "description": "Can create decisions and view results",
      "permissions": ["read:decisions", "write:decisions", "execute:decisions"]
    },
    "analyst": {
      "description": "Can view decisions and results",
      "permissions": ["read:decisions"]
    },
    "auditor": {
      "description": "Can view audit trails",
      "permissions": ["read:decisions", "read:audit"]
    }
  }
}
```

Implement permission checks:

```python
def require_permission(permission: str):
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            user = request.state.user
            if not user or not has_permission(user, permission):
                return JSONResponse(
                    status_code=403,
                    content={"detail": "Permission denied"}
                )
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator

@app.get("/decisions")
@require_permission("read:decisions")
async def list_decisions(request: Request):
    # Implementation...
```

### Data Protection

#### Sensitive Data Handling

1. Encrypt sensitive data at rest:
   - Use AES-256 for database encryption
   - Use envelope encryption for API keys and credentials
   
2. Encrypt data in transit:
   - Require HTTPS for all API communications
   - Use TLS 1.3 where possible
   
3. Implement data masking for logs and audit trails:
   - Mask PII and sensitive fields in logs
   - Implement field-level encryption for sensitive context data

#### API Security

1. Implement rate limiting:

```python
from fastapi import FastAPI, Request, Response
import time
import redis

app = FastAPI()
redis_client = redis.Redis(host="redis", port=6379, db=0)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    key = f"ratelimit:{client_ip}"
    
    # Check rate limit
    requests = redis_client.get(key)
    if requests and int(requests) > 60:  # 60 requests per minute
        return Response(
            content="Rate limit exceeded",
            status_code=429
        )
    
    # Increment counter
    pipe = redis_client.pipeline()
    pipe.incr(key)
    pipe.expire(key, 60)  # 1 minute expiration
    pipe.execute()
    
    # Process request
    return await call_next(request)
```

2. Set security headers:

```python
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

### LLM-Specific Security

1. Input validation and sanitization:
   - Validate all inputs before sending to LLMs
   - Sanitize outputs before processing
   - Monitor for prompt injection attacks

2. Set appropriate context limits:
   - Don't expose sensitive information in LLM contexts
   - Use role-appropriate data access controls

3. Implement output filtering:
   - Filter harmful or inappropriate LLM responses
   - Validate outputs against compliance requirements

4. Set up API key rotation:
   - Regularly rotate LLM provider API keys
   - Use separate API keys for different environments

## Monitoring and Observability

### Metrics Collection

#### Key Metrics to Monitor

1. **System Metrics**:
   - CPU, memory, and disk usage
   - Network throughput and latency
   - Request/response times
   - Error rates

2. **Business Metrics**:
   - Decision processing rate
   - Decision quality (via feedback)
   - Executive utilization
   - Framework selection distribution

3. **LLM Metrics**:
   - LLM API latency
   - Token usage and costs
   - Completion success rates
   - Rate limit encounters

#### Prometheus Configuration

Example `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'ai-executive-platform'
    static_configs:
      - targets: ['ai-executive:8000']
    metrics_path: '/metrics'
```

Example metrics implementation:

```python
from prometheus_client import Counter, Histogram, start_http_server
import time

# Define metrics
DECISION_REQUESTS = Counter(
    'decision_requests_total',
    'Total number of decision requests',
    ['status']
)

DECISION_PROCESSING_TIME = Histogram(
    'decision_processing_seconds',
    'Time spent processing decisions',
    ['framework', 'complexity']
)

LLM_REQUESTS = Counter(
    'llm_requests_total',
    'Total number of LLM API requests',
    ['provider', 'model', 'status']
)

LLM_TOKENS = Counter(
    'llm_tokens_total',
    'Total number of tokens used',
    ['provider', 'model', 'type']
)

# Instrument code
def process_decision(request):
    start_time = time.time()
    try:
        # Process decision...
        DECISION_REQUESTS.labels(status='success').inc()
    except Exception:
        DECISION_REQUESTS.labels(status='error').inc()
        raise
    finally:
        DECISION_PROCESSING_TIME.labels(
            framework='bayesian',
            complexity='high'
        ).observe(time.time() - start_time)
```

### Logging Strategy

#### Log Configuration

Example logging configuration:

```python
import logging
import json
from datetime import datetime
import uuid

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "request_id": getattr(record, "request_id", str(uuid.uuid4())),
        }
        
        # Add extra attributes
        for key, value in record.__dict__.items():
            if key not in ["args", "asctime", "created", "exc_info", "exc_text", 
                          "filename", "funcName", "id", "levelname", "levelno", 
                          "lineno", "module", "msecs", "message", "msg", 
                          "name", "pathname", "process", "processName", 
                          "relativeCreated", "stack_info", "thread", "threadName"]:
                log_data[key] = value
        
        # Add exception info if available
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": self.formatException(record.exc_info)
            }
        
        return json.dumps(log_data)

def configure_logging():
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Configure console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(JSONFormatter())
    root_logger.addHandler(console_handler)
    
    # Configure file handler
    file_handler = logging.FileHandler("/app/logs/ai-executive.log")
    file_handler.setFormatter(JSONFormatter())
    root_logger.addHandler(file_handler)
```

#### Structured Logging

Example of structured logging usage:

```python
import logging
from contextvars import ContextVar

# Create context variable for request ID
request_id_var = ContextVar("request_id", default=None)

def get_logger():
    logger = logging.getLogger("ai-executive")
    return logger

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    # Generate request ID
    request_id = str(uuid.uuid4())
    request_id_var.set(request_id)
    
    # Add request ID to response headers
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    
    return response

# Example usage
logger = get_logger()
logger.info(
    "Processing decision request",
    extra={
        "request_id": request_id_var.get(),
        "decision_id": decision_id,
        "complexity": complexity_level,
        "executives": [e.name for e in selected_executives],
        "framework": selected_framework
    }
)
```

### Monitoring Setup

#### Grafana Dashboards

Example Grafana dashboard configuration:

```json
{
  "dashboard": {
    "id": null,
    "title": "AI Executive Platform",
    "tags": ["ai-executive", "production"],
    "timezone": "browser",
    "schemaVersion": 16,
    "version": 1,
    "refresh": "5s",
    "panels": [
      {
        "title": "Decision Requests",
        "type": "graph",
        "gridPos": {"x": 0, "y": 0, "w": 12, "h": 8},
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "sum(rate(decision_requests_total[5m])) by (status)",
            "legendFormat": "{{status}}"
          }
        ]
      },
      {
        "title": "Decision Processing Time",
        "type": "heatmap",
        "gridPos": {"x": 12, "y": 0, "w": 12, "h": 8},
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "sum(rate(decision_processing_seconds_bucket[5m])) by (le)"
          }
        ]
      },
      {
        "title": "LLM Requests",
        "type": "graph",
        "gridPos": {"x": 0, "y": 8, "w": 12, "h": 8},
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "sum(rate(llm_requests_total[5m])) by (provider, status)",
            "legendFormat": "{{provider}} - {{status}}"
          }
        ]
      },
      {
        "title": "LLM Token Usage",
        "type": "graph",
        "gridPos": {"x": 12, "y": 8, "w": 12, "h": 8},
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "sum(rate(llm_tokens_total[5m])) by (provider, type)",
            "legendFormat": "{{provider}} - {{type}}"
          }
        ]
      }
    ]
  }
}
```

#### Alerting Configuration

Example Prometheus alerting rules:

```yaml
groups:
- name: ai-executive-alerts
  rules:
  - alert: HighErrorRate
    expr: sum(rate(decision_requests_total{status="error"}[5m])) / sum(rate(decision_requests_total[5m])) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate in decision processing"
      description: "Error rate is above 5% for the last 5 minutes"
  
  - alert: SlowDecisionProcessing
    expr: histogram_quantile(0.9, sum(rate(decision_processing_seconds_bucket[5m])) by (le)) > 30
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Slow decision processing"
      description: "90% of decisions are taking more than 30 seconds to process"
  
  - alert: LLMAPIErrors
    expr: sum(rate(llm_requests_total{status="error"}[5m])) > 0
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "LLM API errors detected"
      description: "Errors when calling LLM API"
  
  - alert: HighTokenUsage
    expr: sum(rate(llm_tokens_total[1h])) > 1000000
    for: 15m
    labels:
      severity: warning
    annotations:
      summary: "High token usage"
      description: "Token usage exceeding 1M tokens per hour"
```

### Tracing

#### Distributed Tracing with OpenTelemetry

Configuration:

```python
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

def configure_tracing():
    resource = Resource(attributes={
        SERVICE_NAME: "ai-executive-platform"
    })
    
    tracer_provider = TracerProvider(resource=resource)
    
    # Configure exporter
    otlp_exporter = OTLPSpanExporter(
        endpoint="tempo:4317",
        insecure=True
    )
    span_processor = BatchSpanProcessor(otlp_exporter)
    tracer_provider.add_span_processor(span_processor)
    
    # Set global tracer provider
    trace.set_tracer_provider(tracer_provider)
    
    # Get tracer
    tracer = trace.get_tracer(__name__)
    return tracer
```

Usage example:

```python
from opentelemetry import trace

async def make_decision(request: DecisionRequest):
    tracer = trace.get_tracer(__name__)
    
    with tracer.start_as_current_span("make_decision") as span:
        span.set_attribute("decision.id", request.decision_id)
        span.set_attribute("decision.query", request.query)
        span.set_attribute("decision.complexity", request.complexity_level.value)
        
        # Execute sub-spans
        with tracer.start_as_current_span("select_executives"):
            selected_executives = orchestrator._select_relevant_executives(request)
        
        with tracer.start_as_current_span("select_framework"):
            framework = orchestrator._select_decision_framework(request)
        
        with tracer.start_as_current_span("lead_analysis"):
            primary_recommendation = await lead_executive.analyze(executive_context)
        
        # Continue with other spans...
```

## Backup and Recovery

### Backup Strategy

#### Database Backups

PostgreSQL backup:

```bash
#!/bin/bash
# postgres_backup.sh

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backup/postgres"
DB_NAME="ai_executive"
DB_USER="postgres"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create full backup
pg_dump -U $DB_USER -d $DB_NAME -F c -f $BACKUP_DIR/full_backup_$TIMESTAMP.dump

# Keep last 7 daily backups
find $BACKUP_DIR -name "full_backup_*.dump" -type f -mtime +7 -delete

# Upload to cloud storage (optional)
aws s3 cp $BACKUP_DIR/full_backup_$TIMESTAMP.dump s3://ai-executive-backups/postgres/
```

Redis backup:

```bash
#!/bin/bash
# redis_backup.sh

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backup/redis"
REDIS_HOST="redis"
REDIS_PORT="6379"
REDIS_PASSWORD="your_redis_password"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create Redis backup
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD --rdb $BACKUP_DIR/redis_backup_$TIMESTAMP.rdb

# Keep last 7 daily backups
find $BACKUP_DIR -name "redis_backup_*.rdb" -type f -mtime +7 -delete

# Upload to cloud storage (optional)
aws s3 cp $BACKUP_DIR/redis_backup_$TIMESTAMP.rdb s3://ai-executive-backups/redis/
```

#### Configuration Backups

Backup configuration files:

```bash
#!/bin/bash
# config_backup.sh

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backup/config"
CONFIG_DIR="/app/config"
ENV_FILE="/app/.env"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create a compressed archive of configuration
tar -czf $BACKUP_DIR/config_backup_$TIMESTAMP.tar.gz $CONFIG_DIR $ENV_FILE

# Keep last 30 daily backups
find $BACKUP_DIR -name "config_backup_*.tar.gz" -type f -mtime +30 -delete

# Upload to cloud storage (optional)
aws s3 cp $BACKUP_DIR/config_backup_$TIMESTAMP.tar.gz s3://ai-executive-backups/config/
```

#### Backup Scheduling

Crontab configuration:

```
# Daily database backup at 1 AM
0 1 * * * /app/scripts/postgres_backup.sh >> /var/log/postgres_backup.log 2>&1

# Daily Redis backup at 2 AM
0 2 * * * /app/scripts/redis_backup.sh >> /var/log/redis_backup.log 2>&1

# Daily configuration backup at 3 AM
0 3 * * * /app/scripts/config_backup.sh >> /var/log/config_backup.log 2>&1
```

### Recovery Procedures

#### Database Recovery

PostgreSQL recovery:

```bash
#!/bin/bash
# postgres_restore.sh

BACKUP_FILE=$1
DB_NAME="ai_executive"
DB_USER="postgres"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: postgres_restore.sh <backup_file>"
    exit 1
fi

# Restore database
pg_restore -U $DB_USER -d $DB_NAME -c -C $BACKUP_FILE

echo "Database restored from $BACKUP_FILE"
```

Redis recovery:

```bash
#!/bin/bash
# redis_restore.sh

BACKUP_FILE=$1
REDIS_HOST="redis"
REDIS_PORT="6379"
REDIS_PASSWORD="your_redis_password"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: redis_restore.sh <backup_file>"
    exit 1
fi

# Stop Redis server
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD shutdown

# Copy backup file to Redis data directory
cp $BACKUP_FILE /data/dump.rdb

# Start Redis server
service redis-server start

echo "Redis restored from $BACKUP_FILE"
```

#### Disaster Recovery Plan

1. **Infrastructure Recovery**:
   - Deploy infrastructure using infrastructure-as-code scripts
   - Restore configuration from backups
   - Validate network and security settings

2. **Data Recovery**:
   - Restore PostgreSQL database from latest backup
   - Restore Redis cache from latest backup
   - Verify data integrity

3. **Application Recovery**:
   - Deploy the application using CI/CD pipeline
   - Apply configuration settings
   - Verify system health and functionality

4. **Testing and Validation**:
   - Run system health checks
   - Verify integration with LLM providers
   - Test decision-making capabilities
   - Validate security controls

## Scaling Procedures

### Horizontal Scaling

#### Adding More Instances

For Kubernetes deployments:

```bash
# Scale up the deployment
kubectl scale deployment ai-executive-platform --replicas=5
```

For Docker Compose deployments:

```bash
# Scale up the service
docker-compose up -d --scale ai-executive=5
```

#### Load Balancing Configuration

NGINX load balancing configuration:

```nginx
upstream ai_executive {
    server ai-executive-1:8000;
    server ai-executive-2:8000;
    server ai-executive-3:8000;
    # Add more servers as needed
}

server {
    listen 80;
    server_name api.ai-executive.com;

    location / {
        proxy_pass http://ai_executive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Vertical Scaling

#### Increasing Resources

For Kubernetes deployments:

```yaml
# Update resource requests and limits
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-executive-platform
spec:
  template:
    spec:
      containers:
      - name: ai-executive
        resources:
          requests:
            memory: "4Gi"  # Increased from 2Gi
            cpu: "2000m"   # Increased from 1000m
          limits:
            memory: "8Gi"  # Increased from 4Gi
            cpu: "4000m"   # Increased from 2000m
```

For Docker deployments:

```bash
# Run with increased resources
docker run -p 8000:8000 \
  --memory="8g" \
  --cpus="4.0" \
  --env-file prod.env \
  ai-executive-platform:latest
```

### Database Scaling

#### Read Replica Setup

PostgreSQL replication configuration:

1. Primary server configuration (`postgresql.conf`):

```
wal_level = replica
max_wal_senders = 10
wal_keep_segments = 64
```

2. Primary server authentication (`pg_hba.conf`):

```
host replication replicator 192.168.1.0/24 md5
```

3. Replica setup:

```bash
# Create base backup
pg_basebackup -h primary -D /var/lib/postgresql/data -U replicator -P -v -R
```

4. Replica recovery configuration (`recovery.conf`):

```
standby_mode = 'on'
primary_conninfo = 'host=primary port=5432 user=replicator password=password'
trigger_file = '/var/lib/postgresql/data/trigger'
```

#### Connection Pooling

PgBouncer configuration:

```ini
[databases]
ai_executive = host=localhost port=5432 dbname=ai_executive

[pgbouncer]
listen_addr = *
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

### Caching Strategy

#### Redis Caching Implementation

Implementation example:

```python
import redis
import json
import hashlib

class LLMCache:
    def __init__(self, redis_client, ttl=86400):
        self.redis = redis_client
        self.ttl = ttl
    
    def generate_key(self, model, prompt):
        """Generate a cache key based on model and prompt."""
        key_data = f"{model}:{prompt}"
        return f"llm:cache:{hashlib.md5(key_data.encode()).hexdigest()}"
    
    def get_cached_response(self, model, prompt):
        """Get cached LLM response if available."""
        key = self.generate_key(model, prompt)
        cached = self.redis.get(key)
        if cached:
            return json.loads(cached)
        return None
    
    def cache_response(self, model, prompt, response):
        """Cache an LLM response."""
        key = self.generate_key(model, prompt)
        self.redis.setex(key, self.ttl, json.dumps(response))
```

Usage example:

```python
# Initialize Redis client and cache
redis_client = redis.Redis(host="redis", port=6379, db=0)
llm_cache = LLMCache(redis_client)

async def call_llm_with_caching(model, prompt):
    # Check cache first
    cached_response = llm_cache.get_cached_response(model, prompt)
    if cached_response:
        return cached_response
    
    # Call LLM if no cache hit
    response = await call_llm(model, prompt)
    
    # Cache the response
    llm_cache.cache_response(model, prompt, response)
    
    return response
```

## Performance Tuning

### Application Optimization

#### Asynchronous Processing

Optimize asynchronous execution:

```python
import asyncio

async def process_executive_evaluations(executives, recommendation, context):
    """Process evaluations from multiple executives concurrently."""
    tasks = []
    for executive in executives:
        task = asyncio.create_task(
            executive.evaluate_recommendation(recommendation)
        )
        tasks.append(task)
    
    # Wait for all evaluations to complete
    evaluations = await asyncio.gather(*tasks)
    return evaluations
```

#### Batch Processing

Implement batch processing for LLM requests:

```python
async def batch_llm_requests(requests, max_batch_size=5):
    """Process LLM requests in batches."""
    results = []
    for i in range(0, len(requests), max_batch_size):
        batch = requests[i:i+max_batch_size]
        batch_tasks = [call_llm(req) for req in batch]
        batch_results = await asyncio.gather(*batch_tasks)
        results.extend(batch_results)
    return results
```

### Server Tuning

#### Gunicorn Configuration

Optimize Gunicorn for production:

```python
# gunicorn.conf.py

# Number of workers
workers = 4

# Number of threads per worker
threads = 4

# Worker class
worker_class = 'uvicorn.workers.UvicornWorker'

# Maximum requests per worker before restarting
max_requests = 1000
max_requests_jitter = 50

# Timeout settings
timeout = 300
graceful_timeout = 30

# Keep-alive settings
keepalive = 5

# Log settings
errorlog = '/app/logs/gunicorn-error.log'
accesslog = '/app/logs/gunicorn-access.log'
loglevel = 'info'
```

#### NGINX Optimization

Optimize NGINX for performance:

```nginx
# nginx.conf

worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    multi_accept on;
    use epoll;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Buffer settings
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_body_timeout 12;
    client_header_timeout 12;
    
    # Gzip settings
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
        application/json
        application/javascript
        text/plain
        text/css;
    
    # Cache settings
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
    
    # Include server configurations
    include /etc/nginx/conf.d/*.conf;
}
```

### LLM Optimization

#### Token Usage Optimization

Strategies to optimize token usage:

1. **Prompt Engineering**:
   - Craft concise, effective prompts
   - Use shorthand notation where appropriate
   - Eliminate unnecessary context

2. **Context Truncation**:
   - Implement intelligent context truncation
   - Focus on most relevant information
   - Summarize lengthy contexts

3. **Response Optimization**:
   - Limit maximum tokens in responses
   - Use structured outputs (JSON, etc.)
   - Implement two-pass approaches (outline, then detail)

Implementation example:

```python
def optimize_prompt(prompt, max_length=4000):
    """Optimize a prompt to reduce token usage."""
    # If prompt is already short, return as is
    if len(prompt) <= max_length:
        return prompt
    
    # Extract key components
    lines = prompt.split('\n')
    
    # Keep instructions and recent context
    instructions = [line for line in lines if line.startswith('You are') or line.startswith('Please')]
    recent_context = lines[-20:]  # Keep the most recent 20 lines
    
    # Combine and truncate if still too long
    optimized = '\n'.join(instructions + recent_context)
    if len(optimized) > max_length:
        return optimized[:max_length]
    
    return optimized
```

## Maintenance Procedures

### Routine Maintenance

#### Database Maintenance

PostgreSQL maintenance script:

```bash
#!/bin/bash
# postgres_maintenance.sh

DB_NAME="ai_executive"
DB_USER="postgres"

# Run VACUUM ANALYZE
psql -U $DB_USER -d $DB_NAME -c "VACUUM ANALYZE;"

# Update statistics
psql -U $DB_USER -d $DB_NAME -c "ANALYZE;"

# Reindex if needed
if [ "$(date +%u)" = "7" ]; then  # Only on Sundays
    psql -U $DB_USER -d $DB_NAME -c "REINDEX DATABASE $DB_NAME;"
fi
```

#### Log Rotation

Logrotate configuration:

```
/app/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 appuser appgroup
    sharedscripts
    postrotate
        systemctl reload ai-executive 2>/dev/null || true
    endscript
}
```

### Update Procedures

#### Software Updates

Update procedure:

1. **Prepare Update**:
   ```bash
   # Pull latest code
   git pull origin main
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Run migration scripts
   python scripts/migrate.py
   ```

2. **Testing in Staging**:
   ```bash
   # Run test suite
   pytest
   
   # Run load tests
   locust -f tests/load/locustfile.py
   ```

3. **Production Update**:
   ```bash
   # Deploy with zero downtime
   kubectl apply -f kubernetes/deployment.yaml
   
   # Watch rollout status
   kubectl rollout status deployment/ai-executive-platform
   ```

4. **Verification**:
   ```bash
   # Run smoke tests
   python scripts/smoke_test.py
   
   # Monitor logs and metrics
   kubectl logs -l app=ai-executive
   ```

#### Rollback Procedure

Kubernetes rollback:

```bash
# Rollback deployment
kubectl rollout undo deployment/ai-executive-platform

# For specific revision
kubectl rollout undo deployment/ai-executive-platform --to-revision=2
```

Docker Compose rollback:

```bash
# Rollback to previous image
docker-compose up -d --force-recreate ai-executive
```

## Incident Response

### Incident Classification

| Severity | Description | Response Time | Resolution Time |
|----------|-------------|---------------|-----------------|
| P1       | Critical: Service unavailable | 15 min | 4 hours |
| P2       | High: Major feature unavailable | 30 min | 8 hours |
| P3       | Medium: Non-critical issue | 2 hours | 24 hours |
| P4       | Low: Minor issue | 8 hours | 48 hours |

### Incident Response Process

1. **Detection**:
   - Automated alerts from monitoring system
   - Manual reporting via support channels

2. **Triage**:
   - Assess severity and impact
   - Assign incident owner
   - Notify stakeholders

3. **Investigation**:
   - Gather diagnostic information
   - Analyze logs and metrics
   - Identify root cause

4. **Resolution**:
   - Implement fix or workaround
   - Validate resolution
   - Resume normal service

5. **Post-Incident**:
   - Conduct post-mortem analysis
   - Document lessons learned
   - Implement preventive measures

### Incident Response Checklist

#### P1 (Critical) Incident Checklist

```
[ ] Alert incident response team
[ ] Establish incident channel in Slack/Teams
[ ] Assess immediate impact and severity
[ ] Implement immediate mitigation measures
[ ] Notify stakeholders of incident and ETA
[ ] Gather diagnostic information
[ ] Implement resolution or workaround
[ ] Verify resolution across all environments
[ ] Update stakeholders on resolution
[ ] Schedule post-mortem meeting
[ ] Document incident in knowledge base
```

## Compliance and Governance

### Audit Trails

#### Audit Log Implementation

Audit logging configuration:

```python
import logging
import uuid
from datetime import datetime
import json

class AuditLogger:
    def __init__(self, log_path="/app/data/audit_trails"):
        self.log_path = log_path
        self.logger = logging.getLogger("audit")
        self.logger.setLevel(logging.INFO)
        
        # Configure file handler
        file_handler = logging.FileHandler(f"{log_path}/audit.log")
        formatter = logging.Formatter('%(message)s')
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)
    
    def log_decision(self, decision_outcome, user_id=None):
        """Log a decision event to the audit trail."""
        audit_event = {
            "event_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "decision",
            "user_id": user_id,
            "decision_id": decision_outcome.decision_id,
            "query": decision_outcome.query,
            "executives": decision_outcome.participating_executives,
            "framework": decision_outcome.selected_framework,
            "consensus_level": decision_outcome.consensus.consensus_level.value,
            "support_percentage": decision_outcome.consensus.support_percentage,
            "escalated_to_human": decision_outcome.escalated_to_human
        }
        
        self.logger.info(json.dumps(audit_event))
        
        # Also write detailed decision record for compliance
        with open(f"{self.log_path}/{decision_outcome.decision_id}.json", "w") as f:
            json.dump(decision_outcome.model_dump(), f, indent=2)
    
    def log_access(self, user_id, resource_id, action, success):
        """Log an access control event to the audit trail."""
        audit_event = {
            "event_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": "access",
            "user_id": user_id,
            "resource_id": resource_id,
            "action": action,
            "success": success
        }
        
        self.logger.info(json.dumps(audit_event))
```

### Compliance Controls

#### GDPR Compliance

Implementation of GDPR controls:

1. **Data Minimization**:
   ```python
   def minimize_sensitive_data(decision_request):
       """Minimize sensitive data in the decision request."""
       # Create a copy of the request
       minimized = decision_request.model_copy(deep=True)
       
       # Remove PII from context
       if "personal_data" in minimized.context:
           del minimized.context["personal_data"]
       
       # Anonymize stakeholders
       if "stakeholders" in minimized.context:
           minimized.context["stakeholders"] = [
               f"stakeholder_{i}" for i, _ in enumerate(minimized.context["stakeholders"])
           ]
       
       return minimized
   ```

2. **Data Retention**:
   ```python
   async def apply_retention_policy():
       """Apply data retention policies."""
       retention_days = 90  # Configurable retention period
       
       # Calculate retention date
       retention_date = datetime.utcnow() - timedelta(days=retention_days)
       
       # Delete old decision records
       async with db_pool.acquire() as conn:
           await conn.execute(
               "DELETE FROM decisions WHERE created_at < $1",
               retention_date
           )
       
       # Delete old audit logs
       log_dir = "/app/data/audit_trails"
       for file in os.listdir(log_dir):
           if file.endswith(".json"):
               file_path = os.path.join(log_dir, file)
               file_time = datetime.fromtimestamp(os.path.getctime(file_path))
               if file_time < retention_date:
                   os.remove(file_path)
   ```

#### AI Act Compliance

Implementation of EU AI Act controls:

1. **Risk Assessment**:
   ```python
   def perform_ai_risk_assessment(decision_recommendation):
       """Assess AI risks in line with EU AI Act requirements."""
       risk_assessment = {
           "transparency": {
               "explainability": assess_explainability(decision_recommendation),
               "documentation": assess_documentation(decision_recommendation)
           },
           "fairness": {
               "bias_assessment": assess_bias(decision_recommendation),
               "equality_impact": assess_equality_impact(decision_recommendation)
           },
           "accountability": {
               "human_oversight": assess_human_oversight(decision_recommendation),
               "audit_trail": assess_audit_trail(decision_recommendation)
           },
           "robustness": {
               "technical_robustness": assess_technical_robustness(decision_recommendation),
               "security": assess_security(decision_recommendation)
           }
       }
       
       return risk_assessment
   ```

2. **Human Oversight Implementation**:
   ```python
   async def apply_human_oversight(decision_outcome):
       """Apply human oversight requirements."""
       # Determine if human review is required
       requires_human_review = (
           decision_outcome.consensus.support_percentage < 0.7 or
           decision_outcome.escalated_to_human or
           "high_risk" in decision_outcome.recommendation.domain_specific_analyses
       )
       
       if requires_human_review:
           # Mark for human review
           decision_outcome.human_review_required = True
           
           # Notify relevant stakeholders
           await send_human_review_notification(decision_outcome)
           
           # Record oversight requirement
           await log_human_oversight_requirement(decision_outcome)
       
       return decision_outcome
   ```

### Policy Enforcement

#### Role-Based Access Controls

Implementation of RBAC:

```python
class AccessControl:
    def __init__(self):
        self.role_permissions = {
            "admin": {"read:*", "write:*", "execute:*"},
            "decision_maker": {"read:decisions", "write:decisions", "execute:decisions"},
            "analyst": {"read:decisions", "read:analytics"},
            "auditor": {"read:decisions", "read:audit_logs"}
        }
    
    def has_permission(self, user, permission):
        """Check if user has the required permission."""
        if not user or "roles" not in user:
            return False
        
        user_permissions = set()
        for role in user["roles"]:
            if role in self.role_permissions:
                user_permissions.update(self.role_permissions[role])
        
        # Check for wildcard permissions
        if any(p.endswith(":*") and permission.startswith(p[:-1]) for p in user_permissions):
            return True
        
        return permission in user_permissions

access_control = AccessControl()

def require_permission(permission):
    """Decorator to require a specific permission."""
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(request, *args, **kwargs):
            user = request.state.user
            if not access_control.has_permission(user, permission):
                raise HTTPException(status_code=403, detail="Permission denied")
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator
```

#### Data Classification

Implementation of data classification:

```python
class DataClassification:
    # Classification levels
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    
    @staticmethod
    def classify_decision(decision_request):
        """Classify the sensitivity of a decision request."""
        # Default classification
        classification = DataClassification.INTERNAL
        
        # Check for sensitive keywords in the query
        sensitive_keywords = ["acquisition", "layoff", "confidential", "secret"]
        if any(keyword in decision_request.query.lower() for keyword in sensitive_keywords):
            classification = DataClassification.CONFIDENTIAL
        
        # Check for restricted domains
        restricted_domains = ["legal", "personnel", "merger"]
        if any(domain in decision_request.required_domains for domain in restricted_domains):
            classification = DataClassification.RESTRICTED
        
        return classification
    
    @staticmethod
    def apply_handling_controls(data, classification):
        """Apply appropriate data handling controls based on classification."""
        if classification == DataClassification.PUBLIC:
            # No special handling
            return data
        
        if classification == DataClassification.INTERNAL:
            # Basic access control
            return {"data": data, "access_control": "internal_only"}
        
        if classification == DataClassification.CONFIDENTIAL:
            # Encryption and access control
            return {
                "data": encrypt_sensitive_data(data),
                "access_control": "confidential",
                "audit_required": True
            }
        
        if classification == DataClassification.RESTRICTED:
            # Maximum protection
            return {
                "data": encrypt_sensitive_data(data),
                "access_control": "restricted",
                "audit_required": True,
                "expiration": datetime.utcnow() + timedelta(days=30)
            }
```

This operations guide provides a comprehensive framework for deploying, monitoring, maintaining, and scaling the Enterprise Agentic AI Executive Platform in production environments. By following these guidelines, organizations can ensure reliable operation, optimal performance, and compliance with relevant regulations.
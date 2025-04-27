# Multi-Tenancy Implementation Guide

## Introduction

This guide provides detailed implementation instructions for setting up and configuring multi-tenancy in the Enterprise Agentic AI Executive Platform through APISIX integration. It includes practical guidance, configuration templates, code examples, and best practices to help developers implement secure and efficient multi-tenant environments.

### Purpose and Scope

The purpose of this implementation guide is to:

1. Provide step-by-step instructions for implementing multi-tenancy
2. Offer practical configuration examples for different multi-tenancy scenarios
3. Share code samples for common multi-tenancy patterns
4. Document best practices and anti-patterns for multi-tenant implementations
5. Guide the implementation of cross-tenant federation when required

### Prerequisites

Before implementing multi-tenancy, ensure the following prerequisites are met:

1. **Platform Components**
   - Apache APISIX (version 2.15 or later) installed and configured
   - Enterprise Agentic AI Executive Platform core services deployed
   - Authentication framework implemented as described in the authentication documentation
   - Tenant management service deployed and accessible

2. **Security Requirements**
   - TLS encryption configured for all services
   - Network security policies in place
   - Secure key management system available
   - Audit logging configured

3. **Infrastructure Requirements**
   - Kubernetes cluster with namespace isolation support
   - Resource quota capabilities at cluster level
   - Storage classes supporting tenant isolation
   - Service mesh (optional, but recommended for advanced scenarios)

### Implementation Approach

The implementation approach follows these key principles:

1. **Security-First**: Security considerations take precedence in all design decisions
2. **Complete Isolation**: Default to complete tenant isolation with dedicated resources
3. **Explicit Sharing**: Any resource sharing between tenants must be explicit and controlled
4. **Defense in Depth**: Multiple layers of isolation enforcement
5. **Verifiable Boundaries**: All tenant boundaries must be testable and verifiable

## Implementation Process

The multi-tenancy implementation process consists of several phases, each building on the previous one to create a comprehensive multi-tenant environment.

### Phase 1: Tenant Management Infrastructure

The first phase establishes the core tenant management infrastructure:

1. **Deploy Tenant Management Service**
   - Central registry of tenant information
   - Tenant lifecycle management APIs
   - Tenant configuration storage
   - Tenant relationship management

2. **Configure Tenant Database**
   - Tenant metadata storage
   - Tenant hierarchy and relationships
   - Tenant status tracking
   - Tenant configuration versioning

3. **Implement Tenant Admin API**
   - Tenant creation and management
   - Tenant configuration APIs
   - Tenant status reporting
   - Tenant provisioning hooks

### Phase 2: Tenant Identification and Routing

The second phase implements tenant identification and routing:

1. **Configure Tenant Identification**
   - JWT token claims configuration
   - Header-based identification
   - URL path-based extraction
   - API key tenant association

2. **Implement Tenant Resolver Plugin**
   - APISIX plugin for tenant resolution
   - Tenant validation logic
   - Tenant context creation
   - Error handling for tenant resolution

3. **Configure Tenant-Specific Routes**
   - Route configuration in APISIX
   - Tenant-specific upstream services
   - Tenant-based routing rules
   - Route validation against tenant access

### Phase 3: Resource Isolation

The third phase establishes resource isolation:

1. **Configure Namespace Isolation**
   - Kubernetes namespace per tenant
   - Namespace resource quotas
   - Network policies per namespace
   - Service accounts per tenant

2. **Implement Data Isolation**
   - Database isolation mechanism
   - Tenant-specific schemas or databases
   - Data access controls
   - Tenant context in data queries

3. **Configure Computational Isolation**
   - CPU and memory limits per tenant
   - Tenant-specific service instances
   - Container isolation policies
   - Node affinity for tenant workloads

### Phase 4: Tenant-Specific Policies

The fourth phase implements tenant-specific policies:

1. **Configure Rate Limiting**
   - Tenant-specific rate limits
   - Quota enforcement
   - Usage tracking
   - Rate limit response handling

2. **Implement Access Control**
   - Role-based access within tenants
   - Resource ownership validation
   - Permission boundaries
   - Cross-tenant access controls

3. **Configure Monitoring and Logging**
   - Tenant-specific metrics
   - Tenant context in logs
   - Tenant-specific alerting
   - Usage reporting per tenant

### Phase 5: Cross-Tenant Federation (if required)

The final phase implements cross-tenant federation if required:

1. **Define Federation Interfaces**
   - Resource sharing models
   - Federation protocols
   - Access control for federated resources
   - Federation audit requirements

2. **Implement Federation Service**
   - Federation request handling
   - Cross-tenant authentication
   - Resource translation
   - Federation governance

## Configuration Templates and Code Examples

This section provides practical configuration templates and code examples for implementing multi-tenancy.

### APISIX Route Configuration for Multi-Tenancy

#### Basic Tenant-Aware Route

```yaml
# Basic tenant-aware route configuration
routes:
  - id: tenant_api_route
    uri: /api/*
    plugins:
      jwt-auth:
        header: "Authorization"
        query: "token"
        cookie: "jwt"
      tenant-resolver:
        source: "jwt"
        claim_name: "tenant_id"
        header_name: "X-Tenant-ID"
        required: true
      proxy-rewrite:
        headers:
          set:
            X-Tenant-ID: "$tenant_id"
    upstream:
      type: roundrobin
      nodes:
        "api-service:8080": 1
```

#### Route with Tenant-Specific Upstream

```yaml
# Route with tenant-specific upstream
routes:
  - id: tenant_specific_service
    uri: /tenant-service/*
    vars:
      - ["tenant_id", "==", "tenant-a"]
    plugins:
      jwt-auth:
        # JWT configuration omitted for brevity
      tenant-resolver:
        source: "jwt"
        claim_name: "tenant_id"
        required: true
    upstream:
      type: roundrobin
      nodes:
        "tenant-a-service:8080": 1

  - id: tenant_specific_service_b
    uri: /tenant-service/*
    vars:
      - ["tenant_id", "==", "tenant-b"]
    plugins:
      jwt-auth:
        # JWT configuration omitted for brevity
      tenant-resolver:
        source: "jwt"
        claim_name: "tenant_id"
        required: true
    upstream:
      type: roundrobin
      nodes:
        "tenant-b-service:8080": 1
```

#### Tenant Path Parameter Route

```yaml
# Route with tenant path parameter
routes:
  - id: tenant_path_route
    uri: "/tenants/*/resources/*"
    plugins:
      jwt-auth:
        # JWT configuration omitted for brevity
      tenant-resolver:
        source: "path_parameter"
        parameter_index: 1
        validate_against_jwt: true
        jwt_claim_name: "tenant_id"
      tenant-access-validator:
        strict: true
```

#### Tenant-Specific Plugin Configuration

```yaml
# Tenant-specific plugin configuration
plugin_configs:
  - id: tenant_a_limits
    plugins:
      rate-limit:
        count: 500
        time_window: 60
        rejected_code: 429
        key: remote_addr
      response-rewrite:
        headers:
          set:
            X-Tenant: "tenant-a"

  - id: tenant_b_limits
    plugins:
      rate-limit:
        count: 1000
        time_window: 60
        rejected_code: 429
        key: remote_addr
      response-rewrite:
        headers:
          set:
            X-Tenant: "tenant-b"

routes:
  - id: tenant_a_api
    uri: /api/*
    vars:
      - ["tenant_id", "==", "tenant-a"]
    plugin_config_id: tenant_a_limits
    # Other configuration omitted

  - id: tenant_b_api
    uri: /api/*
    vars:
      - ["tenant_id", "==", "tenant-b"]
    plugin_config_id: tenant_b_limits
    # Other configuration omitted
```

### JWT Token Configuration with Tenant Claims

#### JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "tenant-key-1"
  },
  "payload": {
    "sub": "user@example.com",
    "iss": "https://auth.enterprise.com",
    "iat": 1619798400,
    "exp": 1619884800,
    "tenant_id": "tenant-a",
    "tenant_tier": "enterprise",
    "tenant_features": ["advanced_analytics", "custom_models"],
    "roles": ["admin"],
    "scope": "read write execute"
  }
}
```

#### APISIX JWT Authentication Plugin Configuration

```yaml
plugins:
  jwt-auth:
    header: "Authorization"
    query: "token"
    cookie: "jwt"
    key: "public-key"
    algorithm: "RS256"
    exp: 7200
    base64_secret: false
    lifetime_grace_period: 30
    claim_exp: "exp"
    claim_iat: "iat"
    verify_claims:
      - claim_name: "tenant_id"
        required: true
```

#### Custom JWT Verification with Tenant Context

```lua
-- Example of a custom JWT verification plugin
local core = require("apisix.core")
local jwt = require("resty.jwt")
local tenant_service = require("tenant.service")

local plugin_name = "tenant-jwt-verifier"

-- Plugin schema definition
local schema = {
    type = "object",
    properties = {
        tenant_claim: {type = "string", default = "tenant_id"},
        validate_tenant: {type = "boolean", default = true},
        tenant_header: {type = "string", default = "X-Tenant-ID"},
    }
}

-- Plugin metadata
local _M = {
    version = 0.1,
    priority = 2510, -- Execute after jwt-auth
    name = plugin_name,
    schema = schema,
}

function _M.check_schema(conf)
    return core.schema.check(schema, conf)
end

function _M.rewrite(conf, ctx)
    -- Ensure JWT has already been validated
    if not ctx.jwt_payload then
        return 401, {message = "Missing JWT payload"}
    end

    -- Extract tenant ID from JWT claims
    local tenant_id = ctx.jwt_payload[conf.tenant_claim]
    if not tenant_id then
        return 401, {message = "Missing tenant claim in JWT"}
    end

    -- Validate tenant if required
    if conf.validate_tenant then
        local tenant_valid, err = tenant_service.validate_tenant(tenant_id)
        if not tenant_valid then
            return 403, {message = "Invalid tenant: " .. (err or "unknown error")}
        end
    end

    -- Set tenant context for downstream services
    core.request.set_header(ctx, conf.tenant_header, tenant_id)

    -- Store tenant ID in context for other plugins
    ctx.tenant_id = tenant_id
end

return _M
```

### Resource Isolation Configuration

#### Kubernetes Namespace for Tenant Isolation

```yaml
# Create tenant-specific namespace
apiVersion: v1
kind: Namespace
metadata:
  name: tenant-a
  labels:
    tenant: tenant-a
    tenant-tier: enterprise
    isolation: dedicated

---
# Resource quota for tenant namespace
apiVersion: v1
kind: ResourceQuota
metadata:
  name: tenant-a-quota
  namespace: tenant-a
spec:
  hard:
    requests.cpu: "20"
    requests.memory: 100Gi
    limits.cpu: "40"
    limits.memory: 200Gi
    pods: "100"
    services: "50"
    persistentvolumeclaims: "20"

---
# Network policy for tenant isolation
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: tenant-a-isolation
  namespace: tenant-a
spec:
  podSelector: {}  # Applies to all pods in the namespace
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          tenant: tenant-a
    - namespaceSelector:
        matchLabels:
          shared: "true"
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          tenant: tenant-a
    - namespaceSelector:
        matchLabels:
          shared: "true"
    - ipBlock:
        cidr: 0.0.0.0/0
        except:
        - 10.0.0.0/8  # Example of blocking internal network access
```

#### Tenant-Specific Deployment

```yaml
# Tenant-specific service deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tenant-a-service
  namespace: tenant-a
  labels:
    app: executive-service
    tenant: tenant-a
spec:
  replicas: 3
  selector:
    matchLabels:
      app: executive-service
      tenant: tenant-a
  template:
    metadata:
      labels:
        app: executive-service
        tenant: tenant-a
    spec:
      serviceAccountName: tenant-a-service
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - executive-service
              topologyKey: "kubernetes.io/hostname"
      containers:
      - name: executive-service
        image: executive-service:1.0.0
        resources:
          requests:
            cpu: "1"
            memory: "2Gi"
          limits:
            cpu: "2"
            memory: "4Gi"
        env:
        - name: TENANT_ID
          value: tenant-a
        - name: DB_CONNECTION_STRING
          valueFrom:
            secretKeyRef:
              name: tenant-a-db-credentials
              key: connection-string
        volumeMounts:
        - name: tenant-a-config
          mountPath: /app/config
      volumes:
      - name: tenant-a-config
        configMap:
          name: tenant-a-config
```

#### Tenant-Specific Database Configuration

```yaml
# Tenant database secret
apiVersion: v1
kind: Secret
metadata:
  name: tenant-a-db-credentials
  namespace: tenant-a
type: Opaque
data:
  username: dGVuYW50LWEtdXNlcg==  # Base64 encoded "tenant-a-user"
  password: dmVyeS1zZWN1cmUtcGFzc3dvcmQ=  # Base64 encoded password
  connection-string: cG9zdGdyZXNxbDovL3RlbmFudC1hLXVzZXI6dmVyeS1zZWN1cmUtcGFzc3dvcmRAcG9zdGdyZXMvdGVuYW50X2E=
```

### Rate Limiting Configuration Per Tenant

#### Basic Rate Limiting

```yaml
# Basic rate limiting configuration
plugins:
  limit-req:
    rate: 500  # requests per second
    burst: 50
    key: "$remote_addr $tenant_id"
    rejected_code: 429
    rejected_msg: "Too many requests for tenant"
```

#### Advanced Rate Limiting with Tenant Tiers

```yaml
# Custom rate limiting plugin configuration
plugins:
  tenant-rate-limit:
    tenant_id_source: "http_header"  # or jwt_claim, path_parameter
    tenant_id_name: "X-Tenant-ID"    # or JWT claim name
    tier_service_endpoint: "http://tier-service:8080/api/tiers"
    default_rate: 100                # Default rate if tier not found
    default_burst: 20
    redis_host: "redis.svc"
    redis_port: 6379
    redis_timeout: 1000
    rejected_code: 429
    enable_dynamic_update: true
    update_interval: 60              # seconds
```

#### Implementation of a Tenant-Aware Rate Limiting Plugin

```lua
-- Example implementation of a tenant-aware rate limiting plugin (simplified)
local core = require("apisix.core")
local limit_req = require("resty.limit.req")
local tenant_service = require("tenant.service")

local plugin_name = "tenant-rate-limit"

-- Plugin schema definition
local schema = {
    type = "object",
    properties = {
        tenant_id_source = {
            type = "string",
            enum = {"http_header", "jwt_claim", "path_parameter"},
            default = "http_header"
        },
        tenant_id_name = {type = "string", default = "X-Tenant-ID"},
        tier_service_endpoint = {type = "string"},
        default_rate = {type = "integer", default = 100},
        default_burst = {type = "integer", default = 20},
        redis_host = {type = "string", default = "127.0.0.1"},
        redis_port = {type = "integer", default = 6379},
        redis_timeout = {type = "integer", default = 1000},
        rejected_code = {type = "integer", default = 429},
        enable_dynamic_update = {type = "boolean", default = false},
        update_interval = {type = "integer", default = 60},
    },
    required = {"tier_service_endpoint"}
}

-- Plugin metadata
local _M = {
    version = 0.1,
    priority = 1000,  -- Run after authentication but before most other plugins
    name = plugin_name,
    schema = schema,
}

-- Cache for tenant tier information
local tenant_tier_cache = core.lrucache.new({
    ttl = 300,  -- Cache TTL in seconds
    count = 512  -- Maximum items in cache
})

-- Function to get tenant rate limit based on tier
local function get_tenant_rate_limit(conf, tenant_id)
    -- Check cache first
    local cache_key = tenant_id
    local tenant_limits = tenant_tier_cache:get(cache_key)

    if tenant_limits then
        return tenant_limits.rate, tenant_limits.burst
    end

    -- Fetch tier information from service
    local url = conf.tier_service_endpoint .. "/" .. tenant_id
    local res, err = core.http.get(url)

    if not res or res.status ~= 200 then
        core.log.error("Failed to fetch tenant tier info: ", err or (res and res.status))
        -- Return default limits if tier service unavailable
        return conf.default_rate, conf.default_burst
    end

    -- Parse response
    local tier_info, err = core.json.decode(res.body)
    if not tier_info then
        core.log.error("Failed to decode tier info: ", err)
        return conf.default_rate, conf.default_burst
    end

    -- Extract rate limits from tier info
    local rate = tier_info.rate_limit or conf.default_rate
    local burst = tier_info.burst_limit or conf.default_burst

    -- Cache the result
    tenant_tier_cache:set(cache_key, {
        rate = rate,
        burst = burst
    })

    return rate, burst
end

-- Extract tenant ID based on configuration
local function extract_tenant_id(conf, ctx)
    if conf.tenant_id_source == "http_header" then
        return core.request.header(ctx, conf.tenant_id_name)

    elseif conf.tenant_id_source == "jwt_claim" and ctx.jwt_payload then
        return ctx.jwt_payload[conf.tenant_id_name]

    elseif conf.tenant_id_source == "path_parameter" then
        -- Extract from path parameter using regex matching
        -- This is a simplified implementation
        local uri = ctx.var.uri
        local tenant_pattern = "/tenants/([^/]+)/"
        local tenant_id = string.match(uri, tenant_pattern)
        return tenant_id
    end

    return nil
end

-- Initialize limiter instance for a tenant
local function create_limit_obj(conf, tenant_id)
    local rate, burst = get_tenant_rate_limit(conf, tenant_id)
    return limit_req.new("tenant_rate_limit_" .. tenant_id, rate, burst)
end

-- Main plugin access function
function _M.access(conf, ctx)
    -- Extract tenant ID
    local tenant_id = extract_tenant_id(conf, tenant_id_source)
    if not tenant_id then
        core.log.error("Failed to extract tenant ID for rate limiting")
        return 400, {error_msg = "Missing tenant identifier"}
    end

    -- Get limiter instance
    local lim, err = create_limit_obj(conf, tenant_id)
    if not lim then
        core.log.error("Failed to create limiter: ", err)
        return 500, {error_msg = "Internal server error"}
    end

    -- Apply rate limiting
    local key = tenant_id
    local delay, err = lim:incoming(key, true)

    if not delay then
        if err == "rejected" then
            return conf.rejected_code, {error_msg = "Too many requests for tenant: " .. tenant_id}
        end
        core.log.error("Failed to limit request: ", err)
        return 500, {error_msg = "Internal server error"}
    end

    -- Request within limits, proceed with a delay if necessary
    if delay > 0 then
        -- Optionally add delay if needed
        -- ngx.sleep(delay)
    end
end

return _M
```

### Tenant Context Propagation Implementation

#### Tenant Context Header Propagation

```yaml
# Configure header propagation in APISIX
plugins:
  proxy-rewrite:
    headers:
      set:
        X-Tenant-ID: "$ctx.tenant_id"
        X-Tenant-Name: "$ctx.tenant_name"
        X-Tenant-Tier: "$ctx.tenant_tier"
```

#### Tenant Context Middleware (Node.js Example)

```javascript
// Example tenant context middleware for Node.js services
const tenantMiddleware = (req, res, next) => {
  // Extract tenant ID from headers
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) {
    return res.status(400).json({ error: 'Missing tenant identifier' });
  }

  // Validate tenant ID format
  if (!/^[a-z0-9-]{1,36}$/.test(tenantId)) {
    return res.status(400).json({ error: 'Invalid tenant identifier format' });
  }

  // Add tenant context to request object
  req.tenantContext = {
    tenantId,
    tenantName: req.headers['x-tenant-name'] || tenantId,
    tenantTier: req.headers['x-tenant-tier'] || 'standard'
  };

  // Add tenant context to response headers for debugging
  res.setHeader('X-Tenant-ID', tenantId);

  // Continue with request processing
  next();
};

// Usage in Express app
app.use(tenantMiddleware);
```

#### Database Query with Tenant Context (TypeORM Example)

```typescript
// Example of tenant-aware database access in TypeScript with TypeORM
import { Entity, Column, PrimaryGeneratedColumn, createConnection, getRepository } from 'typeorm';
import { Request, Response } from 'express';
import { TenantContext } from '../types/tenant';

@Entity()
class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  tenantId: string;  // Tenant identifier for data isolation
}

// Create databse connection with tenant context
const createTenantConnection = async (tenantContext: TenantContext) => {
  // Could use separate connections per tenant, or a shared connection
  return await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: `tenant_${tenantContext.tenantId}`,  // Tenant-specific database
    entities: [UserEntity],
    synchronize: false,
  });
};

// Example service method using tenant context
export const getUsersForTenant = async (req: Request, res: Response) => {
  try {
    // Extract tenant context set by middleware
    const { tenantContext } = req;
    if (!tenantContext) {
      return res.status(400).json({ error: 'Missing tenant context' });
    }

    // Connect to tenant database
    const connection = await createTenantConnection(tenantContext);

    // Get repository with tenant context
    const userRepo = getRepository(UserEntity);

    // Query with tenant filter - belt and braces approach
    const users = await userRepo.find({
      where: {
        tenantId: tenantContext.tenantId
      }
    });

    // Close connection if not reusing
    await connection.close();

    return res.json({ users });
  } catch (error) {
    console.error('Error processing tenant-specific request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
```

### Cross-Tenant Federation Implementation

#### Federation Service Implementation

```typescript
// Example of a cross-tenant federation service in TypeScript
import express from 'express';
import { validateTenantAccess, getTenantById } from './tenant-service';
import { createFederationToken, validateFederationToken } from './federation-auth';

const router = express.Router();

// Request federation access to another tenant's resources
router.post('/federation/request', async (req, res) => {
  try {
    const { sourceTenantId, targetTenantId, resourceType, resourceId, accessLevel } = req.body;

    // Verify the requesting tenant exists
    const sourceTenant = await getTenantById(sourceTenantId);
    if (!sourceTenant) {
      return res.status(404).json({ error: 'Source tenant not found' });
    }

    // Verify the target tenant exists
    const targetTenant = await getTenantById(targetTenantId);
    if (!targetTenant) {
      return res.status(404).json({ error: 'Target tenant not found' });
    }

    // Verify federation is allowed between these tenants
    const federationAccess = await validateFederationAccess(sourceTenantId, targetTenantId);
    if (!federationAccess.allowed) {
      return res.status(403).json({
        error: 'Federation not allowed',
        reason: federationAccess.reason
      });
    }

    // Check if the specific resource access is allowed
    const resourceAccess = await validateResourceAccess(
      sourceTenantId,
      targetTenantId,
      resourceType,
      resourceId,
      accessLevel
    );

    if (!resourceAccess.allowed) {
      return res.status(403).json({
        error: 'Resource access not allowed',
        reason: resourceAccess.reason
      });
    }

    // Create a federation token
    const federationToken = await createFederationToken({
      sourceTenantId,
      targetTenantId,
      resourceType,
      resourceId,
      accessLevel,
      expiration: Date.now() + (3600 * 1000) // 1 hour expiration
    });

    // Log the federation request for audit
    await logFederationActivity({
      type: 'federation_request',
      sourceTenantId,
      targetTenantId,
      resourceType,
      resourceId,
      accessLevel,
      timestamp: Date.now()
    });

    return res.json({
      federationToken,
      expiration: new Date(Date.now() + (3600 * 1000)).toISOString()
    });

  } catch (error) {
    console.error('Error processing federation request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Access a resource using federation token
router.get('/federation/resource/:resourceType/:resourceId', async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const federationToken = req.headers['x-federation-token'];

    if (!federationToken) {
      return res.status(401).json({ error: 'Missing federation token' });
    }

    // Validate the federation token
    const tokenData = await validateFederationToken(federationToken);
    if (!tokenData) {
      return res.status(401).json({ error: 'Invalid federation token' });
    }

    // Verify token matches requested resource
    if (tokenData.resourceType !== resourceType || tokenData.resourceId !== resourceId) {
      return res.status(403).json({ error: 'Token does not grant access to this resource' });
    }

    // Verify token is not expired
    if (tokenData.expiration < Date.now()) {
      return res.status(401).json({ error: 'Federation token expired' });
    }

    // Retrieve the federated resource
    const resource = await getResourceWithFederationContext(
      tokenData.targetTenantId,
      resourceType,
      resourceId,
      tokenData.accessLevel,
      tokenData.sourceTenantId
    );

    // Log the federation access for audit
    await logFederationActivity({
      type: 'federation_access',
      sourceTenantId: tokenData.sourceTenantId,
      targetTenantId: tokenData.targetTenantId,
      resourceType,
      resourceId,
      accessLevel: tokenData.accessLevel,
      timestamp: Date.now()
    });

    return res.json({ resource });

  } catch (error) {
    console.error('Error accessing federated resource:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

#### Federation Configuration in APISIX

```yaml
# APISIX configuration for federation requests
routes:
  - id: federation_request_route
    uri: /api/federation/*
    plugins:
      jwt-auth:
        # JWT configuration omitted for brevity
      tenant-resolver:
        source: "jwt"
        claim_name: "tenant_id"
        required: true
      federation-validator:
        target_header: "X-Target-Tenant-ID"
        check_federation_policy: true
        federation_service_endpoint: "http://federation-service:8080/api/federation/validate"
    upstream:
      type: roundrobin
      nodes:
        "federation-service:8080": 1
```

## Tenant-Specific Configuration Management

Properly managing tenant-specific configurations is critical for a successful multi-tenant implementation.

### Managing Tenant-Specific Routes

Tenant-specific routes can be managed through several approaches:

1. **Dynamic Route Generation**
   - Generate routes programmatically based on tenant registry
   - Update routes when tenants are added or removed
   - Store route configurations in a version-controlled repository

2. **Template-Based Route Management**
   - Define route templates with tenant variables
   - Instantiate templates with tenant-specific values
   - Apply template instances through the APISIX Admin API

3. **Tenant Route Namespacing**
   - Group tenant routes under common prefixes
   - Use route matching patterns for tenant identification
   - Isolate tenant-specific route configurations

#### Example Route Management Script

```javascript
// Example script for managing tenant-specific routes in APISIX
const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');

// APISIX Admin API configuration
const APISIX_ADMIN_URL = process.env.APISIX_ADMIN_URL || 'http://apisix-admin:9080';
const APISIX_ADMIN_KEY = process.env.APISIX_ADMIN_KEY || 'edd1c9f034335f136f87ad84b625c8f1';

// Get tenant registry
async function getTenantRegistry() {
  try {
    const response = await axios.get('http://tenant-service:8080/api/tenants');
    return response.data.tenants;
  } catch (error) {
    console.error('Failed to fetch tenant registry:', error);
    throw error;
  }
}

// Load route template
function loadRouteTemplate(templateName) {
  const templatePath = `./templates/${templateName}.yaml`;
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  return yaml.load(templateContent);
}

// Create tenant-specific route from template
function createTenantRoute(template, tenant) {
  // Clone template to avoid modifying the original
  const route = JSON.parse(JSON.stringify(template));

  // Replace template variables with tenant values
  route.id = `${route.id}_${tenant.id}`;
  route.uri = route.uri.replace('${tenant_id}', tenant.id);

  if (route.vars && route.vars.length > 0) {
    for (let i = 0; i < route.vars.length; i++) {
      if (route.vars[i][0] === 'tenant_id' && route.vars[i][1] === '==') {
        route.vars[i][2] = tenant.id;
      }
    }
  }

  // Update upstream if tenant-specific
  if (route.upstream && route.upstream.nodes && tenant.services) {
    const serviceKey = Object.keys(route.upstream.nodes)[0];
    const serviceParts = serviceKey.split(':');

    if (tenant.services[serviceParts[0]]) {
      const newServiceKey = `${tenant.services[serviceParts[0]]}:${serviceParts[1]}`;
      route.upstream.nodes = {
        [newServiceKey]: route.upstream.nodes[serviceKey]
      };
    }
  }

  return route;
}

// Create or update route in APISIX
async function applyRoute(route) {
  try {
    const url = `${APISIX_ADMIN_URL}/apisix/admin/routes/${route.id}`;
    const response = await axios.put(url, route, {
      headers: {
        'X-API-KEY': APISIX_ADMIN_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Route ${route.id} applied successfully:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to apply route ${route.id}:`, error);
    throw error;
  }
}

// Main function to update all tenant routes
async function updateTenantRoutes() {
  try {
    // Get all tenants
    const tenants = await getTenantRegistry();

    // Load route templates
    const apiRouteTemplate = loadRouteTemplate('api_route');
    const dataRouteTemplate = loadRouteTemplate('data_route');

    // Process each tenant
    for (const tenant of tenants) {
      if (tenant.status !== 'active') {
        console.log(`Skipping inactive tenant: ${tenant.id}`);
        continue;
      }

      // Create and apply API route
      const apiRoute = createTenantRoute(apiRouteTemplate, tenant);
      await applyRoute(apiRoute);

      // Create and apply data route
      const dataRoute = createTenantRoute(dataRouteTemplate, tenant);
      await applyRoute(dataRoute);
    }

    console.log('All tenant routes updated successfully');
  } catch (error) {
    console.error('Failed to update tenant routes:', error);
    process.exit(1);
  }
}

// Run the update
updateTenantRoutes();
```

### Tenant-Specific Plugin Configurations

Managing tenant-specific plugin configurations requires a systematic approach:

1. **Plugin Configuration Templates**
   - Define standard plugin configurations for different tenant tiers
   - Parameterize configurations with tenant-specific values
   - Version control templates for auditability

2. **Tenant Configuration Storage**
   - Store tenant-specific configurations in dedicated storage
   - Implement access controls for configuration data
   - Maintain configuration history for audit purposes

3. **Configuration Validation**
   - Validate configurations against schema before application
   - Test configurations in staging environment
   - Maintain compatibility with platform versions

### Configuration Versioning and Deployment

A robust configuration versioning and deployment strategy includes:

1. **Version Control**
   - Store configurations in Git repositories
   - Tag configuration versions
   - Maintain release history

2. **Configuration as Code**
   - Define configurations using infrastructure as code tools
   - Automate configuration deployment
   - Apply GitOps practices to configuration management

3. **Deployment Pipeline**
   - Test configurations in development environment
   - Validate configurations automatically
   - Deploy configurations through CI/CD pipeline

### Dynamic Configuration Updates

Support for dynamic configuration updates includes:

1. **Runtime Configuration Updates**
   - Update configurations without service restarts
   - Apply changes through the APISIX Admin API
   - Monitor configuration change impact

2. **Configuration Watching**
   - Watch for configuration changes in storage
   - Reload service configurations when changes are detected
   - Log configuration change events

3. **Configuration Rollback**
   - Support immediate configuration rollback
   - Track configuration versions
   - Maintain backup of previous configurations

## Implementation Patterns and Best Practices

This section documents proven patterns and best practices for multi-tenant implementations.

### Pattern: Tenant Header Propagation

#### Problem

Services need to maintain tenant context throughout a request chain spanning multiple services.

#### Solution

Propagate tenant context using HTTP headers that are forwarded by all services in the request chain.

#### Implementation

1. APISIX Gateway extracts tenant ID from authentication token
2. Gateway adds tenant headers:
   - `X-Tenant-ID`: Primary tenant identifier
   - `X-Tenant-Context`: Additional tenant context (JSON)
3. All services preserve and forward these headers in outbound requests
4. Services validate header integrity based on authentication context

#### Code Example

```yaml
# APISIX configuration
plugins:
  proxy-rewrite:
    headers:
      set:
        X-Tenant-ID: "$ctx.tenant_id"
        X-Tenant-Context: "$ctx.tenant_context"
```

```javascript
// Node.js middleware for header propagation
function tenantHeaderPropagation(req, res, next) {
  const tenantId = req.headers['x-tenant-id'];
  const tenantContext = req.headers['x-tenant-context'];

  if (tenantId) {
    // Store in request context for application use
    req.tenantId = tenantId;

    // Parse tenant context if available
    if (tenantContext) {
      try {
        req.tenantContext = JSON.parse(tenantContext);
      } catch (e) {
        console.warn('Invalid tenant context format:', tenantContext);
        req.tenantContext = {};
      }
    }

    // Add middleware to automatically propagate headers in outgoing requests
    const originalRequest = require('request');
    require('request').defaults({
      headers: {
        'X-Tenant-ID': tenantId,
        'X-Tenant-Context': tenantContext || '{}'
      }
    });
  }

  next();
}
```

### Pattern: Tenant-Specific Rate Limiting

#### Problem

Different tenants have different usage patterns and requirements for API rate limiting.

#### Solution

Implement tenant-aware rate limiting that applies specific limits based on tenant tier and configuration.

#### Implementation

1. Define rate limit tiers in the tenant management system
2. Store tenant rate limit configuration with tenant metadata
3. Create a rate limiting plugin that:
   - Identifies the tenant from the request
   - Retrieves the tenant's rate limit configuration
   - Applies appropriate rate limits
   - Tracks usage separately per tenant

#### Code Example

See the tenant-aware rate limiting plugin example provided earlier in this document.

### Pattern: Tenant Isolation with Shared Resources

#### Problem

Some resources need to be shared across tenants while maintaining isolation for tenant-specific data.

#### Solution

Implement a resource sharing model with explicit access controls and tenant context preservation.

#### Implementation

1. Define shared and tenant-specific resource categories
2. Implement tenant context at the data access layer
3. Apply tenant filtering for all data operations
4. Create explicit sharing mechanisms for cross-tenant access

#### Code Example

```typescript
// TypeScript example of data access with tenant isolation and sharing
class DataRepository<T extends BaseEntity> {
  constructor(
    private entityType: new () => T,
    private tenantField: keyof T = 'tenantId' as keyof T
  ) {}

  async findById(id: string, tenantContext: TenantContext): Promise<T | null> {
    const repository = getRepository(this.entityType);

    // Build query with tenant context
    const query: any = { id };

    // Apply tenant filter unless explicitly accessing shared resource
    if (!tenantContext.accessingSharedResource) {
      query[this.tenantField] = tenantContext.tenantId;
    } else {
      // For shared resources, verify access permissions
      const hasAccess = await this.verifySharedResourceAccess(
        id, tenantContext.tenantId
      );

      if (!hasAccess) {
        throw new ForbiddenError('No access to this shared resource');
      }
    }

    return repository.findOne(query);
  }

  async create(data: Partial<T>, tenantContext: TenantContext): Promise<T> {
    const repository = getRepository(this.entityType);

    // Always set tenant ID for new entities unless explicitly shared
    if (!tenantContext.creatingSharedResource) {
      data[this.tenantField] = tenantContext.tenantId as any;
    } else {
      // For shared resources, verify creation permission
      const canCreate = await this.verifyCanCreateSharedResource(tenantContext.tenantId);

      if (!canCreate) {
        throw new ForbiddenError('Cannot create shared resources');
      }
    }

    const entity = repository.create(data);
    return repository.save(entity);
  }

  private async verifySharedResourceAccess(
    resourceId: string,
    tenantId: string
  ): Promise<boolean> {
    // Implementation of shared resource access verification
    // This would check against resource sharing configurations
    return true; // Simplified for example
  }

  private async verifyCanCreateSharedResource(tenantId: string): Promise<boolean> {
    // Implementation of shared resource creation permission check
    return true; // Simplified for example
  }
}
```

### Pattern: Tenant-Aware Error Handling

#### Problem

Error responses need to be tailored to tenant-specific requirements while maintaining security boundaries.

#### Solution

Implement tenant-aware error handling that customizes error responses based on tenant configuration while preventing information leakage.

#### Implementation

1. Define error handling policies per tenant
2. Create an error handling middleware that:
   - Captures errors from application code
   - Identifies the tenant from the request context
   - Applies tenant-specific error formatting
   - Filters sensitive information based on tenant policy
   - Logs errors with tenant context

#### Code Example

```typescript
// TypeScript example of tenant-aware error handling
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant-service';

export class TenantAwareErrorHandler {
  constructor(private tenantService: TenantService) {}

  handleError() {
    return async (err: any, req: Request, res: Response, next: NextFunction) => {
      try {
        // Extract tenant ID from request
        const tenantId = req.headers['x-tenant-id'] as string;

        if (!tenantId) {
          // Default error handling for requests without tenant context
          return this.sendDefaultError(err, res);
        }

        // Get tenant error handling configuration
        const tenantConfig = await this.tenantService.getTenantErrorConfig(tenantId);

        // Format error based on tenant configuration
        const errorResponse = this.formatErrorForTenant(err, tenantConfig);

        // Log error with tenant context
        this.logTenantError(err, tenantId, req);

        // Send response with appropriate status code
        return res.status(errorResponse.statusCode).json(errorResponse.body);

      } catch (handlerError) {
        // Fallback error handling if tenant-specific handling fails
        console.error('Error in tenant error handler:', handlerError);
        return this.sendDefaultError(err, res);
      }
    };
  }

  private formatErrorForTenant(err: any, tenantConfig: any) {
    // Default values
    let statusCode = err.statusCode || 500;
    let errorMessage = 'An error occurred';
    let errorDetails = null;

    // Apply tenant-specific formatting
    if (tenantConfig) {
      // Use tenant-specific error messages if available
      if (tenantConfig.customErrors && tenantConfig.customErrors[err.code]) {
        errorMessage = tenantConfig.customErrors[err.code];
      }

      // Include error details based on tenant configuration
      if (tenantConfig.includeErrorDetails && err.message) {
        errorDetails = this.sanitizeErrorDetails(err.message, tenantConfig.sensitivePatterns);
      }
    }

    return {
      statusCode,
      body: {
        error: {
          code: err.code || 'internal_error',
          message: errorMessage,
          details: errorDetails
        }
      }
    };
  }

  private sanitizeErrorDetails(details: string, sensitivePatterns: RegExp[]) {
    let sanitized = details;

    // Remove sensitive information based on patterns
    if (sensitivePatterns && sensitivePatterns.length > 0) {
      sensitivePatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '[REDACTED]');
      });
    }

    return sanitized;
  }

  private sendDefaultError(err: any, res: Response) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      error: {
        code: err.code || 'internal_error',
        message: 'An error occurred'
      }
    });
  }

  private logTenantError(err: any, tenantId: string, req: Request) {
    console.error(`Tenant Error [${tenantId}]:`, {
      error: err,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
}
```

### Pattern: Tenant-Specific Plugin Chains

#### Problem

Different tenants require different API behavior and processing logic.

#### Solution

Implement tenant-specific plugin chains in APISIX that apply different processing logic based on tenant identity.

#### Implementation

1. Create tenant-specific plugin configurations
2. Use APISIX's plugin_config feature to define plugin sets
3. Use route conditions to apply plugin configurations based on tenant
4. Update plugin configurations dynamically when tenant settings change

#### Code Example

```yaml
# Create tenant-specific plugin configurations
plugin_configs:
  - id: tenant_a_plugins
    plugins:
      rate-limit:
        count: 200
        time_window: 60
      request-validation:
        body_schema:
          type: object
          required: ["action"]
      proxy-rewrite:
        headers:
          set:
            X-Tenant-Tier: "premium"

  - id: tenant_b_plugins
    plugins:
      rate-limit:
        count: 100
        time_window: 60
      request-validation:
        body_schema:
          type: object
          required: ["action", "parameters"]
      proxy-rewrite:
        headers:
          set:
            X-Tenant-Tier: "standard"

# Routes that use tenant-specific plugin chains
routes:
  - id: api_tenant_a
    uri: /api/*
    vars:
      - ["tenant_id", "==", "tenant-a"]
    plugin_config_id: tenant_a_plugins
    upstream:
      type: roundrobin
      nodes:
        "api-service:8080": 1

  - id: api_tenant_b
    uri: /api/*
    vars:
      - ["tenant_id", "==", "tenant-b"]
    plugin_config_id: tenant_b_plugins
    upstream:
      type: roundrobin
      nodes:
        "api-service:8080": 1
```

### Anti-Pattern: Tenant ID in Application Logic

#### Problem

Embedding tenant IDs directly in application business logic creates tight coupling and hinders reusability.

#### Solution

Abstract tenant context handling into middleware and data access layers, keeping core business logic tenant-agnostic.

#### Example of Anti-Pattern:

```javascript
// Anti-pattern: Tenant IDs hardcoded in business logic
function processOrder(orderId) {
  if (tenantId === 'tenant-a') {
    // Special logic for tenant A
    applyDiscountForTenantA();
  } else if (tenantId === 'tenant-b') {
    // Special logic for tenant B
    applyPriorityShippingForTenantB();
  } else {
    // Default handling
    applyStandardProcessing();
  }
}
```

#### Correct Pattern:

```javascript
// Correct pattern: Tenant-agnostic business logic with tenant strategies
function processOrder(orderId, tenantContext) {
  // Get tenant-specific order processor
  const orderProcessor = tenantContext.getOrderProcessor();

  // Apply tenant-specific processing via strategy pattern
  orderProcessor.processOrder(orderId);
}

// Tenant-specific strategies configured externally
const tenantProcessors = {
  'tenant-a': new DiscountOrderProcessor(),
  'tenant-b': new PriorityShippingProcessor(),
  'default': new StandardOrderProcessor()
};

// Tenant context provides appropriate processor
function getTenantContext(tenantId) {
  return {
    tenantId,
    getOrderProcessor: () => {
      return tenantProcessors[tenantId] || tenantProcessors['default'];
    }
  };
}
```

### Anti-Pattern: Shared Database Without Tenant Filtering

#### Problem

Using a shared database without consistent tenant filtering risks data leakage between tenants.

#### Solution

Implement systematic tenant filtering at the data access layer, ideally with automated enforcement.

#### Example of Anti-Pattern:

```javascript
// Anti-pattern: Queries without tenant filtering
async function getUserData(userId) {
  const user = await db.users.findOne({ id: userId });
  return user;
}
```

#### Correct Pattern:

```javascript
// Correct pattern: All queries include tenant filtering
async function getUserData(userId, tenantId) {
  const user = await db.users.findOne({
    id: userId,
    tenantId: tenantId // Always filter by tenant
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}

// Even better: Tenant context automatically applied at data layer
class TenantAwareRepository {
  constructor(collection, tenantId) {
    this.collection = collection;
    this.tenantId = tenantId;
  }

  // All methods automatically apply tenant filter
  findOne(filter) {
    return this.collection.findOne({
      ...filter,
      tenantId: this.tenantId
    });
  }

  find(filter) {
    return this.collection.find({
      ...filter,
      tenantId: this.tenantId
    });
  }
}
```

## Conclusion

Implementing multi-tenancy in the Enterprise Agentic AI Executive Platform through APISIX integration provides a robust foundation for secure and scalable tenant isolation. This guide has provided practical implementation guidance for creating a comprehensive multi-tenant environment with:

1. **Complete Tenant Isolation**: Ensuring tenant resources remain strictly separated
2. **Flexible Configuration**: Supporting tenant-specific policies and behaviors
3. **Resource Management**: Efficiently allocating and controlling resources per tenant
4. **Cross-Tenant Federation**: Enabling controlled resource sharing when required

When implementing multi-tenancy, remember these key principles:

- Tenant context must be consistently propagated throughout the request lifecycle
- Resource isolation must be enforced at multiple layers
- Configuration should be managed systematically with proper versioning
- Performance impacts of tenant isolation should be continuously monitored

By following the patterns and best practices in this guide, you can create a secure, scalable, and maintainable multi-tenant implementation that meets enterprise requirements for resource isolation while maintaining operational efficiency.

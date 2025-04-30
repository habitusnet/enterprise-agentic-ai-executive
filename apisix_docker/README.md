# APISIX Docker Deployment

This directory contains the configuration files and docker-compose setup for deploying Apache APISIX as a key component of the Enterprise Agentic AI Executive Platform.

## Components

The deployment includes:

- **APISIX**: The API gateway itself
- **etcd**: The configuration center for APISIX
- **APISIX Dashboard**: Web UI for managing APISIX

## Directory Structure

```
apisix_docker/
├── docker-compose.yml         # Docker Compose configuration
├── apisix_conf/               # APISIX configuration files
│   └── config.yaml            # Main APISIX configuration
└── dashboard_conf/            # Dashboard configuration files
    └── conf.yaml              # Dashboard configuration
```

## Getting Started

### Start the Services

```bash
docker-compose up -d
```

This will start all services in detached mode.

### Verify the Services

Check if all containers are running:

```bash
docker-compose ps
```

### Access the Dashboard

Open your browser and visit http://localhost:9000

Login credentials:
- Username: admin
- Password: admin

### Test APISIX

You can test if APISIX is working with the following command:

```bash
curl "http://127.0.0.1:9080/apisix/admin/services/" \
-H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1'
```

The response should be:

```json
{
  "total": 0,
  "list": []
}
```

## Stop the Services

```bash
docker-compose down
```

To remove volumes as well:

```bash
docker-compose down -v
```

## Making Changes

If you make changes to the configuration files, you'll need to reload APISIX:

```bash
docker-compose exec apisix apisix reload
```

## Security Notice

The current configuration uses default API keys and passwords. For production use:

1. Change the admin_key in both APISIX and Dashboard configurations
2. Restrict admin API access to specific IPs
3. Change the default dashboard password

## Next Steps for Implementation

1. Configure APISIX routes for LLM providers
2. Implement MCP (Model Context Protocol) server
3. Set up multi-tenant access controls
4. Configure observability and monitoring

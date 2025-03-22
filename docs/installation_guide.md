# Installation Guide

This guide provides comprehensive instructions for setting up the Enterprise Agentic AI Executive Platform in various environments. Follow these steps carefully to ensure proper installation and configuration.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Installation Steps](#installation-steps)
- [Configuration](#configuration)
- [LLM Provider Setup](#llm-provider-setup)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Operating System**: Linux (Ubuntu 20.04+), macOS (11+), or Windows 10+
- **Python**: Version 3.10+
- **Network**: Stable internet connection for LLM API access

#### Recommended Requirements
- **CPU**: 8+ cores
- **RAM**: 16GB+
- **Storage**: 100GB+ SSD
- **Operating System**: Linux (Ubuntu 22.04+)
- **Python**: Version 3.11
- **Network**: High-bandwidth internet connection

### Required Software

- **Git**: For repository cloning and version control
- **Python 3.10+**: The primary programming language
- **pip**: Python package manager
- **virtualenv** or **conda**: For isolated Python environments
- **Docker** (optional): For containerized deployment

### Required Accounts

- **LLM Provider Account**: One or more of the following:
  - OpenAI API account
  - Anthropic API account
  - Azure OpenAI Service account
  - Cohere API account
  - Local LLM setup (if using local models)

## Environment Setup

### Setting Up Python Environment

#### Using virtualenv

```bash
# Install virtualenv if not already installed
pip install virtualenv

# Create a new virtual environment
virtualenv venv

# Activate the environment
# On Linux/macOS
source venv/bin/activate
# On Windows
venv\Scripts\activate
```

#### Using conda

```bash
# Create a new conda environment
conda create -n ai-executive python=3.11

# Activate the environment
conda activate ai-executive
```

### Cloning the Repository

```bash
# Clone the repository
git clone https://github.com/your-organization/enterprise-ai-executive.git

# Navigate to the project directory
cd enterprise-ai-executive
```

## Installation Steps

### Installing Dependencies

```bash
# Install required Python packages
pip install -r requirements.txt
```

The `requirements.txt` file includes the following key dependencies:
- pandas
- numpy
- langchain
- langgraph
- pydantic
- fastapi (for API deployment)
- uvicorn (for API deployment)
- pytest (for testing)
- neo4j (for graph database support)
- matplotlib (for visualizations)
- aiohttp (for async HTTP requests)

### Optional Dependencies

For enhanced functionality, you can install additional packages:

```bash
# Install visualization dependencies
pip install -r requirements-viz.txt

# Install development dependencies
pip install -r requirements-dev.txt
```

## Configuration

### Environment Configuration

Create a `.env` file in the project root directory by copying the example:

```bash
cp .env.example .env
```

Edit the `.env` file to configure the following:

```
# LLM Provider Configuration
LLM_PROVIDER=openai  # Options: openai, anthropic, azure, cohere, local
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
AZURE_OPENAI_API_KEY=your_azure_api_key
AZURE_OPENAI_ENDPOINT=your_azure_endpoint
COHERE_API_KEY=your_cohere_api_key

# Local LLM Configuration (if using local models)
LOCAL_LLM_HOST=localhost
LOCAL_LLM_PORT=8000

# Database Configuration (optional)
USE_DATABASE=false  # Set to true if using a database
DATABASE_URI=your_database_uri

# Logging Configuration
LOG_LEVEL=INFO  # Options: DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_FILE=logs/ai_executive.log

# Governance Configuration
ENABLE_HUMAN_OVERSIGHT=true
CONSENSUS_THRESHOLD=0.7
MAX_RESOLUTION_ATTEMPTS=3
```

### System Configuration

Create or modify the `config.json` file to customize system behavior:

```bash
cp config.example.json config.json
```

Edit `config.json` to configure system parameters:

```json
{
  "system": {
    "name": "Enterprise AI Executive Platform",
    "version": "1.0.0",
    "default_decision_framework": "bayesian",
    "auto_select_framework": true
  },
  "executives": {
    "enabled": ["strategy", "finance", "ethics", "legal", "risk"],
    "custom_path": "./custom_executives"
  },
  "frameworks": {
    "enabled": ["bayesian", "mcda", "cynefin", "ooda"],
    "custom_path": "./custom_frameworks"
  },
  "consensus": {
    "threshold": 0.7,
    "min_participation": 0.8,
    "enable_veto": true
  },
  "governance": {
    "human_escalation_threshold": 0.3,
    "log_decisions": true,
    "audit_trail_path": "./audit_trails"
  },
  "visualization": {
    "enabled": true,
    "output_path": "./visualizations"
  }
}
```

## LLM Provider Setup

### OpenAI Setup

1. Create an account at [OpenAI Platform](https://platform.openai.com/)
2. Generate an API key in the OpenAI dashboard
3. Add your OpenAI API key to the `.env` file:
   ```
   LLM_PROVIDER=openai
   OPENAI_API_KEY=your_openai_api_key
   ```

### Anthropic Setup

1. Create an account at [Anthropic](https://www.anthropic.com/)
2. Request API access and generate an API key
3. Add your Anthropic API key to the `.env` file:
   ```
   LLM_PROVIDER=anthropic
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

### Azure OpenAI Setup

1. Create an Azure account and provision the Azure OpenAI service
2. Generate an API key and endpoint URI
3. Add your Azure OpenAI credentials to the `.env` file:
   ```
   LLM_PROVIDER=azure
   AZURE_OPENAI_API_KEY=your_azure_api_key
   AZURE_OPENAI_ENDPOINT=your_azure_endpoint
   ```

### Local LLM Setup (Advanced)

For users who want to run models locally:

1. Set up a local LLM server (e.g., using [llama.cpp](https://github.com/ggerganov/llama.cpp) or similar)
2. Configure the `.env` file to point to your local server:
   ```
   LLM_PROVIDER=local
   LOCAL_LLM_HOST=localhost
   LOCAL_LLM_PORT=8000
   ```

## Verification

### Verifying Installation

Run the verification script to ensure all components are installed correctly:

```bash
python scripts/verify_installation.py
```

This script checks:
- Python version compatibility
- Required packages availability
- Environment configuration
- LLM provider connectivity
- System configuration validity

### Running the Example

Execute the example usage script to verify the system works end-to-end:

```bash
python src/example_usage.py
```

This will run a sample decision-making process, testing:
- Executive agent initialization
- Decision framework application
- Consensus building
- Recommendation generation

## Troubleshooting

### Common Issues

#### Package Installation Failures

**Issue**: Error installing required packages.
**Solution**: 
- Ensure you have the latest pip: `pip install --upgrade pip`
- Install development libraries: 
  - On Ubuntu: `sudo apt-get install python3-dev build-essential`
  - On macOS: `xcode-select --install`
  - On Windows: Install Visual C++ Build Tools

#### LLM API Connection Issues

**Issue**: Cannot connect to LLM provider.
**Solution**:
- Verify API key is correct and not expired
- Check internet connection
- Ensure API endpoint is correct
- Verify account has sufficient credits/quota

#### Environment Configuration Problems

**Issue**: System cannot find configuration values.
**Solution**:
- Ensure `.env` file is in the correct location
- Verify environment variables are correctly formatted
- Try loading variables explicitly: `export $(cat .env | xargs)`

### Getting Help

If you encounter issues not covered here:

1. Check the [FAQ](faq.md) for answers to common questions
2. Review the [Issues](https://github.com/your-organization/enterprise-ai-executive/issues) on GitHub for similar problems
3. Join our [Community Forum](https://community.your-organization.com) for support
4. Contact enterprise support at support@your-organization.com

## Next Steps

After successful installation:

1. Review the [Developer Guide](developer_guide.md) to understand the system architecture
2. Explore the [Operations Guide](operations_guide.md) for deployment options
3. Check the [API Reference](api_reference.md) for integration possibilities
4. Consider extending the system with [Custom Executives](custom_executives.md)

For enterprise deployment assistance, contact our professional services team at enterprise-services@your-organization.com.
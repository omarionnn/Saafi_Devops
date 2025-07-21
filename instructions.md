# Saafi DevOps Platform - Implementation Instructions

## 🎯 Project Overview
Saafi is a developer-first self-service DevOps platform for fast, secure, multi-cloud infrastructure provisioning (AWS & GCP) with GitHub integration. This document provides detailed implementation instructions for building the MVP.

## 📋 Prerequisites
- Node.js 18+
- Docker & Docker Compose
- AWS CLI configured
- GCP CLI configured
- GitHub account with admin access for creating GitHub Apps
- Supabase account (or preferred database)

## 🏗️ Project Structure
```
saafi/
├── frontend/                 # Next.js application
├── backend/                  # Node.js/Express API
├── infrastructure/           # Terraform/Pulumi modules
├── blueprints/              # Infrastructure templates
├── docs/                    # Documentation
├── scripts/                 # Setup and deployment scripts
└── docker-compose.yml       # Local development
```

## 🚀 Development Setup Instructions

### 1. Initialize Project
```bash
# Create main project directory
mkdir saafi && cd saafi

# Initialize package.json for monorepo
npm init -y

# Create workspace structure
mkdir frontend backend infrastructure blueprints docs scripts
```

### 2. Frontend Setup (Next.js + Tailwind)
```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install lucide-react recharts @headlessui/react
```

**Key Frontend Files to Create:**
- `app/login/page.tsx` - GitHub OAuth login
- `app/dashboard/page.tsx` - Main dashboard
- `app/marketplace/page.tsx` - Blueprint marketplace
- `app/env/[id]/page.tsx` - Environment details
- `components/EnvironmentCard.tsx` - Environment display component
- `components/BlueprintCard.tsx` - Blueprint display component
- `lib/supabase.ts` - Supabase client configuration

### 3. Backend Setup (Node.js/Express)
```bash
cd ../backend
npm init -y
npm install express cors helmet morgan dotenv
npm install @supabase/supabase-js jsonwebtoken bcryptjs
npm install -D nodemon @types/node typescript
```

**Key Backend Files to Create:**
- `src/app.ts` - Express app configuration
- `src/routes/auth.ts` - Authentication routes
- `src/routes/environments.ts` - Environment management
- `src/routes/blueprints.ts` - Blueprint operations
- `src/middleware/auth.ts` - JWT authentication middleware
- `src/services/provisioning.ts` - Infrastructure provisioning logic
- `src/services/github.ts` - GitHub integration service

## 🗄️ Database Schema (Supabase)

### Core Tables
```sql
-- Users table (managed by Supabase Auth)
-- Additional user metadata
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  github_username TEXT,
  github_id INTEGER,
  role TEXT DEFAULT 'dev' CHECK (role IN ('admin', 'dev', 'viewer')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organizations/Teams
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  github_org TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User-Organization relationships
CREATE TABLE user_organizations (
  user_id UUID REFERENCES user_profiles(id),
  org_id UUID REFERENCES organizations(id),
  role TEXT DEFAULT 'member',
  PRIMARY KEY (user_id, org_id)
);

-- Environment definitions
CREATE TABLE environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'provisioning', 'active', 'failed', 'terminated')),
  cloud_provider TEXT NOT NULL CHECK (cloud_provider IN ('aws', 'gcp')),
  blueprint_id UUID REFERENCES blueprints(id),
  github_repo TEXT,
  github_pr INTEGER,
  owner_id UUID REFERENCES user_profiles(id),
  org_id UUID REFERENCES organizations(id),
  config JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Blueprint templates
CREATE TABLE blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cloud_provider TEXT NOT NULL CHECK (cloud_provider IN ('aws', 'gcp')),
  category TEXT,
  template_config JSONB NOT NULL,
  cost_estimate DECIMAL(10,2),
  compliance_tags TEXT[],
  version TEXT DEFAULT '1.0.0',
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Feedback submissions
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  type TEXT CHECK (type IN ('thumbs_up', 'thumbs_down', 'bug_report', 'feature_request')),
  content TEXT,
  blueprint_id UUID REFERENCES blueprints(id),
  environment_id UUID REFERENCES environments(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Environment usage tracking
CREATE TABLE environment_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_id UUID REFERENCES environments(id),
  runtime_minutes INTEGER,
  estimated_cost DECIMAL(10,2),
  last_accessed TIMESTAMP,
  recorded_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Authentication & Authorization Implementation

### GitHub OAuth Setup
1. Create GitHub App at `https://github.com/settings/apps`
2. Set permissions:
   - Repository: Read & Write
   - Pull requests: Read & Write  
   - Metadata: Read
3. Generate private key and store securely

### Supabase Auth Configuration
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// GitHub OAuth provider setup
export const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      scopes: 'repo user:email'
    }
  })
  return { data, error }
}
```

## 🧰 Blueprint System Implementation

### Blueprint Structure
```typescript
// types/blueprint.ts
export interface Blueprint {
  id: string
  name: string
  description: string
  cloud_provider: 'aws' | 'gcp'
  category: string
  template_config: {
    terraform?: {
      source: string
      variables: Record<string, any>
    }
    pulumi?: {
      program: string
      stack: string
    }
  }
  cost_estimate: number
  compliance_tags: string[]
  version: string
}
```

### Starter Blueprints to Implement
1. **Node.js App on AWS EC2**
   - EC2 instance with Node.js
   - Security group configuration
   - Auto-scaling group (optional)

2. **Python Flask App on GCP Cloud Run**
   - Cloud Run service
   - Cloud SQL integration
   - IAM roles

3. **PostgreSQL DB on AWS RDS**
   - RDS PostgreSQL instance
   - VPC and subnet configuration
   - Security groups

4. **GKE Kubernetes Cluster**
   - GKE cluster setup
   - Node pools
   - Basic ingress configuration

## 🔗 GitHub Integration Implementation

### Webhook Handler
```typescript
// backend/src/routes/github.ts
import express from 'express'
import { verifyWebhookSignature } from '../utils/github'

const router = express.Router()

router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-hub-signature-256']
  const payload = req.body
  
  if (!verifyWebhookSignature(payload, signature)) {
    return res.status(401).send('Unauthorized')
  }
  
  const { action, pull_request, repository } = payload
  
  if (action === 'opened' && pull_request) {
    // Trigger environment provisioning
    await provisionEnvironmentForPR({
      repo: repository.full_name,
      pr_number: pull_request.number,
      branch: pull_request.head.ref
    })
  }
  
  if (action === 'closed' && pull_request) {
    // Trigger environment cleanup
    await cleanupEnvironmentForPR({
      repo: repository.full_name,
      pr_number: pull_request.number
    })
  }
  
  res.status(200).send('OK')
})
```

### PR Comment Integration
```typescript
// services/github.ts
import { Octokit } from '@octokit/rest'

export class GitHubService {
  private octokit: Octokit
  
  constructor(token: string) {
    this.octokit = new Octokit({ auth: token })
  }
  
  async commentOnPR(repo: string, prNumber: number, message: string) {
    const [owner, repoName] = repo.split('/')
    
    return this.octokit.issues.createComment({
      owner,
      repo: repoName,
      issue_number: prNumber,
      body: message
    })
  }
  
  async updatePRComment(repo: string, commentId: number, message: string) {
    const [owner, repoName] = repo.split('/')
    
    return this.octokit.issues.updateComment({
      owner,
      repo: repoName,
      comment_id: commentId,
      body: message
    })
  }
}
```

## 🏭 Infrastructure Provisioning

### Terraform Integration
```typescript
// services/provisioning.ts
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export class ProvisioningService {
  async provisionEnvironment(blueprint: Blueprint, config: any) {
    const workingDir = `/tmp/terraform/${Date.now()}`
    
    try {
      // Create working directory
      await execAsync(`mkdir -p ${workingDir}`)
      
      // Generate Terraform configuration
      await this.generateTerraformConfig(workingDir, blueprint, config)
      
      // Initialize Terraform
      await execAsync('terraform init', { cwd: workingDir })
      
      // Plan
      const { stdout: planOutput } = await execAsync('terraform plan', { cwd: workingDir })
      
      // Apply
      await execAsync('terraform apply -auto-approve', { cwd: workingDir })
      
      // Get outputs
      const { stdout: outputs } = await execAsync('terraform output -json', { cwd: workingDir })
      
      return {
        success: true,
        outputs: JSON.parse(outputs),
        planOutput
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  private async generateTerraformConfig(workingDir: string, blueprint: Blueprint, config: any) {
    // Implementation depends on blueprint structure
    // Generate main.tf, variables.tf, etc.
  }
}
```

## 🎨 UI Components to Build

### Environment Card Component
```tsx
// components/EnvironmentCard.tsx
interface EnvironmentCardProps {
  environment: {
    id: string
    name: string
    status: 'pending' | 'provisioning' | 'active' | 'failed' | 'terminated'
    cloud_provider: 'aws' | 'gcp'
    github_repo?: string
    created_at: string
  }
  onDelete: (id: string) => void
  onViewDetails: (id: string) => void
}

export function EnvironmentCard({ environment, onDelete, onViewDetails }: EnvironmentCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    provisioning: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    terminated: 'bg-gray-100 text-gray-800'
  }
  
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      {/* Environment card content */}
    </div>
  )
}
```

## 🔧 Configuration Files

### Environment Variables (.env)
```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# GitHub
GITHUB_APP_ID=your_github_app_id
GITHUB_PRIVATE_KEY=your_github_private_key
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# AWS
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=us-east-1

# GCP
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GOOGLE_PROJECT_ID=your_gcp_project_id

# Application
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=3001
```

### Docker Compose for Local Development
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
  
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    depends_on:
      - redis
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

## 📋 Development Checklist

### Week 1: Foundation
- [x] Project structure setup
- [ ] Supabase database schema creation
- [ ] GitHub OAuth integration
- [x] Basic Next.js frontend with login (bootstrapped, not yet with login UI)
- [x] Express backend with auth middleware (backend initialized, middleware not yet implemented)
- [ ] Environment card UI components

### Week 2: Core Functionality
- [ ] Blueprint storage and retrieval
- [ ] Environment provisioning service
- [ ] 3 working blueprints (AWS EC2, GCP Cloud Run, AWS RDS)
- [ ] Dashboard with environment listing
- [ ] Blueprint marketplace UI

### Week 3: Integration
- [ ] Secrets management integration
- [ ] GitHub App setup and webhook handling
- [ ] PR-triggered provisioning
- [ ] Environment cleanup on PR merge/close
- [ ] RBAC implementation

### Week 4: Polish & Insights
- [ ] Feedback widget implementation
- [ ] Cost estimation service
- [ ] Usage tracking
- [ ] Admin dashboard for feedback
- [ ] Bug fixes and testing
- [ ] Internal demo preparation

## 🚨 Security Considerations

1. **Secrets Management**: Never store cloud credentials in database
2. **RBAC**: Implement proper role-based access control
3. **Input Validation**: Validate all user inputs
4. **Rate Limiting**: Implement API rate limiting
5. **Webhook Security**: Always verify GitHub webhook signatures
6. **Environment Isolation**: Ensure environments can't access each other

## 🧪 Testing Strategy

1. **Unit Tests**: Jest for backend logic
2. **Integration Tests**: Test API endpoints
3. **E2E Tests**: Playwright for critical user flows
4. **Infrastructure Tests**: Test blueprint provisioning in isolated environments

## 📊 Monitoring & Logging

1. **Application Monitoring**: Use Sentry or similar
2. **Infrastructure Monitoring**: CloudWatch/Stackdriver
3. **User Analytics**: PostHog or Google Analytics
4. **Cost Monitoring**: AWS Cost Explorer/GCP Billing APIs

## 🚀 Deployment Instructions

### Production Deployment
1. Set up CI/CD pipeline (GitHub Actions)
2. Configure production database
3. Set up monitoring and logging
4. Configure domain and SSL
5. Deploy frontend to Vercel/Netlify
6. Deploy backend to Railway/Render

This instruction document should serve as your comprehensive guide while building Saafi. Reference specific sections as needed during development.
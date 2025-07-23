# Saafi DevOps Platform

Saafi is a developer-first, self-service DevOps platform for fast, secure, multi-cloud infrastructure provisioning (AWS & GCP) with GitHub integration. It empowers teams to provision, manage, and track cloud environments and blueprints with ease, enabling modern DevOps workflows and automation.

## 🚀 Vision
Saafi aims to make cloud infrastructure as easy and safe as possible for developers and teams. Our vision is to:
- Enable anyone to provision secure, compliant, and cost-effective cloud environments in minutes.
- Automate environment lifecycle for every developer, pull request, and team.
- Provide deep GitHub integration for seamless CI/CD and environment management.
- Support multi-cloud (AWS, GCP) and compliance out-of-the-box.

## ✨ What Makes Saafi Stand Out
- **Self-service, developer-first UX**: No more waiting for ops—provision what you need, when you need it.
- **Blueprint marketplace**: Reusable, versioned infrastructure templates for common stacks and compliance needs.
- **GitHub integration**: PR-triggered environments, feedback, and automation.
- **Multi-cloud support**: AWS and GCP from day one.
- **Security & compliance**: RBAC, secrets management, and compliance tagging built-in.
- **Cost and usage tracking**: See what you’re running and what it costs.

## 🏗️ Features

### ✅ Developed
- Monorepo structure with frontend (Next.js), backend (Express), infrastructure, blueprints, docs, and scripts
- Supabase database schema and integration
- GitHub OAuth authentication (Supabase Auth)
- JWT authentication middleware for backend API
- Environment card UI component
- Dashboard with real environment listing, creation, and deletion
- User-specific filtering for environments
- Blueprint marketplace UI (fetches from Supabase)
- Blueprint selection pre-fills environment creation

### 🛠️ In Progress / Next Up
- Backend endpoints for blueprint storage and retrieval (API)
- Environment provisioning service (Terraform/Pulumi integration)
- Secrets management integration
- GitHub App setup and webhook handling
- PR-triggered provisioning and environment cleanup
- RBAC implementation
- Feedback widget, cost estimation, usage tracking, admin dashboard
- Bug fixes, testing, and internal demo

## 📋 Development Checklist
- [x] Project structure setup
- [x] Supabase database schema creation
- [x] GitHub OAuth integration
- [x] Basic Next.js frontend with login
- [x] Express backend with auth middleware
- [x] Environment card UI components
- [x] Dashboard with environment listing, creation, and deletion
- [x] User-specific filtering for environments
- [x] Blueprint marketplace UI
- [x] Blueprint selection pre-fills environment creation
- [ ] Backend endpoints for blueprint storage and retrieval
- [ ] Environment provisioning service
- [ ] Secrets management integration
- [ ] GitHub App setup and webhook handling
- [ ] PR-triggered provisioning and cleanup
- [ ] RBAC implementation
- [ ] Feedback widget, cost estimation, usage tracking, admin dashboard
- [ ] Bug fixes, testing, and internal demo

## 📚 Documentation
See `instructions.md` for detailed setup, schema, and implementation instructions.

---

**Saafi is on a mission to make DevOps and cloud infrastructure simple, fast, and accessible for every developer and team.**
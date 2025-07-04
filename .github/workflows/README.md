# GitHub Actions CI/CD Setup

This repository uses GitHub Actions for Continuous Integration and Deployment.

## 🔧 Required GitHub Secrets

To enable the CI/CD pipeline, you need to configure the following secrets in your GitHub repository:

### Go to: Repository Settings → Secrets and Variables → Actions → New Repository Secret

#### **Frontend Environment Variables**

```
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### **Backend Environment Variables**

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

## 📋 Secrets Setup Instructions

1. **Go to your GitHub repository**
2. **Click Settings** (top right of repo)
3. **Click Secrets and Variables → Actions** (left sidebar)
4. **Click "New repository secret"**
5. **Add each secret:**

| Secret Name              | Value                     | Description                   |
| ------------------------ | ------------------------- | ----------------------------- |
| `VITE_API_URL`           | `http://localhost:3001`   | Frontend API endpoint         |
| `VITE_SUPABASE_URL`      | `https://xxx.supabase.co` | Your Supabase project URL     |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...`                  | Your Supabase anon public key |
| `SUPABASE_URL`           | `https://xxx.supabase.co` | Backend Supabase project URL  |
| `SUPABASE_KEY`           | `eyJ...`                  | Backend Supabase anon key     |

## 🚀 CI Pipeline Overview

The CI pipeline runs on every push and pull request to `main` and `develop` branches.

### **Jobs:**

#### 1. **Frontend CI**

- ✅ Type checking with TypeScript
- ✅ Format checking with Prettier
- ✅ Build the React application
- ✅ Upload build artifacts

#### 2. **Backend CI**

- ✅ ESLint code linting
- ✅ Format checking with Prettier
- ✅ Server health check (starts server and tests `/api/health`)
- ✅ Test runner (placeholder for future tests)

#### 3. **Security Audit**

- ✅ Frontend dependency audit
- ✅ Backend dependency audit
- ✅ Check for known vulnerabilities

#### 4. **Build Summary**

- ✅ Aggregates all job results
- ✅ Fails if any job fails
- ✅ Provides clear success/failure status

## 📊 Workflow Triggers

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

## 🔄 Caching Strategy

The workflow uses intelligent caching to speed up builds:

- **Node.js dependencies** cached per `package-lock.json` hash
- **Frontend dependencies** cached separately from backend
- **Build artifacts** preserved for 7 days

## ❌ Failure Conditions

The pipeline will fail if:

- TypeScript compilation errors
- ESLint linting errors
- Prettier format violations
- Frontend build fails
- Backend server health check fails
- Security audit finds high-severity vulnerabilities
- Any job times out (default: 6 hours)

## 🔍 Monitoring

### **View CI Status:**

1. Go to **Actions** tab in your GitHub repository
2. Click on any workflow run to see detailed logs
3. Each job shows individual steps and their status

### **Debug Failed Builds:**

1. Click on the failed job
2. Expand the failed step to see error logs
3. Common issues:
   - Missing secrets
   - TypeScript errors
   - Format violations
   - Dependency conflicts

## 🚀 Next Steps

After CI is working, you can extend the workflow to:

- Add deployment to Vercel/Netlify
- Add automated testing
- Add code coverage reports
- Add automated releases
- Add security scanning (CodeQL, Snyk)

## 💡 Local Testing

Test the same checks locally before pushing:

```bash
# Frontend checks
cd frontend
npm run type-check
npm run format:check
npm run build

# Backend checks
cd backend
npm run lint
npm run format -- --check
npm start  # Test server starts
```

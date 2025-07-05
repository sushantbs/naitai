# 🚀 Vercel Deployment Guide

This guide walks you through deploying your monorepo to Vercel with separate frontend and backend projects.

## Prerequisites

- ✅ GitHub repository with your code
- ✅ Supabase project set up
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com))

## Step 1: Connect Repository to Vercel

1. **Login to Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "Login" and sign in with your GitHub account

2. **Import Your Repository**
   - Click "New Project" button
   - Select "Import Git Repository"
   - Choose your GitHub repository from the list
   - Click "Import"

## Step 2: Set Up Backend Project

### 2.1 Create Backend Project

1. **Configure Project Settings**
   - Project Name: `naitai-backend` (or your preferred name)
   - Framework Preset: `Other`
   - Root Directory: `backend`
   - Build Command: `npm run build` (leave empty for now)
   - Output Directory: `.` (leave as default)
   - Install Command: `npm install`

2. **Environment Variables**
   Add these in the Vercel dashboard under "Environment Variables":

   ```
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_KEY=your-supabase-service-role-key
   PORT=3001
   ```

3. **Deploy Backend**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note the deployed URL (e.g., `https://naitai-backend.vercel.app`)

### 2.2 Test Backend Deployment

After deployment, test these endpoints:

- `https://your-backend.vercel.app/api/health`
- `https://your-backend.vercel.app/api/habits`

## Step 3: Set Up Frontend Project

### 3.1 Create Frontend Project

1. **Import Same Repository Again**
   - Go back to Vercel dashboard
   - Click "New Project" again
   - Select the same GitHub repository
   - Click "Import"

2. **Configure Project Settings**
   - Project Name: `naitai-frontend` (or your preferred name)
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   Add these in the Vercel dashboard under "Environment Variables":

   ```
   VITE_API_URL=https://your-backend.vercel.app
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Deploy Frontend**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note the deployed URL (e.g., `https://naitai-frontend.vercel.app`)

## Step 4: Configure Environment Variables

### Backend Environment Variables

| Variable       | Value                              | Description               |
| -------------- | ---------------------------------- | ------------------------- |
| `SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `SUPABASE_KEY` | `your-service-role-key`            | Supabase service role key |
| `PORT`         | `3001`                             | Port for the server       |

### Frontend Environment Variables

| Variable                 | Value                              | Description               |
| ------------------------ | ---------------------------------- | ------------------------- |
| `VITE_API_URL`           | `https://your-backend.vercel.app`  | Your deployed backend URL |
| `VITE_SUPABASE_URL`      | `https://your-project.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key`                    | Supabase anon/public key  |

## Step 5: Test Deployments

### Backend Testing

1. **Health Check**

   ```bash
   curl https://your-backend.vercel.app/api/health
   ```

   Should return: `{"status":"OK"}`

2. **Habits API**
   ```bash
   curl https://your-backend.vercel.app/api/habits
   ```
   Should return habits data

### Frontend Testing

1. **Visit Frontend URL**
   - Open `https://your-frontend.vercel.app`
   - Navigate to the habits page
   - Try adding a new habit
   - Check if data persists

2. **Check Network Tab**
   - Open browser DevTools
   - Check if API calls are going to your backend URL
   - Verify no CORS errors

## Step 6: Set Up Preview Deployments

### Automatic Preview Deployments

Both projects will automatically create preview deployments for:

- Every pull request
- Every push to non-main branches

### Manual Preview Deployments

1. **Create a New Branch**

   ```bash
   git checkout -b feature/new-feature
   git push origin feature/new-feature
   ```

2. **Check Vercel Dashboard**
   - Both projects will show preview deployments
   - Test the preview URLs before merging

## Step 7: Configure Custom Domains (Optional)

### Backend Domain

1. Go to your backend project settings
2. Click "Domains"
3. Add custom domain (e.g., `api.yourdomain.com`)
4. Update frontend `VITE_API_URL` to use custom domain

### Frontend Domain

1. Go to your frontend project settings
2. Click "Domains"
3. Add custom domain (e.g., `yourdomain.com`)

## Troubleshooting

### Common Issues

1. **Backend API Not Found**
   - Check if `vercel.json` exists in backend folder
   - Verify root directory is set to `backend`

2. **Frontend API Calls Failing**
   - Check `VITE_API_URL` environment variable
   - Verify backend deployment is working
   - Check CORS configuration

3. **Environment Variables Not Loading**
   - Ensure variables are set in Vercel dashboard
   - Redeploy after adding variables
   - Check variable names match exactly

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs in Vercel dashboard

### Getting Help

- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Check deployment logs in Vercel dashboard
- Use Vercel CLI for local testing: `npm i -g vercel`

## Quick Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Test locally
vercel dev

# Deploy manually
vercel --prod

# Check deployment status
vercel ls
```

## Next Steps

1. ✅ Deploy backend to Vercel
2. ✅ Deploy frontend to Vercel
3. ✅ Configure environment variables
4. ✅ Test both deployments
5. ✅ Set up preview deployments
6. 🔄 Configure custom domains (optional)
7. 🔄 Set up monitoring and analytics

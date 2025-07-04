# Quick Setup Guide

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Environment Variables

**Frontend (.env.local)**

```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local` and add your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (.env)**

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your configuration:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
```

Note: For now the env files have to be manually exported because Cursor ignores the .env files as they have been added to the .cursorignore file / Cursor editor settings for security reasons. Cursor should not be able to access the .env files for obvious reasons.

### 3. Start Development Servers

```bash
npm run dev
```

This will start:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### 4. Health Check

Visit http://localhost:3001/health to verify the backend is running.

## 📋 Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both applications
- `npm run test` - Run all tests
- `npm run lint` - Lint all code
- `npm run format` - Format all code
- `npm run type-check` - Type check all TypeScript

## 🔧 Next Steps

1. **Set up Supabase**: Create a new project at [supabase.com](https://supabase.com)
2. **Configure GitHub**: Set up repository secrets for CI/CD
3. **Deploy to Vercel**: Connect your GitHub repository to Vercel
4. **Add shadcn/ui components**: Run `npx shadcn-ui@latest add button` in the frontend directory

## 📚 Documentation

- [Full README](./README.md) - Complete project documentation
- [Frontend README](./frontend/README.md) - Frontend-specific documentation
- [Backend README](./backend/README.md) - Backend-specific documentation

## 🤝 Need Help?

Check the GitHub issues or create a new one if you encounter any problems.

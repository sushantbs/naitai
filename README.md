# Naitai - Full-Stack Monorepo

A modern full-stack application built with React, TypeScript, Node.js, and Supabase.

## 🏗️ Project Structure

```
naitai/
├── frontend/          # React + TypeScript + Vite + Tailwind + shadcn/ui + Framer Motion
├── backend/           # Node.js + Express + ESM + Supabase
├── .github/           # GitHub Actions CI/CD workflows
├── .gitignore         # Git ignore patterns
├── .editorconfig      # Editor configuration
├── package.json       # Root package.json for workspace management
├── README.md          # This file
└── vercel.json        # Vercel deployment configuration
```

## 🚀 Tech Stack

### Frontend

- **Framework**: React 18
- **Type System**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **State Management**: React Query + Zustand (recommended)

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Module System**: ESM (ES Modules)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Type Safety**: TypeScript

### DevOps & Deployment

- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Frontend Deployment**: Vercel
- **Backend Deployment**: Vercel Functions
- **Database**: Supabase Cloud

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn or pnpm
- Git
- A Supabase account
- A Vercel account (for deployment)

## 🔧 Getting Started

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Setup

Create environment files:

```bash
# Frontend environment
cp frontend/.env.example frontend/.env.local

# Backend environment
cp backend/.env.example backend/.env
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Update the environment variables in both frontend and backend

### 4. Database Setup

```bash
# Navigate to backend and run migrations
cd backend
npm run db:migrate
```

### 5. Development

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start individually:
# Frontend (from root)
npm run dev:frontend

# Backend (from root)
npm run dev:backend
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Automatic Deployment (Recommended)

1. Push to `main` branch
2. GitHub Actions will automatically deploy to Vercel
3. Environment variables are managed through Vercel dashboard

### Manual Deployment

```bash
# Build and deploy frontend
cd frontend
npm run build
vercel --prod

# Deploy backend
cd ../backend
vercel --prod
```

## 📁 Project Guidelines

### Code Organization

- Use TypeScript for all new code
- Follow the established folder structure
- Keep components small and focused
- Use absolute imports with path aliases

### Styling

- Use Tailwind CSS utilities
- Leverage shadcn/ui components
- Keep custom CSS minimal
- Use CSS variables for theming

### State Management

- Use React Query for server state
- Use Zustand for client state
- Keep state as close to where it's used as possible

### API Design

- Use RESTful conventions
- Implement proper error handling
- Use TypeScript interfaces for API contracts
- Include comprehensive API documentation

## 🔐 Environment Variables

### Frontend (.env.local)

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (.env)

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=3001
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Scripts

### Root Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only
- `npm run build` - Build both applications
- `npm run test` - Run all tests
- `npm run lint` - Lint all code
- `npm run format` - Format all code

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code

### Backend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Express.js](https://expressjs.com/)
- [Supabase](https://supabase.com/)
- [Vercel](https://vercel.com/)
# Test comment

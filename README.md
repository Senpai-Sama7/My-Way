# 🚀 Welcome to Learn Your Way

A modern, production-ready web application scaffold powered by cutting-edge technologies, designed to accelerate your development with AI-powered personalized learning.

## ✨ Technology Stack

This scaffold provides a robust foundation built with:

### 🎯 Core Framework
- **⚡ Next.js 15** - The React framework for production with App Router
- **📘 TypeScript 5** - Type-safe JavaScript for better developer experience
- **🎨 Tailwind CSS 4** - Utility-first CSS framework for rapid UI development

### 🧩 UI Components & Styling
- **🧩 shadcn/ui** - High-quality, accessible components built on Radix UI
- **🎯 Lucide React** - Beautiful & consistent icon library
- **🌈 Framer Motion** - Production-ready motion library for React
- **🎨 Next Themes** - Perfect dark mode in 2 lines of code

### 📋 Forms & Validation
- **🎣 React Hook Form** - Performant forms with easy validation
- **✅ Zod** - TypeScript-first schema validation

### 🔄 State Management & Data Fetching
- **🐻 Zustand** - Simple, scalable state management
- **🔄 TanStack Query** - Powerful data synchronization for React
- **🌐 Fetch** - Promise-based HTTP request

### 🗄️ Database & Backend
- **🗄️ Prisma** - Next-generation TypeScript ORM
- **🔐 NextAuth.js** - Complete open-source authentication solution

### 🎨 Advanced UI Features
- **📊 TanStack Table** - Headless UI for building tables and datagrids
- **🖱️ DND Kit** - Modern drag and drop toolkit for React
- **📊 Recharts** - Redefined chart library built with React and D3
- **🖼️ Sharp** - High performance image processing

### 🌍 Internationalization & Utilities
- **🌍 Next Intl** - Internationalization library for Next.js
- **📅 Date-fns** - Modern JavaScript date utility library
- **🪝 ReactUse** - Collection of essential React hooks for modern development

## 🎯 Why This Scaffold?

- **🏎️ Fast Development** - Pre-configured tooling and best practices
- **🎨 Beautiful UI** - Complete shadcn/ui component library with advanced interactions
- **🔒 Type Safety** - Full TypeScript configuration with Zod validation
- **📱 Responsive** - Mobile-first design principles with smooth animations
- **🗄️ Database Ready** - Prisma ORM configured for rapid backend development
- **🔐 Auth Included** - NextAuth.js for secure authentication flows
- **📊 Data Visualization** - Charts, tables, and drag-and-drop functionality
- **🌍 i18n Ready** - Multi-language support with Next Intl
- **🚀 Production Ready** - Optimized build and deployment settings
- **🤖 AI-Friendly** - Structured codebase perfect for AI assistance

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Run full end-to-end walkthrough (uses system Chrome)
bun run test:e2e

# Start production server
bun start
```

Open [http://localhost:3000](http://localhost:3000) to see your application running.

## 🧠 Open-source LLM backend

The scaffold now uses a **generic chat completion client** (via `src/lib/ai-client.ts`). You just need an LLM service that speaks a OpenAI/LLM-compatible chat API—for example:

1. **Run a local open-source server**, such as [Ollama](https://ollama.ai/docs/introduction) + an open-model (e.g., `ollama run llama3`), h2oGPT, or any other self-hosted REST endpoint.
2. Set `LLM_BASE_URL` to the endpoint URL (default: `http://127.0.0.1:11434/api/chat/completions` for Ollama) and `LLM_MODEL` to the model name you want to use (default: `llama3.1`).
3. Provide `LLM_API_KEY` only if your service enforces authentication.

Example `.env.local` (create in the repo root):

```env
LLM_BASE_URL=http://127.0.0.1:11434/api/chat
LLM_MODEL=qwen3-4b
LLM_API_KEY=
```

No extra config file is required. As long as the backend can reach your chosen LLM server, the `/api/*` routes that power tutoring, TTS, and media generation will work.

### Local TTS (open-source)

The `/api/tts` route now uses **espeak-ng** to generate WAV audio locally. It is open-source and already installed on this machine. If you deploy elsewhere, install `espeak-ng` on the server or replace the TTS route with your preferred open-source TTS service.

### Health checks

Use `GET /api/health` for a quick status. For a full dependency check (LLM + DB), use `GET /api/health?deep=1`.

## 🤖 AI Features

This scaffold is optimized for AI-driven development and learning:

- **💻 Code Generation** - Generate components, pages, and features
- **🎨 UI Development** - Create beautiful interfaces
- **🔧 Bug Fixing** - Identify and resolve issues
- **📝 Documentation** - Auto-generate comprehensive documentation
- **🚀 Optimization** - Performance improvements and best practices


## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
└── lib/                # Utility functions and configurations
```

## 🎨 Available Features & Components

This scaffold includes a comprehensive set of modern web development tools:

### 🧩 UI Components (shadcn/ui)
- **Layout**: Card, Separator, Aspect Ratio, Resizable Panels
- **Forms**: Input, Textarea, Select, Checkbox, Radio Group, Switch
- **Feedback**: Alert, Toast (Sonner), Progress, Skeleton
- **Navigation**: Breadcrumb, Menubar, Navigation Menu, Pagination
- **Overlay**: Dialog, Sheet, Popover, Tooltip, Hover Card
- **Data Display**: Badge, Avatar, Calendar

### 📊 Advanced Data Features
- **Tables**: Powerful data tables with sorting, filtering, pagination (TanStack Table)
- **Charts**: Beautiful visualizations with Recharts
- **Forms**: Type-safe forms with React Hook Form + Zod validation

### 🎨 Interactive Features
- **Animations**: Smooth micro-interactions with Framer Motion
- **Drag & Drop**: Modern drag-and-drop functionality with DND Kit
- **Theme Switching**: Built-in dark/light mode support

### 🔐 Backend Integration
- **Authentication**: Ready-to-use auth flows with NextAuth.js
- **Database**: Type-safe database operations with Prisma
- **API Client**: HTTP requests with Fetch + TanStack Query
- **State Management**: Simple and scalable with Zustand

### 🌍 Production Features
- **Internationalization**: Multi-language support with Next Intl
- **Image Optimization**: Automatic image processing with Sharp
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Essential Hooks**: 100+ useful React hooks with ReactUse for common patterns

## 🤝 Get Started

1. **Clone this scaffold** to jumpstart your project
2. **Start building** with intelligent code generation and assistance
3. **Deploy with confidence** using the production-ready setup

---

Built with ❤️ for the developer community.
# My-Way

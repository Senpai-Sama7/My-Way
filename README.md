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

## � AI Configuration

This scaffold features a flexible AI client (`src/lib/ai-client.ts`) that supports multiple providers. You can switch between them by setting environment variables in `.env.local`.

### Supported Providers

- **Ollama** (Default) - For local inference.
- **OpenAI** - For GPT-4o, GPT-3.5, etc.
- **Gemini** - For Google's Gemini models (via OpenAI-compatible endpoint).
- **OpenRouter** - For accessing various models (Claude, Llama 3, etc.).
- **Local** - For other local servers (e.g., LM Studio).

### Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Configure your provider:

   **For Ollama (Local):**
   ```env
   LLM_PROVIDER=ollama
   LLM_MODEL=llama3.1
   ```

   **For OpenAI:**
   ```env
   LLM_PROVIDER=openai
   LLM_API_KEY=sk-...
   LLM_MODEL=gpt-4o
   ```

   **For Gemini:**
   ```env
   LLM_PROVIDER=gemini
   LLM_API_KEY=your-google-api-key
   LLM_MODEL=gemini-2.0-flash
   ```

   **For OpenRouter:**
   ```env
   LLM_PROVIDER=openrouter
   LLM_API_KEY=sk-...
   LLM_MODEL=meta-llama/llama-3-8b-instruct:free
   ```

### Health Checks

Use `GET /api/health` for a quick status.


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

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserPreferences {
  gradeLevel: number
  interest: string
  learningStyle: string
  dailyGoal: number
}

interface LearningSession {
  materialId: string
  materialTitle: string
  category: string
  currentView: 'immersive-text' | 'slides' | 'audio' | 'mindmap'
  currentSectionIndex: number
  completedSections: number[]
  viewedSlides: boolean
  viewedAudio: boolean
  viewedMindmap: boolean
  embeddedQuestionsSeen: string[]
}

interface AppState {
  // User preferences
  preferences: UserPreferences | null
  setPreferences: (preferences: UserPreferences) => void

  // Current learning session
  currentSession: LearningSession | null
  setCurrentSession: (session: LearningSession | null) => void

  // UI state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Navigation
  currentPage: string
  setCurrentPage: (page: string) => void

  // AI Preferences
  aiPreferences: AiPreferences
  setAiPreferences: (prefs: Partial<AiPreferences>) => void
}

export interface AiPreferences {
    provider: 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'openrouter'
    apiKey?: string
    model?: string
    baseUrl?: string
    enabled: boolean
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User preferences
      preferences: null,
      setPreferences: (preferences) => set({ preferences }),

      // Current learning session
      currentSession: null,
      setCurrentSession: (session) => set({ currentSession: session }),

      // UI state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Navigation
  // Navigation
  currentPage: '/',
  setCurrentPage: (page) => set({ currentPage: page }),

  // AI Preferences
  aiPreferences: {
      provider: 'ollama',
      enabled: true
  },
  setAiPreferences: (prefs) => set((state) => ({ aiPreferences: { ...state.aiPreferences, ...prefs } })),
}),
{
  name: 'learn-my-way-store',
  partialize: (state) => ({
    preferences: state.preferences,
    currentSession: state.currentSession,
    aiPreferences: state.aiPreferences,
  }),
}
  )
)
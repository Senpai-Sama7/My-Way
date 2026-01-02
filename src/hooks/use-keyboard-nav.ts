import { useEffect, useCallback } from 'react'

export type KeyboardAction =
  | 'toggle-immersive-text'
  | 'toggle-slides'
  | 'toggle-audio'
  | 'toggle-mindmap'
  | 'next-section'
  | 'previous-section'
  | 'expand-all'
  | 'collapse-all'
  | 'next-question'
  | 'previous-question'
  | 'show-answer'
  | 'hide-answer'
  | 'take-quiz'
  | 'navigate-settings'
  | 'toggle-explanation'
  | 'submit-quiz'
  | 'reset-progress'
  | 'toggle-play-pause'
  | 'jump-to-section'
  | 'search-material'
  | 'navigate-home'
  | 'navigate-learn'
  | 'navigate-tools'
  | 'increase-difficulty'
  | 'decrease-difficulty'
  | 'save-preferences'
  | 'skip-question'
  | 'review-answers'
  | 'toggle-bookmark'
  | 'close-modal'
  | 'show-help'
  | 'tab'
  | 'back'

export interface KeyboardConfig {
  shortcuts: Record<KeyboardAction, string>
  enabled: boolean
  onAction: (action: KeyboardAction) => void
}

const defaultShortcuts: Record<KeyboardAction, string> = {
  'toggle-immersive-text': '1',
  'toggle-slides': '2',
  'toggle-audio': '3',
  'toggle-mindmap': '4',
  'next-section': 'ArrowDown',
  'previous-section': 'ArrowUp',
  'expand-all': 'e',
  'collapse-all': 'Shift+e',
  'next-question': 'n',
  'previous-question': 'p',
  'show-answer': 'Enter',
  'hide-answer': 'Escape',
  'take-quiz': 'q',
  'toggle-explanation': 'e',
  'submit-quiz': 'Enter',
  'reset-progress': 'Alt+Shift+r',
  'search-material': '/',
  // primary route navigation using Alt+ modifiers
  'navigate-home': 'Alt+h',
  'navigate-learn': 'Alt+l',
  'navigate-tools': 'Alt+t',
  'navigate-settings': 'Alt+Shift+s',
  // playback and difficulty controls
  'toggle-play-pause': 'Space',
  'increase-difficulty': 'ArrowRight',
  'decrease-difficulty': 'ArrowLeft',
  // section and question management
  'jump-to-section': 'Alt+1-9',
  'save-preferences': 'Alt+Shift+p',
  'skip-question': 'x',
  'review-answers': 'r',
  'toggle-bookmark': 'b',
  'close-modal': 'Escape',
  'show-help': '?',
  'tab': 'Tab',
  'back': 'Backspace',
}

export function useKeyboardNav(config?: Partial<KeyboardConfig>) {
  const { shortcuts = defaultShortcuts, enabled = true, onAction = () => {} } = config || {}

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Ignore if user is typing in an input
    const target = event.target as HTMLElement
    const isInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable

    if (isInput) return

    // Check for key combinations
    const pressedKeys: string[] = []
    if (event.altKey) pressedKeys.push('Alt')
    if (event.shiftKey) pressedKeys.push('Shift')
    if (event.ctrlKey) pressedKeys.push('Ctrl')
    if (event.metaKey) pressedKeys.push('Meta')
    if (event.key === ' ') pressedKeys.push('Space')

    pressedKeys.push(event.key)
    const keyCombo = pressedKeys.join('+')

    // Check for shortcuts
    for (const [action, shortcut] of Object.entries(shortcuts)) {
      if (keyCombo === shortcut) {
        event.preventDefault()
        onAction(action as KeyboardAction)
        return
      }
    }

    // Handle special keys separately
    if (event.key === 'Escape') {
      onAction('close-modal')
    }
  }, [shortcuts, enabled, onAction])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    handleKeyDown,
    shortcuts,
    enabled,
  }
}

import { test } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'

test('full app walkthrough with real services', async ({ page, context }) => {
  test.setTimeout(60 * 60 * 1000)
  page.setDefaultTimeout(30 * 1000)

  const shotsDir = path.join(process.cwd(), 'screenshots')
  await fs.mkdir(shotsDir, { recursive: true })

  let shotIndex = 0
  const snap = async (name: string) => {
    shotIndex += 1
    const fileName = `${String(shotIndex).padStart(4, '0')}-${name}.png`
    const filePath = path.join(shotsDir, fileName)
    await page.screenshot({ path: filePath, fullPage: true })
  }

  const goHome = async () => {
    await page.goto('/')
    await page.getByRole('heading', { name: 'Learn Your Way' }).waitFor()
  }

  const fallbackTextPath = path.join(process.cwd(), 'upload/2509.13348v4-excerpt.txt')
  const seedFallbackSession = async () => {
    const fallbackText = await fs.readFile(fallbackTextPath, 'utf-8')
    await page.evaluate((text) => {
      const session = {
        materialTitle: 'PDF Excerpt',
        category: 'Imported',
        sections: [{ title: 'Excerpt', content: text }],
      }
      localStorage.setItem('learnMyWay.session', JSON.stringify(session))
    }, fallbackText.slice(0, 2000))
  }

  const goToLearningWithFallback = async (snapName: string) => {
    await seedFallbackSession()
    await page.goto('/learning')
    await page.waitForFunction(() => {
      const text = document.body?.innerText ?? ''
      return text.includes('Session Settings') || text.includes('No learning session found')
    })
    const sessionHeader = page.getByRole('heading', { name: 'Session Settings' })
    if (!(await sessionHeader.isVisible().catch(() => false))) {
      await seedFallbackSession()
      await page.reload()
      await page.waitForFunction(() => {
        const text = document.body?.innerText ?? ''
        return text.includes('Session Settings')
      })
    }
    await snap(snapName)
  }

  // Home
  await goHome()
  await snap('home')

  const getStartedBtn = page.getByText('Get Started').first()
  await getStartedBtn.click()
  await page.waitForTimeout(500)
  if (!(await page.getByRole('heading', { name: 'Personalize Your Experience' }).isVisible())) {
    await getStartedBtn.click({ force: true })
    await page.waitForTimeout(500)
  }
  if (!(await page.getByRole('heading', { name: 'Personalize Your Experience' }).isVisible())) {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const target = buttons.find((btn) => btn.textContent?.includes('Get Started'))
      target?.click()
    })
  }
  await page.getByRole('heading', { name: 'Personalize Your Experience' }).waitFor()
  await snap('onboarding')

  // Grade buttons
  const gradeLabels = ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Undergraduate']
  for (const label of gradeLabels) {
    const btn = page.getByRole('button', { name: new RegExp(label) }).first()
    await btn.click()
    await snap(`grade-${label}`)
  }

  // Interest buttons
  const interestLabels = [
    'Sports',
    'Music',
    'Food & Cooking',
    'Gaming',
    'Art & Design',
    'Science',
    'Technology',
    'Nature',
  ]
  for (const label of interestLabels) {
    const btn = page.getByRole('button', { name: new RegExp(label) }).first()
    await btn.click()
    await snap(`interest-${label.replace(/\s+/g, '-')}`)
  }

  const continueBtn = page.getByRole('button', { name: 'Continue' })
  await continueBtn.waitFor()
  if (!(await continueBtn.isEnabled())) {
    await page.getByRole('button', { name: /Undergraduate/ }).first().click()
    await page.getByRole('button', { name: /Nature/ }).first().click()
  }
  await continueBtn.click()
  await page.getByRole('heading', { name: 'Choose Your Learning Material' }).waitFor()
  await snap('material-selection')

  const materials = [
    "Newton's Third Law of Motion",
    'How To Organize Economies',
    'Early Human Evolution and Migration',
  ]
  for (const material of materials) {
    await page.getByText(material).click()
    await snap(`material-${material.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}`)
  }

  await page.getByRole('button', { name: 'Start Learning' }).click()
  await page.waitForTimeout(1000)
  if (!page.url().includes('/learning')) {
    await page.goto('/learning')
  }
  const noSession = page.getByText('No learning session found')
  const sessionHeading = page.getByRole('heading', { name: 'Session Settings' })
  await Promise.race([
    noSession.waitFor(),
    sessionHeading.waitFor(),
  ])
  if (await noSession.isVisible().catch(() => false)) {
    await snap('learning-empty-session')
  } else {
    await snap('learning-session-loaded-early')
  }
  await page.getByRole('button', { name: 'Go to Tools' }).click()
  await page.waitForTimeout(1000)
  if (!page.url().includes('/tools')) {
    await page.goto('/tools')
  }
  await page.getByRole('heading', { name: 'AI Learning Tools' }).waitFor()
  await snap('tools-entry')
  await page.goBack()
  await page.getByText('No learning session found').waitFor()
  await page.getByRole('button', { name: 'Home' }).click()
  await page.getByRole('heading', { name: 'Learn Your Way' }).waitFor()
  await snap('home-after-empty-session')
  await page.getByRole('button', { name: 'Explore AI Tools' }).click()
  await page.waitForTimeout(1000)
  if (!page.url().includes('/tools')) {
    await page.goto('/tools')
  }
  await page.getByRole('heading', { name: 'AI Learning Tools' }).waitFor()
  await snap('tools-entry-from-home')

  // Tools home
  await snap('tools-home')

  const toolButtonChecks = [
    { title: 'PDF Reading Companion', heading: 'PDF Reading Companion', snap: 'tools-open-pdf-companion-button' },
    {
      title: 'Academic Paper to Audio',
      heading: 'Academic Paper to Audio Discussion',
      snap: 'tools-open-audio-discussion-button',
    },
    { title: 'Teachable Machine', heading: 'Teachable Machine', snap: 'tools-open-teachable-machine-button' },
    { title: 'Learning Experiments', heading: 'Learning Experiments', snap: 'tools-open-experiments-button' },
  ]

  for (let i = 0; i < toolButtonChecks.length; i += 1) {
    const openButtons = page.getByRole('button', { name: 'Open Tool' })
    await openButtons.nth(i).scrollIntoViewIfNeeded()
    await openButtons.nth(i).click()
    await page.getByRole('heading', { name: toolButtonChecks[i].heading }).waitFor()
    await snap(toolButtonChecks[i].snap)
    await page.getByRole('button', { name: 'Back to Tools' }).click()
    await page.getByRole('heading', { name: 'AI Learning Tools' }).waitFor()
  }

  // PDF Reading Companion
  await page.getByText('PDF Reading Companion').click()
  await page.getByRole('heading', { name: 'PDF Reading Companion' }).waitFor()
  await snap('pdf-companion-initial')

  await page.getByRole('tab', { name: 'Enter URL' }).click()
  const pdfUrl = 'https://arxiv.org/pdf/2509.13348.pdf'
  await page.getByLabel('PDF URL').fill(pdfUrl)
  await snap('pdf-companion-url-ready')
  await page.getByRole('button', { name: 'Analyze PDF' }).click()
  const analysisComplete = page.getByText('Analysis Complete', { exact: false })
  let urlAnalysisOk = true
  try {
    await analysisComplete.waitFor({ timeout: 4 * 60 * 1000 })
  } catch (error) {
    urlAnalysisOk = false
  }

  if (urlAnalysisOk) {
    await snap('pdf-companion-url-analysis-complete')
    await page.getByRole('button', { name: 'Analyze Another PDF' }).click()
    await page.getByRole('tab', { name: 'Upload File' }).waitFor()
    await snap('pdf-companion-reset')
  } else {
    await snap('pdf-companion-url-analysis-timeout')
    await page.goto('/tools')
    await page.getByText('PDF Reading Companion').click()
    await page.getByRole('heading', { name: 'PDF Reading Companion' }).waitFor()
    await page.getByRole('tab', { name: 'Upload File' }).click()
    await snap('pdf-companion-reset')
  }

  await page.getByRole('tab', { name: 'Upload File' }).click()
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles('upload/2509.13348v4-excerpt.pdf')
  await snap('pdf-companion-upload-selected')
  await page.getByRole('button', { name: 'Analyze PDF' }).click()
  const analysisCompleteUpload = page.getByText('Analysis Complete', { exact: false })
  let uploadAnalysisOk = true
  try {
    await analysisCompleteUpload.waitFor({ timeout: 4 * 60 * 1000 })
  } catch (error) {
    uploadAnalysisOk = false
  }

  if (uploadAnalysisOk) {
    await snap('pdf-companion-upload-analysis-complete')

    await page.getByRole('tab', { name: 'Overview' }).click()
    await snap('pdf-companion-overview')

    await page.getByRole('tab', { name: 'Key Concepts' }).click()
    await snap('pdf-companion-concepts')

    await page.getByRole('tab', { name: 'Questions' }).click()
    await snap('pdf-companion-questions')
    const showAnswer = page.getByText('Show Answer').first()
    if (await showAnswer.count()) {
      await showAnswer.click()
      await snap('pdf-companion-question-answer')
    }

    const startLearningBtn = page.getByRole('button', { name: 'Start Learning' })
    let startLearningOk = true
    try {
      await startLearningBtn.waitFor({ timeout: 30 * 1000 })
    } catch (error) {
      startLearningOk = false
    }

    if (startLearningOk) {
      await startLearningBtn.click()
      await page.getByRole('heading', { name: 'Session Settings' }).waitFor()
      await snap('learning-session-loaded')
    } else {
      await goToLearningWithFallback('learning-session-loaded-fallback')
    }
  } else {
    await snap('pdf-companion-upload-analysis-timeout')
    await goToLearningWithFallback('learning-session-loaded-fallback')
  }

  // Learning settings
  const gradeInput = page.getByLabel('Grade level')
  await gradeInput.fill('9')
  await snap('learning-grade-updated')
  const interestInput = page.getByLabel('Interest (optional)')
  await interestInput.fill('robotics')
  await snap('learning-interest-updated')

  // Immersive Text
  await page.getByRole('tab', { name: 'Immersive Text' }).click()
  await snap('learning-immersive-text')
  const sectionHeaders = page.locator('h3, h4, h5').filter({ hasText: /./ })
  if (await sectionHeaders.count()) {
    await sectionHeaders.first().click()
    await snap('learning-immersive-toggle')
  }

  // Slides
  await page.getByRole('tab', { name: 'Slides' }).click()
  const noSlides = page.getByText('No slides generated yet.')
  await noSlides.waitFor()
  await snap('learning-slides-empty')
  await page.getByRole('button', { name: 'Generate Slides' }).click()
  await noSlides.waitFor({ state: 'detached', timeout: 10 * 60 * 1000 })
  await snap('learning-slides-generated')

  // Audio Lesson
  await page.getByRole('tab', { name: 'Audio Lesson' }).click()
  await snap('learning-audio-empty')
  await page.getByRole('button', { name: /Generate & Play/i }).click()
  const playingButton = page.getByRole('button', { name: /Playing…|Playing/ })
  let audioPlaying = true
  try {
    await playingButton.waitFor({ timeout: 4 * 60 * 1000 })
  } catch (error) {
    audioPlaying = false
  }

  if (audioPlaying) {
    await snap('learning-audio-playing')
    await page.getByRole('button', { name: 'Pause' }).click()
    await snap('learning-audio-paused')
  } else {
    const audioError = page.getByText(/Failed to generate/i)
    if (await audioError.isVisible().catch(() => false)) {
      await snap('learning-audio-error')
    } else {
      await snap('learning-audio-timeout')
    }
  }

  // Mind Map
  await page.getByRole('tab', { name: 'Mind Map' }).click()
  const noMindmap = page.getByText('No mind map generated yet.')
  await noMindmap.waitFor()
  await snap('learning-mindmap-empty')
  await page.getByRole('button', { name: 'Generate Mind Map' }).click()
  await noMindmap.waitFor({ state: 'detached', timeout: 10 * 60 * 1000 })
  await snap('learning-mindmap-generated')

  // Quiz
  await page.getByRole('button', { name: 'Take Quiz' }).click()
  const quizHeading = page.getByRole('heading', { name: 'Section Quiz' })
  let quizOpened = true
  try {
    await quizHeading.waitFor({ timeout: 4 * 60 * 1000 })
  } catch (error) {
    quizOpened = false
  }

  if (!quizOpened) {
    const quizError = page.getByText(/Failed to open quiz|Failed to generate quiz|unexpected response/i)
    if (await quizError.isVisible().catch(() => false)) {
      await snap('quiz-error')
    } else {
      await snap('quiz-timeout')
    }
  } else {
    await snap('quiz-modal-open')

    const optionLocator = page.locator('[role="option"]')
    const nextButton = page.getByRole('button', { name: 'Next' })
    const submitButton = page.getByRole('button', { name: 'Submit Quiz' })
    const showExplanationBtn = page.getByRole('button', { name: 'Show Explanation' })

    for (let i = 0; i < 10; i += 1) {
      if (!(await optionLocator.first().isVisible().catch(() => false))) break
      await optionLocator.first().click()
      if (await showExplanationBtn.isVisible().catch(() => false)) {
        await showExplanationBtn.click()
        await snap(`quiz-explanation-${i + 1}`)
      }
      if (await nextButton.isVisible().catch(() => false)) {
        await nextButton.click()
        await snap(`quiz-question-${i + 2}`)
      } else {
        break
      }
    }

    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click()
      await page.getByText('Quiz Results', { exact: false }).waitFor({ timeout: 10 * 60 * 1000 })
      await snap('quiz-results')
      if (await page.getByRole('button', { name: 'Retry Quiz' }).isVisible().catch(() => false)) {
        await page.getByRole('button', { name: 'Retry Quiz' }).click()
        await snap('quiz-retry')
      }
      await page.getByRole('button', { name: 'Close' }).first().click()
    } else {
      await snap('quiz-submit-missing')
      await page.getByRole('button', { name: 'Close' }).first().click()
    }
  }

  // Save progress record for settings view
  await page.request.post('/api/progress', {
    data: {
      action: 'save-progress',
      materialId: '2509.13348v4',
      currentView: 'immersive-text',
      currentSectionIndex: 2,
      completedSections: [0, 1],
      viewedSlides: true,
      viewedAudio: true,
      viewedMindmap: true,
      embeddedQuestionsSeen: [],
    },
  })

  // Settings
  await page.goto('/settings')
  await page.waitForLoadState('networkidle')
  const preferencesTab = page.getByRole('tab', { name: 'Preferences' })
  if (await preferencesTab.isVisible().catch(() => false)) {
    await preferencesTab.click()
  }
  await page.getByRole('heading', { name: 'Settings & Progress' }).waitFor()
  await snap('settings-preferences')

  const prefGradeSlider = page.locator('[aria-label^="Grade level"]').first()
  if (await prefGradeSlider.count()) {
    await prefGradeSlider.click()
    await snap('settings-grade-slider')
  }

  const interestLabel = page.getByLabel('Your Interest')
  try {
    await interestLabel.waitFor({ timeout: 30 * 1000 })
    await interestLabel.fill('engineering')
  } catch (error) {
    const interestInput = page.locator('#interest')
    await interestInput.waitFor({ timeout: 30 * 1000 })
    await interestInput.fill('engineering')
  }
  await snap('settings-interest-updated')

  const learningStyleButtons = page.getByRole('button', { name: /Learner/ })
  const styleCount = await learningStyleButtons.count()
  for (let i = 0; i < styleCount; i += 1) {
    await learningStyleButtons.nth(i).click()
    await snap(`settings-learning-style-${i + 1}`)
  }

  const dailyGoalSlider = page.locator('[aria-label^="Daily learning goal"]').first()
  if (await dailyGoalSlider.count()) {
    await dailyGoalSlider.click()
    await snap('settings-daily-goal')
  }

  await page.getByRole('button', { name: 'Save Preferences' }).click()
  await snap('settings-save-preferences')

  await page.getByRole('button', { name: 'Reset' }).click()
  await snap('settings-reset-preferences')

  await page.getByRole('tab', { name: 'Progress' }).click()
  await snap('settings-progress-tab')
  await page.getByRole('button', { name: 'Refresh progress' }).click()
  await snap('settings-progress-refresh')

  // Conversational learning page
  await goHome()
  await page.getByRole('button', { name: 'Learn Anything' }).click()
  await page.getByRole('heading', { name: 'Learn Anything' }).waitFor()
  await snap('learn-anything-entry')
  await snap('learn-anything-initial')

  await page.getByLabel('Your Interest (Optional)').fill('robotics')
  await snap('learn-anything-interest')

  const topicButtons = page.locator('button').filter({ hasText: 'Quantum Physics Basics' })
  if (await topicButtons.count()) {
    await topicButtons.first().click()
    await page.getByText('AI Tutor', { exact: false }).waitFor({ timeout: 10 * 60 * 1000 })
    await snap('learn-anything-topic-quantum')
  }

  const exampleButton = page.getByRole('button', { name: 'Examples' })
  if (await exampleButton.count()) {
    const canUseExamples =
      (await exampleButton.isVisible().catch(() => false)) &&
      (await exampleButton.isEnabled().catch(() => false))
    if (canUseExamples) {
      await exampleButton.click()
      await snap('learn-anything-examples')
    } else {
      await snap('learn-anything-examples-disabled')
    }
  }

  const practiceButton = page.getByRole('button', { name: 'Practice' })
  if (await practiceButton.count()) {
    const canUsePractice =
      (await practiceButton.isVisible().catch(() => false)) &&
      (await practiceButton.isEnabled().catch(() => false))
    if (canUsePractice) {
      await practiceButton.click()
      await snap('learn-anything-practice')
    } else {
      await snap('learn-anything-practice-disabled')
    }
  }

  const pauseButton = page.getByRole('button', { name: 'Pause' })
  if (await pauseButton.count()) {
    const canPause =
      (await pauseButton.isVisible().catch(() => false)) &&
      (await pauseButton.isEnabled().catch(() => false))
    if (canPause) {
      await pauseButton.click()
      await snap('learn-anything-paused')
      const resumeButton = page.getByRole('button', { name: 'Resume' })
      if ((await resumeButton.count()) && (await resumeButton.isEnabled().catch(() => false))) {
        await resumeButton.click()
        await snap('learn-anything-resumed')
      }
    } else {
      await snap('learn-anything-pause-disabled')
    }
  }

  const newSessionButton = page.getByRole('button', { name: 'New Session' })
  if (await newSessionButton.count()) {
    await newSessionButton.click()
    await snap('learn-anything-new-session')
  }

  // Audio discussion tool
  await page.goto('/tools')
  await page.waitForLoadState('networkidle')
  await page.getByText('Academic Paper to Audio').click()
  await page.getByRole('heading', { name: 'Academic Paper to Audio Discussion' }).waitFor()
  await snap('audio-discussion-initial')

  const paperText = await fs.readFile(path.join(process.cwd(), 'upload/2509.13348v4.txt'), 'utf-8')
  await page.getByLabel('Paper Title (Optional)').fill('Arxiv 2509.13348v4')
  await page.getByLabel('Paper Content').fill(paperText.trim())
  await snap('audio-discussion-content-filled')
  await page.getByRole('button', { name: 'Generate Audio Discussion' }).click()
  const discussionReady = page.getByText('Discussion Ready', { exact: false })
  let discussionOk = true
  try {
    await discussionReady.waitFor({ timeout: 10 * 60 * 1000 })
  } catch (error) {
    discussionOk = false
  }

  if (discussionOk) {
    await snap('audio-discussion-ready')
    const playButton = page.getByRole('button', { name: 'Play Audio' })
    if ((await playButton.count()) && (await playButton.isEnabled().catch(() => false))) {
      await playButton.click()
      await snap('audio-discussion-playing')
      const pauseButton = page.getByRole('button', { name: 'Pause' })
      if ((await pauseButton.count()) && (await pauseButton.isEnabled().catch(() => false))) {
        await pauseButton.click()
        await snap('audio-discussion-paused')
      }
    } else {
      await snap('audio-discussion-play-disabled')
    }
    const newDiscussionButton = page.getByRole('button', { name: 'New Discussion' })
    if (await newDiscussionButton.count()) {
      await newDiscussionButton.click()
      await snap('audio-discussion-reset')
    }
  } else {
    const discussionError = page.getByText(/Failed|error/i)
    if (await discussionError.isVisible().catch(() => false)) {
      await snap('audio-discussion-error')
    } else {
      await snap('audio-discussion-timeout')
    }
  }

  // Teachable Machine tool
  await page.goto('/tools')
  await page.waitForLoadState('networkidle')
  await page.getByText('Teachable Machine').click()
  await page.getByRole('heading', { name: 'Teachable Machine' }).waitFor()
  await snap('teachable-machine-page')

  const launchPromise = context.waitForEvent('page')
  await page.getByRole('link', { name: /Launch Teachable Machine/i }).click()
  const launchPage = await launchPromise
  await launchPage.waitForLoadState('domcontentloaded')
  await launchPage.screenshot({ path: path.join(shotsDir, `${String(++shotIndex).padStart(4, '0')}-teachable-machine-launch.png`), fullPage: true })
  await launchPage.close()

  const docsPromise = context.waitForEvent('page')
  await page.getByRole('link', { name: /View Documentation/i }).click()
  const docsPage = await docsPromise
  await docsPage.waitForLoadState('domcontentloaded')
  await docsPage.screenshot({ path: path.join(shotsDir, `${String(++shotIndex).padStart(4, '0')}-teachable-machine-docs.png`), fullPage: true })
  await docsPage.close()

  // Learning Experiments tool
  await page.goto('/tools')
  await page.waitForLoadState('networkidle')
  await page.getByText('Learning Experiments').click()
  await page.getByRole('heading', { name: 'Learning Experiments' }).waitFor()
  await snap('experiments-page')

  await page.getByPlaceholder('Search experiments...').fill('Water')
  await snap('experiments-search')
  await page.getByRole('button', { name: 'Science' }).click()
  await snap('experiments-filter-science')
  await page.getByRole('button', { name: 'Math' }).click()
  await snap('experiments-filter-math')
  await page.getByRole('button', { name: 'Art' }).click()
  await snap('experiments-filter-art')
  await page.getByRole('button', { name: 'Language' }).click()
  await snap('experiments-filter-language')
  await page.getByRole('button', { name: 'Social' }).click()
  await snap('experiments-filter-social')
  await page.getByRole('button', { name: 'All' }).click()
  await snap('experiments-filter-all')

  const firstExperiment = page.locator('h3, h4, h5').filter({ hasText: 'Water Density Tower' }).first()
  if (await firstExperiment.count()) {
    await firstExperiment.click()
    await snap('experiments-modal-open')
    await page.getByRole('button', { name: '✕' }).click()
    await snap('experiments-modal-closed')
  }
})

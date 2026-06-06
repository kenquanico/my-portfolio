import { lazy, Suspense, useCallback, useState } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'

const Projects = lazy(() => import('./components/Projects.tsx'))
const AboutMe = lazy(() => import('./components/AboutMe.tsx'))

const screenFallback = (
  <div style={{ minHeight: '100vh', background: '#000' }} />
)

function App() {
  const [view, setView] = useState<'home' | 'projects' | 'aboutme'>('home')
  const navigateHome = useCallback(() => setView('home'), [])
  const navigateProjects = useCallback(() => setView('projects'), [])
  const navigateAbout = useCallback(() => setView('aboutme'), [])

  if (view === 'projects') {
    return (
      <Suspense fallback={screenFallback}>
        <Projects onNavigateHome={navigateHome} onNavigateToAbout={navigateAbout} />
      </Suspense>
    )
  }

  if (view === 'aboutme') {
    return (
      <Suspense fallback={screenFallback}>
        <AboutMe onNavigateHome={navigateHome} onNavigateToProjects={navigateProjects} />
      </Suspense>
    )
  }

  return (
      <LandingPage
          onNavigateToAbout={navigateAbout}
          onNavigateToProjects={navigateProjects}
      />
  )
}

export default App

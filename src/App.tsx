import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'

const Projects = lazy(() => import('./components/Projects.tsx'))
const AboutMe = lazy(() => import('./components/AboutMe.tsx'))

const screenFallback = (
  <div style={{ minHeight: '100vh', background: '#000' }} />
)

function App() {
  const [view, setView] = useState<'home' | 'projects' | 'aboutme'>('home')
  const [pendingContact, setPendingContact] = useState(false)
  const navigateHome = useCallback(() => {
    setPendingContact(false)
    setView('home')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])
  const navigateProjects = useCallback(() => {
    setPendingContact(false)
    setView('projects')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])
  const navigateAbout = useCallback(() => {
    setPendingContact(false)
    setView('aboutme')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])
  const navigateContact = useCallback(() => {
    setPendingContact(true)
    setView('home')
  }, [])

  useEffect(() => {
    if (view !== 'home' || !pendingContact) return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setPendingContact(false)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pendingContact, view])

  if (view === 'projects') {
    return (
      <Suspense fallback={screenFallback}>
        <Projects onNavigateHome={navigateHome} onNavigateToAbout={navigateAbout} onNavigateToContact={navigateContact} />
      </Suspense>
    )
  }

  if (view === 'aboutme') {
    return (
      <Suspense fallback={screenFallback}>
        <AboutMe onNavigateHome={navigateHome} onNavigateToProjects={navigateProjects} onNavigateToContact={navigateContact} />
      </Suspense>
    )
  }

  return (
      <LandingPage
          onNavigateToAbout={navigateAbout}
          onNavigateToProjects={navigateProjects}
          onNavigateToContact={navigateContact}
      />
  )
}

export default App

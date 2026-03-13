import { useState } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'
import Projects from './components/Projects.tsx'
import AboutMe from './components/AboutMe.tsx'

function App() {
  const [view, setView] = useState<'home' | 'projects' | 'aboutme'>('home')

  if (view === 'projects') return <Projects onNavigateHome={() => setView('home')} onNavigateToAbout={() => setView('aboutme')} />
  if (view === 'aboutme')  return <AboutMe  onNavigateHome={() => setView('home')} onNavigateToProjects={() => setView('projects')} />
  return (
      <LandingPage
          onNavigateToAbout={() => setView('aboutme')}
          onNavigateToProjects={() => setView('projects')}
      />
  )
}

export default App
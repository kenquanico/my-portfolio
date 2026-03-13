import { useState } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'
import AboutPage from './components/About'

function App() {
  const [view, setView] = useState<'home' | 'about'>('home')

  return view === 'about'
    ? <AboutPage onNavigateHome={() => setView('home')} />
    : <LandingPage onNavigateToAbout={() => setView('about')} />
}

export default App

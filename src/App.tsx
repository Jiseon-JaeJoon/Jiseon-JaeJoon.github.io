/*
가장 중요하게 다루게 될 파일!
청첩장의 실제 화면을 구성하는 곳
*/
import { useState } from 'react'
import './App.css'
import Navigation from './components/Navigation'
import KakaoGuide from './components/KakaoGuide'
import VideoIntro from './components/VideoIntro'
import Cover from './components/Cover'
import FlowerPetals from './components/FlowerPetals'
import Greeting from './components/Greeting'
import CalendarCountdown from './components/CalendarCountdown'
import Gallery from './components/Gallery'
import Location from './components/Location'
import Transportation from './components/Transportation'
import AccountInfo from './components/AccountInfo'
import Rsvp from './components/Rsvp'
import Guestbook from './components/Guestbook'

const isKakaoTalk = /KAKAOTALK/i.test(navigator.userAgent)

function App() {
  const [introPlayed, setIntroPlayed] = useState(false)

  if (isKakaoTalk) {
    return <KakaoGuide />
  }

  if (!introPlayed) {
    return <VideoIntro onEnd={() => setIntroPlayed(true)} />
  }

  return (
    <div className="app-container">
      <Navigation />
      <FlowerPetals />
      <div className="sections-grid">
        <Cover />
        <Greeting />
        <CalendarCountdown />
        <Gallery />
        <Location />
        <Transportation />
        <Rsvp />
        <AccountInfo />
        <Guestbook />
      </div>

      <div className="footer-section">
        <p>Made with love · 손재준 ❤️ 장지선 · 2026.09.19</p>
      </div>
    </div>
  )
}

export default App

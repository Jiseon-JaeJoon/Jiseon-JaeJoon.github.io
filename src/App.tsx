/*
가장 중요하게 다루게 될 파일!
청첩장의 실제 화면을 구성하는 곳 
*/
import { useState } from 'react'
import './App.css'
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
      <FlowerPetals />
      <div className="sections-grid">
        {/* 1. 대문 컨포넌트 */}
        <Cover />

        {/* 2. 인사말 및 혼주 소개 */}
        <Greeting />

        {/* 3. 날짜 및 카운트다운 */}
        <CalendarCountdown />

        {/* 4. 웨딩 갤러리 */}
        <Gallery />

        {/* 5. 오시는 길 (지도) */}
        <Location />

        {/* 6. 대중교통 안내 */}
        <Transportation />

        {/* 7. 참석 의사 전달 */}
        <Rsvp />

        {/* 8. 마음전하기 */}
        <AccountInfo />

        {/* 9. 방명록 */}
        <Guestbook />
      </div>

      <div className="footer-section">
        <p>Made by JaeJoon ❤️ Jiseon</p>
      </div>
    </div>
  )
}

export default App

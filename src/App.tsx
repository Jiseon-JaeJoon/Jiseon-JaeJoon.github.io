/*
가장 중요하게 다루게 될 파일!
청첩장의 실제 화면을 구성하는 곳 
*/
import { useEffect } from 'react'
import './App.css'
import Cover from './components/Cover'
import FlowerPetals from './components/FlowerPetals'
import Greeting from './components/Greeting'
import CalendarCountdown from './components/CalendarCountdown'
import Gallery from './components/Gallery'
import Location from './components/Location'
import Transportation from './components/Transportation'
import AccountInfo from './components/AccountInfo'

function App() {
  useEffect(() => {
    const items = document.querySelectorAll('.sections-grid > *, .footer-section');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06 }
    );

    items.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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

        {/* 7. 마음전하기 */}
        <AccountInfo />
      </div>

      <div className="footer-section">
        <p>Made by JaeJoon ❤️ Jiseon</p>
      </div>
    </div>
  )
}

export default App

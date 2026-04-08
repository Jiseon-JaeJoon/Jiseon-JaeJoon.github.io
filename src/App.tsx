/*
가장 중요하게 다루게 될 파일!
청첩장의 실제 화면을 구성하는 곳 
*/
import './App.css'
import Cover from './components/Cover'
import Greeting from './components/Greeting'
import Gallery from './components/Gallery'
import Location from './components/Location'

function App() {
  return (
    <div className="app-container">
      {/* 1. 대문 컨포넌트 */}
      <Cover />

      {/* 2. 인사말 및 혼주 소개 */}
      <Greeting />

      {/* 3. 웨딩 갤러리 */}
      <Gallery />

      {/* 4. 오시는 길 (지도) */}
      <Location />

      {/* Footer (간단한 마무리 영역) */}
      <section style={{ backgroundColor: '#fafafa', padding: '40px 20px', color: '#999', fontSize: '0.8rem' }}>
        <p>Made by JaeJoon ❤️ Jiseon</p>
      </section>
    </div>
  )
}

export default App

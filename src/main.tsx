/*
index.html의 빈 <div id="root"></div>를 찾아서, 
그 안에 아래에 설명할 App 컴포넌트(화면)를 실제로 그려주는(Rendering) 역할을 합니다.
보통 이 파일은 개발 초기에 설정해 두고 거의 건드리지 않습니다.
*/

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

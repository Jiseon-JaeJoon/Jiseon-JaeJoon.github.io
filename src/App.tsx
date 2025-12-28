
import mainImage from './assets/지선재준.jpg'
import './App.css'


function App() {
  return (
    <div className="wedding-container">
      {/*여기에 내용을 채워나갈 거에요 */}
      <h1>Jiseon & JaeJoon Wedding Invitation</h1>

      <img 
        src={mainImage} 
        alt="Main Image" 
        style={{width: '100%', maxWidth: '400px', borderRadius: '10px'}}
      />
      <p> Github push test</p>
      </div>
  )
}

export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import AssessmentPage from './pages/AssessmentPage'
import Methodology from './components/Methodology'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />

        <Routes>
          <Route path="/" element={<AssessmentPage />} />
          <Route path="/methodology" element={<Methodology />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
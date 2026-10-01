import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="app-header">
      <Link to="/" className="brand">
        <span className="brand-mark">C</span>
        <span className="brand-name">CreditRisk</span>
      </Link>

      <nav className="header-nav">
        <Link to="/">Assessment</Link>
        <Link to="/methodology">Methodology</Link>
      </nav>
    </header>
  )
}

export default Header
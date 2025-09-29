import React from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'

// Componentes ultra-simples para testar
const Home = () => (
  <div style={{ padding: '20px' }}>
    <h1>Home Page</h1>
    <Link to="/test">Go to Test Page</Link>
  </div>
)

const TestPage = () => {
  const location = useLocation()
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Page</h1>
      <p>Current path: {location.pathname}</p>
      <Link to="/">Go back to Home</Link>
    </div>
  )
}

const ContactTypesTest = () => (
  <div style={{ padding: '20px' }}>
    <h1>Contact Types Management</h1>
    <p>This is working!</p>
    <Link to="/">Go back to Home</Link>
  </div>
)

const NotFound = () => (
  <div style={{ padding: '20px' }}>
    <h1>404 - Page Not Found</h1>
    <Link to="/">Go to Home</Link>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
          <Link to="/" style={{ marginRight: '20px' }}>Home</Link>
          <Link to="/test" style={{ marginRight: '20px' }}>Test</Link>
          <Link to="/settings/contact-types">Contact Types</Link>
        </nav>
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/settings/contact-types" element={<ContactTypesTest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
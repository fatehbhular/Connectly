import NavigationBar from './components/NavigationBar';
import LoginPage from './pages/LoginPage';

import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState("Waiting for backend...")

  useEffect(() => {
    fetch("http://localhost:8080/api/test")
      .then(res => res.text())
      .then(data => setMessage(data))
      .catch(err => setMessage("Connection failed: " + err))
  }, [])

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>{message}</h1>
    </div>
  )
}

export default App
import { AuthProvider } from './context/AuthProvider'
import AuthForm from './pages/AuthForm'
import ChatPage from './pages/ChatPage'
import Home from './pages/Home'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {


  return (
   <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat/:id" element={<ChatPage />} />
      </Routes>
    </AuthProvider>
   </BrowserRouter>
  )
}

export default App

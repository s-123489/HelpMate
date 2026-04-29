import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home/Home.jsx'
import TaskDetail from './pages/Task/TaskDetail.jsx'
import TaskPublish from './pages/Task/TaskPublish.jsx'
import OrderMessage from './pages/Order/OrderMessage.jsx'
import UserCenter from './pages/User/UserCenter.jsx'
import Login from './pages/Auth/Login.jsx'
import Register from './pages/Auth/Register.jsx'
import AIChat from './pages/AIChat/AIChat.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/task/:id" element={<TaskDetail />} />
        <Route path="/task/publish" element={<TaskPublish />} />
        <Route path="/order/message" element={<OrderMessage />} />
        <Route path="/user/center" element={<UserCenter />} />
        <Route path="/ai/chat" element={<AIChat />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App

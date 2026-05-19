import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home/Home.jsx'
import TaskDetail from './pages/Task/TaskDetail.jsx'
import TaskPublish from './pages/Task/TaskPublish.jsx'
import OrderMessage from './pages/Order/OrderMessage.jsx'
import UserCenter from './pages/User/UserCenter.jsx'
import Login from './pages/Auth/Login.jsx'
import Register from './pages/Auth/Register.jsx'
import AIChat from './pages/AIChat/AIChat.jsx'
import { isAuthenticated } from './utils/auth.js'

const RequireAuth = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/task/:id" element={<RequireAuth><TaskDetail /></RequireAuth>} />
        <Route path="/task/publish" element={<RequireAuth><TaskPublish /></RequireAuth>} />
        <Route path="/order/message" element={<RequireAuth><OrderMessage /></RequireAuth>} />
        <Route path="/user/center" element={<RequireAuth><UserCenter /></RequireAuth>} />
        <Route path="/ai/chat" element={<RequireAuth><AIChat /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App

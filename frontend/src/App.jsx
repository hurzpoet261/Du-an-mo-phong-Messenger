import { Navigate, Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import OnboardingPage from './pages/OnboardingPage'
import LoginPage from './pages/LoginPage'
import NotificationPage from './pages/NotificationPage'
import CallPage from './pages/CallPage'
import ChatPage from './pages/ChatPage'

import { Toaster } from 'react-hot-toast'
import {useAuthUser} from './hooks/useAuthUser'
// import PageLoader from './components/PageLoader'
 
function App() {
  const {isLoading, authUser} = useAuthUser();

  if (isLoading) return <PageLoader />;

  return (
    <div className ="h-screen" data-theme="night"> 
      <Routes>
        <Route path="/" element={authUser ? <HomePage />: <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/onboarding" element={!authUser ? <OnboardingPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
        <Route path="/call" element={authUser ? <CallPage /> : <Navigate to="/login" />} />
        <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
      </Routes>    
      <Toaster />
    </div>
  )
}

export default App
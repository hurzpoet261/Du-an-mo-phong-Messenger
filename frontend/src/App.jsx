import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import OnboardingPage from './pages/OnboardingPage'
import LoginPage from './pages/LoginPage'
import NotificationPage from './pages/NotificationPage'
import CallPage from './pages/CallPage'
import ChatPage from './pages/ChatPage'

import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import {axiosInstance} from './lib/axios.js'

const App = () => {
  // tanstack query
  const {data, isLoading, error} = useQuery({
    queryKey: ['todos'],
    queryFn: async() => {

      const res = await axios.get("https://localhost:5001/api/auth/me");
      return res.data;
    }
  })
 
  console.log(data);

  return (
    <div className ="h-screen" data-theme="night"> 
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/call" element={<CallPage />} />
        <Route path="/chat" element={<ChatPage/>} />
      </Routes>    
      <Toaster />
    </div>
  )
}

export default App
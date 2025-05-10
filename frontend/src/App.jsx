import { Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"
import NotificationPage from "./pages/NotificationPage"
import CallPage from "./pages/CallPage"
import ChatPage from "./pages/ChatPage"
import OnboardingPage from "./pages/OnboardingPage"
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./lib/axios";

function App() {

  // tanstack query
  const { data, error, isLoading } = useQuery({
    queryKey: ["theme"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/me")
      return res.data;
    },
  });

  console.log({isLoading})
  console.log({data})
  console.log({error})
  
  return (
    <div className="h-screen" data-theme="cupcake">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/call" element={<CallPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Routes>

      <Toaster />

    </div>
  )
}

export default App

import { Navigate, Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"
import NotificationPage from "./pages/NotificationPage"
import CallPage from "./pages/CallPage"
import ChatPage from "./pages/ChatPage"
import OnboardingPage from "./pages/OnboardingPage"
import PageLoader from "./components/PageLoader";
import useAuthUser from "./hooks/useAuthUser";
import Layout from "./components/Layout";
import useThemeStore from "./store/useThemeStore";

function App() {

  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);  // check if user is authenticated
  const isOnboarding = authUser?.isOnBoarded;  // check if user has completed onboarding

  if (isLoading) return <PageLoader />;  // show page loader while loading auth data
  //// toast.error("Error: " + error.message);  // show error message if auth data loading fails

  return (
    <div className="h-screen" data-theme={theme}>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated && isOnboarding ? (
            <Layout showSideBar>
              <HomePage />
            </Layout>
          ) : (
            <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
          )}
        />
        <Route path="/signup" element={!isAuthenticated ? <SignupPage /> : <Navigate to={isOnboarding ? "/" : "/onboarding"} />} />
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarding ? "/" : "/onboarding"} />} />
        <Route path="/notifications" element={isAuthenticated ? <NotificationPage /> : <Navigate to="/login" />} />
        <Route path="/call" element={isAuthenticated ? <CallPage /> : <Navigate to="/login" />} />
        <Route path="/chat" element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/onboarding" element={isAuthenticated ? (!isOnboarding ? (<OnboardingPage />) : (<Navigate to="/" />)) : (<Navigate to="/login" />)} />
      </Routes>

      <Toaster />

    </div>
  )
}

export default App

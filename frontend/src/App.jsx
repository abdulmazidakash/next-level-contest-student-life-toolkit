
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import ClassSchedule from "./pages/ClassSchedule";
import Budget from "./pages/Budget";
import StudyPlanner from "./pages/StudyPlanner";
import ExamQA from "./pages/ExamQA";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";
import WeeklyProgress from "./pages/weekly-progress/WeeklyProgress"; //unique features
import ProfilePage from "./pages/profile/ProfilePage";
import AboutUsPage from "./pages/about-us/AboutUsPage";
import TermsAndConditions from "./pages/terms-and-conditions/TermsAndConditions";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div data-theme="toolkit" className="min-h-screen bg-base-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <ClassSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <ProtectedRoute>
                <Budget />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <StudyPlanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam"
            element={
              <ProtectedRoute>
                <ExamQA />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weekly-progress"
            element={
              <ProtectedRoute>
                <WeeklyProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about-us"
            element={
                <AboutUsPage />
            }
          />
          <Route
            path="/terms-and-conditions"
            element={
                <TermsAndConditions />
            }
          />

          <Route path="*" element={<NotFound/>} />
        </Routes>
      </div>
      <Footer/>
    </div>
  );
}


import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import PersonDetailPage from "./pages/PersonDetailPage";
import LoginPage from "./pages/LoginPage";
import AdminPersonsPage from "./pages/AdminPersonsPage";
import AdminDeletePersonPage from "./pages/AdminDeletePersonPage";
import AdminManagementPage from "./pages/AdminManagementPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/persons/:id" element={<PersonDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/admin/persons"
                element={
                  <ProtectedRoute>
                    <Navigate to="/admin/persons/new" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/persons/:id"
                element={
                  <ProtectedRoute>
                    <AdminPersonsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/persons/delete"
                element={
                  <ProtectedRoute>
                    <AdminDeletePersonPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/admins"
                element={
                  <ProtectedRoute>
                    <AdminManagementPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

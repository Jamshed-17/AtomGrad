import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import PersonDetailPage from "./pages/PersonDetailPage";
import LoginPage from "./pages/LoginPage";
import AdminPersonsPage from "./pages/AdminPersonsPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/persons/:id" element={<PersonDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin/persons/:id"
              element={
                <ProtectedRoute>
                  <AdminPersonsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

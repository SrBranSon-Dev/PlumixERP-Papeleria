import "./App.css";
import Navbar from "./components/navbar/navbar";
import Footer from "./components/footer/footer";
import LoginCard from "./components/login/LoginCard";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <div className="app">
      <Navbar />

      <Routes>
        <Route path="/" element={<LoginCard />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;

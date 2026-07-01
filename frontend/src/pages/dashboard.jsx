import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenido a PlumixERP</p>
    </div>
  );
}

export default Dashboard;

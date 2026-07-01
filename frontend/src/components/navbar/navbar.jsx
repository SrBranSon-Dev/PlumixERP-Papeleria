import "./navbar.css";
import logo from "../../images/Logo.png";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="Logo" className="logoImg" />
      </div>

      {isAuthenticated && (
        <button className="btnLogin" onClick={handleLogout}>
          Cerrar sesión
        </button>
      )}
    </nav>
  );
}

export default Navbar;

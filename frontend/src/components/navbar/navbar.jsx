import "./navbar.css";
import logo from "../../images/Logo.png";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="Logo" className="logoImg" />
      </div>
    </nav>
  );
}

export default Navbar;

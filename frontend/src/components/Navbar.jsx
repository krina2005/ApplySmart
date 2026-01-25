import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src="/logo.png" alt="Apply Smart" className="logo-img" />
        <span className="logo-text">Apply Smart</span>
      </div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/upload">Check your match</Link></li>
      </ul>

      <div className="login-box">
        <FaUserCircle
          className="login-icon"
          onClick={() => setOpen(!open)}
        />

        {open && (
          <div className="dropdown">
            <Link to="/login/user" onClick={() => setOpen(false)}>User Login</Link>
            <Link to="/login/admin" onClick={() => setOpen(false)}>Admin Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

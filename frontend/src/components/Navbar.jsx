import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo">AI Resume Checker</div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/upload">Upload</Link></li>
        <li><Link to="#">Score</Link></li>
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

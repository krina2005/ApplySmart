import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import "./Navbar.css";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check active session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserRole(session.user.user_metadata?.role || 'user');
      } else {
        setUserRole(null);
      }
    };

    checkSession();

    // 2. Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserRole(session.user.user_metadata?.role || 'user');
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Logic to hide logged-in state on login pages
  const isLoginPage = location.pathname.startsWith('/login/');
  const displayRole = isLoginPage ? null : userRole;

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src="/logo.png" alt="Apply Smart" className="logo-img" />
        <span className="logo-text">Apply Smart</span>
      </div>

      <ul className="nav-links">
        {displayRole === 'user' ? (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/upload">Check your match</Link></li>
            <li><Link to="/user-dashboard">Dashboard</Link></li>
          </>
        ) : displayRole === 'company' ? (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/company-dashboard">Company Dashboard</Link></li>
            <li><Link to="/post-job">Post Job</Link></li>
            <li><Link to="/applications">Applications</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/upload">Check your match</Link></li>
          </>
        )}
      </ul>

      <div className="login-box">
        {displayRole ? (
          <FaSignOutAlt
            className="login-icon"
            onClick={handleLogout}
            title="Logout"
          />
        ) : (
          <>
            <FaUserCircle
              className="login-icon"
              onClick={() => setOpen(!open)}
            />

            {open && (
              <div className="dropdown">
                <Link to="/login/user" onClick={() => setOpen(false)}>User Login</Link>
                <Link to="/login/admin" onClick={() => setOpen(false)}>Admin Login</Link>
                <Link to="/login/company" onClick={() => setOpen(false)}>Company Login</Link>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

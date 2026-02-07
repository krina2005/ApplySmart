import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import "./Navbar.css";

const Navbar = () => {
  const [open, setOpen] = useState(false);          // login dropdown
  const [menuOpen, setMenuOpen] = useState(false); // mobile menu
  const [userRole, setUserRole] = useState(null);
  const [hidden, setHidden] = useState(false);     // hide on scroll
  const lastScrollY = useRef(0);

  const location = useLocation();
  const navigate = useNavigate();

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserRole(session.user.user_metadata?.role || "user");
      } else {
        setUserRole(null);
      }
    };

    checkSession();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setUserRole(session.user.user_metadata?.role || "user");
        } else {
          setUserRole(null);
        }
      });

    return () => subscription.unsubscribe();
  }, []);

  /* ---------------- HIDE ON SCROLL ---------------- */
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    setMenuOpen(false);
  };

  const isLoginPage = location.pathname.startsWith("/login/");
  const displayRole = isLoginPage ? null : userRole;

  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar ${hidden ? "navbar-hidden" : ""}`}>
     {/* LEFT */}
      <div className="logo-container">
        {/* Hamburger (mobile only) */}
        <div className="hamburger left" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <img src="/logo.png" alt="Apply Smart" className="logo-img" />
        <span className="logo-text">Apply Smart</span>
      </div>


      {/* CENTER (desktop) */}
      <ul className="nav-links">
        {displayRole === "user" ? (
          <>
            <li><Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link></li>
            <li><Link to="/upload" className={location.pathname === "/upload" ? "active" : ""}>Check your match</Link></li>
            <li><Link to="/user-dashboard" className={location.pathname.startsWith("/user-dashboard") ? "active" : ""}>Dashboard</Link></li>
          </>
        ) : displayRole === "company" ? (
          <>
            <li><Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link></li>
            <li><Link to="/company-dashboard" className={location.pathname.startsWith("/company-dashboard") ? "active" : ""}>Company Dashboard</Link></li>
            <li><Link to="/post-job" className={location.pathname.startsWith("/post-job") ? "active" : ""}>Post Job</Link></li>
            <li><Link to="/applications" className={location.pathname.startsWith("/applications") ? "active" : ""}>Applications</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link></li>
            <li><Link to="/upload" className={location.pathname === "/upload" ? "active" : ""}>Check your match</Link></li>
          </>
        )}
      </ul>

      {/* RIGHT */}
      <div className="login-box">

        {/* Desktop login */}
        {!menuOpen && (
          displayRole ? (
            <FaSignOutAlt className="login-icon" onClick={handleLogout} />
          ) : (
            <>
              <FaUserCircle className="login-icon" onClick={() => setOpen(!open)} />
              {open && (
                <div className="dropdown">
                  <Link to="/login/user" onClick={() => setOpen(false)}>User Login</Link>
                  <Link to="/login/admin" onClick={() => setOpen(false)}>Admin Login</Link>
                  <Link to="/login/company" onClick={() => setOpen(false)}>Company Login</Link>
                </div>
              )}
            </>
          )
        )}
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="mobile-menu">
          <ul>
            {displayRole === "user" && (
              <>
                <li>
                  <Link
                    to="/"
                    className={location.pathname === "/" ? "active" : ""}
                    onClick={closeMobileMenu}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/upload"
                    className={location.pathname === "/upload" ? "active" : ""}
                    onClick={closeMobileMenu}
                  >
                    Check your match
                  </Link>
                </li>
                <li>
                  <Link
                    to="/user-dashboard"
                    className={location.pathname.startsWith("/user-dashboard") ? "active" : ""}
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                </li>
              </>
            )}

            {displayRole === "company" && (
              <>
                <li>
                  <Link
                    to="/"
                    className={location.pathname === "/" ? "active" : ""}
                    onClick={closeMobileMenu}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/company-dashboard"
                    className={location.pathname.startsWith("/company-dashboard") ? "active" : ""}
                    onClick={closeMobileMenu}
                  >
                    Company Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/post-job"
                    className={location.pathname.startsWith("/post-job") ? "active" : ""}
                    onClick={closeMobileMenu}
                  >
                    Post Job
                  </Link>
                </li>
                <li>
                  <Link
                    to="/applications"
                    className={location.pathname.startsWith("/applications") ? "active" : ""}
                    onClick={closeMobileMenu}
                  >
                    Applications
                  </Link>
                </li>
              </>
            )}

            {!displayRole && (
              <>
                <li>
                  <Link
                    to="/"
                    className={location.pathname === "/" ? "active" : ""}
                    onClick={closeMobileMenu}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/upload"
                    className={location.pathname === "/upload" ? "active" : ""}
                    onClick={closeMobileMenu}
                  >
                    Check your match
                  </Link>
                </li>
                <li>
                  <Link to="/login/user" onClick={closeMobileMenu}>
                    User Login
                  </Link>
                </li>
                <li>
                  <Link to="/login/company" onClick={closeMobileMenu}>
                    Company Login
                  </Link>
                </li>
              </>
            )}

            {displayRole && (
              <li className="logout" onClick={handleLogout}>
                Logout
              </li>
            )}
          </ul>
        </div>
      )}


    </nav>
  );
};

export default Navbar;

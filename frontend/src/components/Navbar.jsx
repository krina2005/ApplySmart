import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, UserCircle, Menu, X, Home, Sparkles, LayoutDashboard, PlusCircle, ClipboardList, LogIn } from "lucide-react";
import SmartIcon from "./SmartIcon";
import { supabase } from "../supabaseClient";
import "./Navbar.css";

import ThemeToggle from "./ThemeToggle";

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
          <SmartIcon icon={menuOpen ? X : Menu} variant="ghost" />
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
        <ThemeToggle />

        {/* Desktop login */}
        {!menuOpen && (
          displayRole ? (
            <SmartIcon icon={LogOut} variant="ghost" className="login-icon" onClick={handleLogout} />
          ) : (
            <>
              <SmartIcon icon={UserCircle} variant="ghost" className="login-icon" onClick={() => setOpen(!open)} />
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
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <SmartIcon icon={LayoutDashboard} size={18} /> Dashboard
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
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <SmartIcon icon={LayoutDashboard} size={18} /> Company Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/post-job"
                    className={location.pathname.startsWith("/post-job") ? "active" : ""}
                    onClick={closeMobileMenu}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <SmartIcon icon={PlusCircle} size={18} /> Post Job
                  </Link>
                </li>
                <li>
                  <Link
                    to="/applications"
                    className={location.pathname.startsWith("/applications") ? "active" : ""}
                    onClick={closeMobileMenu}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <SmartIcon icon={ClipboardList} size={18} /> Applications
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
              <li className="logout" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SmartIcon icon={LogOut} size={18} /> Logout
              </li>
            )}
          </ul>
        </div>
      )}


    </nav>
  );
};

export default Navbar;

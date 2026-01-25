import { useState } from 'react';
import './LoginShared.css';
import { supabase } from '../supabaseClient';

const AdminLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    // Basic email regex
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    // Password must be at least 6 characters
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!validateEmail(email)) {
      alert("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!validatePassword(password)) {
        alert("Password must be at least 6 characters long.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // Login Logic
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;

        // Role Check
        const role = data.user?.user_metadata?.role;
        if (role !== 'admin') {
          await supabase.auth.signOut();
          alert("Access Denied: You are not authorized as an Admin.");
          setLoading(false);
          return;
        }

        alert("Logged in successfully as Admin!");
        console.log("Logged in user:", data.user);

      } else {
        // Sign Up Logic
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              role: 'admin',
            },
          },
        });

        if (error) throw error;
        if (!data.session) {
          alert("Account created! Please verify your email before logging in.");
        } else {
          alert("Account created and logged in!");
        }
        console.log("Signed up user:", data.user);
      }
    } catch (error) {
      if (error.message.includes("User already registered")) {
        alert("This email is already registered. Please login or use a different email.");
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h2 className="login-title">{isLogin ? 'Admin Login' : 'Admin Sign Up'}</h2>
        <p className="login-subtitle">
          {isLogin ? 'Welcome back! Please login to continue.' : 'Create a new admin account.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              className="form-input"
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              className="form-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <input
                className="form-input"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && (
                <p className={`password-match-text ${password === confirmPassword ? 'match-success' : 'match-error'}`}>
                  {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>
          )}

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            className="toggle-link"
            onClick={() => {
              setIsLogin(!isLogin);
              setConfirmPassword('');
              setEmail('');
              setPassword('');
            }}
            type="button"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;

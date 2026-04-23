
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginShared.css';
import { supabase } from '../supabaseClient';
import { useDialog } from '../components/DialogProvider';

const UserLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useDialog();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateEmail(email)) {
      await showAlert('Please enter a valid email address.', { variant: 'warning', title: 'Invalid Email' });
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!validatePassword(password)) {
        await showAlert('Password must be at least 6 characters long.', { variant: 'warning', title: 'Weak Password' });
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        await showAlert('Passwords do not match.', { variant: 'warning', title: 'Password Mismatch' });
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;

        const role = data.user?.user_metadata?.role;
        if (role !== 'user') {
          await supabase.auth.signOut();
          await showAlert('Access Denied: You are not authorized as a User.', { variant: 'error', title: 'Access Denied' });
          setLoading(false);
          return;
        }

        await showAlert('Logged in successfully as User!', { variant: 'success', title: 'Welcome Back!' });
        console.log("Logged in user:", data.user);
        window.open('/user-dashboard', '_blank');

      } else {

        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              role: 'user',
            },
          },
        });

        if (error) throw error;

        if (!data.session) {
          await showAlert('Account created! Please verify your email before logging in.', { variant: 'info', title: 'Verify Email' });
        } else {
          await showAlert('Account created and logged in!', { variant: 'success', title: 'Welcome!' });
          window.open('/user-dashboard', '_blank');
        }

        console.log("Signed up user:", data.user);
      }

    } catch (error) {
      if (error.message.includes("User already registered")) {
        await showAlert('This email is already registered. Please login or use a different email.', { variant: 'warning', title: 'Already Registered' });
      } else {
        await showAlert(error.message, { variant: 'error', title: 'Error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      await showAlert('Please enter your email first.', { variant: 'warning', title: 'Email Required' });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password",
    });

    if (error) {
      await showAlert(error.message, { variant: 'error', title: 'Error' });
    } else {
      await showAlert('Password reset email sent! Check your inbox.', { variant: 'success', title: 'Email Sent' });
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h2 className="login-title">{isLogin ? 'User Login' : 'User Sign Up'}</h2>
        <p className="login-subtitle">
          {isLogin ? 'Welcome back! Please login to continue.' : 'Create a new user account.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              className="form-input"
              type="email"
              placeholder="User Email"
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

            {isLogin && (
              <p
                style={{ cursor: "pointer", color: "var(--accent)", fontSize: "14px", marginTop: "5px" }}
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </p>
            )}
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

export default UserLogin;


import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useDialog } from "../components/DialogProvider";
import "./ResetPassword.css";

const ResetPassword = () => {

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { showAlert } = useDialog();

  useEffect(() => {

    const checkRecoverySession = async () => {

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        await showAlert('This reset link is invalid or expired.', { variant: 'error', title: 'Invalid Link' });
        window.location.href = "/login/user";
      }

    };

    checkRecoverySession();

  }, []);


  const updatePassword = async (e) => {

    e.preventDefault();

    if (password.length < 6) {
      await showAlert('Password must be at least 6 characters.', { variant: 'warning', title: 'Too Short' });
      return;
    }

    if (password !== confirmPassword) {
      await showAlert('Passwords do not match.', { variant: 'warning', title: 'Mismatch' });
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      await showAlert(error.message, { variant: 'error', title: 'Update Failed' });
    } else {
      await showAlert('Password updated successfully!', { variant: 'success', title: 'Password Updated' });
      window.location.href = "/login/user";
    }
  };

  return (
    <div className="reset-container">

      <div className="reset-card">

        <h2 className="reset-title">Reset Password</h2>
        <p className="reset-subtitle">
          Enter your new password below
        </p>
        <form onSubmit={updatePassword}>

          <input
            className="reset-input"
            type="password"
            placeholder="New Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className="reset-input"
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {confirmPassword && (
            <p className={`password-check ${password === confirmPassword ? "match" : "nomatch"}`}>
              {password === confirmPassword
                ? "Passwords match"
                : "Passwords do not match"}
            </p>
          )}

          <button className="reset-btn" type="submit">
            Update Password
          </button>

        </form>
      </div>

    </div>
  );
};

export default ResetPassword;
import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./ResetPassword.css";

const ResetPassword = () => {

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updatePassword = async () => {

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully!");
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
            {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
          </p>
        )}

        <button className="reset-btn" onClick={updatePassword}>
          Update Password
        </button>

      </div>

    </div>
  );
};

export default ResetPassword;
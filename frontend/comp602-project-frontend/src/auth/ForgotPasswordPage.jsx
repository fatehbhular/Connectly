import { useState } from "react";
import BASE_URL from "../config.js";
import "./LoginPage.css";

// Icon
const PersonIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const LockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function ForgotPasswordPage({ onBack, onSuccess }) {
  const [forgotStep, setForgotStep] = useState("email");                    // Screen to show ("email" or "reset")
  const [forgotEmail, setForgotEmail] = useState("");                       // Email typed
  const [forgotCode, setForgotCode] = useState("");                         // Code typed
  const [newPassword, setNewPassword] = useState("");                       // New password typed
  const [forgotErr, setForgotErr] = useState(false);                        // Error in the form
  const [toast, setToast] = useState(null);                                 // Notification

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleForgotSubmit = async () => {                                                         // Return email 
    setForgotErr(false);
    if (!forgotEmail.trim()) { setForgotErr(true); return; }                                       // Check if email is empty

    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {                                // Send code request to server
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.toLowerCase().trim() })
      });

      if (!res.ok) { showToast("No account found with that email."); setForgotErr(true); return; } // Server responds with an error (notification)

      setForgotStep("reset");                                                                      // email found, move reset password interface
    } catch { showToast("Could not connect to server."); }
  };

  const handleResetSubmit = async () => {
    setForgotErr(false);                                                                           
    if (!forgotCode.trim()) { setForgotErr(true); showToast("Enter the code."); return; }         // Check if code is empty
    if (newPassword.length < 6) { 
        setForgotErr(true); showToast("Password must be at least 6 characters."); return; }       // Check if new password is less than 6 characters

    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {                                // Send reset password request to server
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.toLowerCase().trim(),
          code: forgotCode,
          password: newPassword      
        })
      });

      if (!res.ok) { setForgotErr(true); showToast("Invalid or expired code."); return; }          

      onSuccess();                                                                                 // tell LoginPage reset worked, show success toast and go back to login
    } catch { showToast("Could not connect to server."); }
  };

  // Reset password interface
  if (forgotStep === "reset") return (
    <div className="login-page">
      <div className="login-card">
        {toast && <div className="login-toast">{toast}</div>}

        <div className="login-form-content">
          <h1 className="login-heading">Reset Password</h1>
          <p className="login-subheading">Enter the code sent to <strong>{forgotEmail}</strong></p>
        </div>

        {/* Code */}
        <div className="login-field">
          <div className="login-input-wrap">
            <span className="login-input-icon"><LockIcon /></span>
            <input
              className={`login-input${forgotErr ? ' login-input--error' : ''}`}
              type="text"
              placeholder="Enter code"
              value={forgotCode}
              maxLength={6}
              onChange={e => { setForgotCode(e.target.value.toUpperCase()); setForgotErr(false); }}
              autoCapitalize="characters"
              onKeyDown={e => { if (e.key === "Enter") handleResetSubmit(); }}
            />
          </div>
        </div>

        {/* New Password */}
        <div className="login-field">
          <div className="login-input-wrap">
            <span className="login-input-icon"><LockIcon /></span>
            <input
              className={`login-input${forgotErr ? ' login-input--error' : ''}`}
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setForgotErr(false); }}
              onKeyDown={e => { if (e.key === "Enter") handleResetSubmit(); }}
            />
          </div>
        </div>

        <button className="login-btn" onClick={handleResetSubmit}>Reset Password</button>

        <p className="login-toggle">
          Wrong email?
          <button onClick={() => { setForgotStep("email"); setForgotCode(""); setForgotErr(false); }}>Go back</button>
        </p>
      </div>
    </div>
  );

  // Forgot password interface
  return (
    <div className="login-page">
      <div className="login-card">
        {toast && <div className="login-toast">{toast}</div>}

        <div className="login-form-content">
          <h1 className="login-heading">Forgot Password</h1>
          <p className="login-subheading">Enter your email and we'll send you a code.</p>
        </div>

        {/* Email */}
        <div className="login-field">
          <div className="login-input-wrap">
            <span className="login-input-icon"><PersonIcon /></span>
            <input
              className={`login-input${forgotErr ? ' login-input--error' : ''}`}
              type="email"
              placeholder="Email"
              value={forgotEmail}
              onChange={e => { setForgotEmail(e.target.value); setForgotErr(false); }}
              onKeyDown={e => { if (e.key === "Enter") handleForgotSubmit(); }}
            />
          </div>
        </div>

        <button className="login-btn" onClick={handleForgotSubmit}>Send Code</button>

        <p className="login-toggle">
          Remember your password?
          <button onClick={onBack}>Sign In</button>
        </p>
      </div>
    </div>
  );
}
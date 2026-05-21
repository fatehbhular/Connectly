import { useState } from "react";
import BASE_URL from "../config.js";
import "./LoginPage.css";

// Icon
const LockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function OtpPage({ email, pendingUser, isSignUp, rememberMe, onLogin, onBack }) {
  const [otpCode, setOtpCode] = useState("");                                             // Typed Code
  const [otpErr, setOtpErr] = useState(false);                                            // Code Error
  const [toast, setToast] = useState(null);                                               // Notfication

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleVerifyOtp = async () => {                                  
    setOtpErr(false);
    if (!otpCode.trim()) { setOtpErr(true); return; }                      

    try {
      const res = await fetch(`${BASE_URL}/auth/verify-otp`, {                             // Verify the OTP code entered by the user
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode, context: isSignUp ? "signup" : "login" }),
      });

      if (!res.ok) {                                                                      // Server responds with an error, show notfication
        setOtpErr(true);
        showToast("Invalid or expired code. Try again.");
        return;
      }

      if (rememberMe) localStorage.setItem("currentUser", JSON.stringify(pendingUser));   // OTP verified — finish logging in
      onLogin(pendingUser);

    } catch { showToast("Could not connect to server."); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {toast && <div className="login-toast">{toast}</div>}

        <div className="login-form-content">
          <h1 className="login-heading">Check your email</h1>
          <p className="login-subheading">Enter the 6 character code sent to <strong>{email}</strong></p>
        </div>

        {/* Code */}
        <div className="login-field">
          <div className="login-input-wrap">
            <span className="login-input-icon"><LockIcon /></span>
            <input
              className={`login-input${otpErr ? ' login-input--error' : ''}`}
              type="text"
              placeholder="Enter code"
              value={otpCode}
              maxLength={6}
              onChange={e => { setOtpCode(e.target.value.toUpperCase()); setOtpErr(false); }}
              onKeyDown={e => { if (e.key === "Enter") handleVerifyOtp(); }}
              autoCapitalize="characters"
            />
          </div>
        </div>

        <button className="login-btn" onClick={handleVerifyOtp}>Verify Code</button>

        <p className="login-toggle">
          Wrong account?
          <button onClick={onBack}>Go back</button>
        </p>
      </div>
    </div>
  );
}
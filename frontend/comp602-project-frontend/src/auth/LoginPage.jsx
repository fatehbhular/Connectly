import { useState } from "react";
import BASE_URL from "../config.js";
import "./LoginPage.css";
import OtpPage from "./OtpPage";
import ForgotPasswordPage from "./ForgotPasswordPage";

// Icons
const PersonIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

const LockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function LoginPage({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [toast, setToast] = useState(null);                                         // floating toast message
  const [usernameErr, setUsernameErr] = useState(false);
  const [passwordErr, setPasswordErr] = useState(false);
  const [step, setStep] = useState("login");                                        // "login" | "otp" | "forgot"
  const [pendingUser, setPendingUser] = useState(null);                             // holds user while waiting for OTP

  const showToast = (msg) => {                                                      // display toast notification for 3 sec
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    setUsernameErr(false);
    setPasswordErr(false);
    
    let hasErr = false;                                                             // check if any of the fields are empty
    if (!username.trim()) { setUsernameErr(true); hasErr = true; }
    if (!password.trim()) { setPasswordErr(true); hasErr = true; }

    if (isSignUp && password.length < 6) {                                         // On the sign up page, check if the password is less than 6 characters
      setPasswordErr(true);
      showToast("Password must be at least 6 characters.");
      return;
    }

    const endpoint = isSignUp ? "/auth/signup" : "/auth/login";                    // change the fetch depending on the current page
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.toLowerCase().trim(), password }),
      });

      if (!res.ok) {                                                               // Let the user know the server rejected the input
        showToast(isSignUp ? "Username already taken." : "Incorrect username or password.");
        return;
      }

      const user = await res.json();

      if (!isSignUp && user.otpEnabled) {
        setPendingUser(user);                                                      // hold the user until OTP is verified
        setStep("otp");                                                            // show OTP screen
        return;
      }

      if (rememberMe) localStorage.setItem("currentUser", JSON.stringify(user));   // Save the user to the local device
      onLogin(user);

    } catch { showToast("Could not connect to server."); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  if (step === "otp") return (                                                    // Show the OTP page, pass the pending user
    <OtpPage
      email={pendingUser?.email}
      pendingUser={pendingUser}
      rememberMe={rememberMe}
      onLogin={onLogin}
      onBack={() => setStep("login")}
    />
  );

  if (step === "forgot") return (                                                 // Show the forgot password page
    <ForgotPasswordPage
      onBack={() => setStep("login")}
      onSuccess={() => {                                                          
        showToast("Password reset! Please sign in.");
        setStep("login");
      }}
    />
  );

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Floating toast; used for validity labels */}
        {toast && <div className="login-toast">{toast}</div>}

        <div className="login-form-content" key={isSignUp ? "signup" : "signin"}>
          <h1 className="login-heading">{isSignUp ? "Create Account" : "Welcome Back"}</h1>
          <p className="login-subheading">{isSignUp ? "Join Connectly today." : "Enter your credentials to continue."}</p>
        </div>

        {/* Username */}
        <div className="login-field">
          <div className="login-input-wrap">
            <span className="login-input-icon"><PersonIcon /></span>
            <input
              className={`login-input${usernameErr ? ' login-input--error' : ''}`}
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => { setUsername(e.target.value); setUsernameErr(false); }}
              onKeyDown={handleKeyDown}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
        </div>

        {/* Password */}
        <div className="login-field">
          <div className="login-input-wrap">
            <span className="login-input-icon"><LockIcon /></span>
            <input
              className={`login-input${passwordErr ? ' login-input--error' : ''}`}
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); setPasswordErr(false); }}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Remember me row */}
        <div className="login-row" style={{ visibility: isSignUp ? 'hidden' : 'visible' }}>
          <label className="login-remember">
            <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
            Remember me
          </label>
          {/* switches to forgot password flow */}
          <button className="login-forgot" onClick={() => setStep("forgot")}>Forgot password?</button>
        </div>

        <button className="login-btn" onClick={handleSubmit}>
          {isSignUp ? "Create Account" : "Sign In"}
        </button>

        <div className="login-divider"><span>or</span></div>

        <p className="login-toggle">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button onClick={() => { setIsSignUp(s => !s); setToast(null); setUsernameErr(false); setPasswordErr(false); }}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>

      </div>
    </div>
  );
}
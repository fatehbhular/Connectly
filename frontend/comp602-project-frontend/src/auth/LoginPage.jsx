import BASE_URL from '../config.js';
import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);                                                      // true = show sign up form, false = show sign in form

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(null);                                                       // holds the error message to display

  const handleSubmit = async () => {
    setError(null);                                                                                     // clear any previous error before trying again

    if (!username || !password) {                                                                       // Validation before calling the server
      setError("Please enter username and password.");
      return;
    }
    if (username.includes(" ")) {
      setError("Username cannot contain spaces.");
      return;
    }

    try {                                                                                               // Pick what method to call based on signing in or signing up
      const url  = isSignUp ? `${BASE_URL}/auth/signup` : `${BASE_URL}/auth/login`;
      const body = { username: username.toLowerCase(), password };

      const res = await fetch(url, {                                                                    // Send the request to Spring Boot
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),                                                                     // convert JS object to JSON string
      });

      if (!res.ok) {
        // Server returned an error (401 wrong password, 409 username taken, etc.)
        setError(isSignUp ? "Username already taken." : "Invalid username or password.");
        return;
      }

      const user = await res.json();                                                                    // convert the servers JSON response into a JS object
      onLogin(user);                                                                                    // pass the logged in user up to App.jsx

    } catch (err) {
      setError("Could not connect to server.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Connectly</h1>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "8px", width: "250px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{ padding: "8px", width: "250px" }}
        />

        <button onClick={handleSubmit} style={{ padding: "10px 24px", cursor: "pointer" }}>
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>

        <p style={{ color: "gray", fontSize: "13px" }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            style={{ background: "none", border: "none", color: "blue", cursor: "pointer", marginLeft: "6px" }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>

        <p style={{ color: "red", fontSize: "13px", minHeight: "20px", margin: 0 }}>
          {error ?? ""}
        </p>
      </div>
    </div>
  );
}
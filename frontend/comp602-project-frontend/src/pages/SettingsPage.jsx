import { useState } from "react";
import PageWrapper from "../components/PageWrapper";

export default function SettingsPage() {
  const [theme, setTheme] = useState("Light");
  const [language, setLanguage] = useState("English");

  return (
    <PageWrapper>
      <h1>Settings</h1>

      {/* Theme settings */}
      <section>
        <h3>Theme</h3>
        <p>Change the visual appearance of the app.</p>

        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option>Light</option>
          <option>Dark</option>
        </select>
      </section>

      {/* Password settings */}
      <section>
      <h3>Password</h3>
      <p>Update account password settings.</p>

      <input type="password" placeholder="New password" />
      <br /><br />
      <button>Update Password</button>
      </section>

      {/* Security settings */}
      <section>
        <h3>Security</h3>
        <p>Manage account security preferences.</p>
      </section>

      {/* Language settings */}
      <section>
        <h3>Language</h3>
        <p>Choose preferred app language.</p>

        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
        </select>
      </section>
    </PageWrapper>
  );
}
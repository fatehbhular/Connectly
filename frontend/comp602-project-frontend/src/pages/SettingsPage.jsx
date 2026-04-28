import PageWrapper from "../components/PageWrapper";

export default function SettingsPage() {
  return (
    <PageWrapper>
      <h1>Settings</h1>

      {/* Theme settings section */}
      <section>
        <h3>Theme</h3>
        <p>Change the visual appearance of the app.</p>
      </section>

      {/* Password settings section */}
      <section>
        <h3>Password</h3>
        <p>Update account password settings.</p>
      </section>

      {/* Security settings section */}
      <section>
        <h3>Security</h3>
        <p>Manage account security preferences.</p>
      </section>

      {/* Language settings section */}
      <section>
        <h3>Language</h3>
        <p>Choose preferred app language.</p>
      </section>
    </PageWrapper>
  );
}
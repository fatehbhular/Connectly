import { useState } from "react";

import LoginPage from "./auth/LoginPage";
import OnboardingPage from "./auth/OnboardingPage";
import ProfilePage from "./profile/ProfilePage";
import SettingsPage from "./settings/SettingsPage";
import ConnectionsPage from "./connections/ConnectionsPage";
import MessagingPage from "./messaging/MessagingPage";
import AnalyticsPage from "./analytics/AnalyticsPage";
import NavigationBar from "./components/NavigationBar";
import UserHeatbeat from "./hooks/UserHearbeat";

function App() {
  // Save the current user if the user chooses "remember me"
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [page, setPage] = useState("profile");
  const [inDM, setInDM] = useState(false);

  // Runs for the whole session once logged in
  UserHeatbeat(currentUser?.userId);

  // If nobody is logged in, show the login page
  if (!currentUser) {
    return <LoginPage onLogin={(user) => setCurrentUser(user)} />;
  }

  // New user, run them through onboarding before the main app
  if (!currentUser.profileComplete) {
    return <OnboardingPage currentUser={currentUser} onComplete={setCurrentUser} />;
  }

  // Otherwise show the main app
  return (
    <div>
      {page === "profile" && (
        <ProfilePage currentUser={currentUser} onProfileUpdate={setCurrentUser} />
      )}

      {page === "connections" && (
        <ConnectionsPage currentUser={currentUser} />
      )}

      {page === "messages" && (
        <MessagingPage currentUser={currentUser} onDMOpen={setInDM} />
      )}

      {page === "settings" && (
        <SettingsPage
          onSignOut={() => {
            setCurrentUser(null);
            setPage("profile");
          }}
          user={currentUser}
          onUserUpdate={setCurrentUser}
        />
      )}

      {page === "analytics" && (
        <AnalyticsPage currentUser={currentUser} />
      )}

      {/* Only show the full nav if not in message view */}
      {!inDM ? (
        <NavigationBar
          setPage={setPage}
          currentPage={page}
          currentUser={currentUser}
        />
      ) : null}
    </div>
  );
}

export default App;
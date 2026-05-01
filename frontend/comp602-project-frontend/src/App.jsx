import { useState } from "react";

import LoginPage from "./auth/LoginPage";
import ProfilePage from "./profile/ProfilePage";
import SettingsPage from "./settings/SettingsPage";
import ConnectionsPage from "./connections/ConnectionsPage";
import MessagingPage from "./messaging/MessagingPage";

import NavigationBar from "./components/NavigationBar";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("profile");

  // If nobody is logged in, show the login page
  if (!currentUser) {
    return <LoginPage onLogin={(user) => setCurrentUser(user)} />;
  }

  // Otherwise show the main app
  return (
    <div>
      {page === "profile" && <ProfilePage currentUser={currentUser} onProfileUpdate={setCurrentUser} />}
      {page === "connections" && currentUser.profileComplete && <ConnectionsPage currentUser={currentUser} />}
      {page === "messages"    && currentUser.profileComplete && <MessagingPage currentUser={currentUser} />}
      {page === "settings"    && currentUser.profileComplete && <SettingsPage />}

      {/* only show the full nav if profile complete, else just show profile tab */}
      {currentUser.profileComplete
        ? <NavigationBar setPage={setPage} currentUser={currentUser} />
        : null
      }
    </div>
  );
}

export default App;
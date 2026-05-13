import { useState } from "react";

import LoginPage from "./auth/LoginPage";
import OnboardingPage from "./auth/OnboardingPage";
import ProfilePage from "./profile/ProfilePage";
import SettingsPage from "./settings/SettingsPage";
import ConnectionsPage from "./connections/ConnectionsPage";
import MessagingPage from "./messaging/MessagingPage";

import NavigationBar from "./components/NavigationBar";

function App() {
  
  // Save the current user if the user chooses "remmeber me"
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [page, setPage] = useState("profile");
  const [inDM, setInDM] = useState(false);

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
      {page === "profile" && <ProfilePage currentUser={currentUser} onProfileUpdate={setCurrentUser} />}
      {page === "connections" && <ConnectionsPage currentUser={currentUser} />}
      {page === "messages" && <MessagingPage currentUser={currentUser} onDMOpen={setInDM} />}
      {page === "settings" && <SettingsPage onSignOut={() => { setCurrentUser(null); setPage("profile"); }} user={currentUser} onUserUpdate={setCurrentUser}/>}


      {/* only show the full nav if not im msg */}  
      {!inDM
        ? <NavigationBar setPage={setPage} currentPage={page} currentUser={currentUser} />
        : null
      }
    </div>
  );
}

export default App;
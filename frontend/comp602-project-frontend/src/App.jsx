import { useState } from "react";

import LoginPage     from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import MessagingPage from "./pages/MessagingPage";

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
      {page === "profile" && <ProfilePage />}
      {page === "connections" && <ConnectionsPage currentUser={currentUser} />}
      {page === "messages" && <MessagingPage />}
      {page === "settings" && <SettingsPage />}
      <NavigationBar setPage={setPage} currentUser={currentUser} />
    </div>
  );
}

export default App;
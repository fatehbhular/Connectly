import { useState } from "react";

import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import MessagingPage from "./pages/MessagingPage";

import NavigationBar from "./components/NavigationBar";

function App() {
  const [page, setPage] = useState("profile");

  return (
    <div>
      {page === "profile" && <ProfilePage />}
      {page === "connections" && <ConnectionsPage />}
      {page === "messages" && <MessagingPage />}
      {page === "settings" && <SettingsPage />}

      <NavigationBar setPage={setPage} />
    </div>
  );
}

export default App;
import { useState } from "react";

export default function ProfilePage() {

  // State for user input fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");

  // Stores the saved profile after clicking save
  const [savedProfile, setSavedProfile] = useState(null);

  // Function to save current input values into savedProfile
  const handleSave = () => {
    setSavedProfile({ name, bio, skills });
  };

  return (
    <div style={{ padding: "20px", paddingBottom: "80px" }}>
      <h1>Profile Page</h1>

      {}   // Name input
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      /><br /><br />

      {}  // Bio input
      <input
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      /><br /><br />

      {} // Skills input
      <input
        placeholder="Skills"
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
      /><br /><br />

      {}  // Display saved profile if it exists
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
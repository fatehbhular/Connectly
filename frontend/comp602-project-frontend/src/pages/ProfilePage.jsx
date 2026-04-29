import { useState } from "react";
import PageWrapper from "../components/PageWrapper";

export default function ProfilePage() {
  // State for user input fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Stores the saved profile after clicking save
  const [savedProfile, setSavedProfile] = useState(null);

  // Saves the current input values into savedProfile
  const handleSave = () => {
    // Prevent saving if any profile fields are empty
    if (!name || !bio || !skills || !portfolio) {
      alert("Please fill in all profile fields.");
      return;
    }

    setSavedProfile({ name, bio, skills, portfolio });
  };

  return (
    <PageWrapper>
      <h1>Profile Page</h1>

      {/* Name input */}
      <label>Name</label><br />
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      /><br /><br />

      {/* Bio input */}
      <label>Bio</label><br />
      <input
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      /><br /><br />

      {/* Skills input */}
      <label>Skills</label><br />
      <input
        placeholder="Skills"
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
      /><br /><br />

      {/* Portfolio input */}
      <label>Portfolio</label><br />
      <textarea
        placeholder="Portfolio details or project links"
        value={portfolio}
        onChange={(e) => setPortfolio(e.target.value)}
      ></textarea><br /><br />

      {/* Save button */}
      <button onClick={handleSave}>Save</button>

      {/* Display saved profile details if available */}
      {savedProfile && (
        <div style={{ marginTop: "20px" }}>
          <h3>Saved Profile</h3>

          <p><strong>Name:</strong> {savedProfile.name}</p>
          <p><strong>Bio:</strong> {savedProfile.bio}</p>
          <p><strong>Skills:</strong> {savedProfile.skills}</p>
          <p><strong>Portfolio:</strong> {savedProfile.portfolio}</p>
        </div>
      )}
    </PageWrapper>
  );
}
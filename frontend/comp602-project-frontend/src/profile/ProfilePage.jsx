import { useState } from "react";
import "./ProfilePage.css";

export default function ProfilePage({ currentUser, onProfileUpdate }) {
  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? "");
  const [industry, setIndustry] = useState(currentUser?.industry ?? "");
  const [city, setCity] = useState(currentUser?.location ?? "");
  const [bio, setBio] = useState(currentUser?.bio ?? "");
  const [skills, setSkills] = useState(currentUser?.skills?.join(", ") ?? "");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isComplete = currentUser?.profileComplete;

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!displayName.trim() || !industry.trim() || !city.trim()) {
      setError("Display name, industry and city are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", "userId": currentUser.userId },
        body: JSON.stringify({ displayName, industry, city, bio, skills }),
      });

      if (res.status === 400) {
        setError("Could not find that city. Please try a different location");
        return;
      }

      if (!res.ok) {
        setError("Failed to save profile");
        return;
      }

      const updated = await res.json();
      onProfileUpdate(updated);
      setSuccess("Profile saved!");

    } catch (err) {
      setError("Could not connect to server");
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-form">

        <h1>Profile</h1>

        <div className="profile-grid">

          <label>Display Name</label>
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
          />

          <label>Industry</label>
          <input
            value={industry}
            onChange={e => setIndustry(e.target.value)}
          />

          <label>City</label>
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
          />

          <label>Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
          />

          <label>Skills</label>
          <input
            value={skills}
            onChange={e => setSkills(e.target.value)}
          />

          <div />
          <button className="profile-save-btn" onClick={handleSave}>Save Profile</button>

        </div>

        <div className="profile-messages">
          {!isComplete && <p className="profile-warning">Complete your profile to unlock the app</p>}
          {error && <p className="profile-error">{error}</p>}
          {success && <p className="profile-success">{success}</p>}
        </div>

      </div>
    </div>
  );
}
import { useState } from "react";

export default function ProfilePage() {

  // State for profile form fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");

  return (
  <div style={{ padding: "20px", paddingBottom: "80px" }}>
    <h1>Profile Page</h1>

    <input
      placeholder="Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
    /><br /><br />

    <input
      placeholder="Bio"
      value={bio}
      onChange={(e) => setBio(e.target.value)}
    /><br /><br />

    <input
      placeholder="Skills"
      value={skills}
      onChange={(e) => setSkills(e.target.value)}
    /><br /><br />

  </div>
);
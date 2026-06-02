export default function ProfilePage({ currentUser, onProfileUpdate }) {
  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? "");
  const [industry, setIndustry] = useState(currentUser?.industry ?? "");
  const [city, setCity] = useState(currentUser?.location ?? "");
  const [bio, setBio] = useState(currentUser?.bio ?? "");

  // Nessecary fields for profile links
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser?.linkedinUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(currentUser?.githubUrl ?? "");

  const [skillList, setSkillList] = useState(
    () => (currentUser?.skills ?? []).filter(Boolean)
  );

  const [skillInput, setSkillInput] = useState("");
  const [statusFeedback, setStatusFeedback] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [savedStrip, setSavedStrip] = useState({
    displayName: currentUser?.displayName ?? "",
    industry: currentUser?.industry ?? "",
    city: currentUser?.location ?? "",
  });

  const isComplete = currentUser?.profileComplete;
  const hasError = statusFeedback?.type === "error";

  const clearStatus = () => setStatusFeedback(null);

  const handleSave = async () => {
    setStatusFeedback(null);

    if (!displayName.trim() || !industry.trim() || !city.trim()) {
      setStatusFeedback({
        type: "error",
        message: "Display name, industry, and city are required.",
      });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userId: currentUser.userId,
        },
        body: JSON.stringify({
          displayName: displayName.trim(),
          industry: industry.trim(),
          city: city.trim(),
          bio: bio.trim(),
          skills: skillList.join(", "),

          // ✅ NEW FIELDS SENT TO BACKEND
          linkedinUrl: linkedinUrl.trim(),
          githubUrl: githubUrl.trim(),
        }),
      });

      if (!res.ok) {
        setStatusFeedback({ type: "error", message: "Failed to save profile." });
        return;
      }

      const updated = await res.json();
      onProfileUpdate(updated);

      setSavedStrip({
        displayName: updated.displayName ?? displayName.trim(),
        industry: updated.industry ?? industry.trim(),
        city: updated.location ?? city.trim(),
      });

      setStatusFeedback({ type: "success", message: "Profile saved." });
    } catch {
      setStatusFeedback({
        type: "error",
        message: "Could not connect to server.",
      });
    } finally {
      setSaving(false);
    }
  };
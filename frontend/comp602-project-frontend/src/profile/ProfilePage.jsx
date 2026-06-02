import BASE_URL from "../config.js";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PortfolioSuggestionsModal from "./PortfolioSuggestionsModal.jsx";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
};

const inputStyle = (invalid) => ({
  width: "100%",
  padding: "7px 10px",
  border: `1px solid ${invalid ? "#E8845A" : "#E8E4DC"}`,
  borderRadius: 10,
  fontSize: 14,
  boxSizing: "border-box",
  background: "#F0EDE6",
  outline: "none",
  color: "#1a1a1a",
  fontFamily: "inherit",
  touchAction: "manipulation",
});

const primaryBtn = {
  width: "100%",
  padding: "9px",
  background: "#fb923c",
  color: "white",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
  fontFamily: "inherit",
};

function SaveBadge({ type }) {
  if (!type || type === "warning") return null;
  const isError = type === "error";
  return (
    <AnimatePresence>
      <motion.div
        key={type}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        aria-label={isError ? "Save failed" : "Profile saved"}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: isError ? "#C45A3A" : "#3D8B5E",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 700,
          boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
          zIndex: 10,
        }}
      >
        {isError ? "!" : "✓"}
      </motion.div>
    </AnimatePresence>
  );
}

function FieldLabel({ children }) {
  return (
    <label style={{ display: "block", margin: "0 0 3px", fontSize: 11, fontWeight: 500, color: "#B0A99F" }}>
      {children}
    </label>
  );
}

const SKILLS_CHIP_HEIGHT = 96;

function ProfileStrip({ displayName, username, industry, city }) {
  const avatarLetter = (displayName?.trim() || username || "?")[0]?.toUpperCase();
  const previewName = displayName?.trim() || username || "?";
  const locationLine = [industry?.trim(), city?.trim()].filter(Boolean).join(" · ");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0 8px" }}>
      <div style={{
        width: 46, height: 46, borderRadius: "50%",
        background: "linear-gradient(135deg, #fdba74, #fb923c)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontWeight: 700, fontSize: 18, flexShrink: 0,
        boxShadow: "0 0 0 2px white",
      }}>
        {avatarLetter}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.25 }}>{previewName}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#B0A99F" }}>@{username}</p>
        </div>
        {locationLine && (
          <p style={{ margin: "5px 0 0", fontSize: 12, color: "#C4785A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {locationLine}
          </p>
        )}
      </div>
    </div>
  );
}

function SkillsSection({ skillList, skillInput, setSkillInput, onAdd, onRemove, onFocus, skillCount }) {
  const atMax = skillCount >= 10;
  return (
    <div style={{ padding: "9px 10px", borderRadius: 12, background: "linear-gradient(160deg, #FFF8F2 0%, #F0EDE6 100%)", border: "1px solid #E8E4DC" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, padding: "6px 9px", borderRadius: 10,
        border: `1.5px dashed ${atMax ? "#E8E4DC" : "#D4CFCA"}`,
        background: atMax ? "#F0EDE6" : "white", opacity: atMax ? 0.6 : 1, marginBottom: 6,
      }}>
        <span style={{
          width: 20, height: 20, borderRadius: "50%", background: atMax ? "#E8E4DC" : "#fb923c",
          color: "white", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 600, flexShrink: 0, lineHeight: 1,
        }}>+</span>
        <input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
          onFocus={onFocus}
          disabled={atMax}
          placeholder={atMax ? "Maximum reached" : "Add skills"}
          style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#1a1a1a", fontFamily: "inherit", touchAction: "manipulation" }}
        />
        <span style={{ fontSize: 10, fontWeight: 600, color: atMax ? "#C4785A" : "#B0A99F", background: "white", border: "1px solid #E8E4DC", borderRadius: 20, padding: "1px 7px", flexShrink: 0 }}>
          {skillCount}/10
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignContent: "flex-start", gap: 4, height: SKILLS_CHIP_HEIGHT, marginTop: 4, overflow: "hidden" }}>
        {skillList.length > 0 ? skillList.map((skill) => (
          <span key={skill} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 7px 3px 9px", borderRadius: 16, background: "white", border: "1px solid #F5C4B0", fontSize: 11, fontWeight: 600, color: "#C4785A", height: 22, boxSizing: "border-box" }}>
            {skill}
            <button type="button" onClick={() => onRemove(skill)} aria-label={`Remove ${skill}`} style={{ width: 16, height: 16, borderRadius: "50%", background: "#F0EDE6", border: "none", cursor: "pointer", color: "#B0A99F", fontSize: 12, lineHeight: 1, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>×</button>
          </span>
        )) : (
          <p style={{ margin: 0, fontSize: 11, color: "#B0A99F", lineHeight: 1.4, padding: "4px 2px" }}>Add skills so others know what you're good at.</p>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage({ currentUser, onProfileUpdate }) {
  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? "");
  const [industry, setIndustry] = useState(currentUser?.industry ?? "");
  const [city, setCity] = useState(currentUser?.location ?? "");
  const [bio, setBio] = useState(currentUser?.bio ?? "");
  // Profile link fields
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser?.linkedinUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(currentUser?.githubUrl ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(currentUser?.portfolioUrl ?? "");

  const [skillList, setSkillList] = useState(() => (currentUser?.skills ?? []).filter(Boolean));
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

  const preventFocusJump = (e) => {
    const el = e.target;
    el.setAttribute("readonly", true);
    setTimeout(() => el.removeAttribute("readonly"), 100);
  };

  useEffect(() => {
    setSavedStrip({
      displayName: currentUser?.displayName ?? "",
      industry: currentUser?.industry ?? "",
      city: currentUser?.location ?? "",
    });
  }, [currentUser?.displayName, currentUser?.industry, currentUser?.location]);

  useEffect(() => {
    if (showSuggestions) return;
    const blockScroll = (e) => e.preventDefault();
    document.addEventListener("touchmove", blockScroll, { passive: false, capture: true });
    document.addEventListener("wheel", blockScroll, { passive: false, capture: true });
    return () => {
      document.removeEventListener("touchmove", blockScroll, { capture: true });
      document.removeEventListener("wheel", blockScroll, { capture: true });
    };
  }, [showSuggestions]);

  useEffect(() => {
    if (!statusFeedback) return;
    const delay = statusFeedback.type === "success" ? 2500 : 3500;
    const timer = setTimeout(clearStatus, delay);
    return () => clearTimeout(timer);
  }, [statusFeedback]);

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill || skillList.includes(skill) || skillList.length >= 10) return;
    setSkillList((prev) => [...prev, skill]);
    setSkillInput("");
    clearStatus();
  };

  const removeSkill = (skill) => {
    setSkillList((prev) => prev.filter((s) => s !== skill));
    clearStatus();
  };

  const addSuggestedSkill = (skill) => {
    if (!skill || skillList.includes(skill) || skillList.length >= 10) return;
    setSkillList((prev) => [...prev, skill]);
    clearStatus();
  };

  const handleSave = async () => {
    setStatusFeedback(null);
    if (!displayName.trim() || !industry.trim() || !city.trim()) {
      setStatusFeedback({ type: "error", message: "Display name, industry, and city are required." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", userId: currentUser.userId },
        body: JSON.stringify({
          displayName: displayName.trim(),
          industry: industry.trim(),
          city: city.trim(),
          bio: bio.trim(),
          skills: skillList.join(", "),
          linkedinUrl: linkedinUrl.trim(),
          githubUrl: githubUrl.trim(),
          portfolioUrl: portfolioUrl.trim(),
        }),
      });

      if (res.status === 400) {
        setStatusFeedback({ type: "error", message: "Could not find that city. Try a different location." });
        return;
      }
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
      setStatusFeedback({ type: "error", message: "Could not connect to server." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page flex flex-col w-full h-dvh bg-[#F0EDE6] overflow-hidden">
      <motion.div
        className="flex-shrink-0 flex items-baseline justify-between px-6 pt-6 pb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        <div className="flex items-baseline gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#C4785A] mb-1">your details</p>
        </div>
        <button type="button" onClick={() => setShowSuggestions(true)} aria-label="Portfolio suggestions"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6" /><path d="M10 22h4" />
            <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
          </svg>
        </button>
      </motion.div>

      {!isComplete && (
        <p className="flex-shrink-0 mx-4 mb-1.5 px-2.5 py-1 rounded-lg text-center"
          style={{ fontSize: 11, fontWeight: 500, color: "#C4785A", background: "#FFF8F0", border: "1px solid #F5D4B0" }}>
          Complete your profile to unlock the rest of the app.
        </p>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24 flex flex-col gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <motion.div className="relative rounded-2xl bg-white border border-[#E8E4DC] px-4 pt-3.5 pb-3.5 shrink-0"
          initial="hidden" animate="visible" variants={cardVariants}>
          <SaveBadge type={statusFeedback?.type} />
          <ProfileStrip
            displayName={savedStrip.displayName}
            username={currentUser?.username}
            industry={savedStrip.industry}
            city={savedStrip.city}
          />
        </motion.div>

        <motion.div className="rounded-2xl bg-white border border-[#E8E4DC] px-4 pt-3.5 pb-0 shrink-0"
          initial="hidden" animate="visible" variants={cardVariants} transition={{ delay: 0.04 }}>
          <div className="flex flex-col gap-1.5">

            <div>
              <FieldLabel>Display name</FieldLabel>
              <input value={displayName} onChange={(e) => { setDisplayName(e.target.value); clearStatus(); }}
                onFocus={preventFocusJump} placeholder="How others see you" style={inputStyle(hasError && !displayName.trim())} />
            </div>

            <div>
              <FieldLabel>Industry</FieldLabel>
              <input value={industry} onChange={(e) => { setIndustry(e.target.value); clearStatus(); }}
                onFocus={preventFocusJump} placeholder="e.g. Software Engineering" style={inputStyle(hasError && !industry.trim())} />
            </div>

            <div>
              <FieldLabel>City</FieldLabel>
              <input value={city} onChange={(e) => { setCity(e.target.value); clearStatus(); }}
                onFocus={preventFocusJump} placeholder="e.g. Auckland" style={inputStyle(hasError && !city.trim())} />
            </div>

            <div>
              <FieldLabel>Bio</FieldLabel>
              <input type="text" value={bio} onChange={(e) => { setBio(e.target.value); clearStatus(); }}
                onFocus={preventFocusJump} placeholder="Tell people about yourself…" style={inputStyle(false)} />
            </div>

            {/* ✅ NEW: LinkedIn, GitHub, Portfolio inputs */}
            <div>
              <FieldLabel>LinkedIn URL</FieldLabel>
              <input type="url" value={linkedinUrl} onChange={(e) => { setLinkedinUrl(e.target.value); clearStatus(); }}
                onFocus={preventFocusJump} placeholder="https://linkedin.com/in/yourprofile" style={inputStyle(false)} />
            </div>

            <div>
              <FieldLabel>GitHub URL</FieldLabel>
              <input type="url" value={githubUrl} onChange={(e) => { setGithubUrl(e.target.value); clearStatus(); }}
                onFocus={preventFocusJump} placeholder="https://github.com/yourusername" style={inputStyle(false)} />
            </div>

            <div>
              <FieldLabel>Portfolio URL</FieldLabel>
              <input type="url" value={portfolioUrl} onChange={(e) => { setPortfolioUrl(e.target.value); clearStatus(); }}
                onFocus={preventFocusJump} placeholder="https://yourportfolio.com" style={inputStyle(false)} />
            </div>

            <div>
              <FieldLabel>Skills</FieldLabel>
              <SkillsSection
                skillList={skillList} skillInput={skillInput} setSkillInput={setSkillInput}
                onAdd={addSkill} onRemove={removeSkill} onFocus={preventFocusJump} skillCount={skillList.length}
              />
              <div style={{ marginTop: 6, paddingBottom: 12 }}>
                <motion.button onClick={handleSave} disabled={saving} whileTap={{ scale: 0.98 }}
                  style={{ ...primaryBtn, opacity: saving ? 0.65 : 1 }}>
                  {saving ? "Saving…" : "Save profile"}
                </motion.button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {showSuggestions && (
        <PortfolioSuggestionsModal
          userId={currentUser?.userId}
          existingSkills={skillList}
          onClose={() => setShowSuggestions(false)}
          onAddSkill={addSuggestedSkill}
        />
      )}
    </div>
  );
}
import BASE_URL from '../config.js';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
      const res = await fetch(`${BASE_URL}/users/profile`, {
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

  const inputClass = "w-full px-3 py-2 rounded-xl bg-[#F0EDE6] border border-[#E8E4DC] text-sm text-gray-900 placeholder-[#B0A99F] outline-none focus:ring-2 focus:ring-orange-300 transition-shadow";

  // Shared card animation — each card fades and slides up, staggered by index
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, type: "spring", stiffness: 320, damping: 26 },
    }),
  };

  const fields = [
    { label: "Display Name", value: displayName, onChange: e => setDisplayName(e.target.value), placeholder: "Your name" },
    { label: "Industry",     value: industry,     onChange: e => setIndustry(e.target.value),     placeholder: "e.g. Software Engineering" },
    { label: "City",         value: city,         onChange: e => setCity(e.target.value),         placeholder: "e.g. Auckland" },
    { label: "Skills",       value: skills,       onChange: e => setSkills(e.target.value),       placeholder: "e.g. React, Java, Design" },
  ];

  return (
    <div className="flex flex-col w-full h-dvh bg-[#F0EDE6] overflow-hidden">

      {/* Header */}
      <div className="flex items-baseline gap-2 px-6 pt-6 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#C4785A] mb-1">
          your details
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-col flex-1 overflow-y-auto px-4 gap-3 pb-24">

        {/* Incomplete profile warning */}
        <AnimatePresence>
          {!isComplete && (
            <motion.div
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-orange-50 border border-orange-200"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
              <p className="text-orange-400 text-xs font-semibold">Complete your profile to unlock the app</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text input fields */}
        {fields.map((field, i) => (
          <motion.div
            key={field.label}
            className="flex flex-col gap-2 px-4 py-4 rounded-2xl bg-white border border-[#E8E4DC]"
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <label className="text-gray-900 font-semibold text-sm">{field.label}</label>
            <input
              value={field.value}
              onChange={field.onChange}
              placeholder={field.placeholder}
              className={inputClass}
            />
          </motion.div>
        ))}

        {/* Bio — separate because it uses a textarea */}
        <motion.div
          className="flex flex-col gap-2 px-4 py-4 rounded-2xl bg-white border border-[#E8E4DC]"
          custom={fields.length}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <label className="text-gray-900 font-semibold text-sm">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            placeholder="Tell people about yourself"
            className={`${inputClass} resize-none`}
          />
        </motion.div>

        {/* Save button — scale on press for physical feedback */}
        <motion.button
          onClick={handleSave}
          className="w-full py-3 rounded-2xl bg-orange-400 text-white text-sm font-semibold"
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          Save Profile
        </motion.button>

        {/* Error / success banners — fade + slide in when they appear */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-50 border border-red-100"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <p className="text-red-400 text-xs font-semibold">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-orange-50 border border-orange-200"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
              <p className="text-orange-400 text-xs font-semibold">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom padding so last card clears the nav bar */}
        <div className="h-6" />

      </div>
    </div>
  );
}
import { useState } from "react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [theme, setTheme] = useState("Light");
  const [language, setLanguage] = useState("English");

  // Shared card animation — each card fades and slides up, staggered by index
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, type: "spring", stiffness: 320, damping: 26 },
    }),
  };

  return (
    <div className="flex flex-col w-full h-dvh bg-[#F0EDE6]">

      {/* Header */}
      <div className="flex items-baseline gap-2 px-6 pt-14 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#C4785A] mb-1">
          your account
        </p>
      </div>

      {/* Settings list */}
      <div className="flex flex-col flex-1 overflow-y-auto px-4 gap-3 pb-24">

        {/* Theme */}
        <motion.div
          className="flex items-center justify-between px-4 py-4 rounded-2xl bg-white border border-[#E8E4DC]"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div>
            <p className="text-gray-900 font-semibold text-sm">Theme</p>
            <p className="text-[#B0A99F] text-xs mt-0.5">Change the visual appearance of the app.</p>
          </div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="text-sm text-gray-900 bg-[#F0EDE6] border border-[#E8E4DC] rounded-xl px-3 py-1.5 outline-none"
          >
            <option>Light</option>
            <option>Dark</option>
          </select>
        </motion.div>

        {/* Password */}
        <motion.div
          className="flex flex-col gap-3 px-4 py-4 rounded-2xl bg-white border border-[#E8E4DC]"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div>
            <p className="text-gray-900 font-semibold text-sm">Password</p>
            <p className="text-[#B0A99F] text-xs mt-0.5">Update your account password.</p>
          </div>
          <input
            type="password"
            placeholder="New password"
            className="w-full px-3 py-2 rounded-xl bg-[#F0EDE6] border border-[#E8E4DC] text-sm text-gray-900 placeholder-[#B0A99F] outline-none focus:ring-2 focus:ring-orange-300 transition-shadow"
          />
          <motion.button
            className="self-start px-4 py-2 rounded-xl bg-orange-400 text-white text-sm font-semibold"
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            Update Password
          </motion.button>
        </motion.div>

        {/* Security */}
        <motion.div
          className="flex items-center justify-between px-4 py-4 rounded-2xl bg-white border border-[#E8E4DC]"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div>
            <p className="text-gray-900 font-semibold text-sm">Two-Factor Authentication</p>
            <p className="text-[#B0A99F] text-xs mt-0.5">Manage account security preferences.</p>
          </div>
          <input type="checkbox" className="w-4 h-4 accent-orange-400" />
        </motion.div>

        {/* Language */}
        <motion.div
          className="flex items-center justify-between px-4 py-4 rounded-2xl bg-white border border-[#E8E4DC]"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div>
            <p className="text-gray-900 font-semibold text-sm">Language</p>
            <p className="text-[#B0A99F] text-xs mt-0.5">Choose your preferred app language.</p>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm text-gray-900 bg-[#F0EDE6] border border-[#E8E4DC] rounded-xl px-3 py-1.5 outline-none"
          >
            <option>English</option>
            <option>Chinese</option>
            <option>Spanish</option>
            <option>Arabic</option>
            <option>Hindi</option>
          </select>
        </motion.div>

      </div>
    </div>
  );
}
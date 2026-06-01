import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BASE_URL from "../config.js";
import { useModalOverlay } from "../hooks/useModalOverlay";
import ProfileAnalyticsCard from "./ProfileAnalyticsCard.jsx";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
};

const gradientBlurBackdrop = {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 45%)",
  maskImage: "linear-gradient(to bottom, transparent 0%, black 45%)",
  background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 100%)",
  pointerEvents: "none",
};

const modalCard = {
  width: "100%",
  maxWidth: 400,
  background: "white",
  borderRadius: 24,
  padding: "28px",
  border: "1px solid #E8E4DC",
  boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  pointerEvents: "auto",
};

const inputStyle = (invalid, flex) => ({
  flex: flex ? 1 : undefined,
  width: flex ? undefined : "100%",
  minWidth: 0,
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

const inlinePrimaryBtn = {
  padding: "7px 12px",
  background: "#fb923c",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 13,
  fontFamily: "inherit",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const primaryBtn = {
  flex: 2,
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

const secondaryBtn = {
  flex: 1,
  padding: "9px",
  background: "#F0EDE6",
  color: "#B0A99F",
  border: "1px solid #E8E4DC",
  borderRadius: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
  fontFamily: "inherit",
};

const sectionDivider = { borderTop: "1px solid #E8E4DC", margin: "8px 0" };

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
        aria-label={isError ? "Action failed" : "Saved"}
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
    <label
      style={{
        display: "block",
        margin: "0 0 3px",
        fontSize: 11,
        fontWeight: 500,
        color: "#B0A99F",
      }}
    >
      {children}
    </label>
  );
}

function AccountStrip({ displayName, username, email }) {
  const avatarLetter = (displayName?.trim() || username || "?")[0]?.toUpperCase();
  const previewName = displayName?.trim() || username || "?";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0 8px" }}>
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #fdba74, #fb923c)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 700,
          fontSize: 18,
          flexShrink: 0,
          boxShadow: "0 0 0 2px white",
        }}
      >
        {avatarLetter}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.25 }}>
            {previewName}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#B0A99F" }}>@{username}</p>
        </div>
        {email && (
          <p
            style={{
              margin: "5px 0 0",
              fontSize: 12,
              color: "#C4785A",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {email}
          </p>
        )}
      </div>
    </div>
  );
}

function InlineRow({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        border: "none",
        padding: 2,
        cursor: disabled ? "not-allowed" : "pointer",
        background: checked ? "#fb923c" : "#E8E4DC",
        opacity: disabled ? 0.5 : 1,
        transition: "background 0.2s ease",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: "block",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "white",
          transform: checked ? "translateX(18px)" : "translateX(0)",
          transition: "transform 0.2s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        }}
      />
    </button>
  );
}

function TextLink({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        marginTop: 4,
        fontSize: 11,
        color: "#B0A99F",
        cursor: "pointer",
        fontFamily: "inherit",
        alignSelf: "flex-start",
      }}
    >
      {children}
    </button>
  );
}

export default function SettingsPage({ onSignOut, user, onUserUpdate }) {
  const hasEmail = Boolean(user?.email?.trim());

  const [otpEnabled, setOtpEnabled] = useState(user?.otpEnabled || false);
  const [statusFeedback, setStatusFeedback] = useState(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordCode, setPasswordCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordModalFeedback, setPasswordModalFeedback] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const [emailStep, setEmailStep] = useState("idle");
  const [newEmail, setNewEmail] = useState("");
  const [currentEmailCode, setCurrentEmailCode] = useState("");
  const [newEmailCode, setNewEmailCode] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useModalOverlay(showPasswordModal);

  useEffect(() => {
    if (!statusFeedback) return;
    const delay = statusFeedback.type === "success" ? 2500 : 3500;
    const timer = setTimeout(() => setStatusFeedback(null), delay);
    return () => clearTimeout(timer);
  }, [statusFeedback]);

  const resetPasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordCode("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordModalFeedback(null);
    setCodeSent(false);
  };

  const resetEmailFlow = () => {
    setEmailStep("idle");
    setNewEmail("");
    setCurrentEmailCode("");
    setNewEmailCode("");
    setStatusFeedback(null);
  };

  const handleToggleOtp = async (enable) => {
    if (enable && !hasEmail) {
      setStatusFeedback({ type: "error", message: "Add an email to your account first." });
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/auth/otp/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, enable: String(enable) }),
      });

      if (!res.ok) {
        setStatusFeedback({ type: "error", message: "Failed to update 2FA setting." });
        return;
      }

      const updatedUser = await res.json();
      onUserUpdate(updatedUser);
      setOtpEnabled(enable);
      setStatusFeedback({
        type: "success",
        message: enable ? "2FA enabled." : "2FA disabled.",
      });
    } catch {
      setStatusFeedback({ type: "error", message: "Could not connect to server." });
    }
  };

  const handleSendPasswordCode = async () => {
    setPasswordLoading(true);
    setPasswordModalFeedback(null);

    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email.toLowerCase().trim() }),
      });

      if (!res.ok) {
        setPasswordModalFeedback({ type: "error", message: "Could not send code. Check your email address." });
        return;
      }

      setCodeSent(true);
    } catch {
      setPasswordModalFeedback({ type: "error", message: "Could not connect to server." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const openPasswordModal = async () => {
    setPasswordCode("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordModalFeedback(null);
    setCodeSent(false);
    setShowPasswordModal(true);

    if (hasEmail) {
      setPasswordLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email.toLowerCase().trim() }),
        });
        if (res.ok) {
          setCodeSent(true);
        } else {
          setPasswordModalFeedback({ type: "error", message: "Could not send code." });
        }
      } catch {
        setPasswordModalFeedback({ type: "error", message: "Could not connect to server." });
      } finally {
        setPasswordLoading(false);
      }
    }
  };

  const handleDirectPasswordUpdate = async () => {
    setPasswordModalFeedback(null);

    if (newPassword.length < 6) {
      setPasswordModalFeedback({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordModalFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/settings/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", userId: String(user.userId) },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPasswordModalFeedback({ type: "error", message: data.error || "Failed to update password." });
        return;
      }

      resetPasswordModal();
      setStatusFeedback({ type: "success", message: "Password updated." });
    } catch {
      setPasswordModalFeedback({ type: "error", message: "Could not connect to server." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setPasswordModalFeedback(null);

    if (!passwordCode.trim()) {
      setPasswordModalFeedback({ type: "error", message: "Enter the verification code." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordModalFeedback({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordModalFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email.toLowerCase().trim(),
          code: passwordCode.trim().toUpperCase(),
          password: newPassword,
        }),
      });

      if (!res.ok) {
        setPasswordModalFeedback({ type: "error", message: "Invalid or expired code." });
        return;
      }

      resetPasswordModal();
      setStatusFeedback({ type: "success", message: "Password updated." });
    } catch {
      setPasswordModalFeedback({ type: "error", message: "Could not connect to server." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    setStatusFeedback(null);

    if (!newEmail.trim()) {
      setStatusFeedback({ type: "error", message: "Enter an email address." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      setStatusFeedback({ type: "error", message: "Enter a valid email address." });
      return;
    }

    setEmailLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/change-email/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", userId: String(user.userId) },
        body: JSON.stringify({ newEmail: newEmail.toLowerCase().trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatusFeedback({ type: "error", message: data.error || "Could not update email." });
        return;
      }

      setEmailStep(data.step === "verify-new" ? "verify-new" : "verify-current");
      setStatusFeedback({ type: "success", message: data.message || "Check your email for a code." });
    } catch {
      setStatusFeedback({ type: "error", message: "Could not connect to server." });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailVerifyCurrent = async () => {
    setStatusFeedback(null);

    if (!currentEmailCode.trim()) {
      setStatusFeedback({ type: "error", message: "Enter the verification code." });
      return;
    }

    setEmailLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/change-email/verify-current`, {
        method: "POST",
        headers: { "Content-Type": "application/json", userId: String(user.userId) },
        body: JSON.stringify({
          newEmail: newEmail.toLowerCase().trim(),
          code: currentEmailCode.trim().toUpperCase(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatusFeedback({ type: "error", message: data.error || "Invalid or expired code." });
        return;
      }

      setEmailStep("verify-new");
      setStatusFeedback({ type: "success", message: "Code sent to your new email." });
    } catch {
      setStatusFeedback({ type: "error", message: "Could not connect to server." });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailConfirm = async () => {
    setStatusFeedback(null);

    if (!newEmailCode.trim()) {
      setStatusFeedback({ type: "error", message: "Enter the verification code." });
      return;
    }

    setEmailLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/change-email/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", userId: String(user.userId) },
        body: JSON.stringify({
          newEmail: newEmail.toLowerCase().trim(),
          code: newEmailCode.trim().toUpperCase(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatusFeedback({ type: "error", message: data.error || "Could not update email." });
        return;
      }

      onUserUpdate(data);
      resetEmailFlow();
      setStatusFeedback({ type: "success", message: hasEmail ? "Email updated." : "Email added." });
    } catch {
      setStatusFeedback({ type: "error", message: "Could not connect to server." });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch(`${BASE_URL}/auth/logout`, { method: "POST" });
    } catch {
      // proceed with local sign-out even if server call fails
    }
    localStorage.removeItem("currentUser");
    onSignOut();
  };

  const hasPasswordModalError = passwordModalFeedback?.type === "error";
  const hasEmailError = statusFeedback?.type === "error";
  const displayName = user?.displayName || user?.username || "?";

  return (
    <div className="settings-page flex flex-col w-full h-dvh bg-[#F0EDE6] overflow-hidden">
      <motion.div
        className="flex-shrink-0 flex items-baseline gap-2 px-6 pt-6 pb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#C4785A] mb-1">
          your account
        </p>
      </motion.div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-24 flex flex-col gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <motion.div
          className="relative rounded-2xl bg-white border border-[#E8E4DC] px-4 pt-3.5 pb-3.5 shrink-0"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <SaveBadge type={statusFeedback?.type} />
          <AccountStrip
            displayName={displayName}
            username={user?.username}
            email={hasEmail ? user.email : null}
          />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.04 }}
          className="shrink-0"
        >
          <ProfileAnalyticsCard userId={user?.userId} />
        </motion.div>

        <motion.div
          className="rounded-2xl bg-white border border-[#E8E4DC] px-4 pt-3.5 pb-0 shrink-0"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.08 }}
        >
          <div className="flex flex-col gap-1.5">
            <div>
              <FieldLabel>{hasEmail ? "Change email" : "Add email"}</FieldLabel>

              {emailStep === "idle" && (
                <InlineRow>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={newEmail}
                    onChange={(e) => { setNewEmail(e.target.value); setStatusFeedback(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleEmailSubmit(); }}
                    style={inputStyle(hasEmailError && !newEmail.trim(), true)}
                  />
                  <motion.button
                    style={{ ...inlinePrimaryBtn, opacity: emailLoading ? 0.6 : 1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleEmailSubmit}
                    disabled={emailLoading}
                  >
                    {emailLoading ? "…" : "Update"}
                  </motion.button>
                </InlineRow>
              )}

              {emailStep === "verify-current" && (
                <>
                  <InlineRow>
                    <input
                      type="text"
                      placeholder="Current email code"
                      value={currentEmailCode}
                      maxLength={6}
                      autoCapitalize="characters"
                      onChange={(e) => { setCurrentEmailCode(e.target.value.toUpperCase()); setStatusFeedback(null); }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleEmailVerifyCurrent(); }}
                      style={inputStyle(hasEmailError && !currentEmailCode.trim(), true)}
                    />
                    <motion.button
                      style={{ ...inlinePrimaryBtn, opacity: emailLoading ? 0.6 : 1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleEmailVerifyCurrent}
                      disabled={emailLoading}
                    >
                      {emailLoading ? "…" : "Next"}
                    </motion.button>
                  </InlineRow>
                  <TextLink onClick={resetEmailFlow}>Cancel</TextLink>
                </>
              )}

              {emailStep === "verify-new" && (
                <>
                  <InlineRow>
                    <input
                      type="text"
                      placeholder="New email code"
                      value={newEmailCode}
                      maxLength={6}
                      autoCapitalize="characters"
                      onChange={(e) => { setNewEmailCode(e.target.value.toUpperCase()); setStatusFeedback(null); }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleEmailConfirm(); }}
                      style={inputStyle(hasEmailError && !newEmailCode.trim(), true)}
                    />
                    <motion.button
                      style={{ ...inlinePrimaryBtn, opacity: emailLoading ? 0.6 : 1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleEmailConfirm}
                      disabled={emailLoading}
                    >
                      {emailLoading ? "…" : "Confirm"}
                    </motion.button>
                  </InlineRow>
                  <TextLink onClick={resetEmailFlow}>Cancel</TextLink>
                </>
              )}
            </div>

            <div style={sectionDivider} />

            <div>
              <FieldLabel>Password</FieldLabel>
              <motion.button
                style={{ ...inlinePrimaryBtn, width: "100%", padding: "9px", borderRadius: 12, fontSize: 14 }}
                whileTap={{ scale: 0.98 }}
                onClick={openPasswordModal}
              >
                Change password
              </motion.button>
            </div>

            <div style={sectionDivider} />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                paddingBottom: 2,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 500, color: "#B0A99F" }}>
                Two-factor authentication
              </span>
              <ToggleSwitch
                checked={otpEnabled}
                onChange={handleToggleOtp}
                disabled={!hasEmail}
              />
            </div>

            <div style={sectionDivider} />

            <div style={{ paddingBottom: 12 }}>
              <motion.button
                onClick={handleSignOut}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  padding: "9px",
                  background: "#F0EDE6",
                  color: "#6B6560",
                  border: "1px solid #E8E4DC",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Sign out
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {showPasswordModal && (
        <>
          <div style={gradientBlurBackdrop} />
          <div
            style={{ position: "fixed", inset: 0, zIndex: 51, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 16px 32px" }}
            onClick={resetPasswordModal}
          >
            <motion.div
              style={modalCard}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Change Password</p>
                {hasEmail && (
                  <p style={{ fontSize: 12, color: "#B0A99F", margin: "3px 0 0 0" }}>
                    {codeSent ? `Enter the code sent to ${user.email}` : "We'll send a code to your email."}
                  </p>
                )}
              </div>

              <div style={{ borderTop: "1px solid #E8E4DC" }} />

              {hasEmail && (
                <InlineRow>
                  <input
                    type="text"
                    placeholder="Verification code"
                    value={passwordCode}
                    maxLength={6}
                    autoCapitalize="characters"
                    onChange={(e) => { setPasswordCode(e.target.value.toUpperCase()); setPasswordModalFeedback(null); }}
                    style={inputStyle(hasPasswordModalError && !passwordCode.trim(), true)}
                  />
                  <motion.button
                    style={{ ...inlinePrimaryBtn, opacity: passwordLoading ? 0.6 : 1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSendPasswordCode}
                    disabled={passwordLoading}
                  >
                    Resend
                  </motion.button>
                </InlineRow>
              )}

              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPasswordModalFeedback(null); }}
                style={inputStyle(hasPasswordModalError && newPassword.length < 6)}
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordModalFeedback(null); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") hasEmail ? handleResetPassword() : handleDirectPasswordUpdate();
                }}
                style={inputStyle(hasPasswordModalError && newPassword !== confirmPassword)}
              />

              {passwordModalFeedback?.message && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    lineHeight: 1.4,
                    color: passwordModalFeedback.type === "error" ? "#C45A3A" : "#3D8B5E",
                  }}
                >
                  {passwordModalFeedback.message}
                </p>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <motion.button style={secondaryBtn} whileTap={{ scale: 0.97 }} onClick={resetPasswordModal}>
                  Cancel
                </motion.button>
                <motion.button
                  style={{ ...primaryBtn, opacity: passwordLoading ? 0.6 : 1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={hasEmail ? handleResetPassword : handleDirectPasswordUpdate}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Updating…" : "Update"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

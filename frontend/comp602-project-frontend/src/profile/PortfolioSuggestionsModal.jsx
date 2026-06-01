import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BASE_URL from "../config.js";

// Same modal shell as MessagingPage group chat picker
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
  gap: "18px",
  pointerEvents: "all",
};

const sectionLabel = {
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#B0A99F",
  margin: "0 0 10px 0",
};

const scrollList = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  maxHeight: "220px",
  overflowY: "auto",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

const secondaryBtn = {
  flex: 1,
  padding: "14px",
  background: "#F0EDE6",
  color: "#B0A99F",
  border: "1px solid #E8E4DC",
  borderRadius: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
  fontFamily: "inherit",
};

const chipBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 10px",
  borderRadius: 16,
  background: "white",
  border: "1px solid #F5C4B0",
  fontSize: 11,
  fontWeight: 600,
  color: "#C4785A",
  cursor: "pointer",
  fontFamily: "inherit",
};

export default function PortfolioSuggestionsModal({ userId, existingSkills, onClose, onAddSkill }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const existing = new Set((existingSkills ?? []).map((s) => s.toLowerCase()));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/portfolio/suggestions`, {
          headers: { userId: String(userId) },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.message || "AI suggestions are temporarily unavailable. Please try again later.");
        }
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "AI suggestions are temporarily unavailable. Please try again later.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const canAdd = (skill) => !existing.has(skill.toLowerCase());

  return (
    <>
      <div style={gradientBlurBackdrop} />
      <div
        style={{ position: "fixed", inset: 0, zIndex: 51 }}
        onClick={onClose}
        aria-hidden
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 52,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          padding: "0 16px 32px",
          pointerEvents: "none",
        }}
      >
        <motion.div
          style={modalCard}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
          role="dialog"
          aria-labelledby="portfolio-suggestions-title"
        >
          <div>
            <p id="portfolio-suggestions-title" style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
              Grow your portfolio
            </p>
            <p style={{ fontSize: 12, color: "#B0A99F", margin: "3px 0 0 0" }}>
              Ideas to stand out on Connectly.
            </p>
          </div>

          <div style={{ borderTop: "1px solid #E8E4DC" }} />

          {loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "8px 0" }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: "2.5px solid #F0EDE6",
                  borderTopColor: "#fb923c",
                  animation: "portfolio-spin 0.7s linear infinite",
                }}
              />
              <span style={{ fontSize: 13, color: "#B0A99F" }}>Finding ideas for you…</span>
              <style>{`@keyframes portfolio-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "4px 0" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#C4785A", lineHeight: 1.45 }}>
                {error}
              </p>
              <p style={{ margin: "8px 0 0", fontSize: 11, color: "#B0A99F" }}>
                Suggestions are generated by AI — nothing is shown when it is unavailable.
              </p>
            </div>
          )}

          {!loading && !error && data?.skills?.length > 0 && (
            <div>
              <p style={sectionLabel}>Skills to pick up</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    style={{
                      ...chipBtn,
                      opacity: canAdd(skill) ? 1 : 0.45,
                      cursor: canAdd(skill) ? "pointer" : "default",
                    }}
                    disabled={!canAdd(skill)}
                    onClick={() => canAdd(skill) && onAddSkill(skill)}
                    title={canAdd(skill) ? "Add to your profile" : "Already on your profile"}
                  >
                    {skill}
                    {canAdd(skill) && <span style={{ fontSize: 13, lineHeight: 1 }}>+</span>}
                  </button>
                ))}
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 11, color: "#B0A99F" }}>
                Tap a skill to add it to your profile.
              </p>
            </div>
          )}

          {!loading && !error && data?.projects?.length > 0 && (
            <div>
              <p style={sectionLabel}>Project ideas</p>
              <div style={scrollList}>
                {data.projects.map((project) => (
                  <div
                    key={project.title}
                    style={{
                      padding: "12px 13px",
                      borderRadius: 14,
                      background: "#F0EDE6",
                      border: "1px solid #E8E4DC",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
                      {project.title}
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: 12, color: "#6B6560", lineHeight: 1.45 }}>
                      {project.description}
                    </p>
                    {project.skillsUsed?.length > 0 && (
                      <p style={{ margin: "8px 0 0", fontSize: 10, color: "#B0A99F" }}>
                        Uses: {project.skillsUsed.join(" · ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !error && data && (
            <p style={{ margin: 0, fontSize: 10, color: "#B0A99F", textAlign: "center" }}>
              Personalised with AI
            </p>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" style={secondaryBtn} onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

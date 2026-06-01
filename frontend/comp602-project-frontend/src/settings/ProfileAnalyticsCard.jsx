import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import BASE_URL from "../config.js";

function pct(n, digits = 0) {
  if (!Number.isFinite(n)) return "—";
  return digits > 0 ? n.toFixed(digits) : String(Math.round(n));
}

function deriveInsights({ rightSwipes, leftSwipes, matches }) {
  const views = rightSwipes + leftSwipes;
  if (views === 0) return null;

  return {
    views,
    rightSwipes,
    leftSwipes,
    matches,
    interestRate: (rightSwipes / views) * 100,
    connectRate: (matches / views) * 100,
  };
}

function Donut({ interestRate }) {
  const size = 88;
  const r = 34;
  const c = 2 * Math.PI * r;
  const interestLen = (interestRate / 100) * c;
  const passLen = c - interestLen;
  const cx = size / 2;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#F0EDE6" strokeWidth="11" />
        {passLen > 0 && (
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke="#E8E4DC"
            strokeWidth="11"
            strokeDasharray={`${passLen} ${c}`}
            strokeDashoffset={-interestLen}
            transform={`rotate(-90 ${cx} ${cx})`}
            strokeLinecap="round"
          />
        )}
        {interestLen > 0 && (
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke="#fb923c"
            strokeWidth="11"
            strokeDasharray={`${interestLen} ${c}`}
            transform={`rotate(-90 ${cx} ${cx})`}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", lineHeight: 1 }}>
          {pct(interestRate)}%
        </span>
        <span
          style={{
            fontSize: 7,
            color: "#B0A99F",
            marginTop: 2,
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: "0.03em",
            maxWidth: 52,
          }}
        >
          swiped right
        </span>
      </div>
    </div>
  );
}

function SplitBar({ interestRate }) {
  return (
    <div style={{ display: "flex", height: 6, borderRadius: 999, overflow: "hidden", background: "#F0EDE6" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${interestRate}%` }}
        transition={{ type: "spring", stiffness: 220, damping: 28 }}
        style={{ background: "#fb923c", borderRadius: interestRate >= 99 ? 999 : "999px 0 0 999px" }}
      />
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${100 - interestRate}%` }}
        transition={{ type: "spring", stiffness: 220, damping: 28, delay: 0.05 }}
        style={{ background: "#E8E4DC" }}
      />
    </div>
  );
}

export default function ProfileAnalyticsCard({ userId }) {
  const [analytics, setAnalytics] = useState(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const eventSource = new EventSource(`${BASE_URL}/analytics/${userId}/stream`);
    eventSource.onopen = () => setLive(true);
    eventSource.onmessage = (e) => {
      setAnalytics(JSON.parse(e.data));
      setLive(true);
    };
    eventSource.onerror = () => {
      setLive(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setLive(false);
    };
  }, [userId]);

  const stats = useMemo(
    () => (analytics ? deriveInsights(analytics) : null),
    [analytics],
  );

  return (
    <div className="rounded-2xl bg-white border border-[#E8E4DC] px-4 py-3.5">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: stats ? 12 : 0,
        }}
      >
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#C4785A", letterSpacing: "0.06em" }}>
          Who swiped on you
        </p>
        {live && stats && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#B0A99F" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fb923c" }} />
            live
          </span>
        )}
      </div>

      {!analytics ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 0" }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: "2.5px solid #F0EDE6",
              borderTopColor: "#fb923c",
              animation: "settings-analytics-spin 0.7s linear infinite",
            }}
          />
          <span style={{ fontSize: 13, color: "#B0A99F" }}>Loading insights…</span>
          <style>{`@keyframes settings-analytics-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : !stats ? (
        <p style={{ margin: 0, fontSize: 12, color: "#B0A99F", lineHeight: 1.45, paddingBottom: 4 }}>
          Nobody has seen your profile on Connect yet. Once they swipe, your stats show up here.
        </p>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <Donut interestRate={stats.interestRate} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11, color: "#B0A99F" }}>Mutual matches</p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#fb923c",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {pct(stats.connectRate, stats.connectRate > 0 && stats.connectRate < 1 ? 1 : 0)}%
              </p>
              <p style={{ margin: "5px 0 0", fontSize: 10, color: "#B0A99F", lineHeight: 1.4 }}>
                {stats.matches} of {stats.views} liked you and you liked them back
              </p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #E8E4DC", paddingTop: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                fontSize: 11,
                color: "#B0A99F",
              }}
            >
              <span>{stats.rightSwipes} swiped right</span>
              <span>{stats.leftSwipes} swiped left</span>
            </div>
            <SplitBar interestRate={stats.interestRate} />
          </div>
        </>
      )}
    </div>
  );
}

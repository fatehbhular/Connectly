import { useEffect, useState } from "react";

import BASE_URL from "../config.js";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@400;500;600&display=swap');

  .analytics-page {
    padding: 24px 20px;
    max-width: 640px;
    font-family: 'Sora', sans-serif;
    color: #1a1917;
  }

  .analytics-header { margin-bottom: 28px; }
  .analytics-header h1 {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.4px;
    margin: 0 0 4px;
  }
  .analytics-header p {
    font-size: 13px;
    color: #6b6a65;
    font-family: 'DM Mono', monospace;
    margin: 0;
  }

  .analytics-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 10px;
    margin-bottom: 16px;
  }

  .analytics-card {
    background: #fff;
    border: 0.5px solid #e2e0da;
    border-radius: 12px;
    padding: 14px 16px;
  }
  .analytics-card .card-label {
    font-size: 11px;
    color: #6b6a65;
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 6px;
  }
  .analytics-card .card-value {
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -1px;
    line-height: 1;
    margin: 0 0 4px;
  }
  .analytics-card .card-sub {
    font-size: 11px;
    color: #6b6a65;
    margin: 0;
    font-family: 'DM Mono', monospace;
  }
  .analytics-card.green .card-value { color: #2d7a4f; }
  .analytics-card.red   .card-value { color: #b03030; }
  .analytics-card.gold  .card-value { color: #8a6500; }

  .analytics-section {
    background: #fff;
    border: 0.5px solid #e2e0da;
    border-radius: 12px;
    padding: 18px 20px;
    margin-bottom: 14px;
  }
  .analytics-section .section-title {
    font-size: 11px;
    font-weight: 500;
    color: #6b6a65;
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 16px;
  }

  .bar-row { margin-bottom: 14px; }
  .bar-row:last-child { margin-bottom: 0; }
  .bar-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }
  .bar-label .bar-name { font-size: 13px; font-weight: 500; }
  .bar-label .bar-stat { font-size: 12px; color: #6b6a65; font-family: 'DM Mono', monospace; }
  .bar-track {
    background: #f0eeea;
    border-radius: 6px;
    height: 10px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    border-radius: 6px;
    transition: width 0.8s cubic-bezier(.16, 1, .3, 1);
  }
  .bar-fill.green { background: #3dbc73; }
  .bar-fill.red   { background: #e85555; }

  .analytics-empty {
    text-align: center;
    padding: 56px 20px;
    background: #fff;
    border: 0.5px dashed #e2e0da;
    border-radius: 12px;
  }
  .analytics-empty .empty-icon {
    font-size: 36px;
    opacity: 0.35;
    margin-bottom: 12px;
  }
  .analytics-empty p {
    font-size: 14px;
    color: #6b6a65;
    margin: 0;
  }

  .analytics-loading {
    padding: 48px 20px;
    text-align: center;
    font-size: 13px;
    color: #6b6a65;
    font-family: 'DM Mono', monospace;
  }
`;

export default function AnalyticsPage({ currentUser }) {
  const [analytics, setAnalytics] = useState(null);

  const userId = currentUser?.userId || 1;

  // Connect to SSE stream — backend sends current stats on connect,
  // then pushes live updates whenever a swipe is recorded
  useEffect(() => {
    const eventSource = new EventSource(`${BASE_URL}/analytics/${userId}/stream`);

    eventSource.onmessage = (e) => {
      setAnalytics(JSON.parse(e.data));
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [userId]);

  // Calculate total swipes
  const totalSwipes = analytics
    ? analytics.rightSwipes + analytics.leftSwipes
    : 0;

  // Check for user interactions
    const hasInteractions = analytics
    ? analytics.rightSwipes > 0 || analytics.leftSwipes > 0 || analytics.matches > 0
    : false;

  // Calculate percentages for right and left swipes
    const rightPct =
    totalSwipes === 0
      ? 0
      : Math.round((analytics.rightSwipes / totalSwipes) * 100);

  const leftPct = totalSwipes === 0 ? 0 : 100 - rightPct;

  // Calculate match rate
  const matchRate =
    analytics?.rightSwipes > 0
      ? Math.round((analytics.matches / analytics.rightSwipes) * 100)
      : 0;

  return (
    <>
      <style>{styles}</style>
      <div className="analytics-page">
        <div className="analytics-header">
          <h1>Profile analytics</h1>
          <p>User #{userId}</p>
        </div>

        {/* Metric summary cards */}
        {!analytics ? (
          <div className="analytics-loading">Loading analytics…</div>
        ) : !hasInteractions ? (
          <div className="analytics-empty">
            <div className="empty-icon">◎</div>
            <p>This user has no interactions yet</p>
          </div>
        ) : (
          <>
            <div className="analytics-cards">
              <div className="analytics-card">
                <p className="card-label">Total swipes</p>
                <p className="card-value">{totalSwipes}</p>
                <p className="card-sub">all time</p>
              </div>
              <div className="analytics-card green">
                <p className="card-label">Right swipes</p>
                <p className="card-value">{analytics.rightSwipes}</p>
                <p className="card-sub">{rightPct}% of total</p>
              </div>
              <div className="analytics-card red">
                <p className="card-label">Left swipes</p>
                <p className="card-value">{analytics.leftSwipes}</p>
                <p className="card-sub">{leftPct}% of total</p>
              </div>
              <div className="analytics-card gold">
                <p className="card-label">Matches</p>
                <p className="card-value">{analytics.matches}</p>
                <p className="card-sub">{matchRate}% match rate</p>
              </div>
            </div>

            {/* Swipe breakdown progress bars */}
            <div className="analytics-section">
              <p className="section-title">Swipe breakdown</p>
              <div className="bar-row">
                <div className="bar-label">
                  <span className="bar-name">Right swipes</span>
                  <span className="bar-stat">{analytics.rightSwipes} · {rightPct}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill green" style={{ width: `${rightPct}%` }} />
                </div>
              </div>
              <div className="bar-row">
                <div className="bar-label">
                  <span className="bar-name">Left swipes</span>
                  <span className="bar-stat">{analytics.leftSwipes} · {leftPct}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill red" style={{ width: `${leftPct}%` }} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

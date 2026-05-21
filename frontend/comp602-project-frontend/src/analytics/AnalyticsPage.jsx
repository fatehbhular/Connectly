import { useEffect, useState } from "react";

export default function AnalyticsPage({ currentUser }) {
  // Stores analytics data loaded from the backend
  const [analytics, setAnalytics] = useState(null);

  // Uses logged-in user id where available
  const userId = currentUser?.userId || 1;

  // Fetch analytics data when the page loads
  useEffect(() => {
    fetch(`http://localhost:8080/analytics/${userId}`)
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((error) => console.error("Error loading analytics:", error));
  }, [userId]);

  // Display loading message while waiting for backend response
  if (!analytics) {
    return <p>Loading analytics...</p>;
  }

  const totalSwipes = analytics.rightSwipes + analytics.leftSwipes;

  // Checks to see if user has any interactions
  const hasInteractions =
    analytics.rightSwipes > 0 ||
    analytics.leftSwipes > 0 ||
    analytics.matches > 0;

  const rightSwipePercent =
    totalSwipes === 0
      ? 0
      : Math.round((analytics.rightSwipes / totalSwipes) * 100);

  const leftSwipePercent =
    totalSwipes === 0
      ? 0
      : Math.round((analytics.leftSwipes / totalSwipes) * 100);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Profile Analytics</h1>

      {!hasInteractions ? (
        <p>This user has no interactions</p>
      ) : (
        <div>
          <p>
            <strong>Total Swipes:</strong> {totalSwipes}
          </p>

          <p>
            <strong>Right Swipes:</strong> {analytics.rightSwipes}
          </p>

          <p>
            <strong>Left Swipes:</strong> {analytics.leftSwipes}
          </p>

          <p>
            <strong>Matches:</strong> {analytics.matches}
          </p>

          <p>
            <strong>Right Swipe Rate:</strong> {rightSwipePercent}%
          </p>

          <h3>Swipe Activity</h3>

          <p>Right Swipes</p>
          <div style={{ background: "#eee", width: "100%", height: "20px" }}>
            <div
              style={{
                background: "#4caf50",
                width: `${rightSwipePercent}%`,
                height: "20px"
              }}
            />
          </div>

          <p>Left Swipes</p>
          <div style={{ background: "#eee", width: "100%", height: "20px" }}>
            <div
              style={{
                background: "#f44336",
                width: `${leftSwipePercent}%`,
                height: "20px"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
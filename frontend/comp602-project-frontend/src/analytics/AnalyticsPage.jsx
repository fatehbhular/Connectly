import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  // Stores analytics data loaded from the backend
  const [analytics, setAnalytics] = useState(null);

  // Temporary user id used for testing backend integration
  const userId = 1;

  // Fetch analytics data when the page loads
  useEffect(() => {
    fetch(`http://localhost:8080/analytics/${userId}`)
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((error) => console.error("Error loading analytics:", error));
  }, []);

  // Display loading message while waiting for backend response
  if (!analytics) {
    return <p>Loading analytics...</p>;
  }

  // Checks to see if user has any interactions
  const hasInteractions =
    analytics.views > 0 ||
    analytics.likes > 0 ||
    analytics.matches > 0;

  return (
    <div style={{ padding: "20px" }}>
      {/* Page title */}
      <h1>Profile Analytics</h1>

      {/* Display message for no interactions */}
      {!hasInteractions ? (
        <p>This user has no interactions</p>
      ) : (
        /* Display analytics stats */
        <div>
          <p>
            <strong>Profile Views:</strong> {analytics.views}
          </p>

          <p>
            <strong>Likes:</strong> {analytics.likes}
          </p>

          <p>
            <strong>Successful Matches:</strong> {analytics.matches}
          </p>
        </div>
      )}
    </div>
  );
}
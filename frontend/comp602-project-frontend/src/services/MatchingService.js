export const getRankedUsers = (lat, lng) =>
  fetch(`${BASE_URL}/matching/nearby?lat=${lat}&lng=${lng}`);
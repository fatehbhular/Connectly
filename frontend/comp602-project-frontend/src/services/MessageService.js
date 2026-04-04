export const getDMList = () =>
  fetch(`${BASE_URL}/messaging/dms`);

export const getConversation = (key) =>
  fetch(`${BASE_URL}/messaging/conversation/${key}`);
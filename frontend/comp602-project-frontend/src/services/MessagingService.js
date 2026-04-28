const BASE_URL = 'localhost:5173';

export const getDMList = (userId) =>
    fetch(`${BASE_URL}/messaging/dms`, {
        headers: {'userId': userId}
    });

export const getConversation = (key, userId) => 
    fetch(`${BASE_URL}/messaging/conversation/${key}`, {
        headers: {'userId': userId}
    });

export const sendMessage = (userId, payload) => 
    fetch(`${BASE_URL}/messaging/send`, {
        method: 'POST',
        headers: { 'userId': userId, 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
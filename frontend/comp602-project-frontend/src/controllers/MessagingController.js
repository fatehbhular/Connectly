import * as MessagingService from '../services/MessagingService';

export const loadDMs = async (userId) => {
    const response = await MessagingService.getDMList(userId);
    return response.json();
};

export const loadConversation = async (key, userId) => {
    const response = await MessagingService.getConversation(key, userId);
    return response.json();
};

export const sendMessage = async (userId, recipientId, content, timestamp) => {
    const payload = { recipientId, content, timestamp };
    const response = await MessagingService.sendMessage(userId, payload);
    return response.json();
};
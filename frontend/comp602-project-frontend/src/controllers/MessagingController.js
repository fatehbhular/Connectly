import * as MessagingService from '../services/MessagingService';

/**
 * Controller layer for messaging feature.
 * 
 * Sits between the UI (MessagingPage) and the service layer (MessagingService).
 * Responsible for calling the correct service method and parsing HTTP response.
 * - No business logic here
 * - No direct fetch calls here -> belongs in MessagingService
 */


/**
 * Loads all conversation key for the signed-in user.
 * 
 * @param {number} userId -> ID of the signed-in user
 * @returns {Promise<string[]>} -> array of conversation key strings
 */
export const loadDMs = async (userId) => {
    const response = await MessagingService.getDMList(userId);
    return response.json();
};

/**
 * Loads all messages belonging to specific conversation.
 * 
 * @param {string} key -> conversation key identifying the conversation
 * @param {number} userId -> ID of the signed-in user (used for authorisation - check on backend) 
 * @returns {Promise<Message[]>} -> array of message objects
 */
export const loadConversation = async (key, userId) => {
    const response = await MessagingService.getConversation(key, userId);
    return response.json();
};

/**
 * Sends a message to a recipient.
 * 
 * Constructs the payload and delegates to MessagingService.
 * Throws error if backend returns not-OK response.
 * 
 * @param {number} userId -> ID of the signed-in user sending the message
 * @param {number} recipientId -> ID of the user receiving the message
 * @param {string} content -> text content of the message
 * @param {number} timestamp -> Unix timestamp in milliseconds (Date.now())
 * @throws {Error} if the backend returns a non-OK response
 * @returns 
 */
export const sendMessage = async (userId, recipientId, content, timestamp) => {
    const payload = { recipientId, content, timestamp };
    const response = await MessagingService.sendMessage(userId, payload);
    if (!response.ok) throw new Error('Error: Failed to send message.');
    return;
};
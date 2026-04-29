/**
 * Service layer for the messaging feature.
 * 
 * Responsible for all raw HTTP fetch calls to the SpringBoot backend.
 * - No business logic here
 * - No response parsing -> belongs in Controller layer
 * - Returns raw fetch Promises for Controller to handle
 */

const BASE_URL = 'http://localhost:8080';

/**
 * Fetches all conversation keys for the given user
 * 
 * Passes userId as request header so backedn can identify who is asking.
 * 
 * @param {number} userId -> ID of signed-in user
 * @returns {Promise<Response>} raw fetch response
 */
export const getDMList = (userId) =>
    fetch(`${BASE_URL}/messaging/dms`, {
        headers: {'userId': userId}
    });

/**
 * Fetches all messages belonging to a specific conversation.
 * 
 * Passes the conversation key in the URl path and userId in the 
 * header so the backedn can verify the user is a member of the conversation.
 * 
 * @param {string} key -> conversation key identifying the conversation
 * @param {number} userId -> ID of the signed-in user
 * @returns {Promise<Response>} raw fetch response
 */
export const getConversation = (key, userId) => 
    fetch(`${BASE_URL}/messaging/conversation/${key}`, {
        headers: {'userId': userId}
    });

/**
 * Sends a message to the backend.
 * 
 * Passes senderId in the header and the message payload in the request body as JSON.
 * Payload contains -> recipientId, content, and timestamp.
 * 
 * @param {number} userId -> ID of the user sending the message
 * @param {object} payload -> message data ({ recipientId, content, timestamp })
 * @returns {Promise<Response>} raw fetch response
 */
export const sendMessage = (userId, payload) => 
    fetch(`${BASE_URL}/messaging/send`, {
        method: 'POST',
        headers: { 'userId': userId, 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
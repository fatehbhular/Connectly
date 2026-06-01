/**
 * Service layer for the messaging feature.
 *
 * Responsible for all HTTP fetch calls to the Spring Boot backend.
 * Handles response parsing and error throwing.
 * - No business logic here
 * - Returns parsed data directly (not raw fetch Promises)
 */

import BASE_URL from '../config.js';

/**
 * Fetches all conversation keys for the signed-in user.
 *
 * Passes userId as a request header so the backend can identify who is asking.
 *
 * @param {number} userId -> ID of the signed-in user
 * @returns {Promise<string[]>} array of conversation key strings
 */
export const getDMList = async (userId) => {
    const response = await fetch(`${BASE_URL}/messaging/dms`, {
        headers: { 'userId': userId }
    });
    if (!response.ok) throw new Error('Failed to load DMs');
    return response.json();
};

/**
 * Fetches all messages belonging to a specific conversation.
 *
 * Passes the conversation key in the URL path and userId in the header
 * so the backend can verify the user is a member of the conversation.
 *
 * @param {string} key -> conversation key identifying the conversation
 * @param {number} userId -> ID of the signed-in user (used for authorisation check on backend)
 * @returns {Promise<Message[]>} array of message objects
 */
export async function getConversation(conversationKey, userId) {
    const res = await fetch(`${BASE_URL}/messaging/conversation/${conversationKey}`, {
        headers: { 'userId': userId }
    });
    if (!res.ok) {
        const err = new Error('Failed to load conversation');
        err.status = res.status;                                            // attach status so callers can detect kicks (400)
        throw err;
    }
    return res.json();
}
/**
 * Sends a message to a recipient.
 *
 * Passes senderId in the header and the message payload in the request body as JSON.
 * Constructs payload from individual parameters before sending.
 *
 * @param {number} userId -> ID of the signed-in user sending the message
 * @param {number} recipientId -> ID of the user receiving the message
 * @param {string} content -> text content of the message
 * @param {number} timestamp -> Unix timestamp in milliseconds (Date.now())
 * @throws {Error} if the backend returns a non-OK response
 */
export const sendMessage = async (userId, recipientId, content, timestamp) => {
    const response = await fetch(`${BASE_URL}/messaging/send`, {
        method: 'POST',
        headers: { 'userId': userId, 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId, content, timestamp })
    });
    if (!response.ok) throw new Error('Failed to send message');
};

/**
 * Fetches the display name of a user by their ID.
 *
 * Backend returns a plain string, not JSON.
 *
 * @param {number} userId -> ID of the user to look up
 * @returns {Promise<string>} the user's display name
 */
export const getDisplayName = async (userId) => {
    const response = await fetch(`${BASE_URL}/users/selectedUserDisplayName?id=${userId}`);
    if (!response.ok) throw new Error(`Failed to fetch display name for user ${userId}`);
    return response.text();
};

export const getLastMessage = async (conversationKey, userId) => {
    const response = await fetch(`${BASE_URL}/messaging/lastMessage/${conversationKey}`, {
        headers: { 'userId': userId }
    });
    if (!response.ok) throw new Error('Failed to fetch last message');
    return response.json();
};



export async function createGroup(name, memberIds) {                        // creates a new group and returns the saved group object
    const res = await fetch(`${BASE_URL}/groups/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, memberIds })
    });
    return res.json();
}
 
export async function getGroupName(groupId) {                               // returns the display name of a group
    const res = await fetch(`${BASE_URL}/groups/${groupId}/name`);
    return res.text();
}
 
export async function getGroupMembers(groupId) {                            // returns the list of member user IDs in a group
    const res = await fetch(`${BASE_URL}/groups/${groupId}/members`);
    return res.json();
}

export async function getGroupCreatedAt(groupId) {                            // epoch ms when the group was created
    const res = await fetch(`${BASE_URL}/groups/${groupId}/createdAt`);
    if (!res.ok) throw new Error('Failed to fetch group createdAt');
    return res.json();
}
 
export async function addGroupMember(groupId, userId) {                     // adds a user to an existing group
    await fetch(`${BASE_URL}/groups/${groupId}/addMember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
}
 
export async function sendGroupMessage(userId, groupId, content, timestamp) { // sends a message to a group conversation
    await fetch(`${BASE_URL}/messaging/send-group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'userId': userId },
        body: JSON.stringify({ groupId, content, timestamp })
    });
}

export async function removeGroupMember(groupId, userId) {                  // removes a member from a group
    await fetch(`${BASE_URL}/groups/${groupId}/removeMember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
}
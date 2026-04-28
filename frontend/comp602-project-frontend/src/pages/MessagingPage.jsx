import {useState, useEffect} from 'react';
import * as MessagingController from '../controllers/MessagingController';

/**
 * The MAIN PAGE of Connectly's messaging feature.
 * 
 * Renders the DM list. When a conversation is selected, the messages with that conversationKey will also load.
 * 
 * @returns the page of all conversations and the selected conversation's messages.
 */
export default function MessagingPage() {
    /** The List of all DMs for the logged-in user */
    const [dms, setDMs] = useState([]);
    /** The messages in the currently selected conversation */
    const [conversation, setConversation] = useState(null);
    // TODO: Find out how to retrieve current logged in user's ID.
    const [userId, setUserId] = useState();
    /** The key of the conversation the user clicked on */
    const [selectedKey, setSelectedKey] = useState(null);
    /** The state of the message the user wants to send */
    const [newMessage, setNewMessage] = useState('');
    /** The user Id of the recipient (needed when sending a message) */
    const [recipientId, setRecipientId] = useState('');

    useEffect(() => {
        const loadDMs = async () => {
            try {
                const data = await MessagingController.loadDMs(userId);
                setDMs(data);
            } catch (error) {
                console.log('Failed to load DMs: ', error);
            }
        };
        loadDMs();
    }, []);

    useEffect(() => {
        const loadConversation = async () => {
            if (selectedKey) {
                try {
                    const data = await MessagingController.loadConversation(selectedKey, userId);
                    setConversation(data);
                } catch (error) {
                    console.log('Failed to load conversation: ', error);
                }
            }
        };
        loadConversation();
    }, [selectedKey, userId]);

    const handleSendMessage = async () => {
        if (newMessage.trim() && recipientId) {
            try {
                await MessagingController.sendMessage(userId, recipientId, newMessage, Date.now());
                setNewMessage('');
                if (conversation) {
                    const updated = await MessagingController.loadConversation(selectedKey, userId);
                    setConversation(updated);
                }
            } catch (error) {
                console.log('Failed to send message: ', error);
            }
        }
    };

    const handleSelectDM = (key) => {
        setSelectedKey(key);
    }

    return (
        <div className="main-container">
            <div className="container-1">
                <h1>Messages</h1>
                <div className="dms-display">
                    {dms.length === 0 ? (
                        <p>No direct messages yet!</p>
                    ) : (
                        dms.map((dm, index) => (
                            <div className="mapping-of-dms" key={index} onClick={() => handleSelectDM(dm)}>
                                <strong>{dm}</strong>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="container-2">
                <h2>Conversation</h2>
                {conversation ? (
                    <div className="conversation-display">
                        <div>
                            {conversation.map((message, index) => (
                                <div key={index}>
                                    <strong>{message.senderId === userId ? 'You' : message.senderId}</strong> : {message.content}
                                </div>
                            ))}
                        </div>
                        <div>
                            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message.."/>
                            <button onClick={handleSendMessage}>Send</button>
                        </div>
                    </div>
                ) : (
                    <p>Select a conversation to start messaging!</p>
                )}
            </div>
        </div>
    );
}
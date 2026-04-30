import {useState, useEffect, useRef} from 'react';
import * as MessagingController from '../controllers/MessagingController';
import '../styles/MessagingPage.css'


/**
 * The MAIN PAGE of Connectly's messaging feature.
 * 
 * Renders the DM list. When a conversation is selected, the messages with that conversationKey will also load.
 * 
 * @returns the page of all conversations and the selected conversation's messages.
 */
export default function MessagingPage({currentUser}) {
    /** The List of all DMs for the logged-in user */
    const [dms, setDMs] = useState([]);
    /** The messages in the currently selected conversation */
    const [conversation, setConversation] = useState([]);
    /** The key of the conversation the user clicked on */
    const [selectedKey, setSelectedKey] = useState(null);
    /** The state of the message the user wants to send */
    const [newMessage, setNewMessage] = useState('');
    /** The user Id of the recipient (needed when sending a message) */
    const [recipientId, setRecipientId] = useState('');
    /** The user Id of the signed-in user (active user) */
    const [userId, setUserId] = useState(currentUser.userId);
    /** The name of the other members of the chat (excluding the active user) */
    const [conversationName, setConversationName] = useState(null);
    /** The name that will display on each of the user's DMs */
    const [dmNames, setDmNames] = useState({});

    const messagesEndRef = useRef(null);
    const shouldScroll = useRef(false);

    /**
     * Loads the DM list whenever the signed-in userId is available.
     * 
     * Flow:
     * 1. Guard: Skip if userId is not loaded
     * 2. Fetch all conversation keys for the signed-in user
     * 3. For each key, retrieve the other person's ID and fetch their display name
     * 4. Store the key -> display name mapping in dmNames for rendering the list of DMs
     */
    useEffect(() => {
        const loadDMs = async () => {
            if (!userId) return; /** Guard -> Wait for userId to be set */
            console.log('Loading DMs for userId: ' + userId);
            try {
                const data = await MessagingController.loadDMs(userId);
                setDMs(data);

                /** Builds a lookup map: conversationKey -> recipient displayName */
                const names = {};
                for (const key of data) {
                    const otherUserId = key.split('_').find(id => parseInt(id) !== userId);
                    const name = await MessagingController.getDisplayName(otherUserId);
                    names[key] = name;
                }
                setDmNames(names);

            } catch (error) {
                console.log('Failed to load DMs: ', error);
            }
        };
        loadDMs();
    }, [userId]); /** re-runs when userId is set */

    /**
     * Loads the messages in the selected conversation whenever the conversation key changes.
     * 
     * Skips the fetch if no conversation has been selected yet (null).
     * Re-runs whenever the user clicks on a different DM or userId changes.
     */
    useEffect(() => {
        const loadConversation = async () => {
            if (selectedKey) { /** This is a GUARD -> don't fetch if no conversation is selected. */
                try {
                    const data = await MessagingController.loadConversation(selectedKey, userId);
                    setConversation(data);
                } catch (error) {
                    console.log('Failed to load conversation: ', error);
                }
            }
        };
        loadConversation();
    }, [selectedKey, userId]); /** Re-runs when different conversation is selected. */

    /**
     * Handles clicking a DM in the left panel (DM List panel).
     * 
     * Flow:
     * 1. Sets the selected conversaiton key -> triggers loadConversation useEffect
     * 2. Retrieves recipient's ID from conversationKey, and stores it for sending messages
     * 3. Fetches and sets recipient's display name for conversation header
     * 
     * @param {string} key -> conversation key of the DM clicked.
     */
    const handleSelectDM = async (key) => {
        shouldScroll.current = true;
        setSelectedKey(key);
        /** Get recipientId from the conversation key (exclude signed-in user's ID) */
        const otherUserId = key.split('_').find(id => parseInt(id) !== userId);
        setRecipientId(otherUserId);

        /** Fetch display name of other user for the header */
        try {
            const name = await MessagingController.getDisplayName(otherUserId);
            setConversationName(name);
            console.log(conversationName);
        } catch (error) {
            console.log('Failed to load conversation name: ', error);
        }
    }

    /**
     * Polls the selected conversation every 3 seconds to show new messages.
     * 
     * TODO: Replace with WebSockets in sprint 2 for true real-time messaging.
     * 
     * Cleanup: clears the interval when the selected conversation changes, or component unmounts -> prevents multiple intervals stacking.
     */
    useEffect(() => {
        if (!selectedKey) return; // Guard: don't poll if no conversation selected
    
        const interval = setInterval(async () => {
            try {
                const updated = await MessagingController.loadConversation(selectedKey, userId);
                setConversation(updated);
            } catch (error) {
                console.log('Failed to poll conversation: ', error);
            }
        }, 500);
    
        return () => clearInterval(interval); // cleanup when conversation changes or unmounts
    }, [selectedKey, userId]);

    /**
     * Sends a new message and refreshes the conversation display.
     * 
     * Guards ->
     * 1. Empty or whitespace-only messages
     * 2. Sending without a recipient selected
     * 
     * After successful send, it clears the input and re-fetches the conversation -> new messages appear without waiting for next poll cycle.
     */
    const handleSendMessage = async () => {
        if (newMessage.trim() && recipientId) {
            shouldScroll.current = true;
            try {
                await MessagingController.sendMessage(userId, recipientId, newMessage, Date.now());
                setNewMessage(''); /** Clears the input after successful send. */
                if (conversation) {
                    /** Re-fetches immediately so sent message appears without need to poll. */
                    const updated = await MessagingController.loadConversation(selectedKey, userId);
                    setConversation(updated);
                }
            } catch (error) {
                console.log('Failed to send message: ', error);
            }
        }
    };

     useEffect(() => {
        if (!shouldScroll.current) return;
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
            shouldScroll.current = false;   // reset after scrolling
        }, 100);
    }, [conversation]);

    return (
        <div className="main-container">
            {/** LEFT PANEL - DM List */}
            <div className="container-1">
                <h1 className="container-1-title">Messages</h1>
                <div className="dms-display">
                    {dms.length === 0 ? (
                        /** Empty state -> when no conversations */
                        <p>No direct messages yet!</p>
                    ) : (
                        /** Render each DM as clickable row showing recipient's display name. */
                        dms.map((dm, index) => (
                            <div className="mapping-of-dms" key={index} onClick={() => handleSelectDM(dm)}>
                                <strong>{dmNames[dm] || dm}</strong> {/** Fallback incase name is not loaded. */}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/** RIGHT PANEL - selected conversation + message input */}
            <div className="container-2">
                {/** Header: shows display name of person you're chatting with */}
                <h2 className="conversation-title">{conversationName}</h2>
                {conversation.length > 0 ? (
                    <div className="conversation-display">
                        {/** Scrollable message list */}
                        <div className="messages-list">
                            {conversation.map((message, index) => (
                                <div className={`message-bubble ${message.senderId === userId ? 'message-sent' : 'message-received'}`} key={index}>
                                {/** Show "You" for sent messages, senderId for received */}
                                <strong>{message.senderId === userId ? 'You' : message.senderId}</strong> : {message.content}
                            </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        {/** Message insert bar -> fixed at bottom of conversation panel */}
                        <div className="message-input-bar">
                            <input className="message-input" type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message.."/>
                            <button className="send-button" onClick={handleSendMessage}>Send</button>
                        </div>
                    </div>
                ) : (
                    /** Shown when no conversation is selected */
                    <p>Select a conversation to start messaging!</p>
                )}
            </div>
        </div>
    );
}
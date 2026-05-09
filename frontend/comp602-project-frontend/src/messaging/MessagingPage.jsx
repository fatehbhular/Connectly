import { useState, useEffect } from 'react';
import * as MessagingService from '../services/MessagingService';
import DMListUI from './DMListUI';
import DMPage from './DMPage';

export default function MessagingPage({currentUser, onDMOpen}) {
    const [dms, setDMs] = useState([]);
    const [conversation, setConversation] = useState([]);
    const [selectedKey, setSelectedKey] = useState(null);
    const [recipientId, setRecipientId] = useState('');
    const [userId] = useState(currentUser.userId);
    const [conversationName, setConversationName] = useState(null);
    const [dmNames, setDmNames] = useState ({});
    const [namesLoaded, setNamesLoaded] = useState(false);
    const [lastMessages, setLastMessages] = useState({});

    useEffect(() => {
        const loadDMs = async () => {
            if (!userId) return;
            console.log('userId: ', userId);
            try {
                const data = await MessagingService.getDMList(userId);
                setDMs(data);

                /** Builds a lookup map: conversationKey -> recipient displayName */
                const names = {};
                await Promise.all(
                    data.map(async (key) => {
                        const otherUserId = key.split('_').find(id => parseInt(id) !== userId);
                        const name = await MessagingService.getDisplayName(otherUserId);
                        names[key] = name;
                    })
                );

                setDmNames(names);

                const lastMsgs = {};
                await Promise.all(
                    data.map(async (key) => {
                        try {
                            const lastMessage = await MessagingService.getLastMessage(key, userId);
                            lastMsgs[key] = lastMessage;
                        } catch (error) {
                            console.log('Failed to fetch last message for', key, ':', error);
                        }
                    })
                );
                console.log('lastMessages:', lastMsgs);
                setLastMessages(lastMsgs);

                setNamesLoaded(true);
            } catch (error) {
                console.log('Failed to load DMs: ', error);
            }
        };
        loadDMs();
    }, [userId]);

    useEffect(() => {
        const loadConversation = async () => {
            if (selectedKey) {
                try {
                    const data = await MessagingService.getConversation(selectedKey, userId);
                    console.log('conversation loaded:', data);
                    setConversation(data);
                } catch (error) {
                    console.log('Failed to load conversation: ', error);
                }
            }
        };
        loadConversation();
    }, [selectedKey, userId]);

    useEffect(() => {
        if (!selectedKey) return;
        const interval = setInterval(async () => {
            try {
                const updated = await MessagingService.getConversation(selectedKey, userId);
                setConversation(updated);
            } catch (error) {
                console.log('Failed to poll conversation ', error);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [selectedKey, userId]);

    const handleSelectDM = async (key) => {
        setSelectedKey(key);
        onDMOpen(true);
        const otherUserId = key.split('_').find(id => parseInt(id) !== userId);
        setRecipientId(otherUserId);
        try {
            const name = await MessagingService.getDisplayName(otherUserId);
            setConversationName(name);
        } catch (error) {
            console.log('Failed to load conversation name: ', error);
        }
    };

    const handleSendMessage = async (content) => {
        try {
            await MessagingService.sendMessage(userId, recipientId, content, Date.now());
            const updated = await MessagingService.getConversation(selectedKey, userId);
            setConversation(updated);
        } catch (error) {
            console.log('Failed to send message: ', error);
        }
    };

    /**
     * Handles going back to the DM list
     */
    const handleBack = () => {
        setSelectedKey(null);
        setConversation([]);
        setConversationName(null);
        onDMOpen(false);
    }

    /** Show conversation screen if a DM is selected */
    if (selectedKey) {
        return (
            <DMPage 
                conversation={conversation}
                conversationName={conversationName}
                userId={userId}
                dmNames={dmNames}
                selectedKey={selectedKey}
                onSendMessage={handleSendMessage}
                onBack={handleBack}
            />
        );
    }

    return (
        <DMListUI
            dms={dms}
            dmNames={dmNames}
            namesLoaded={namesLoaded}
            onSelectDM={handleSelectDM}
            lastMessages={lastMessages}
            userId={userId}
        />
    );
}
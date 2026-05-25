import { useState, useEffect } from 'react';
import * as MessagingService from '../services/MessagingService';
import DMListUI from './DMListUI';
import DMPage from './DMPage';
import BASE_URL from '../config.js';

export default function MessagingPage({currentUser, onDMOpen, sendSignal, onRecipientChange, startCall, endCall}) {
    const [dms, setDMs] = useState([]);
    const [conversation, setConversation] = useState([]);
    const [selectedKey, setSelectedKey] = useState(null);
    const [recipientId, setRecipientId] = useState('');
    const [userId] = useState(currentUser.userId);
    const [conversationName, setConversationName] = useState(null);
    const [dmNames, setDmNames] = useState({});
    const [namesLoaded, setNamesLoaded] = useState(false);
    const [lastMessages, setLastMessages] = useState({});

    // New Group modal state
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [connectionNames, setConnectionNames] = useState({});             // connection id -> display name
    const [senderNamesMap, setSenderNamesMap] = useState({});

    // Add Member modal state
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [currentGroupMembers, setCurrentGroupMembers] = useState([]);

    const [freshConnectionKeys, setFreshConnectionKeys] = useState([]);

    // Load connection display names when the new group modal opens
    useEffect(() => {
        if (!showGroupModal) return;
        const load = async () => {
            const res = await fetch(`${BASE_URL}/users/connections`, {
                headers: { 'userId': userId }
            });
            const connectionKeys = await res.json();
            const names = {};
            await Promise.all(
                connectionKeys.map(async (id) => {
                    names[id] = await MessagingService.getDisplayName(id);
                })
            );
            setConnectionNames(names);
            setFreshConnectionKeys(connectionKeys);         // new state instead of freshConnectionKeys
        };
        load();
    }, [showGroupModal]);

    // Load current group members when the add member modal opens
    useEffect(() => {
        if (!showAddMemberModal || !selectedKey?.startsWith('group_')) return;
        const groupId = selectedKey.split('_')[1];
        MessagingService.getGroupMembers(groupId).then(setCurrentGroupMembers).catch(console.log);
        if (!freshConnectionKeys?.length) return;
        const load = async () => {
            const names = {};
            await Promise.all(
                freshConnectionKeys.map(async (id) => {
                    names[id] = await MessagingService.getDisplayName(id);
                })
            );
            setConnectionNames(names);
        };
        if (!Object.keys(connectionNames).length) load();
    }, [showAddMemberModal]);

    const loadDMs = async () => {
        if (!userId) return;
        try {
            const data = await MessagingService.getDMList(userId);
            setDMs(data);

            const names = {};
            await Promise.all(
                data.map(async (key) => {
                    if (key.startsWith('group_')) {
                        const groupId = key.split('_')[1];
                        names[key] = await MessagingService.getGroupName(groupId);
                    } else {
                        const otherUserId = key.split('_').find(id => parseInt(id) !== userId);
                        names[key] = await MessagingService.getDisplayName(otherUserId);
                    }
                })
            );
            setDmNames(names);

            const lastMsgs = {};
            await Promise.all(
                data.map(async (key) => {
                    try {
                        lastMsgs[key] = await MessagingService.getLastMessage(key, userId);
                    } catch (error) {
                        console.log('Failed to fetch last message for', key, ':', error);
                    }
                })
            );
            setLastMessages(lastMsgs);
            setNamesLoaded(true);
        } catch (error) {
            console.log('Failed to load DMs: ', error);
        }
    };

    useEffect(() => { loadDMs(); }, [userId]);

    useEffect(() => {
        const loadConversation = async () => {
            if (selectedKey) {
                try {
                    const data = await MessagingService.getConversation(selectedKey, userId);
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

        if (key.startsWith('group_')) {                                     // group — no single recipient
            const groupId = key.split('_')[1];
            const name = await MessagingService.getGroupName(groupId);
            setConversationName(name);
            setRecipientId(null);
            const memberIds = await MessagingService.getGroupMembers(groupId);
            const names = {};
            await Promise.all(memberIds.map(async (id) => {
                names[id] = await MessagingService.getDisplayName(id);
            }));
            setSenderNamesMap(names);
        } else {
            const otherUserId = key.split('_').find(id => parseInt(id) !== userId);
            setRecipientId(otherUserId);
            onRecipientChange(otherUserId);
            const name = await MessagingService.getDisplayName(otherUserId);
            setConversationName(name);
        }
    };

    const handleSendMessage = async (content) => {
        try {
            if (selectedKey.startsWith('group_')) {
                const groupId = parseInt(selectedKey.split('_')[1]);
                await MessagingService.sendGroupMessage(userId, groupId, content, Date.now());
            } else {
                await MessagingService.sendMessage(userId, recipientId, content, Date.now());
            }
            const updated = await MessagingService.getConversation(selectedKey, userId);
            setConversation(updated);
        } catch (error) {
            console.log('Failed to send message: ', error);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedMembers.length === 0) return;
        try {
            const memberIds = [userId, ...selectedMembers];
            await MessagingService.createGroup(groupName.trim(), memberIds);
            setShowGroupModal(false);
            setGroupName('');
            setSelectedMembers([]);
            await loadDMs();
        } catch (error) {
            console.log('Failed to create group: ', error);
        }
    };

    const handleAddMember = async (memberId) => {
        if (!selectedKey?.startsWith('group_')) return;
        const groupId = selectedKey.split('_')[1];
        try {
            await MessagingService.addGroupMember(groupId, memberId);
            setCurrentGroupMembers(prev => [...prev, memberId]);
        } catch (error) {
            console.log('Failed to add member: ', error);
        }
    };

    const handleBack = () => {
        setSelectedKey(null);
        setConversation([]);
        setConversationName(null);
        onDMOpen(false);
    };

    const isGroupConversation = selectedKey?.startsWith('group_');

    if (selectedKey) {
        return (
            <>
                <DMPage
                    conversation={conversation}
                    conversationName={conversationName}
                    userId={userId}
                    dmNames={dmNames}
                    selectedKey={selectedKey}
                    onSendMessage={handleSendMessage}
                    onBack={handleBack}
                    sendSignal={sendSignal}
                    recipientId={recipientId}
                    startCall={startCall}
                    endCall={endCall}
                    isGroup={isGroupConversation}
                    onAddMember={() => setShowAddMemberModal(true)}
                    senderNamesMap={senderNamesMap}
                />

                {/* Add Member modal */}
                {showAddMemberModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(0,0,0,0.4)' }}>
                        <div style={{ width: '100%', maxWidth: '360px', background: 'white', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <p>Add a member</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                                {freshConnectionKeys?.filter(id => !currentGroupMembers.includes(id)).length === 0 ? (
                                    <p>All your connections are already in this group.</p>
                                ) : (
                                    freshConnectionKeys
                                        ?.filter(id => !currentGroupMembers.includes(id))
                                        .map(id => (
                                            <button
                                                key={id}
                                                style={{ textAlign: 'left', padding: '10px 12px' }}
                                                onClick={() => handleAddMember(id)}
                                            >
                                                {connectionNames[id] || `User ${id}`}
                                            </button>
                                        ))
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{ flex: 1, padding: '12px' }} onClick={() => setShowAddMemberModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            <DMListUI
                dms={dms}
                dmNames={dmNames}
                namesLoaded={namesLoaded}
                onSelectDM={handleSelectDM}
                lastMessages={lastMessages}
                userId={userId}
                onNewGroup={() => setShowGroupModal(true)}
            />

            {/* New Group modal */}
            {showGroupModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(0,0,0,0.4)' }}>
                    <div style={{ width: '100%', maxWidth: '360px', background: 'white', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p>New Group</p>
                        <input
                            type="text"
                            placeholder="Group name"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            style={{ width: '100%', padding: '12px', boxSizing: 'border-box' }}
                        />
                        <p>Select connections to add:</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                            {!freshConnectionKeys?.length ? (
                                <p>You have no connections yet.</p>
                            ) : (
                                freshConnectionKeys.map(id => {
                                    const selected = selectedMembers.includes(id);
                                    return (
                                        <button
                                            key={id}
                                            style={{ textAlign: 'left', padding: '10px 12px', background: selected ? '#eee' : 'transparent' }}
                                            onClick={() => setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])}
                                        >
                                            {selected ? '✓ ' : ''}{connectionNames[id] || `User ${id}`}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ flex: 1, padding: '12px' }} onClick={() => { setShowGroupModal(false); setGroupName(''); setSelectedMembers([]); }}>Cancel</button>
                            <button style={{ flex: 1, padding: '12px' }} onClick={handleCreateGroup}>Create</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
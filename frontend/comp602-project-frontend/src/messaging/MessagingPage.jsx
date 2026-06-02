import { useState, useEffect, useRef } from 'react';
import * as MessagingService from '../services/MessagingService';
import DMListUI from './DMListUI';
import DMPage from './DMPage';
import BASE_URL from '../config.js';
import { motion } from 'framer-motion';

export default function MessagingPage({currentUser, onDMOpen, sendSignal, onRecipientChange, startCall, endCall}) {
    const [dms, setDMs] = useState([]);
    const [conversation, setConversation] = useState([]);
    const [selectedKey, setSelectedKey] = useState(null);
    const [recipientId, setRecipientId] = useState('');
    const [userId] = useState(currentUser.userId);
    const [conversationName, setConversationName] = useState(null);
    const [dmNames, setDmNames] = useState({});
    const [namesLoaded, setNamesLoaded] = useState(false);
    const [conversationLoading, setConversationLoading] = useState(false);
    const [lastMessages, setLastMessages] = useState({});

    // Unread tracking — seenTimestamps stores the last timestamp the user saw per conversation
    const [seenTimestamps, setSeenTimestamps] = useState(() => {
        try {
            const saved = localStorage.getItem(`seenTimestamps_${userId}`);
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });
    const isFirstLoad = useRef(!localStorage.getItem(`seenTimestamps_${userId}`));

    const parseMessageTime = (timestamp) => {
        if (timestamp == null) return 0;
        const t = new Date(timestamp).getTime();
        return Number.isNaN(t) ? 0 : t;
    };

    const getConversationSortTime = (key, msgs, groupCreatedAt) => {
        const messageTime = parseMessageTime(msgs[key]?.timestamp);
        if (messageTime > 0) return messageTime;
        if (key.startsWith('group_')) return groupCreatedAt[key] ?? 0;
        return 0;
    };

    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [connectionNames, setConnectionNames] = useState({});
    const [memberDisplayNames, setMemberDisplayNames] = useState({});
    const [senderNamesMap, setSenderNamesMap] = useState({});

    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [currentGroupMembers, setCurrentGroupMembers] = useState([]);
    const [selectedNewMembers, setSelectedNewMembers] = useState([]);
    const [freshConnectionKeys, setFreshConnectionKeys] = useState([]);

    // Conversations with messages newer than what the user last saw
    const selectedKeyRef = useRef(selectedKey);
    useEffect(() => { selectedKeyRef.current = selectedKey; }, [selectedKey]);

    const unreadKeys = new Set(
        dms.filter(key => {
            if (key === selectedKeyRef.current) return false;               // currently viewing → always read
            const lastTs = lastMessages[key]?.timestamp;
            if (!lastTs) return false;
            return lastTs !== seenTimestamps[key];                          // new message arrived since last seen
        })
    );

    useEffect(() => {
        if (userId) localStorage.setItem(`seenTimestamps_${userId}`, JSON.stringify(seenTimestamps));
    }, [seenTimestamps, userId]);

    useEffect(() => {
        if (!showGroupModal) return;
        const load = async () => {
            const res = await fetch(`${BASE_URL}/users/connections`, { headers: { 'userId': userId } });
            const connectionKeys = await res.json();
            const names = {};
            await Promise.all(connectionKeys.map(async (id) => {
                names[id] = await MessagingService.getDisplayName(id);
            }));
            setConnectionNames(names);
            setFreshConnectionKeys(connectionKeys);
        };
        load();
    }, [showGroupModal]);

    useEffect(() => {
        if (!showAddMemberModal || !selectedKey?.startsWith('group_')) return;
        setSelectedNewMembers([]);
        const groupId = selectedKey.split('_')[1];
        const load = async () => {
            const memberIds = await MessagingService.getGroupMembers(groupId);
            setCurrentGroupMembers(memberIds);
            const allNames = {};
            await Promise.all(memberIds.map(async (id) => {
                allNames[id] = await MessagingService.getDisplayName(id);
            }));
            setMemberDisplayNames(allNames);
            const res = await fetch(`${BASE_URL}/users/connections`, { headers: { 'userId': userId } });
            const connectionKeys = await res.json();
            const connNames = {};
            await Promise.all(connectionKeys.map(async (id) => {
                connNames[id] = await MessagingService.getDisplayName(id);
            }));
            setConnectionNames(connNames);
            setFreshConnectionKeys(connectionKeys);
        };
        load();
    }, [showAddMemberModal]);

    const loadDMs = async () => {
        if (!userId) return;
        try {
            const data = await MessagingService.getDMList(userId);

            const names = {};
            await Promise.all(data.map(async (key) => {
                if (key.startsWith('group_')) {
                    const groupId = key.split('_')[1];
                    names[key] = await MessagingService.getGroupName(groupId);
                } else {
                    const otherUserId = key.split('_').find(id => parseInt(id) !== userId);
                    names[key] = await MessagingService.getDisplayName(otherUserId);
                }
            }));
            setDmNames(names);

            const lastMsgs = {};
            await Promise.all(data.map(async (key) => {
                try { lastMsgs[key] = await MessagingService.getLastMessage(key, userId); }
                catch (error) { console.log('Failed to fetch last message for', key); }
            }));
            setLastMessages(lastMsgs);

            const groupCreatedAt = {};
            await Promise.all(
                data.filter((key) => key.startsWith('group_')).map(async (key) => {
                    const groupId = key.split('_')[1];
                    groupCreatedAt[key] = await MessagingService.getGroupCreatedAt(groupId);
                })
            );

            // If you sent the last message, mark it as seen so you don't get a notification for your own message
            const autoSeen = {};
            Object.keys(lastMsgs).forEach(key => {
                if (lastMsgs[key]?.senderId === userId) {
                    autoSeen[key] = lastMsgs[key].timestamp;
                }
            });
            if (Object.keys(autoSeen).length > 0) {
                setSeenTimestamps(prev => ({ ...prev, ...autoSeen }));
            }

            // On first load, initialise all conversations as "seen" so there are no false unread badges
            if (isFirstLoad.current) {
                const initial = {};
                data.forEach(key => { initial[key] = lastMsgs[key]?.timestamp || null; });
                setSeenTimestamps(initial);
                isFirstLoad.current = false;
            }

            // Sort by most recent activity (messages, or group creation if no messages yet)
            const sorted = [...data].sort((a, b) =>
                getConversationSortTime(b, lastMsgs, groupCreatedAt) - getConversationSortTime(a, lastMsgs, groupCreatedAt)
            );
            setDMs(sorted);
            setNamesLoaded(true);
        } catch (error) { console.log('Failed to load DMs: ', error); }
    };

    useEffect(() => { loadDMs(); }, [userId]);

    useEffect(() => {
        if (selectedKey) return;
        const interval = setInterval(loadDMs, 3000);
        return () => clearInterval(interval);
    }, [selectedKey]);

    useEffect(() => {
        const loadConversation = async () => {
            if (!selectedKey) {
                setConversation([]);
                setConversationLoading(false);
                return;
            }

            setConversationLoading(true);
            setConversation([]);

            try {
                const data = await MessagingService.getConversation(selectedKey, userId);
                setConversation(data);
            } catch (error) {
                console.log('Failed to load conversation: ', error);
            } finally {
                setConversationLoading(false);
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
                if (error.status === 400) {
                    console.log('Kicked from group — returning to DM list');
                    handleBack();
                } else {
                    console.log('Failed to poll conversation ', error);
                }
            }
        }, 500);
        return () => clearInterval(interval);
    }, [selectedKey, userId]);

    const handleSelectDM = async (key) => {
        setSelectedKey(key);
        onDMOpen(true);

        // Mark this conversation as seen the moment the user opens it
        setSeenTimestamps(prev => ({ ...prev, [key]: lastMessages[key]?.timestamp || null }));

        if (key.startsWith('group_')) {
            const groupId = key.split('_')[1];
            const name = await MessagingService.getGroupName(groupId);
            setConversationName(name);
            setRecipientId(null);
            const memberIds = await MessagingService.getGroupMembers(groupId);
            const names = {};
            await Promise.all(memberIds.map(async (id) => { names[id] = await MessagingService.getDisplayName(id); }));
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
        } catch (error) { console.log('Failed to send message: ', error); }
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
        } catch (error) { console.log('Failed to create group: ', error); }
    };

    const handleAddMembers = async () => {
        if (selectedNewMembers.length === 0) return;
        if (!selectedKey?.startsWith('group_')) return;
        const groupId = selectedKey.split('_')[1];
        try {
            await Promise.all(selectedNewMembers.map(id => MessagingService.addGroupMember(groupId, id)));
            setCurrentGroupMembers(prev => [...prev, ...selectedNewMembers]);
            setSelectedNewMembers([]);
            setShowAddMemberModal(false);
        } catch (error) { console.log('Failed to add members: ', error); }
    };

    const handleRemoveMember = async (memberId) => {
        if (!selectedKey?.startsWith('group_')) return;
        const groupId = selectedKey.split('_')[1];
        try {
            await MessagingService.removeGroupMember(groupId, memberId);
            setCurrentGroupMembers(prev => prev.filter(id => id !== memberId));
        } catch (error) { console.log('Failed to remove member: ', error); }
    };

    const handleBack = () => {
        setSelectedKey(null);
        setConversation([]);
        setConversationName(null);
        onDMOpen(false);
        loadDMs();
    };

    const isGroupConversation = selectedKey?.startsWith('group_');

    // ─── Shared modal styles ──────────────────────────────────────────────────

    const gradientBlurBackdrop = {
        position: 'fixed', inset: 0, zIndex: 50,
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 45%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 45%)',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 100%)',
        pointerEvents: 'none',
    };

    const modalCard = {
        width: '100%', maxWidth: 400,
        background: 'white', borderRadius: 24,
        padding: '28px', border: '1px solid #E8E4DC',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column', gap: '18px',
        pointerEvents: 'all',
    };

    const modalInput = {
        width: '100%', padding: '13px 14px', background: '#F0EDE6',
        border: '1px solid #E8E4DC', borderRadius: 14,
        fontSize: 14, color: '#1a1a1a', outline: 'none',
        fontFamily: 'inherit', boxSizing: 'border-box',
    };

    const primaryBtn = {
        flex: 2, padding: '14px', background: '#fb923c', color: 'white',
        border: 'none', borderRadius: 12, fontWeight: 700,
        cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
    };

    const secondaryBtn = {
        flex: 1, padding: '14px', background: '#F0EDE6', color: '#B0A99F',
        border: '1px solid #E8E4DC', borderRadius: 12, fontWeight: 600,
        cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
    };

    const sectionLabel = {
        fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#B0A99F', margin: '0 0 10px 0',
    };

    const scrollList = {
        display: 'flex', flexDirection: 'column', gap: '8px',
        maxHeight: '220px', overflowY: 'auto',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
    };

    const memberAvatar = (name) => (
        <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #fdba74, #fb923c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 14,
        }}>
            {name?.[0]?.toUpperCase() || '?'}
        </div>
    );

    const MemberRow = ({ id, selected, onToggle, nameMap }) => (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onToggle(id)}
            style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 14,
                background: selected ? '#FEF3EC' : '#F0EDE6',
                border: selected ? '1.5px solid rgba(251,146,60,0.4)' : '1px solid #E8E4DC',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
            }}
        >
            {memberAvatar(nameMap[id])}
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', flex: 1 }}>
                {nameMap[id] || `User ${id}`}
            </span>
            {selected && (
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 6 5 9 10 3" />
                    </svg>
                </span>
            )}
        </motion.button>
    );

    if (selectedKey) {
        return (
            <>
                <DMPage
                    conversation={conversation}
                    conversationLoading={conversationLoading}
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

                {showAddMemberModal && (
                    <>
                        <div style={gradientBlurBackdrop} />
                        <div style={{ position: 'fixed', inset: 0, zIndex: 51 }} onClick={() => { setShowAddMemberModal(false); setSelectedNewMembers([]); }} />
                        <div style={{ position: 'fixed', inset: 0, zIndex: 52, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px 32px', pointerEvents: 'none' }}>
                            <motion.div style={modalCard} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 340, damping: 30 }}>
                                <div>
                                    <p style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Members</p>
                                    <p style={{ fontSize: 12, color: '#B0A99F', margin: '3px 0 0 0' }}>Tap a member to remove them. Select connections to add.</p>
                                </div>
                                <div style={{ borderTop: '1px solid #E8E4DC' }} />
                                {currentGroupMembers.filter(id => id !== userId).length > 0 && (
                                    <div>
                                        <p style={sectionLabel}>Current members</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {currentGroupMembers.filter(id => id !== userId).map(id => (
                                                <motion.button key={id} whileTap={{ scale: 0.92 }} onClick={() => handleRemoveMember(id)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F0EDE6', border: '1px solid #E8E4DC', borderRadius: 20, padding: '5px 10px', fontSize: 12, color: '#B0A99F', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                                                    {memberDisplayNames[id] || `User ${id}`}
                                                    <span style={{ fontSize: 13, color: '#D4CFCA', lineHeight: 1 }}>×</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <p style={sectionLabel}>Add connections</p>
                                    <div style={scrollList}>
                                        {freshConnectionKeys?.filter(id => !currentGroupMembers.includes(id)).length === 0 ? (
                                            <p style={{ fontSize: 13, color: '#B0A99F', margin: 0, textAlign: 'center', padding: '12px 0' }}>All your connections are already in this group.</p>
                                        ) : (
                                            freshConnectionKeys?.filter(id => !currentGroupMembers.includes(id)).map(id => (
                                                <MemberRow key={id} id={id} selected={selectedNewMembers.includes(id)} nameMap={connectionNames}
                                                    onToggle={(id) => setSelectedNewMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])} />
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button style={secondaryBtn} onClick={() => { setShowAddMemberModal(false); setSelectedNewMembers([]); }}>Close</button>
                                    <button style={{ ...primaryBtn, opacity: selectedNewMembers.length === 0 ? 0.5 : 1 }} onClick={handleAddMembers} disabled={selectedNewMembers.length === 0}>
                                        Add {selectedNewMembers.length > 0 ? `${selectedNewMembers.length} ` : ''}Member{selectedNewMembers.length !== 1 ? 's' : ''}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </>
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
                unreadKeys={unreadKeys}
            />

            {showGroupModal && (
                <>
                    <div style={gradientBlurBackdrop} />
                    <div style={{ position: 'fixed', inset: 0, zIndex: 51 }} onClick={() => { setShowGroupModal(false); setGroupName(''); setSelectedMembers([]); }} />
                    <div style={{ position: 'fixed', inset: 0, zIndex: 52, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px 32px', pointerEvents: 'none' }}>
                        <motion.div style={modalCard} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 340, damping: 30 }}>
                            <div>
                                <p style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>New Group</p>
                                <p style={{ fontSize: 12, color: '#B0A99F', margin: '3px 0 0 0' }}>Name your group and choose who to add.</p>
                            </div>
                            <div style={{ borderTop: '1px solid #E8E4DC' }} />
                            <div>
                                <p style={sectionLabel}>Group name</p>
                                <input type="text" placeholder="e.g. Study Group, Team Chat…" value={groupName} onChange={e => setGroupName(e.target.value)} style={modalInput} />
                            </div>
                            <div>
                                <p style={sectionLabel}>Add connections</p>
                                <div style={scrollList}>
                                    {!freshConnectionKeys?.length ? (
                                        <p style={{ fontSize: 13, color: '#B0A99F', margin: 0, textAlign: 'center', padding: '12px 0' }}>You have no connections yet.</p>
                                    ) : (
                                        freshConnectionKeys.map(id => (
                                            <MemberRow key={id} id={id} selected={selectedMembers.includes(id)} nameMap={connectionNames}
                                                onToggle={(id) => setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])} />
                                        ))
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button style={secondaryBtn} onClick={() => { setShowGroupModal(false); setGroupName(''); setSelectedMembers([]); }}>Cancel</button>
                                <button style={{ ...primaryBtn, opacity: (!groupName.trim() || selectedMembers.length === 0) ? 0.5 : 1 }} onClick={handleCreateGroup} disabled={!groupName.trim() || selectedMembers.length === 0}>
                                    Create Group
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </>
    );
}
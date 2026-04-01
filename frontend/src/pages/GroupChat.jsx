import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import axiosInstance from '../cofig/axios';

export default function GroupChat() {
    const { user, token } = useSelector((state) => state.user);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Initial message fetch
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await axiosInstance.get('/group-messages', {
                    headers: { authorization: token }
                });
                setMessages(data);
            } catch (err) {
                // error fetching messages handled silently
            }
        };

        if (token && (user?.role === 'admin' || user?.role === 'manager')) {
            fetchMessages();
        }
    }, [token, user]);

    // Socket.io setup
    useEffect(() => {
        if (!user || !token || (user.role !== 'admin' && user.role !== 'manager')) return;

        // Extract base URL from axios instance (e.g., http://localhost:3030)
        let baseUrl = 'http://localhost:3030';
        if (axiosInstance.defaults.baseURL) {
            baseUrl = axiosInstance.defaults.baseURL.replace('/api', '');
        }
        
        const newSocket = io(baseUrl);

        newSocket.on('connect', () => {
            newSocket.emit('joinAdminManagerGroup');
        });

        newSocket.on('receiveMessage', (message) => {
            setMessages((prevMsg) => [...prevMsg, message]);
        });

        socketRef.current = newSocket;

        return () => {
            newSocket.disconnect();
            socketRef.current = null;
        };
    }, [user, token]);

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current) return;

        try {
            await axiosInstance.post('/group-messages', { message: newMessage }, {
                headers: { authorization: token }
            });
            setNewMessage('');
        } catch (err) {
            // error sending message handled silently
        }
    };

    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
        return <div className="dashboard-container"><p>Access Denied. Only Admin and Managers can view this page.</p></div>;
    }

    return (
        <div className="group-chat-container">
            <h3>SmartFix Communication Room</h3>
            <div className="chat-messages">
                {messages.length === 0 ? (
                    <p className="empty-chat">No messages yet. Start the conversation!</p>
                ) : (
                    messages.map((msg, idx) => {
                        const isMine = msg.senderId?._id === user._id;
                        return (
                            <div key={idx} className={`chat-message ${isMine ? 'mine' : 'theirs'}`}>
                                <div className="chat-meta">
                                    {isMine ? 'You' : msg.senderId?.username || 'Unknown'} ({msg.senderId?.role || 'User'})
                                </div>
                                <div className="chat-bubble">
                                    {msg.message}
                                </div>
                                <div className="chat-time">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="chat-form">
                <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    placeholder="Type a message..." 
                    className="chat-input"
                    autoFocus
                />
                <button type="submit" className="primary-btn" disabled={!newMessage.trim()}>Send</button>
            </form>
        </div>
    );
}

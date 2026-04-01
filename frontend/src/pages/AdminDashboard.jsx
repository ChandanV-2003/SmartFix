import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, updateUserRole } from '../slices/UserSlice.jsx';
import { fetchAllComplaints } from '../slices/ComplaintSlice.jsx';
import ComplaintList from './ComplaintList.jsx';
import GroupChat from './GroupChat.jsx';

export default function AdminDashboard() {
    const dispatch = useDispatch();
    const { users, usersStatus, usersError } = useSelector((state) => state.user);
    const { complaints } = useSelector((state) => state.complaint);
    const [searchEmail, setSearchEmail] = useState('');
    const [updateError, setUpdateError] = useState(null);
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'complaints'

    useEffect(() => {
        dispatch(fetchAllUsers());
        dispatch(fetchAllComplaints());

        const interval = setInterval(() => {
            dispatch(fetchAllUsers());
            dispatch(fetchAllComplaints());
        }, 30000);

        return () => clearInterval(interval);
    }, [dispatch]);

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchEmail.toLowerCase())
    );

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingUserId(userId);
        setUpdateError(null);
        try {
            await dispatch(updateUserRole({ userId, role: newRole })).unwrap();
        } catch (error) {
            setUpdateError(`Failed to update role: ${error}`);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const roleOptions = ['admin', 'manager', 'technician', 'user'];

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                {/* Tabs */}
                <div className="dashboard-tabs">
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        User Management
                    </button>
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
                        onClick={() => setActiveTab('complaints')}
                    >
                        Complaints ({complaints.length})
                    </button>
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        Group Messenger
                    </button>
                </div>

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div>
                        <div className="search-section">
                    <input
                        type="email"
                        placeholder="Search by user email..."
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className="search-input"
                    />
                    <button
                        type="button"
                        className="refresh-btn"
                        onClick={() => dispatch(fetchAllUsers())}
                        disabled={usersStatus === 'loading'}
                    >
                        {usersStatus === 'loading' ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {usersError && <p className="error-message">{usersError}</p>}
                {updateError && <p className="error-message">{updateError}</p>}

                {usersStatus === 'loading' && users.length === 0 && (
                    <div style={{ textAlign: 'center', margin: '20px 0', color: '#627d98' }}>
                        Loading users...
                    </div>
                )}

                <div className="table-wrap">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Current Role</th>
                                <th>Update Role</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 && usersStatus !== 'loading' ? (
                                <tr>
                                    <td colSpan="6" className="empty-cell">
                                        {searchEmail ? 'No users found matching your search.' : 'No users found.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user.username || '-'}</td>
                                        <td>{user.email || '-'}</td>
                                        <td>{user.phone || '-'}</td>
                                        <td>
                                            <span className={`role-badge role-${user.role || 'user'}`}>
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="role-buttons">
                                                {roleOptions.map((role) => (
                                                    <button
                                                        key={role}
                                                        type="button"
                                                        className={`role-btn ${user.role === role ? 'active' : ''}`}
                                                        onClick={() => handleRoleChange(user._id, role)}
                                                        disabled={updatingUserId === user._id}
                                                        title={`Set role to ${role}`}
                                                    >
                                                        {role.charAt(0).toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td>{user.status || 'active'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

                {/* Complaints Tab */}
                {activeTab === 'complaints' && (
                    <ComplaintList />
                )}

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <GroupChat />
                )}
            </div>
        </div>
    );
}

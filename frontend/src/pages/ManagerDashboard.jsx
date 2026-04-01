import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers } from '../slices/UserSlice.jsx';
import { fetchAllComplaints } from '../slices/ComplaintSlice.jsx';
import ComplaintList from './ComplaintList.jsx';
import GroupChat from './GroupChat.jsx';

export default function ManagerDashboard() {
    const dispatch = useDispatch();
    const { users, usersStatus, usersError } = useSelector((state) => state.user);
    const { complaints } = useSelector((state) => state.complaint);
    const [searchEmail, setSearchEmail] = useState('');
    const [activeTab, setActiveTab] = useState('technicians');


    useEffect(() => {
        dispatch(fetchAllUsers());
        dispatch(fetchAllComplaints());

        const interval = setInterval(() => {
            dispatch(fetchAllUsers());
            dispatch(fetchAllComplaints());
        }, 30000);

        return () => clearInterval(interval);
    }, [dispatch]);

    // Filter only technicians
    const technicians = users?.filter(user => user.role === 'technician') || [];
    
    const filteredTechnicians = searchEmail 
        ? technicians.filter(tech => 
            tech.email?.toLowerCase().includes(searchEmail.toLowerCase())
          )
        : technicians;

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                {/* Tabs */}
                <div className="dashboard-tabs">
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'technicians' ? 'active' : ''}`}
                        onClick={() => setActiveTab('technicians')}
                    >
                        Technicians ({technicians.length})
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

                {usersStatus === 'loading' && users.length === 0 && <p>Loading technicians...</p>}

                {/* Technicians Tab */}
                {activeTab === 'technicians' && (
                    <div>
                        <div className="search-section">
                            <input
                                type="email"
                                placeholder="Search technician by email..."
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

                        <div className="table-wrap">
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Status</th>
                                        <th>Joined Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTechnicians.length === 0 && usersStatus !== 'loading' ? (
                                        <tr>
                                            <td colSpan="5" className="empty-cell">
                                                {searchEmail 
                                                    ? 'No technicians found matching your search.' 
                                                    : 'No technicians found.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTechnicians.map((tech) => (
                                            <tr key={tech._id}>
                                                <td>{tech.username || '-'}</td>
                                                <td>{tech.email || '-'}</td>
                                                <td>{tech.phone || '-'}</td>
                                                <td>
                                                    <span className={`role-badge role-${tech.status || 'active'}`}>
                                                        {tech.status || 'active'}
                                                    </span>
                                                </td>
                                                <td>{new Date(tech.createdAt).toLocaleDateString()}</td>
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

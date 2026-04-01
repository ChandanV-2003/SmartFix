import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyComplaints } from '../slices/ComplaintSlice';
import ComplaintForm from './ComplaintForm';

export default function UserDashboard() {
    const dispatch = useDispatch();
    const { myComplaints, complaintsStatus } = useSelector((state) => state.complaint);
    const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'view'

    useEffect(() => {
        dispatch(fetchMyComplaints());

        const interval = setInterval(() => {
            dispatch(fetchMyComplaints());
        }, 30000);

        return () => clearInterval(interval);
    }, [dispatch]);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'status-pending';
            case 'assigned':
                return 'status-assigned';
            case 'in-progress':
                return 'status-progress';
            case 'resolved':
                return 'status-resolved';
            case 'rejected':
                return 'status-rejected';
            default:
                return '';
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                {/* Tabs */}
                <div className="dashboard-tabs">
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'submit' ? 'active' : ''}`}
                        onClick={() => setActiveTab('submit')}
                    >
                        Submit Request
                    </button>
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
                        onClick={() => setActiveTab('view')}
                    >
                        My Complaints ({myComplaints.length})
                    </button>
                </div>

                {/* Submit Tab */}
                {activeTab === 'submit' && <ComplaintForm />}

                {/* View Complaints Tab */}
                {activeTab === 'view' && (
                    <div className="complaint-list-container">
                        <h3>My SmartFix Requests</h3>
                        
                        {complaintsStatus === 'loading' && myComplaints.length === 0 && <p>Loading your complaints...</p>}
                        
                        <div className="table-wrap">
                            <table className="complaint-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Issue Title</th>
                                        <th>Description</th>
                                        <th>Address</th>
                                        <th>Status</th>
                                        <th>Assigned Technician</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myComplaints.length === 0 && complaintsStatus !== 'loading' ? (
                                        <tr>
                                            <td colSpan="6" className="empty-cell">
                                                You haven't submitted any complaints yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        myComplaints.map((complaint) => (
                                            <tr key={complaint._id}>
                                                <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                                                <td>{complaint.issueTitle || '-'}</td>
                                                <td className="desc-cell">{complaint.issueDescription || '-'}</td>
                                                <td>{complaint.address || '-'}</td>
                                                <td>
                                                    <span className={`role-badge ${getStatusBadgeClass(complaint.status)}`}>
                                                        {complaint.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {complaint.assignedTechnicians && complaint.assignedTechnicians.length > 0 ? (
                                                        <div className="tech-details" style={{fontSize: '0.85em', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                                            {complaint.assignedTechnicians.map(tech => (
                                                                <div key={tech._id} style={{ paddingBottom: '4px', borderBottom: '1px solid #eee' }}>
                                                                    <div><strong>Name:</strong> {tech.username}</div>
                                                                    <div><strong>Email:</strong> {tech.email}</div>
                                                                    {tech.phone && (
                                                                        <div><strong>Phone:</strong> {tech.phone}</div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignedComplaints, updateComplaintStatus } from '../slices/ComplaintSlice';

export default function TechnicianDashboard() {
    const dispatch = useDispatch();
    const { complaints, complaintsStatus } = useSelector((state) => state.complaint);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        dispatch(fetchAssignedComplaints());

        const interval = setInterval(() => {
            dispatch(fetchAssignedComplaints());
        }, 30000);

        return () => clearInterval(interval);
    }, [dispatch]);

    const handleStatusChange = async (complaintId, newStatus) => {
        setUpdatingId(complaintId);
        setError(null);
        try {
            await dispatch(updateComplaintStatus({ complaintId, status: newStatus })).unwrap();
        } catch (err) {
            setError(err || 'Failed to update complaint status');
        } finally {
            setUpdatingId(null);
        }
    };

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
                <div className="complaint-list-container">
                    <h3>My Assigned Tasks</h3>
                    
                    {error && <p className="error-message">{error}</p>}
                    {complaintsStatus === 'loading' && <p>Loading your assigned complaints...</p>}
                    
                    <div className="table-wrap">
                        <table className="complaint-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>User</th>
                                    <th>Address</th>
                                    <th>Issue Title</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.length === 0 && complaintsStatus !== 'loading' ? (
                                    <tr>
                                        <td colSpan="7" className="empty-cell">
                                            You have no assigned complaints yet.
                                        </td>
                                    </tr>
                                ) : (
                                    complaints.map((complaint) => (
                                        <tr key={complaint._id}>
                                            <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                                            <td>{complaint.userName || '-'}</td>
                                            <td>{complaint.address || '-'}</td>
                                            <td>{complaint.issueTitle || '-'}</td>
                                            <td className="desc-cell">{complaint.issueDescription || '-'}</td>
                                            <td>
                                                <span className={`role-badge ${getStatusBadgeClass(complaint.status)}`}>
                                                    {complaint.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <select
                                                        value={complaint.status}
                                                        onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                                                        disabled={updatingId === complaint._id || complaint.status === 'resolved' || complaint.status === 'rejected'}
                                                        className="status-select"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="assigned">Assigned</option>
                                                        <option value="in-progress">In Progress</option>
                                                        <option value="resolved">Resolved</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

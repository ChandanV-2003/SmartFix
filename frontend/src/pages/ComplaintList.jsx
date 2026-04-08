import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateComplaintStatus, deleteComplaint, assignTechnicianToComplaint } from '../slices/ComplaintSlice';
import { fetchAllUsers } from '../slices/UserSlice';
import axiosInstance from '../config/axios';

export default function ComplaintList() {
    const dispatch = useDispatch();
    const { complaints, complaintsStatus } = useSelector((state) => state.complaint);
    const currentUser = useSelector((state) => state.user.user);
    const { users } = useSelector((state) => state.user);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState(null);

    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [aiData, setAiData] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiError, setAiError] = useState(null);

    const analyzeComplaintDetails = useCallback(async (description) => {
        setIsAnalyzing(true);
        setAiError(null);
        setAiData(null);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axiosInstance.post('/analyze-complaint', { description }, {
                headers: { authorization: token }
            });
            setAiData(data);
        } catch (err) {
            setAiError(err.response?.data?.error || 'Failed to analyze complaint.');
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    useEffect(() => {
        if (currentUser?.role === 'manager' || currentUser?.role === 'admin') {
            dispatch(fetchAllUsers());
        }
    }, [dispatch, currentUser?.role]);

    const technicians = users?.filter(u => u.role === 'technician') || [];

    const handleAssign = async (complaintId, technicianIds) => {
        setUpdatingId(complaintId);
        setError(null);
        try {
            const updated = await dispatch(assignTechnicianToComplaint({ complaintId, technicianIds })).unwrap();
            // Update the selected complaint so UI reflects changes
            if (selectedComplaint && selectedComplaint._id === complaintId) {
                setSelectedComplaint(updated);
            }
        } catch (err) {
            setError(err || 'Failed to assign technicians');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleStatusChange = async (complaintId, newStatus) => {
        setUpdatingId(complaintId);
        setError(null);
        try {
            const updated = await dispatch(updateComplaintStatus({ complaintId, status: newStatus })).unwrap();
            if (selectedComplaint && selectedComplaint._id === complaintId) {
                setSelectedComplaint(updated);
            }
        } catch (err) {
            setError(err || 'Failed to update complaint status');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (complaintId) => {
        if (window.confirm('Are you sure you want to delete this complaint?')) {
            try {
                await dispatch(deleteComplaint(complaintId)).unwrap();
                if (selectedComplaint && selectedComplaint._id === complaintId) {
                    setSelectedComplaint(null);
                }
            } catch (err) {
                setError(err || 'Failed to delete complaint');
            }
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'status-pending';
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

    // Keep selected complaint updated if the complaints array changes
    useEffect(() => {
        if (selectedComplaint) {
            const updated = complaints.find(c => c._id === selectedComplaint._id);
            if (updated && updated !== selectedComplaint) {
                setSelectedComplaint(updated);
            }
        }
    }, [complaints, selectedComplaint]);

    // Analyze when a new complaint is selected
    useEffect(() => {
        if (selectedComplaint && currentUser?.role === 'manager' && !aiData && !isAnalyzing) {
            analyzeComplaintDetails(selectedComplaint.issueDescription);
        }
        if (!selectedComplaint) {
            setAiData(null);
            setAiError(null);
            setIsAnalyzing(false);
        }
    }, [selectedComplaint, currentUser?.role, aiData, isAnalyzing, analyzeComplaintDetails]);

    return (
        <div className="complaint-list-container">
            <h3>All SmartFix Requests</h3>
            
            {error && <p className="error-message">{error}</p>}
            
            {complaintsStatus === 'loading' && complaints.length === 0 && (
                <div style={{ textAlign: 'center', margin: '20px 0', color: '#627d98' }}>
                    Loading complaints...
                </div>
            )}

            <div className="table-wrap">
                <table className="complaint-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>User</th>
                            <th>Email</th>
                            <th>Address</th>
                            <th>Issue Title</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Assigned Technicians</th>
                        </tr>
                    </thead>
                    <tbody>
                        {complaints.length === 0 && complaintsStatus !== 'loading' ? (
                            <tr>
                                <td colSpan="8" className="empty-cell">
                                    No complaints found.
                                </td>
                            </tr>
                        ) : (
                            complaints.map((complaint) => (
                                <tr 
                                    key={complaint._id} 
                                    onClick={() => setSelectedComplaint(complaint)}
                                    style={{ cursor: 'pointer' }}
                                    className="complaint-row-hover"
                                >
                                    <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                                    <td>{complaint.userName || '-'}</td>
                                    <td>{complaint.userEmail || '-'}</td>
                                    <td>{complaint.address || '-'}</td>
                                    <td>{complaint.issueTitle || '-'}</td>
                                    <td className="desc-cell">{complaint.issueDescription || '-'}</td>
                                    <td>
                                        <span className={`role-badge ${getStatusBadgeClass(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                    </td>
                                    <td>
                                        {complaint.assignedTechnicians && complaint.assignedTechnicians.length > 0 
                                            ? complaint.assignedTechnicians.map(t => t.username).join(', ') 
                                            : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Card for Complaint Actions */}
            {selectedComplaint && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
                    justifyContent: 'center', alignItems: 'flex-start', zIndex: 1000,
                    overflowY: 'auto', padding: '5vh 0'
                }} onClick={(e) => {
                    if (e.target.className === 'modal-overlay') setSelectedComplaint(null);
                }}>
                    <div className="modal-card" style={{
                        backgroundColor: '#fff', padding: '25px', borderRadius: '12px', 
                        minWidth: '350px', maxWidth: '500px', width: '90%', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)', marginBottom: '5vh'
                    }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px'}}>
                            <h4 style={{margin: 0, color: '#333'}}>Manage SmartFix Request</h4>
                            <button onClick={() => setSelectedComplaint(null)} style={{cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.5em', color: '#888', lineHeight: '1'}}>&times;</button>
                        </div>
                        
                        <div style={{marginBottom: '20px', fontSize: '0.95em', color: '#555', lineHeight: '1.5'}}>
                            <p style={{margin: '0 0 8px 0'}}><strong>User:</strong> {selectedComplaint.userName} ({selectedComplaint.userEmail})</p>
                            <p style={{margin: '0 0 8px 0'}}><strong>Issue:</strong> {selectedComplaint.issueTitle}</p>
                            <p style={{margin: '0 0 8px 0'}}><strong>Description:</strong> {selectedComplaint.issueDescription}</p>
                            <p style={{margin: '0 0 8px 0'}}>
                                <strong>Status:</strong> <span className={`role-badge ${getStatusBadgeClass(selectedComplaint.status)}`}>{selectedComplaint.status}</span>
                            </p>
                        </div>

                        {/* AI Suggestions Box */}
                        {currentUser?.role === 'manager' && (
                            <div style={{
                                backgroundColor: '#f0f4f8', padding: '15px', borderRadius: '8px', 
                                marginBottom: '20px', border: '1px solid #d9e2ec'
                            }}>
                                <h5 style={{margin: '0 0 10px 0', color: '#102a43', display: 'flex', alignItems: 'center'}}>
                                    <span style={{marginRight: '8px'}}>🤖</span> AI Recommendations
                                </h5>
                                
                                {isAnalyzing && (
                                    <div style={{color: '#627d98', fontSize: '0.9em', display: 'flex', alignItems: 'center'}}>
                                        <div className="spinner" style={{marginRight: '8px', width: '16px', height: '16px', border: '2px solid #627d98', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
                                        Analyzing complaint details...
                                    </div>
                                )}
                                
                                {aiError && (
                                    <p style={{color: '#d64545', fontSize: '0.9em', margin: 0}}>{aiError}</p>
                                )}
                                
                                {aiData && !isAnalyzing && (
                                    <div style={{fontSize: '0.9em', color: '#334e68'}}>
                                        <p style={{margin: '0 0 6px 0'}}><strong>Technician Type:</strong> {aiData.technicianType || 'N/A'}</p>
                                        <p style={{margin: '0 0 6px 0'}}><strong>Team Size:</strong> {aiData.numberOfTechniciansRequired || 1} tech(s)</p>
                                        <p style={{margin: '0 0 6px 0'}}><strong>Estimated Time:</strong> {aiData.estimatedTime || 'N/A'}</p>
                                        <div style={{margin: '0'}}>
                                            <strong>Suggested Spare Parts:</strong> 
                                            {aiData.spareParts && aiData.spareParts.length > 0 ? (
                                                <ul style={{margin: '4px 0 0 0', paddingLeft: '20px'}}>
                                                    {aiData.spareParts.map((part, idx) => (
                                                        <li key={idx} style={{marginBottom: '2px'}}>{part}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span style={{marginLeft: '4px'}}>None required</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="action-buttons-modal" style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                            {/* Assign Technicians Checkboxes */}
                            {currentUser?.role === 'manager' && (
                                <div className="multiselect-container" style={{maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '6px', backgroundColor: '#fafafa'}}>
                                    <div style={{fontSize: '0.9em', fontWeight: 'bold', marginBottom: '8px', color: '#444'}}>Assign Technicians:</div>
                                    {technicians.length === 0 ? (
                                        <p style={{margin: 0, fontSize: '0.85em', color: '#888'}}>No technicians available.</p>
                                    ) : (
                                        technicians.map(tech => {
                                            const isAssigned = selectedComplaint.assignedTechnicians?.some(t => t._id === tech._id);
                                            return (
                                                <div key={tech._id} style={{display: 'flex', alignItems: 'center', marginBottom: '6px'}}>
                                                    <input 
                                                        type="checkbox" 
                                                        id={`modal-tech-${selectedComplaint._id}-${tech._id}`}
                                                        checked={isAssigned || false}
                                                        onChange={(e) => {
                                                            const currentIds = selectedComplaint.assignedTechnicians?.map(t => t._id) || [];
                                                            let newIds;
                                                            if (e.target.checked) {
                                                                newIds = [...currentIds, tech._id];
                                                            } else {
                                                                newIds = currentIds.filter(id => id !== tech._id);
                                                            }
                                                            handleAssign(selectedComplaint._id, newIds);
                                                        }}
                                                        disabled={updatingId === selectedComplaint._id}
                                                        style={{cursor: 'pointer'}}
                                                    />
                                                    <label htmlFor={`modal-tech-${selectedComplaint._id}-${tech._id}`} style={{marginLeft: '8px', fontSize: '0.9em', cursor: 'pointer', color: '#333'}}>{tech.username}</label>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {/* Update Status */}
                            <div>
                                <label style={{display: 'block', fontSize: '0.9em', fontWeight: 'bold', marginBottom: '5px', color: '#444'}}>Update Status:</label>
                                <select
                                    value={selectedComplaint.status}
                                    onChange={(e) => handleStatusChange(selectedComplaint._id, e.target.value)}
                                    disabled={updatingId === selectedComplaint._id}
                                    className="status-select"
                                    style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd'}}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {/* Delete Button */}
                            {currentUser?.role === 'admin' && (
                                <button
                                    type="button"
                                    className="delete-btn"
                                    onClick={() => handleDelete(selectedComplaint._id)}
                                    disabled={updatingId === selectedComplaint._id}
                                    title="Delete complaint"
                                    style={{width: '100%', padding: '10px', marginTop: '10px'}}
                                >
                                    Delete Request
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

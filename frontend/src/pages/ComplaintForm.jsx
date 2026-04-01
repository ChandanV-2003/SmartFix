import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createComplaint } from '../slices/ComplaintSlice';

export default function ComplaintForm() {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        address: '',
        issueTitle: '',
        issueDescription: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(null);
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validate form
        if (!formData.address.trim() || !formData.issueTitle.trim() || !formData.issueDescription.trim()) {
            setError('All fields are required');
            return;
        }

        try {
            await dispatch(createComplaint(formData)).unwrap();
            setSuccess(true);
            setFormData({
                address: '',
                issueTitle: '',
                issueDescription: ''
            });
        } catch (err) {
            setError(err || 'Failed to submit complaint');
        }
    };

    return (
        <div className="complaint-form-container">
            <h3>New SmartFix Request</h3>
            <form onSubmit={handleSubmit} className="complaint-form">
                <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your address"
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="issueTitle">Issue Title</label>
                    <input
                        type="text"
                        id="issueTitle"
                        name="issueTitle"
                        value={formData.issueTitle}
                        onChange={handleChange}
                        placeholder="Brief title of your issue"
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="issueDescription">Issue Description</label>
                    <textarea
                        id="issueDescription"
                        name="issueDescription"
                        value={formData.issueDescription}
                        onChange={handleChange}
                        placeholder="Describe your issue in detail"
                        rows="5"
                        className="form-textarea"
                    />
                </div>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">Complaint submitted successfully!</p>}

                <button 
                    type="submit" 
                    className="primary-btn complaint-submit-btn"
                >
                    Submit Request
                </button>
            </form>
        </div>
    );
}

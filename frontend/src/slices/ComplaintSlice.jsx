import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../cofig/axios';

// Create a new complaint
export const createComplaint = createAsyncThunk(
    'complaint/createComplaint',
    async ({ address, issueTitle, issueDescription }, { getState, rejectWithValue }) => {
        try {
            const token = getState().user.token || localStorage.getItem('token');
            const { data } = await axiosInstance.post('/complaints', {
                address,
                issueTitle,
                issueDescription
            }, {
                headers: { authorization: token }
            });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Failed to create complaint');
        }
    }
);

// Fetch all complaints (for admin/manager)
export const fetchAllComplaints = createAsyncThunk(
    'complaint/fetchAllComplaints',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().user.token || localStorage.getItem('token');
            const { data } = await axiosInstance.get('/complaints', {
                headers: { authorization: token }
            });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Failed to fetch complaints');
        }
    }
);

// Fetch user's own complaints
export const fetchMyComplaints = createAsyncThunk(
    'complaint/fetchMyComplaints',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().user.token || localStorage.getItem('token');
            const { data } = await axiosInstance.get('/complaints/my', {
                headers: { authorization: token }
            });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Failed to fetch your complaints');
        }
    }
);

// Update complaint status
export const updateComplaintStatus = createAsyncThunk(
    'complaint/updateComplaintStatus',
    async ({ complaintId, status }, { getState, rejectWithValue }) => {
        try {
            const token = getState().user.token || localStorage.getItem('token');
            const { data } = await axiosInstance.put(`/complaints/${complaintId}`, {
                status
            }, {
                headers: { authorization: token }
            });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Failed to update complaint');
        }
    }
);

// Delete a complaint
export const deleteComplaint = createAsyncThunk(
    'complaint/deleteComplaint',
    async (complaintId, { getState, rejectWithValue }) => {
        try {
            const token = getState().user.token || localStorage.getItem('token');
            await axiosInstance.delete(`/complaints/${complaintId}`, {
                headers: { authorization: token }
            });
            return complaintId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Failed to delete complaint');
        }
    }
);

// Fetch assigned complaints
export const fetchAssignedComplaints = createAsyncThunk(
    'complaint/fetchAssignedComplaints',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().user.token || localStorage.getItem('token');
            const { data } = await axiosInstance.get('/complaints/assigned', {
                headers: { authorization: token }
            });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Failed to fetch assigned complaints');
        }
    }
);

// Assign technician to a complaint
export const assignTechnicianToComplaint = createAsyncThunk(
    'complaint/assignTechnicianToComplaint',
    async ({ complaintId, technicianIds }, { getState, rejectWithValue }) => {
        try {
            const token = getState().user.token || localStorage.getItem('token');
            const { data } = await axiosInstance.put(`/complaints/${complaintId}/assign`, {
                assignedTechnicians: technicianIds
            }, {
                headers: { authorization: token }
            });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Failed to assign technician');
        }
    }
);

const initialState = {
    complaints: [],
    myComplaints: [],
    complaintsStatus: 'idle',
    complaintsError: null,
};

const complaintSlice = createSlice({
    name: 'complaint',
    initialState,
    reducers: {
        clearComplaints(state) {
            state.complaints = [];
            state.myComplaints = [];
            state.complaintsStatus = 'idle';
            state.complaintsError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create complaint
            .addCase(createComplaint.pending, (state) => {
                state.complaintsStatus = 'loading';
                state.complaintsError = null;
            })
            .addCase(createComplaint.fulfilled, (state, action) => {
                state.complaintsStatus = 'succeeded';
                state.complaints.unshift(action.payload);
                state.myComplaints.unshift(action.payload);
            })
            .addCase(createComplaint.rejected, (state, action) => {
                state.complaintsStatus = 'failed';
                state.complaintsError = action.payload;
            })
            // Fetch all complaints
            .addCase(fetchAllComplaints.pending, (state) => {
                state.complaintsStatus = 'loading';
                state.complaintsError = null;
            })
            .addCase(fetchAllComplaints.fulfilled, (state, action) => {
                state.complaintsStatus = 'succeeded';
                state.complaints = action.payload;
            })
            .addCase(fetchAllComplaints.rejected, (state, action) => {
                state.complaintsStatus = 'failed';
                state.complaintsError = action.payload;
            })
            // Fetch my complaints
            .addCase(fetchMyComplaints.pending, (state) => {
                state.complaintsStatus = 'loading';
                state.complaintsError = null;
            })
            .addCase(fetchMyComplaints.fulfilled, (state, action) => {
                state.complaintsStatus = 'succeeded';
                state.myComplaints = action.payload;
            })
            .addCase(fetchMyComplaints.rejected, (state, action) => {
                state.complaintsStatus = 'failed';
                state.complaintsError = action.payload;
            })
            // Update complaint status
            .addCase(updateComplaintStatus.fulfilled, (state, action) => {
                const updatedComplaint = action.payload;
                const index = state.complaints.findIndex(c => c._id === updatedComplaint._id);
                if (index > -1) {
                    state.complaints[index] = updatedComplaint;
                }
                const myIndex = state.myComplaints.findIndex(c => c._id === updatedComplaint._id);
                if (myIndex > -1) {
                    state.myComplaints[myIndex] = updatedComplaint;
                }
            })
            // Delete complaint
            .addCase(deleteComplaint.fulfilled, (state, action) => {
                state.complaints = state.complaints.filter(c => c._id !== action.payload);
                state.myComplaints = state.myComplaints.filter(c => c._id !== action.payload);
            })
            // Fetch assigned complaints
            .addCase(fetchAssignedComplaints.pending, (state) => {
                state.complaintsStatus = 'loading';
                state.complaintsError = null;
            })
            .addCase(fetchAssignedComplaints.fulfilled, (state, action) => {
                state.complaintsStatus = 'succeeded';
                state.complaints = action.payload;
            })
            .addCase(fetchAssignedComplaints.rejected, (state, action) => {
                state.complaintsStatus = 'failed';
                state.complaintsError = action.payload;
            })
            // Assign technician
            .addCase(assignTechnicianToComplaint.fulfilled, (state, action) => {
                const updatedComplaint = action.payload;
                const index = state.complaints.findIndex(c => c._id === updatedComplaint._id);
                if (index > -1) {
                    state.complaints[index] = updatedComplaint;
                }
            });
    }
});

export const { clearComplaints } = complaintSlice.actions;

export default complaintSlice.reducer;

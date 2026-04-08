import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../config/axios';

export const registerUser = createAsyncThunk(
    'user/registerUser',
    async ({ username, email, phone, password }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post('/users/register', {
                username, email, phone, password,
            });
            return data;
        } catch (err) {
            const apiError = err.response?.data?.error;
            const message = err.message;
            return rejectWithValue(apiError || message || 'Registration failed');
        }
    }
);

export const loginUser = createAsyncThunk(
    'user/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data } = await axiosInstance.post('/users/login', { email, password });
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Login failed');
        }
    }
);

export const fetchAccount = createAsyncThunk(
    'user/fetchAccount',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().user.token || localStorage.getItem('token');
            const { data } = await axiosInstance.get('/users/account', {
                headers: { authorization: token }
            });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Could not fetch account');
        }
    }
);

export const fetchAllUsers = createAsyncThunk(
    'user/fetchAllUsers',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().user.token || localStorage.getItem('token');
            const { data } = await axiosInstance.get('/users/all', {
                headers: { authorization: token }
            });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Could not fetch users');
        }
    }
);

export const updateUserRole = createAsyncThunk(
    'user/updateUserRole',
    async ({ userId, role }, { getState, rejectWithValue }) => {
        try {
            const token = getState().user.token || localStorage.getItem('token');
            const { data } = await axiosInstance.put(`/users/${userId}`, { role }, {
                headers: { authorization: token }
            });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Could not update user role');
        }
    }
);

const initialState = {
    user: null,
    token: null,
    status: 'idle',
    error: null,
    users: [],
    usersStatus: 'idle',
    usersError: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        restoreUserState(state) {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (storedToken) {
                state.token = storedToken;
            }
            if (storedUser) {
                try {
                    state.user = JSON.parse(storedUser);
                } catch {
                    localStorage.removeItem('user');
                }
            }
            state.status = 'idle';
            state.error = null;
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.status = 'idle';
            state.error = null;
            state.users = [];
            state.usersStatus = 'idle';
            state.usersError = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Registration failed';
            })
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.token = action.payload.token || null;
                state.user = action.payload.user || null;
                if (action.payload.token) localStorage.setItem('token', action.payload.token);
                if (action.payload.user) localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Login failed';
            })
            .addCase(fetchAccount.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAccount.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
                localStorage.setItem('user', JSON.stringify(action.payload));
            })
            .addCase(fetchAccount.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Could not fetch account';
            })
            .addCase(fetchAllUsers.pending, (state) => {
                state.usersStatus = 'loading';
                state.usersError = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.usersStatus = 'succeeded';
                state.users = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.usersStatus = 'failed';
                state.usersError = action.payload || 'Could not fetch users';
            })
            .addCase(updateUserRole.pending, (state) => {
                state.usersStatus = 'loading';
                state.usersError = null;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.usersStatus = 'succeeded';
                const updatedUser = action.payload;
                const userIndex = state.users.findIndex(u => u._id === updatedUser._id);
                if (userIndex > -1) state.users[userIndex] = updatedUser;
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.usersStatus = 'failed';
                state.usersError = action.payload || 'Could not update user role';
            });
    },
});

export const {restoreUserState, logout} = userSlice.actions;

export default userSlice.reducer;
import {configureStore} from '@reduxjs/toolkit';
import userReducer from './slices/UserSlice.jsx';
import complaintReducer from './slices/ComplaintSlice.jsx';

const store = configureStore({
    reducer: {
        user: userReducer,
        complaint: complaintReducer,
    }
});

export default store;
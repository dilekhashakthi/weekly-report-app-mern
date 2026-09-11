import { createSlice } from '@reduxjs/toolkit';

const initialToken = localStorage.getItem('wr_token') || null;
let initialUser = null;
try {
  const saved = localStorage.getItem('wr_user');
  if (saved) initialUser = JSON.parse(saved);
} catch {
  initialUser = null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialToken,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      if (user) {
        state.user = user;
        localStorage.setItem('wr_user', JSON.stringify(user));
      }
      if (token) {
        state.token = token;
        localStorage.setItem('wr_token', token);
      }
      state.isAuthenticated = true;
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('wr_token');
      localStorage.removeItem('wr_user');
    },
  },
});

export const { setCredentials, logoutUser } = authSlice.actions;
export default authSlice.reducer;

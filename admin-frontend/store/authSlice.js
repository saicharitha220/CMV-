import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const resolveApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    }
  }

  return process.env.NEXT_PUBLIC_API_URL || 'https://backend-omega-one-26.vercel.app/api/v1';
};

const initialState = {
  // Do not read localStorage during module initialization to avoid SSR/client hydration mismatch.
  token: null,
  admin: null,
  status: 'idle',
  error: null,
};

const apiUrl = resolveApiBaseUrl();

export const login = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
  const resp = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await resp.json();
  if (!resp.ok) {
    return thunkAPI.rejectWithValue(data.message || 'Login failed');
  }
  return data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.admin = null;
      localStorage.removeItem('cms_token');
      localStorage.removeItem('cms_admin');
    },
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.admin = action.payload.admin;
      if (typeof window !== 'undefined') {
        if (action.payload.token) localStorage.setItem('cms_token', action.payload.token);
        if (action.payload.admin) localStorage.setItem('cms_admin', JSON.stringify(action.payload.admin));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.admin = action.payload.admin;
        localStorage.setItem('cms_token', action.payload.token);
        localStorage.setItem('cms_admin', JSON.stringify(action.payload.admin));
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;

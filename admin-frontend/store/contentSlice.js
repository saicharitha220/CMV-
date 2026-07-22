import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const fetchContent = createAsyncThunk('content/fetchContent', async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  const resp = await fetch(`${apiUrl}/admin/content`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    return thunkAPI.rejectWithValue(data.message || 'Unable to load content');
  }
  return resp.json();
});

export const createContent = createAsyncThunk('content/createContent', async (payload, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  const resp = await fetch(`${apiUrl}/admin/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await resp.json();
  if (!resp.ok) {
    return thunkAPI.rejectWithValue(data.message || 'Create failed');
  }
  return data;
});

export const saveContent = createAsyncThunk('content/saveContent', async ({ key, updates }, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  const resp = await fetch(`${apiUrl}/admin/content/${key}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  const data = await resp.json();
  if (!resp.ok) {
    return thunkAPI.rejectWithValue(data.message || 'Save failed');
  }
  return data;
});

const contentSlice = createSlice({
  name: 'content',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(createContent.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createContent.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(saveContent.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.key === action.payload.key ? action.payload : item));
      })
      .addCase(saveContent.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export default contentSlice.reducer;

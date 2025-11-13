import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserState = {
  username: string;
  password: string;
};

const initialState: UserState = {
  username: '',
  password: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<UserState>) => {
      state.username = action.payload.username;
      state.password = action.payload.password;
    },
    clearCredentials: (state) => {
      state.username = '';
      state.password = '';
    },
  },
});

export const { setCredentials, clearCredentials } = userSlice.actions;
export default userSlice.reducer;


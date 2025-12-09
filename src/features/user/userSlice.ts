import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Account {
  _id: string;
  username: string;
  // avatar?: string;
  dateOfBirth?: string;
  role: 0 | 1;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UserState = {
  account: Account | null;
  isAuthenticated: boolean;
};

const initialState: UserState = {
  account: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAccount: (state, action: PayloadAction<Account>) => {
      state.account = action.payload;
      state.isAuthenticated = true;
    },
    clearAccount: (state) => {
      state.account = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAccount, clearAccount } = userSlice.actions;
export default userSlice.reducer;

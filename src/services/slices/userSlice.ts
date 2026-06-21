import {
  loginUserApi,
  TRegisterData,
  TLoginData,
  registerUserApi,
  logoutApi,
  getOrdersApi,
  updateUserApi,
  resetPasswordApi,
  forgotPasswordApi,
  getUserApi
} from '@api';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';
import { setCookie } from '../../utils/cookie';

type TUserState = {
  user: {
    email: string;
    name: string;
  } | null;
  isUserChecked: boolean;
  userOrders: TOrder[];
  loginUserRequest: boolean;
  loginUserError: string | null;
};

const userInitialState: TUserState = {
  user: null,
  isUserChecked: false,
  userOrders: [] as TOrder[],
  loginUserRequest: false,
  loginUserError: null
};

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async ({ email, password }: Omit<TLoginData, 'name'>) => {
    const data = await loginUserApi({ email, password });
    localStorage.setItem('refreshToken', data.refreshToken);
    setCookie('accessToken', data.accessToken);
    return data;
  }
);

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async ({ email, name, password }: TRegisterData) => {
    const data = await registerUserApi({ email, name, password });
    localStorage.setItem('refreshToken', data.refreshToken);
    setCookie('accessToken', data.accessToken);
    return data;
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ email, name, password }: TRegisterData) => {
    const data = await updateUserApi({ email, name, password });
    return data;
  }
);

export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  const data = await logoutApi();
  return data;
});

export const fetchUserOrders = createAsyncThunk(
  'user/fetchUserOrders',
  async () => {
    const data = await getOrdersApi();
    return data;
  }
);

export const forgotPassword = createAsyncThunk(
  'user/forgotPassword',
  async (email: string) => {
    await forgotPasswordApi({ email });
  }
);

export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async ({ password, token }: { password: string; token: string }) => {
    await resetPasswordApi({ password, token });
  }
);

export const checkUserAuth = createAsyncThunk(
  'user/checkUserAuth',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getUserApi();
      return data.user;
    } catch {
      return rejectWithValue(null);
    }
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState: userInitialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ email: string; name: string }>
    ) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    }
  },
  selectors: {
    selectUserOrders: (sliceState) => sliceState.userOrders,
    selectUser: (sliceState) => sliceState.user,
    selectIsUserChecked: (sliceState) => sliceState.isUserChecked,
    selectLoginUserRequest: (sliceState) => sliceState.loginUserRequest,
    selectLoginUserError: (sliceState) => sliceState.loginUserError
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loginUserRequest = true;
        state.loginUserError = null;
        state.isUserChecked = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginUserRequest = false;
        state.loginUserError = action.error.message || 'Failed to login';
        state.isUserChecked = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginUserRequest = false;
        state.user = action.payload.user;
        state.isUserChecked = true;
      })
      .addCase(registerUser.pending, (state) => {
        state.loginUserRequest = true;
        state.loginUserError = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loginUserRequest = false;
        state.loginUserError = action.error.message || 'Failed to register';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loginUserRequest = false;
        state.user = action.payload.user;
        state.isUserChecked = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        localStorage.removeItem('refreshToken');
        setCookie('accessToken', '', { expires: -1 });
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.userOrders = action.payload;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isUserChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.user = null;
        state.isUserChecked = true;
      })
      .addCase(checkUserAuth.pending, (state) => {
        state.user = null;
        state.isUserChecked = false;
      });
  }
});

export const {
  selectUser,
  selectIsUserChecked,
  selectUserOrders,
  selectLoginUserRequest,
  selectLoginUserError
} = userSlice.selectors;
export const { setUser, clearUser } = userSlice.actions;
export const userSliceReducer = userSlice.reducer;

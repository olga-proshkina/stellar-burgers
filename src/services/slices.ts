import {
  getIngredientsApi,
  loginUserApi,
  TRegisterData,
  TLoginData,
  registerUserApi,
  logoutApi,
  orderBurgerApi,
  getFeedsApi,
  getOrdersApi,
  getOrderByNumberApi,
  updateUserApi,
  resetPasswordApi,
  forgotPasswordApi
} from '@api';
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';
import { TConstructorIngredient, TIngredient } from '@utils-types';
// avoid importing RootState here to prevent circular type/runtime dependency
import { ingredientList } from './data';
import { TOrder } from '@utils-types';
import { setCookie, getCookie } from '../utils/cookie';

// INGREDIENTS

type IngredientsState = {
  ingredients: Array<TIngredient>;
  buns: Array<TIngredient>;
  mains: Array<TIngredient>;
  sauces: Array<TIngredient>;
  isLoading: boolean;
  error: string | null;
};

const ingredientsInitialState: IngredientsState = {
  ingredients: [],
  buns: [],
  mains: [],
  sauces: [],
  isLoading: false,
  error: null
};

export const fetchIngredients = createAsyncThunk(
  'ingredients/fetchIngredients',
  async () => {
    const data = await getIngredientsApi();
    return data;
  }
);

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState: ingredientsInitialState,
  reducers: {},
  selectors: {
    selectIngredients: (sliceState) => sliceState.ingredients,
    selectBuns: (sliceState) => sliceState.buns,
    selectMains: (sliceState) => sliceState.mains,
    selectSauces: (sliceState) => sliceState.sauces,
    selectIsLoading: (sliceState) => sliceState.isLoading,
    selectError: (sliceState) => sliceState.error
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch ingredients';
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ingredients = action.payload;
        state.buns = action.payload.filter(
          (ingredient: TIngredient) => ingredient.type === 'bun'
        );
        state.mains = action.payload.filter(
          (ingredient: TIngredient) => ingredient.type === 'main'
        );
        state.sauces = action.payload.filter(
          (ingredient: TIngredient) => ingredient.type === 'sauce'
        );
      });
  }
});

export const {
  selectIngredients,
  selectIsLoading,
  selectError,
  selectBuns,
  selectMains,
  selectSauces
} = ingredientsSlice.selectors;

// export default ingredientsSlice.reducer;
export const ingredientsSliceReducer = ingredientsSlice.reducer;

type ConstructorItemsState = {
  constructorItems: {
    bun: TIngredient | null;
    ingredients: TConstructorIngredient[];
  };
  orderRequest: boolean;
  orderModalData: TOrder | null;
};

const constructorItemsInitialState: ConstructorItemsState = {
  constructorItems: {
    bun: null,
    ingredients: []
  },
  orderRequest: false,
  orderModalData: null
};

export const orderBurger = createAsyncThunk(
  'constructor/orderBurger',
  async (ingredientIds: string[]) => {
    const data = await orderBurgerApi(ingredientIds);
    return data;
  }
);

export const constructorSlice = createSlice({
  name: 'constructorItems',
  initialState: constructorItemsInitialState,
  reducers: {
    addIngredient: (state, action) => {
      if (action.payload.type === 'bun') {
        state.constructorItems.bun = action.payload;
      } else {
        state.constructorItems.ingredients.push(action.payload);
      }
    },
    setOrderRequest: (state, action: PayloadAction<boolean>) => {
      state.orderRequest = action.payload;
    },
    setOrderModalData: (state, action: PayloadAction<TOrder | null>) => {
      state.orderModalData = action.payload;
    }
  },
  selectors: {
    selectConstructorItems: (sliceState) => sliceState.constructorItems,
    selectOrderRequest: (sliceState) => sliceState.orderRequest,
    selectOrderModalData: (sliceState) => sliceState.orderModalData
  },
  extraReducers: (builder) => {
    builder
      .addCase(orderBurger.pending, (state) => {
        state.orderRequest = true;
        state.orderModalData = null;
      })
      .addCase(orderBurger.rejected, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = null;
      })
      .addCase(orderBurger.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload.order as unknown as TOrder;
        state.constructorItems.bun = null;
        state.constructorItems.ingredients = [];
      });
  }
});

export const { addIngredient, setOrderModalData } = constructorSlice.actions;
export const constructorSliceReducer = constructorSlice.reducer;

// export const selectConstructorItems = (state: any) =>
//   state.constructorSlice?.constructorItems;
export const {
  selectConstructorItems,
  selectOrderRequest,
  selectOrderModalData
} = constructorSlice.selectors;

type TFeedState = {
  orders: TOrder[];
  order: TOrder | null;
  feed: any;
  readyOrders: number[];
  pendingOrders: number[];
};

const feedInitialState: TFeedState = {
  orders: [],
  order: null,
  feed: {},
  readyOrders: [],
  pendingOrders: []
};

export const fetchFeed = createAsyncThunk('feed/fetchFeed', async () => {
  const data = await getFeedsApi();
  return data;
});

export const fetchOrder = createAsyncThunk(
  'feed/fetchOrder',
  async (orderNumber: number) => {
    const data = await getOrderByNumberApi(orderNumber);
    return data;
  }
);

export const feedSlice = createSlice({
  name: 'feed',
  initialState: feedInitialState,
  reducers: {},
  selectors: {
    selectOrders: (sliceState) => sliceState.orders,
    selectOrder: (sliceState) => sliceState.order,
    selectFeed: (sliceState) => sliceState.feed,
    selectReadyOrders: (sliceState) => sliceState.readyOrders,
    selectPendingOrders: (sliceState) => sliceState.pendingOrders
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, () => {})
      .addCase(fetchFeed.rejected, (state, action) => {
        state.orders = [];
        state.feed = {};
        state.readyOrders = [];
        state.pendingOrders = [];
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.orders = action.payload.orders;
        state.feed = {
          total: action.payload.total,
          totalToday: action.payload.totalToday
        };
        state.readyOrders = action.payload.orders
          .filter((order: TOrder) => order.status === 'done')
          .map((order: TOrder) => order.number);
        state.pendingOrders = action.payload.orders
          .filter((order: TOrder) => order.status === 'pending')
          .map((order: TOrder) => order.number);
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.order = action.payload.orders[0];
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.order = null;
      });
  }
});

export const {
  selectOrders,
  selectFeed,
  selectReadyOrders,
  selectPendingOrders,
  selectOrder
} = feedSlice.selectors;
export const feedSliceReducer = feedSlice.reducer;

type TUserState = {
  user: {
    email: string;
    name: string;
  } | null;
  isAuthChecked: boolean;
  userOrders: TOrder[];
  loginUserRequest: boolean;
  loginUserError: string | null;
};

const userInitialState: TUserState = {
  user: null,
  isAuthChecked: false,
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
    selectIsAuthChecked: (sliceState) => sliceState.isAuthChecked,
    selectLoginUserRequest: (sliceState) => sliceState.loginUserRequest,
    selectLoginUserError: (sliceState) => sliceState.loginUserError
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loginUserRequest = true;
        state.loginUserError = null;
        state.isAuthChecked = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginUserRequest = false;
        state.loginUserError = action.error.message || 'Failed to login';
        state.isAuthChecked = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginUserRequest = false;
        state.user = action.payload.user;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.pending, (state) => {
        state.loginUserRequest = true;
        state.loginUserError = null;
        state.isAuthChecked = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loginUserRequest = false;
        state.loginUserError = action.error.message || 'Failed to register';
        state.isAuthChecked = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loginUserRequest = false;
        state.user = action.payload.user;
        state.isAuthChecked = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthChecked = false;
        localStorage.removeItem('refreshToken');
        setCookie('accessToken', '', { expires: -1 });
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.userOrders = action.payload;
      });
  }
});

export const {
  selectUser,
  selectIsAuthChecked,
  selectUserOrders,
  selectLoginUserRequest,
  selectLoginUserError
} = userSlice.selectors;
export const { setUser, clearUser } = userSlice.actions;
export const userSliceReducer = userSlice.reducer;

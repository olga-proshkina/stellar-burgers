import {
  getIngredientsApi,
  loginUserApi,
  TRegisterData,
  TLoginData,
  registerUserApi,
  logoutApi,
  orderBurgerApi
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

export const asyncOrderBurger = createAsyncThunk(
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
    clear: (state) => {
      state.constructorItems.bun = null;
      state.constructorItems.ingredients = [];
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
  }
});

export const { clear, addIngredient } = constructorSlice.actions;
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
  feed: any;
  readyOrders: number[];
  pendingOrders: number[];
};

const feedInitialState: TFeedState = {
  orders: [],
  feed: {},
  readyOrders: [],
  pendingOrders: []
};

export const feedSlice = createSlice({
  name: 'feed',
  initialState: feedInitialState,
  reducers: {},
  selectors: {
    selectOrders: (sliceState) => sliceState.orders,
    selectFeed: (sliceState) => sliceState.feed,
    selectReadyOrders: (sliceState) => sliceState.readyOrders,
    selectPendingOrders: (sliceState) => sliceState.pendingOrders
  }
});

export const {
  selectOrders,
  selectFeed,
  selectReadyOrders,
  selectPendingOrders
} = feedSlice.selectors;
export const feedSliceReducer = feedSlice.reducer;

type TOrderState = {
  orderData: TOrder | null;
  orderIngredients: TIngredient[];
};

const orderInitialState: TOrderState = {
  orderData: null,
  orderIngredients: []
};

export const orderSlice = createSlice({
  name: 'order',
  initialState: orderInitialState,
  reducers: {},
  selectors: {
    selectOrderData: (sliceState) => sliceState.orderData,
    selectOrderIngredients: (sliceState) => sliceState.orderIngredients
  }
});

export const { selectOrderData, selectOrderIngredients } = orderSlice.selectors;
export const orderSliceReducer = orderSlice.reducer;

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

export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  const data = await logoutApi();
  return data;
});

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

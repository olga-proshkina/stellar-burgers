import { getIngredientsApi } from '@api';
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
  selectedIngredient: TIngredient | null;
};

const constructorItemsInitialState: ConstructorItemsState = {
  constructorItems: {
    bun: null,
    ingredients: []
  },
  orderRequest: false,
  orderModalData: {} as TOrder | null,
  selectedIngredient: null
};

export const constructorSlice = createSlice({
  name: 'constructorItems',
  initialState: constructorItemsInitialState,
  reducers: {
    setBun: (state, action) => {
      state.constructorItems.bun = action.payload;
    },
    setIngredients: (state, action) => {
      state.constructorItems.ingredients = action.payload;
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
    },
    setSelectedIngredient: (
      state,
      action: PayloadAction<TIngredient | null>
    ) => {
      state.selectedIngredient = action.payload;
    }
  },
  selectors: {
    selectConstructorItems: (sliceState) => sliceState.constructorItems,
    selectOrderRequest: (sliceState) => sliceState.orderRequest,
    selectOrderModalData: (sliceState) => sliceState.orderModalData,
    selectSelectedIngredient: (sliceState) => sliceState.selectedIngredient
  }
});

export const { setBun, setIngredients, clear, setSelectedIngredient } =
  constructorSlice.actions;
export const constructorSliceReducer = constructorSlice.reducer;

// export const selectConstructorItems = (state: any) =>
//   state.constructorSlice?.constructorItems;
export const {
  selectConstructorItems,
  selectOrderRequest,
  selectOrderModalData,
  selectSelectedIngredient
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
    name: string;
    email: string;
  } | null;
  isAuthChecked: boolean;
  userOrders: TOrder[];
};

const userInitialState: TUserState = {
  user: null,
  isAuthChecked: false,
  userOrders: [] as TOrder[]
};

export const userSlice = createSlice({
  name: 'user',
  initialState: userInitialState,
  reducers: {},
  selectors: {
    selectUser: (sliceState) => sliceState.user,
    selectIsAuthChecked: (sliceState) => sliceState.isAuthChecked,
    selectUserOrders: (sliceState) => sliceState.userOrders
  }
});

export const { selectUser, selectIsAuthChecked, selectUserOrders } =
  userSlice.selectors;
export const userSliceReducer = userSlice.reducer;

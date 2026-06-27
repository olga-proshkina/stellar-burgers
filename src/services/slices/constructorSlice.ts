import { orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TConstructorIngredient, TIngredient } from '@utils-types';
import { TOrder } from '@utils-types';
import { v4 as uuidv4 } from 'uuid';

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
    addIngredient: {
      reducer: (
        state,
        { payload }: PayloadAction<TConstructorIngredient | TIngredient>
      ) => {
        if (payload.type === 'bun') {
          state.constructorItems.bun = payload;
        } else {
          state.constructorItems.ingredients.push(
            payload as TConstructorIngredient
          );
        }
      },
      prepare: (ingredient: TIngredient) => ({
        payload:
          ingredient.type !== 'bun'
            ? { ...ingredient, id: uuidv4() }
            : ingredient
      })
    },

    removeIngredient: (state, action: PayloadAction<number>) => {
      state.constructorItems.ingredients.splice(action.payload, 1);
    },

    moveIngredient: (
      state,
      action: PayloadAction<{ from: number; to: number }>
    ) => {
      const { from, to } = action.payload;
      const items = state.constructorItems.ingredients;
      const [moved] = items.splice(from, 1);
      items.splice(to, 0, moved);
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

export const {
  addIngredient,
  removeIngredient,
  moveIngredient,
  setOrderModalData
} = constructorSlice.actions;
export const constructorSliceReducer = constructorSlice.reducer;

// export const selectConstructorItems = (state: any) =>
//   state.constructorSlice?.constructorItems;
export const {
  selectConstructorItems,
  selectOrderRequest,
  selectOrderModalData
} = constructorSlice.selectors;

import { getFeedsApi, getOrderByNumberApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { TOrder } from '@utils-types';

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

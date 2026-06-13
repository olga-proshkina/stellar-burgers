import { FC } from 'react';

import { TOrder } from '@utils-types';
import { FeedInfoUI } from '../ui/feed-info';
import { useSelector } from '../../services/store';
import {
  // selectOrders,
  selectFeed,
  selectReadyOrders,
  selectPendingOrders
} from '../../services/slices';

const getOrders = (orders: TOrder[], status: string): number[] =>
  orders
    .filter((item) => item.status === status)
    .map((item) => item.number)
    .slice(0, 20);

export const FeedInfo: FC = () => {
  /** DONE: взять переменные из стора */
  // const orders: TOrder[] = useSelector(selectOrders);
  const feed = useSelector(selectFeed);
  const readyOrders = useSelector(selectReadyOrders);
  const pendingOrders = useSelector(selectPendingOrders);

  return (
    <FeedInfoUI
      readyOrders={readyOrders}
      pendingOrders={pendingOrders}
      feed={feed}
    />
  );
};
//

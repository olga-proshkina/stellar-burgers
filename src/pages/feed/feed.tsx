import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC } from 'react';
import { useSelector } from '../../services/store';
import { selectFeed } from '../../services/slices';

export const Feed: FC = () => {
  /** DONE: взять переменную из стора */
  const orders: TOrder[] = useSelector(selectFeed);

  if (!orders.length) {
    return <Preloader />;
  }

  <FeedUI orders={orders} handleGetFeeds={() => {}} />;
};

import { useSelector } from '../../services/store';
import { selectIsAuthChecked, selectUser } from '../../services/slices';
import { Navigate, useNavigate } from 'react-router-dom';

type ProtectedRouteProps = {
  children: React.ReactElement;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthChecked = useSelector(selectIsAuthChecked);

  if (!isAuthChecked) {
    return <Navigate to='/login' replace />;
  }

  return children;
};

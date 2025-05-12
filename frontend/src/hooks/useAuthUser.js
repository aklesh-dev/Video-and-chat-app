import { useQuery } from '@tanstack/react-query';
import { getAuthUser } from '../lib/api';

const useAuthUser = () => {
  // tanstack query
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,  // don't retry if queryFn fails
  });

  return { isLoading: authUser.isLoading, authUser: authUser.data?.user, error: authUser.error }

}

export default useAuthUser;
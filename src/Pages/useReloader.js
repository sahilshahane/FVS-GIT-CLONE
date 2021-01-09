import { useContext } from 'react';
import RoutingContext from './modules/routing-context';

function useReload() {
  const { updateRoute } = useContext(RoutingContext);
  updateRoute('');
}
export default useReload;

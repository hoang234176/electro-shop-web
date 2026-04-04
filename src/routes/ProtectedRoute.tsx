import { getRole } from '../utils/tokenUtils'
import { Navigate } from 'react-router-dom';

interface Props {
    allowRole: string;
}

const ProtectedRoute = ({allowRole}: Props) => {
    const role = getRole();
    if (role !== allowRole) {
        return <Navigate to="/error403" />;
    };
}

export default ProtectedRoute;
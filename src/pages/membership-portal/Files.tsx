import { Navigate } from 'react-router-dom';
import { LIBRARY_UPLOAD_TAB_URL } from '@/lib/libraryPaths';

export default function Files() {
  return <Navigate to={LIBRARY_UPLOAD_TAB_URL} replace />;
}

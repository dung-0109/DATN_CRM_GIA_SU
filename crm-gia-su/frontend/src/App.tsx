import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './portals/auth/Login';
import Register from './portals/auth/Register';
import ForgotPassword from './portals/auth/ForgotPassword';
import ProfileSelect from './portals/auth/ProfileSelect';
import { ProtectedRoute } from './components/ProtectedRoute';
import PortalSelector from './portals/shared/PortalSelector';
import ClientPortal from './portals/client/ClientPortal';
import TutorPortal from './portals/tutor/TutorPortal';
import LandingPage from './pages/LandingPage';
import RequestTutor from './portals/client/RequestTutor';
import MyChildren from './portals/client/MyChildren';
import TutorJobs from './portals/tutor/TutorJobs';
import SalesMatching from './portals/admin-crm/SalesMatching';
import TutorAttendance from './portals/tutor/TutorAttendance';
import ParentAttendance from './portals/client/ParentAttendance';
import AcademicDisputes from './portals/admin-crm/AcademicDisputes';
import LeavesManager from './portals/shared/LeavesManager';
import AdminCRM from './portals/admin-crm/AdminCRM';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes requiring login but no active profile (Profile selector itself) */}
        <Route path="/profile-select" element={
          <ProtectedRoute>
            <ProfileSelect />
          </ProtectedRoute>
        } />

        {/* Protected routes requiring login AND active profile */}
        <Route path="/portals" element={
          <ProtectedRoute>
            <PortalSelector />
          </ProtectedRoute>
        } />
        <Route path="/admin-crm" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACADEMIC', 'ACCOUNTANT']}>
            <AdminCRM />
          </ProtectedRoute>
        }>
          <Route path="matching" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
              <SalesMatching />
            </ProtectedRoute>
          } />
          <Route path="disputes" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACADEMIC']}>
              <AcademicDisputes />
            </ProtectedRoute>
          } />
        </Route>
        <Route path="/client" element={
          <ProtectedRoute allowedRoles={['PARENT', 'STUDENT']}>
            <ClientPortal />
          </ProtectedRoute>
        } />
        <Route path="/client/request-tutor" element={
          <ProtectedRoute allowedRoles={['PARENT']}>
            <RequestTutor />
          </ProtectedRoute>
        } />
        <Route path="/client/children" element={
          <ProtectedRoute allowedRoles={['PARENT']}>
            <MyChildren />
          </ProtectedRoute>
        } />
        <Route path="/client/attendance" element={
          <ProtectedRoute allowedRoles={['PARENT']}>
            <ParentAttendance />
          </ProtectedRoute>
        } />
        <Route path="/client/leaves" element={
          <ProtectedRoute allowedRoles={['PARENT']}>
            <LeavesManager />
          </ProtectedRoute>
        } />
        <Route path="/tutor" element={
          <ProtectedRoute allowedRoles={['TUTOR']}>
            <TutorPortal />
          </ProtectedRoute>
        } />
        <Route path="/tutor/jobs" element={
          <ProtectedRoute allowedRoles={['TUTOR']}>
            <TutorJobs />
          </ProtectedRoute>
        } />
        <Route path="/tutor/attendance" element={
          <ProtectedRoute allowedRoles={['TUTOR']}>
            <TutorAttendance />
          </ProtectedRoute>
        } />
        <Route path="/tutor/leaves" element={
          <ProtectedRoute allowedRoles={['TUTOR']}>
            <LeavesManager />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;

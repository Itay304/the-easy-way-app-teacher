import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import useAuthRole from './hooks/useAuthRole.js';
import useBackButtonGuard from './hooks/useBackButtonGuard.js';
import { AuthProvider } from './context/AuthContext.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import BottomNav from './components/BottomNav.jsx';
import Login from './pages/Login.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import Home from './pages/Home.jsx';
import Classes from './pages/Classes.jsx';
import ClassDetail from './pages/ClassDetail.jsx';
import Assignments from './pages/Assignments.jsx';
import Profile from './pages/Profile.jsx';

function Layout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1 max-w-3xl w-full mx-auto pb-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  const { status, user, profile } = useAuthRole();
  useBackButtonGuard();

  if (status === 'loading') {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (status === 'signed-out') return <Login />;
  if (status === 'unauthorized') return <Unauthorized />;

  return (
    <AuthProvider user={user} profile={profile}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/classes/:classId" element={<ClassDetail />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

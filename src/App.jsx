import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import useAuthRole from './hooks/useAuthRole.js';
import useBackButtonGuard from './hooks/useBackButtonGuard.js';
import { AuthProvider } from './context/AuthContext.jsx';
import { TAB_PATHS } from './lib/tabs.js';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import BottomNav from './components/BottomNav.jsx';
import TabsCarousel from './components/TabsCarousel.jsx';
import Login from './pages/Login.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import ClassDetail from './pages/ClassDetail.jsx';

// עוטף את 4 הטאבים (Home/Classes/Assignments/Profile) ב-TabsCarousel
// יחיד ומתמיד — לא נטען מחדש כשעוברים בין נתיבי הטאבים (swipe/bottom nav),
// רק כשעוזבים אותם לגמרי (למשל ל-/classes/:classId) הוא מתחלף ב-Outlet.
function Layout() {
  const location = useLocation();
  const isTabRoute = TAB_PATHS.includes(location.pathname);

  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1 max-w-3xl w-full mx-auto pb-4">
        {isTabRoute ? <TabsCarousel /> : <Outlet />}
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
            <Route path="/" element={null} />
            <Route path="/classes" element={null} />
            <Route path="/assignments" element={null} />
            <Route path="/profile" element={null} />
            <Route path="/classes/:classId" element={<ClassDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

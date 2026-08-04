import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import useAuthRole from './hooks/useAuthRole.js';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import BottomNav from './components/BottomNav.jsx';
import Login from './pages/Login.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import Home from './pages/Home.jsx';
import Classes from './pages/Classes.jsx';
import ClassDetail from './pages/ClassDetail.jsx';
import Assignments from './pages/Assignments.jsx';
import Profile from './pages/Profile.jsx';

function Layout({ user, profile }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1 max-w-3xl w-full mx-auto pb-4">
        <Outlet context={{ user, profile }} />
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  const { status, user, profile } = useAuthRole();

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
    <BrowserRouter>
      <Routes>
        <Route element={<Layout user={user} profile={profile} />}>
          <Route path="/" element={<Home />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/classes/:classId" element={<ClassDetail />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

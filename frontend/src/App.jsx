import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Seats from './pages/Seats';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import useAuthStore from './store/useAuth';

function Layout() {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {user && <Navbar />}
      <main className="flex-1 p-4 md:p-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/books" element={<Books />} />
            <Route path="/seats" element={<Seats />} />
          </Route>
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;

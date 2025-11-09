import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import Login from "./pages/Login";
import Dashboard from "./pages/Expense";
import Expenses from "./pages/Expenses";
import Categories from "./pages/Categories";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, logout } = useAuth();
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <nav style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <Link to="/">Dashboard</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/categories">Categories</Link>
        <div style={{ flex: 1 }} />
        {user ? <button onClick={logout}>Logout</button> : <Link to="/login">Login</Link>}
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
      </Routes>
    </div>
  );
}

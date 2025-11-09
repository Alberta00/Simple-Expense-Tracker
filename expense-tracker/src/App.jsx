import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Categories from "./pages/Categories";
import { s } from "./ui";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return <div style={s.container}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, logout } = useAuth();
  return (
    <div style={s.container}>
      <nav style={s.nav}>
        <NavLink to="/" end style={({ isActive }) => s.link(isActive)}>
          Dashboard
        </NavLink>
        <NavLink to="/expenses" style={({ isActive }) => s.link(isActive)}>
          Expenses
        </NavLink>
        <NavLink to="/categories" style={({ isActive }) => s.link(isActive)}>
          Categories
        </NavLink>
        <div style={s.spacer} />
        {user ? (
          <button style={s.btn} onClick={logout}>
            Logout
          </button>
        ) : (
          <NavLink to="/login" style={({ isActive }) => s.link(isActive)}>
            Login
          </NavLink>
        )}
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <PrivateRoute>
              <Expenses />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <Categories />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

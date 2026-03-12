import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import Layout from "./components/Layout";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import SuppliersPage from "./pages/SuppliersPage";
import AdminPage from "./pages/AdminPage";
import { getMe } from "./api/authService";
import PurchasesPage from "./pages/PurchasesPage";


function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  // 🔹 Vérifie si un token existe au chargement
  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);

      getMe(savedToken)
        .then((data) => {
          setUser(data);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
          setToken("");
        });
    }
  }, []);

  // 🔹 Après login
  const handleLogin = (loggedUser, accessToken) => {
    setUser(loggedUser);
    setToken(accessToken);
    localStorage.setItem("token", accessToken);
  };

  // 🔹 Après changement de mot de passe → logout forcé
  const handlePasswordChanged = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken("");
  };

  // 🔹 Logout normal
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken("");
  };

  // 🔹 Pas connecté → login
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 🔹 Premier login → changer mot de passe
  if (user.mustChangePassword) {
    return (
      <ChangePasswordPage
        user={user}
        token={token}
        onPasswordChanged={handlePasswordChanged}
      />
    );
  }

  // 🔹 route par défaut selon rôle
  const defaultRoute =
    user.role === "ADMIN" || user.role === "SUPER_ADMIN"
      ? "/admin"
      : "/user/orders";

  return (
  <Layout user={user} onLogout={handleLogout}>
    <Routes key={user.role}>

      {/* pages user */}
      <Route path="/user/products" element={<ProductsPage token={token} />} />
      <Route path="/user/orders" element={<OrdersPage token={token} />} />
      <Route path="/user/customers" element={<CustomersPage token={token} />} />
      <Route path="/user/suppliers" element={<SuppliersPage token={token} />} />
            <Route path="/user/purchases" element={<PurchasesPage token={token} />} />


      {/* page admin */}
      {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
        <Route
          path="/admin"
          element={<AdminPage user={user} token={token} />}
        />
      )}

      <Route path="*" element={<Navigate to={defaultRoute} replace />} />

    </Routes>
  </Layout>
);
        
}

export default App;
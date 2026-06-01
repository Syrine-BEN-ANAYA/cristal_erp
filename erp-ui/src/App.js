import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";

import LoginPage from "./pages/LoginPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import Layout from "./components/Layout";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import SuppliersPage from "./pages/SuppliersPage";
import AiPage from "./pages/AiPage";


import AdminPage from "./pages/AdminPage";
import { getMe } from "./api/authService";
import PurchasesPage from "./pages/PurchasesPage";
import ReportingPage from "./pages/ReportingPage";
import UnderConstructionPage from "./pages/UnderConstructionPage";
import AuditPage from "./pages/AuditPage";
import UsersManagement from "./pages/UsersManagement";
import FirstPage from "./pages/FirstPage";
import HrPage from "./pages/HrPage";
import EmployeesPage from "./pages/EmployeesPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import ContractsPage from "./pages/ContractsPage";
import LeavesPage from "./pages/LeavesPage";

import PayrollPage from "./pages/PayrollPage";

function AppContent() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  const handleLogin = (loggedUser, accessToken) => {
    setUser(loggedUser);
    setToken(accessToken);
    localStorage.setItem("token", accessToken);
  };

  const handlePasswordChanged = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken("");
  };

  return (
    <Routes>
      <Route path="/" element={<FirstPage onLogout={handleLogout} />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/under-construction" element={<UnderConstructionPage />} />
      
      <Route path="/change-password" element={
        user?.mustChangePassword ? (
          <ChangePasswordPage user={user} token={token} onPasswordChanged={handlePasswordChanged} />
        ) : (
          <Navigate to="/" />
        )
      } />
 <Route path="/admin" element={
  user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") ? (
    <Layout user={user} onLogout={handleLogout}>
      <AdminPage token={token} user={user} />
    </Layout>
  ) : (
    <Navigate to="/" />
  )
} />
   <Route path="/user/hr/*" element={
  user ? (
    <Layout user={user} onLogout={handleLogout}>
      <HrPage token={token} user={user} onLogout={handleLogout} />
    </Layout>
  ) : (
    <Navigate to="/" />
  )
} />
<Route
  path="/user/ai"
  element={
    user ? (
      <Layout user={user} onLogout={handleLogout}>
        <AiPage token={token} />
      </Layout>
    ) : (
      <Navigate to="/" />
    )
  }
/>
   <Route path="/user/hr/payroll/*" element={
  user ? (
    <Layout user={user} onLogout={handleLogout}>
      <PayrollPage token={token} user={user} onLogout={handleLogout} />
    </Layout>
  ) : (
    <Navigate to="/" />
  )
} />

      {/* Route directe pour EmployeesPage (optionnelle) */}
      <Route path="/user/hr/employees" element={
        user ? (
          <Layout user={user} onLogout={handleLogout}>
            <EmployeesPage token={token} language="en" />
          </Layout>
        ) : (
          <Navigate to="/" />
        )
      } />
           {/* Route directe pour EmployeesPage (optionnelle) */}
      <Route path="/user/hr/departments" element={
        user ? (
          <Layout user={user} onLogout={handleLogout}>
            <DepartmentsPage token={token} />
          </Layout>
        ) : (
          <Navigate to="/" />
        )
      } />
        <Route path="/user/hr/contracts" element={
        user ? (
          <Layout user={user} onLogout={handleLogout}>
            <ContractsPage token={token} />
          </Layout>
        ) : (
          <Navigate to="/" />
        )
      } />
         <Route path="/user/hr/leaves" element={
        user ? (
          <Layout user={user} onLogout={handleLogout}>
            <LeavesPage token={token} />
          </Layout>
        ) : (
          <Navigate to="/" />
        )
      } />
             
      <Route path="/admin/users" element={
        user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") ? (
          <Layout user={user} onLogout={handleLogout}>
            <UsersManagement user={user} token={token} />
          </Layout>
        ) : (
          <Navigate to="/" />
        )
      } />
      
      <Route path="/admin/audit" element={
        user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") ? (
          <Layout user={user} onLogout={handleLogout}>
            <AuditPage token={token} user={user} />
          </Layout>
        ) : (
          <Navigate to="/" />
        )
      } />
        <Route path="/admin/audit" element={
        user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN") ? (
          <Layout user={user} onLogout={handleLogout}>
            <AuditPage token={token} user={user} />
          </Layout>
        ) : (
          <Navigate to="/" />
        )
      } />
     
      
      <Route path="/user/reporting" element={
        user ? (
          <Layout user={user} onLogout={handleLogout}>
            <ReportingPage token={token} />
          </Layout>
        ) : (
          <Navigate to="/" />
        )
      } />
      
      <Route path="/user/products" element={
        user ? (
          <Layout user={user} onLogout={handleLogout}>
            <ProductsPage token={token} />
          </Layout>
        ) : (
          <Navigate to="/" />
        )
      } />
      
      <Route path="/user/orders" element={
        user ? (
          <Layout user={user} onLogout={handleLogout}>
            <OrdersPage token={token} />
          </Layout>
        ) : (
          <Navigate to="/" />
        )
      } />
      
      <Route path="/user/customers" element={
        user ? (
          <Layout user={user} onLogout={handleLogout}>
            <CustomersPage token={token} />
          </Layout>
        ) : (
          <Navigate to="/" />
        )
      } />
      
      <Route path="/user/suppliers" element={
        user ? (
          <Layout user={user} onLogout={handleLogout}>
            <SuppliersPage token={token} />
          </Layout>
        ) : (
          <Navigate to="/" />
        )
      } />
      
      <Route path="/user/purchases" element={
        user ? (
          <Layout user={user} onLogout={handleLogout}>
            <PurchasesPage token={token} />
          </Layout>
        ) : (
          <Navigate to="/" />
        )
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
// LoginPage.js - Version corrigée avec accès par rôle
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useLanguage } from '../context/LanguageContext';
import { login } from '../api/authService';
import { FiMail, FiLock, FiGlobe } from 'react-icons/fi';
import '../styles/LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const { language, toggleLanguage, t, isRTL } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Traductions spécifiques à LoginPage
  const loginTranslations = {
    EN: {
      welcomeBack: 'Welcome back',
      signIn: 'Sign in to your account',
      username: 'Username',
      usernamePlaceholder: 'Enter your username',
      password: 'Password',
      passwordPlaceholder: '••••••••',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      login: 'Log in',
      loggingIn: 'Checking...',
      noAccount: "Don't have an account?",
      contactSupport: 'Contact support',
      networkError: 'Network error. Please check your connection.',
      invalidRequest: 'Invalid request. Please check your credentials.',
      userNotFound: 'User does not exist',
      accessForbidden: 'Access forbidden. Please contact your administrator.',
      tooManyAttempts: 'Too many attempts. Please try again later.',
      serverError: 'Server error. Please try again later.',
      loginFailed: 'Login failed',
      accessDenied: 'Access Denied',
      departmentRestrictedAdmin: '"{{department}}" department is restricted to Administrators only.',
      departmentRestrictedProd: '"{{department}}" department is restricted to Production users and Super Administrators only.',
      departmentRestrictedHR: '"{{department}}" department is restricted to HR users and Super Administrators only.',
      departmentRestrictedDefault: 'You don\'t have permission for "{{department}}" department.'
    },
    AR: {
      welcomeBack: 'مرحباً بعودتك',
      signIn: 'تسجيل الدخول إلى حسابك',
      username: 'اسم المستخدم',
      usernamePlaceholder: 'أدخل اسم المستخدم',
      password: 'كلمة المرور',
      passwordPlaceholder: '••••••••',
      rememberMe: 'تذكرني',
      forgotPassword: 'نسيت كلمة المرور؟',
      login: 'تسجيل الدخول',
      loggingIn: 'جاري التحقق...',
      noAccount: 'ليس لديك حساب؟',
      contactSupport: 'اتصل بالدعم',
      networkError: 'خطأ في الشبكة. يرجى التحقق من اتصالك.',
      invalidRequest: 'طلب غير صالح. يرجى التحقق من بياناتك.',
      userNotFound: 'المستخدم غير موجود',
      accessForbidden: 'الوصول ممنوع. يرجى الاتصال بالمسؤول.',
      tooManyAttempts: 'محاولات كثيرة. يرجى المحاولة لاحقاً.',
      serverError: 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
      loginFailed: 'فشل تسجيل الدخول',
      accessDenied: 'الوصول ممنوع',
      departmentRestrictedAdmin: 'قسم "{{department}}" مقيد بالمسؤولين فقط.',
      departmentRestrictedProd: 'قسم "{{department}}" مقيد بمستخدمي الإنتاج والمسؤولين العامين فقط.',
      departmentRestrictedHR: 'قسم "{{department}}" مقيد بمستخدمي الموارد البشرية والمسؤولين العامين فقط.',
      departmentRestrictedDefault: 'ليس لديك صلاحية لدخول قسم "{{department}}".'
    }
  };

  const localT = loginTranslations[language];

  // Helper functions for localStorage (safely)
  const safeSetLocalStorage = (key, value) => {
    try { localStorage.setItem(key, value); return true; } catch (err) { return false; }
  };
  const safeRemoveLocalStorage = (key) => {
    try { localStorage.removeItem(key); } catch (err) {}
  };

  // === Vérification des droits d'accès selon le type de département et le rôle ===
  const checkDepartmentAccess = (selectedDeptType, userRole) => {
    const isSuperAdmin = userRole === "SUPER_ADMIN";
    const isAdmin = userRole === "ADMIN";
    const isProdUser = userRole === "PROD_USER";
    const isHrUser = userRole === "HR_USER";

    switch (selectedDeptType) {
      case 'admin':
        return isAdmin || isSuperAdmin;
      case 'prod_user':
        return isProdUser || isSuperAdmin;
      case 'hr_user':
        return isHrUser || isSuperAdmin;
      case 'all':
        return true;
      default:
        return true; // par sécurité, autoriser
    }
  };

  const getAccessDeniedMessage = (selectedDeptType, selectedDeptName) => {
    if (selectedDeptType === 'admin') {
      return localT.departmentRestrictedAdmin.replace('{{department}}', selectedDeptName);
    }
    if (selectedDeptType === 'prod_user') {
      return localT.departmentRestrictedProd.replace('{{department}}', selectedDeptName);
    }
    if (selectedDeptType === 'hr_user') {
      return localT.departmentRestrictedHR.replace('{{department}}', selectedDeptName);
    }
    return localT.departmentRestrictedDefault.replace('{{department}}', selectedDeptName);
  };

  const getErrorMessage = (err) => {
    if (!err.response) {
      if (err.request) return localT.networkError;
      return err.message || localT.loginFailed;
    }
    const status = err.response.status;
    const backendMessage = err.response?.data?.message || err.response?.data?.error || '';
    switch (status) {
      case 400: return localT.invalidRequest;
      case 401:
      case 404: return localT.userNotFound;
      case 403: return localT.accessForbidden;
      case 429: return localT.tooManyAttempts;
      case 500: return localT.serverError;
      default:
        if (backendMessage && /invalid|credentials|not found|exist|incorrect/i.test(backendMessage)) {
          return localT.userNotFound;
        }
        return backendMessage || `${localT.loginFailed} (${status})`;
    }
  };

  const clearDepartmentStorage = () => {
    const keys = ['selectedDepartment', 'selectedDepartmentType', 'selectedDepartmentPath', 'selectedDepartmentName', 'isUnderDevelopment'];
    keys.forEach(k => safeRemoveLocalStorage(k));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const selectedDeptType = localStorage.getItem('selectedDepartmentType');
      const selectedDeptName = localStorage.getItem('selectedDepartmentName') || (language === 'EN' ? 'this department' : 'هذا القسم');
      const selectedDeptId = localStorage.getItem('selectedDepartment');
      
      const res = await login(username, password);
      const { user, access_token } = res;
      
      // Vérifier l'accès
      const hasAccess = checkDepartmentAccess(selectedDeptType, user.role);
      if (!hasAccess) {
        setError(getAccessDeniedMessage(selectedDeptType, selectedDeptName));
        setIsLoading(false);
        return;
      }
      
      safeSetLocalStorage('token', access_token);
      onLogin(user, access_token);
      clearDepartmentStorage();

      if (user.mustChangePassword) {
        navigate("/change-password");
        return;
      }

      // Redirection basée sur le type de département ET l'ID (pour HR)
      let redirectPath = "/user/reporting"; // fallback
      const normalizedDeptType = selectedDeptType ? selectedDeptType.toLowerCase() : null;

      if (normalizedDeptType === 'admin') {
        redirectPath = "/admin";
      } else if (selectedDeptId && selectedDeptId.toLowerCase() === 'hr') {
        redirectPath = "/user/hr";
      } else if (normalizedDeptType === 'prod_user') {
        redirectPath = "/user/reporting";
      } else if (normalizedDeptType === 'hr_user') {
        redirectPath = "/user/hr";
      }

      console.log("Redirection vers:", redirectPath);
      navigate(redirectPath);
      
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Remember me
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rememberedUsername');
      if (saved) { setUsername(saved); setRememberMe(true); }
    } catch (err) {}
  }, []);

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    if (!checked) localStorage.removeItem('rememberedUsername');
    else if (username) localStorage.setItem('rememberedUsername', username);
  };

  return (
    <div className={`login-page ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <button className="login-language-toggle" onClick={toggleLanguage}>
        <FiGlobe size={16} />
        <span>{language === 'EN' ? 'العربية' : 'English'}</span>
      </button>

      <div className="login-grid">
        <div className="login-brand">
          <div className="brand-content">
            <h1 className="brand-title">AL RUBAI<span className="brand-separator"> | </span>UNITED CRISTAL</h1>
            <h1 className="brand-title-ar">الكريستال الرباعي المتحدة</h1>
            <div className="brand-divider"></div>
            <p className="brand-description">Enterprise Resource Planning</p>
            <div className="brand-decoration">
              <span className="olive-branch">🌿</span>
              <span className="olive-branch">✨</span>
              <span className="olive-branch">🌿</span>
            </div>
          </div>
        </div>

        <div className="login-form-container">
          <div className="login-card">
            <h3 className="form-title">{localT.welcomeBack}</h3>
            <p className="form-subtitle">{localT.signIn}</p>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="username" className="input-label">{localT.username}</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input type="text" id="username" className="input-field" placeholder={localT.usernamePlaceholder}
                    value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isLoading} autoComplete="off" />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password" className="input-label">{localT.password}</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input type="password" id="password" className="input-field" placeholder={localT.passwordPlaceholder}
                    value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} autoComplete="off" />
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" checked={rememberMe} onChange={handleRememberMeChange} disabled={isLoading} />
                  <span>{localT.rememberMe}</span>
                </label>
                <a href="/forgot-password" className="forgot-link">{localT.forgotPassword}</a>
              </div>

              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? localT.loggingIn : localT.login}
              </button>
              {error && <div className="error-message">{error}</div>}
            </form>
            <p className="signup-prompt">{localT.noAccount} <a href="/contact">{localT.contactSupport}</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
import React, { createContext, useContext, useState, useCallback } from 'react';

const AdminContext = createContext();

const ADMIN_PASSWORD = '25351311';

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('pro_saude_admin') === 'true';
  });

  const authenticate = useCallback((password) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem('pro_saude_admin', 'true');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    sessionStorage.removeItem('pro_saude_admin');
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, authenticate, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logoutUser } from '../redux/slices/authSlice';
import { useLoginMutation, useRegisterMutation, useLazyGetMeQuery } from '../redux/slices/apiSlice';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);

  const [triggerGetMe] = useLazyGetMeQuery();
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();

  useEffect(() => {
    const token = localStorage.getItem('wr_token');
    if (!token) {
      setLoading(false);
      return;
    }

    triggerGetMe()
      .unwrap()
      .then((res) => {
        dispatch(setCredentials({ user: res.user, token }));
      })
      .catch(() => {
        dispatch(logoutUser());
      })
      .finally(() => {
        setLoading(false);
      });
  }, [triggerGetMe, dispatch]);

  const login = useCallback(
    async (email, password) => {
      const res = await loginMutation({ email, password }).unwrap();
      dispatch(setCredentials({ user: res.user, token: res.token }));
      return res.user;
    },
    [loginMutation, dispatch]
  );

  const register = useCallback(
    async (name, email, password) => {
      const res = await registerMutation({ name, email, password }).unwrap();
      dispatch(setCredentials({ user: res.user, token: res.token }));
      return res.user;
    },
    [registerMutation, dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutUser());
    toast.success('Signed out successfully');
  }, [dispatch]);

  const value = {
    user: reduxUser,
    loading,
    login,
    register,
    logout,
    isManager: reduxUser?.role === 'manager',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
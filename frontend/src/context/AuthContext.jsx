import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  apiSlice,
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
} from '../redux/slices/apiSlice';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));

  const {
    data: meData,
    isLoading,
    isFetching,
    isError,
  } = useGetMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (isError) {
      localStorage.removeItem('accessToken');
      setToken(null);
      dispatch(apiSlice.util.resetApiState());
    }
  }, [isError, dispatch]);

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();

  const user = token ? meData?.user || null : null;
  const loading = Boolean(token && (isLoading || (isFetching && !user)));

  const login = useCallback(
    async (email, password) => {
      const res = await loginMutation({ email, password }).unwrap();
      localStorage.setItem('accessToken', res.token);
      setToken(res.token);
      return res.user;
    },
    [loginMutation]
  );

  const register = useCallback(
    async (name, email, password) => {
      const res = await registerMutation({ name, email, password }).unwrap();
      localStorage.setItem('accessToken', res.token);
      setToken(res.token);
      return res.user;
    },
    [registerMutation]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setToken(null);
    dispatch(apiSlice.util.resetApiState());
    toast.success('Signed out successfully');
  }, [dispatch]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isManager: user?.role === 'manager',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
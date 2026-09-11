import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiClock,
  FiGrid,
  FiInbox,
  FiFolder,
  FiUsers,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './AlertDialog';

const memberLinks = [
  { to: '/app/report', label: 'My Report', icon: FiFileText },
  { to: '/app/history', label: 'Report History', icon: FiClock },
];

const managerLinks = [
  { to: '/app/dashboard', label: 'Team Dashboard', icon: FiGrid },
  { to: '/app/review-queue', label: 'Review Queue', icon: FiInbox },
  { to: '/app/projects', label: 'Projects', icon: FiFolder },
  { to: '/app/users', label: 'Team Members', icon: FiUsers },
];

const initials = (name = '') => {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const AppLayout = () => {
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const links = isManager ? managerLinks : memberLinks;

  const confirmLogout = () => {
    setLogoutOpen(false);
    logout();
    navigate('/login');
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {links.map((linkItem) => {
        const Icon = linkItem.icon;
        return (
          <NavLink
            key={linkItem.to}
            to={linkItem.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{linkItem.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-paper lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-navy py-6 lg:flex">
        <div className="flex items-center gap-2.5 px-5 pb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white font-bold text-xs tracking-wider select-none shadow-sm">
            WR
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">Weekly Reports</p>
            <p className="mt-0.5 text-xs text-white/40 font-inter">
              {isManager ? 'Manager workspace' : 'Team member workspace'}
            </p>
          </div>
        </div>

        {nav}

        <div className="mt-auto border-t border-white/10 px-5 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
              {initials(user?.name) || <FiUser />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs text-white/40 font-inter">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setLogoutOpen(true)}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <FiLogOut className="h-3.5 w-3.5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile topbar + drawer */}
      <div className="flex items-center justify-between bg-navy px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white font-bold text-[10px] tracking-wider select-none shadow-sm">
            WR
          </div>
          <p className="text-sm font-semibold text-white">Weekly Reports</p>
        </div>
        <button
          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-white/20 px-2.5 py-1.5 text-xs text-white"
          onClick={() => setMobileOpen((isOpen) => !isOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FiX className="h-4 w-4" /> : <FiMenu className="h-4 w-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="flex flex-col gap-2 bg-navy px-3 pb-4 lg:hidden">
          {nav}
          <button
            onClick={() => {
              setMobileOpen(false);
              setLogoutOpen(true);
            }}
            className="mx-3 mt-2 flex cursor-pointer items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-left text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white"
          >
            <FiLogOut className="h-3.5 w-3.5" />
            <span>Log out ({user?.name})</span>
          </button>
        </div>
      )}

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>

      {/* Reusable Alert Dialog */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end your current session? You will need to sign in again to access your workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLogoutOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AppLayout;

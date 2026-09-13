import React, { useState } from 'react';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiShield,
  FiCalendar,
  FiCheckCircle,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useUpdateProfileMutation } from '../redux/slices/apiSlice';
import { profileValidationSchema } from '../validations';
import { SectionCard, ErrorBanner } from '../components/Common';

const initials = (name = '') => {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const Profile = () => {
  const { user } = useAuth();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [serverError, setServerError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    enableReinitialize: true,
    validationSchema: profileValidationSchema,
    onSubmit: async (values, { setFieldValue }) => {
      setServerError('');
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
      };

      if (values.newPassword) {
        payload.currentPassword = values.currentPassword;
        payload.newPassword = values.newPassword;
      }

      try {
        const res = await updateProfile(payload).unwrap();
        toast.success(res?.message || 'Profile updated successfully!');
        setFieldValue('currentPassword', '');
        setFieldValue('newPassword', '');
        setFieldValue('confirmPassword', '');
      } catch (error) {
        const msg = error?.data?.message || error?.message || 'Failed to update profile.';
        setServerError(msg);
        toast.error(msg);
      }
    },
  });

  const inputCls =
    'w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40';
  const labelCls =
    'mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink/70 font-inter';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-xl font-semibold text-ink">My Profile</h1>
        <p className="text-sm text-ink/50 font-inter">
          Manage your account settings, personal details, and password.
        </p>
      </div>

      <ErrorBanner message={serverError} />

      {/* User Summary Card */}
      <SectionCard>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-xl font-bold text-white shadow-sm select-none">
              {initials(user?.name) || <FiUser className="h-8 w-8" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">{user?.name}</h2>
              <p className="text-sm text-ink/60 font-inter">{user?.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium font-inter ${
                    user?.role === 'manager'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-accent-light text-accent-dark'
                  }`}
                >
                  <FiShield className="h-3 w-3" />
                  {user?.role === 'manager' ? 'Manager' : 'Team Member'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-status-approved font-inter">
                  <FiCheckCircle className="h-3 w-3" />
                  Active Account
                </span>
              </div>
            </div>
          </div>

          {memberSince && (
            <div className="flex items-center gap-2 text-xs text-ink/50 font-inter sm:self-start">
              <FiCalendar className="h-4 w-4" />
              <span>Joined {memberSince}</span>
            </div>
          )}
        </div>
      </SectionCard>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <SectionCard
          title="Personal Information"
          subtitle="Update your display name and email address"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="name">
                <FiUser className="text-ink/60" />
                <span>Full Name</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`${inputCls} ${
                  formik.touched.name && formik.errors.name ? 'border-red-500' : ''
                }`}
                placeholder="Your full name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="mt-1 text-xs text-red-600 font-inter">{formik.errors.name}</p>
              )}
            </div>

            <div>
              <label className={labelCls} htmlFor="email">
                <FiMail className="text-ink/60" />
                <span>Email Address</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`${inputCls} ${
                  formik.touched.email && formik.errors.email ? 'border-red-500' : ''
                }`}
                placeholder="you@company.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-xs text-red-600 font-inter">{formik.errors.email}</p>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Change Password */}
        <SectionCard
          title="Security & Password"
          subtitle="Leave blank if you do not want to change your password"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls} htmlFor="currentPassword">
                <FiLock className="text-ink/60" />
                <span>Current Password</span>
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  className={`${inputCls} pr-10 ${
                    formik.touched.currentPassword && formik.errors.currentPassword
                      ? 'border-red-500'
                      : ''
                  }`}
                  placeholder="Enter current password"
                  value={formik.values.currentPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink/50 hover:text-ink cursor-pointer transition-colors"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? (
                    <FiEyeOff className="h-4 w-4" />
                  ) : (
                    <FiEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formik.touched.currentPassword && formik.errors.currentPassword && (
                <p className="mt-1 text-xs text-red-600 font-inter">
                  {formik.errors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls} htmlFor="newPassword">
                <FiLock className="text-ink/60" />
                <span>New Password</span>
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  className={`${inputCls} pr-10 ${
                    formik.touched.newPassword && formik.errors.newPassword
                      ? 'border-red-500'
                      : ''
                  }`}
                  placeholder="At least 6 characters"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink/50 hover:text-ink cursor-pointer transition-colors"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? (
                    <FiEyeOff className="h-4 w-4" />
                  ) : (
                    <FiEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formik.touched.newPassword && formik.errors.newPassword && (
                <p className="mt-1 text-xs text-red-600 font-inter">
                  {formik.errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls} htmlFor="confirmPassword">
                <FiLock className="text-ink/60" />
                <span>Confirm New Password</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`${inputCls} pr-10 ${
                    formik.touched.confirmPassword && formik.errors.confirmPassword
                      ? 'border-red-500'
                      : ''
                  }`}
                  placeholder="Re-enter new password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink/50 hover:text-ink cursor-pointer transition-colors"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-4 w-4" />
                  ) : (
                    <FiEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 font-inter">
                  {formik.errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isLoading || !formik.dirty}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiCheck className="h-4 w-4" />
            <span>{isLoading ? 'Saving changes...' : 'Save changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

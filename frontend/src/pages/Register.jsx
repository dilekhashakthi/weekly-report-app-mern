import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { registerValidationSchema } from '../validations';
import { ErrorBanner } from '../components/Common';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError('');
      try {
        const user = await register(values.name, values.email, values.password);
        toast.success(`Welcome to Weekly Reports, ${user.name}!`);
        navigate('/app/history', { replace: true });
      } catch (error) {
        const errMsg =
          error?.data?.message || error?.response?.data?.message || 'Could not create your account.';
        setServerError(errMsg);
        toast.error(errMsg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const inputCls =
    'w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40';
  const labelCls = 'mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink/70 font-inter';

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white font-bold text-lg tracking-wider shadow-sm select-none">
            WR
          </div>
          <h1 className="text-xl font-semibold text-white">Weekly Report</h1>
          <p className="mt-1 text-sm text-white/50 font-inter">Create your team-member account</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4 rounded-xl border border-line bg-white p-6 shadow-sm">
          <ErrorBanner message={serverError} />

          <div>
            <label className={labelCls} htmlFor="name">
              <FiUser className="text-ink/60" />
              <span>Full Name</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`${inputCls} ${formik.touched.name && formik.errors.name ? 'border-red-500' : ''}`}
              placeholder="Jane Doe"
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
              <span>Email</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`${inputCls} ${formik.touched.email && formik.errors.email ? 'border-red-500' : ''}`}
              placeholder="you@company.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-1 text-xs text-red-600 font-inter">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <label className={labelCls} htmlFor="password">
              <FiLock className="text-ink/60" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`${inputCls} pr-10 ${formik.touched.password && formik.errors.password ? 'border-red-500' : ''}`}
                placeholder="At least 6 characters"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink/50 hover:text-ink cursor-pointer transition-colors"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="mt-1 text-xs text-red-600 font-inter">{formik.errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
            disabled={formik.isSubmitting}
          >
            <FiUserPlus />
            <span>{formik.isSubmitting ? 'Creating account...' : 'Create account'}</span>
          </button>

          <p className="text-center text-xs text-ink/60 font-inter">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-[11px] text-ink/40 font-inter">
            New accounts are created as Team Members. A manager can promote your role from the Team Members page.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { FiUsers, FiUserPlus, FiTrash2, FiPower } from 'react-icons/fi';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '../redux/slices/apiSlice';
import { useAuth } from '../context/AuthContext';
import { userInviteValidationSchema } from '../validations';
import { Spinner, ErrorBanner, SectionCard, ConfirmDialog, EmptyState } from '../components/Common';

const UserManagement = () => {
  const { user: me } = useAuth();
  const { data, isLoading, error: fetchError } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [toDelete, setToDelete] = useState(null);
  const [serverError, setServerError] = useState('');

  const users = data?.users || [];

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      role: 'member',
    },
    validationSchema: userInviteValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setServerError('');
      try {
        await createUser(values).unwrap();
        toast.success(`Invited ${values.name} successfully`);
        resetForm();
      } catch (error) {
        const msg = error?.data?.message || 'Could not invite this user.';
        setServerError(msg);
        toast.error(msg);
      }
    },
  });

  const changeRole = async (targetUser, role) => {
    try {
      await updateUser({ id: targetUser.id, role }).unwrap();
      toast.success(`Role updated to ${role}`);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update role');
    }
  };

  const toggleActive = async (targetUser) => {
    try {
      await updateUser({ id: targetUser.id, isActive: !targetUser.isActive }).unwrap();
      toast.success(targetUser.isActive ? 'User account disabled' : 'User account enabled');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update user status');
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteUser(toDelete.id).unwrap();
      toast.success(`Removed ${toDelete.name}`);
      setToDelete(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to remove user');
    }
  };

  const inputCls =
    'w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Team Members</h1>
        <p className="text-sm text-ink/50 font-inter">Invite people, assign roles, and manage access.</p>
      </div>

      <ErrorBanner message={serverError || fetchError?.data?.message} />

      <SectionCard title="Invite a team member">
        <form onSubmit={formik.handleSubmit} className="grid gap-3 sm:grid-cols-5">
          <div>
            <input
              name="name"
              className={`${inputCls} ${formik.touched.name && formik.errors.name ? 'border-red-500' : ''}`}
              placeholder="Full name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="mt-1 text-xs text-red-600 font-inter">{formik.errors.name}</p>
            )}
          </div>
          <div>
            <input
              name="email"
              type="email"
              className={`${inputCls} ${formik.touched.email && formik.errors.email ? 'border-red-500' : ''}`}
              placeholder="Email address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-1 text-xs text-red-600 font-inter">{formik.errors.email}</p>
            )}
          </div>
          <div>
            <input
              name="password"
              type="password"
              className={`${inputCls} ${formik.touched.password && formik.errors.password ? 'border-red-500' : ''}`}
              placeholder="Temp password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="mt-1 text-xs text-red-600 font-inter">{formik.errors.password}</p>
            )}
          </div>
          <div>
            <select
              name="role"
              className={inputCls}
              value={formik.values.role}
              onChange={formik.handleChange}
            >
              <option value="member">Team Member</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <button
            type="submit"
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isCreating}
          >
            <FiUserPlus className="h-4 w-4" />
            <span>{isCreating ? 'Inviting...' : 'Invite'}</span>
          </button>
        </form>
      </SectionCard>

      <SectionCard title="All team members">
        {isLoading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <EmptyState icon={FiUsers} title="No team members found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink/40 font-inter">
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Email</th>
                  <th className="py-2 pr-3 font-medium">Role</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((targetUser) => (
                  <tr key={targetUser.id} className="border-b border-line/60 last:border-0">
                    <td className="py-2.5 pr-3 font-medium text-ink">
                      {targetUser.role === 'member' ? (
                        <Link to={`/app/team/${targetUser.id}`} className="hover:text-accent hover:underline">
                          {targetUser.name}
                        </Link>
                      ) : (
                        targetUser.name
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-ink/70 font-inter">{targetUser.email}</td>
                    <td className="py-2.5 pr-3">
                      <select
                        className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
                        value={targetUser.role}
                        disabled={targetUser.id === me?.id}
                        onChange={(event) => changeRole(targetUser, event.target.value)}
                      >
                        <option value="member">Team Member</option>
                        <option value="manager">Manager</option>
                      </select>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-inter font-medium ${
                          targetUser.isActive
                            ? 'bg-green-50 text-status-approved'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {targetUser.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex gap-2">
                        <button
                          className="flex cursor-pointer items-center gap-1 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => toggleActive(targetUser)}
                          disabled={targetUser.id === me?.id}
                        >
                          <FiPower className="h-3 w-3" />
                          <span>{targetUser.isActive ? 'Disable' : 'Enable'}</span>
                        </button>
                        <button
                          className="flex cursor-pointer items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={targetUser.id === me?.id}
                          onClick={() => setToDelete(targetUser)}
                        >
                          <FiTrash2 className="h-3 w-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <ConfirmDialog
        open={!!toDelete}
        title={`Remove ${toDelete?.name}?`}
        description="This permanently deletes their account. Their existing reports remain in the database."
        confirmLabel="Remove"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};

export default UserManagement;

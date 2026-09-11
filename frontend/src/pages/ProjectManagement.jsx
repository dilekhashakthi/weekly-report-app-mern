import React, { useState } from 'react';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { FiFolder, FiFolderPlus, FiEdit2, FiTrash2, FiPower, FiCheck, FiX } from 'react-icons/fi';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '../redux/slices/apiSlice';
import { projectValidationSchema } from '../validations';
import { Spinner, ErrorBanner, SectionCard, ConfirmDialog, EmptyState } from '../components/Common';

const ProjectManagement = () => {
  const { data, isLoading, error: fetchError } = useGetProjectsQuery();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const [editingProject, setEditingProject] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [serverError, setServerError] = useState('');

  const projects = data?.projects || [];

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema: projectValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setServerError('');
      try {
        if (editingProject) {
          await updateProject({ id: editingProject._id, ...values }).unwrap();
          toast.success('Project updated successfully');
          setEditingProject(null);
        } else {
          await createProject(values).unwrap();
          toast.success('Project created successfully');
        }
        resetForm();
      } catch (error) {
        const msg = error?.data?.message || 'Could not save the project.';
        setServerError(msg);
        toast.error(msg);
      }
    },
  });

  function startEdit(p) {
    setEditingProject(p);
    formik.setValues({
      name: p.name,
      description: p.description || '',
    });
  }

  function cancelEdit() {
    setEditingProject(null);
    formik.resetForm();
  }

  async function toggleActive(p) {
    try {
      await updateProject({ id: p._id, isActive: !p.isActive }).unwrap();
      toast.success(p.isActive ? 'Project deactivated' : 'Project activated');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update project status');
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await deleteProject(toDelete._id).unwrap();
      toast.success('Project removed');
      setToDelete(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete project');
    }
  }

  const saving = isCreating || isUpdating;
  const inputCls =
    'w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Projects & Categories</h1>
        <p className="text-sm text-ink/50 font-inter">Manage the tags team members attach to their weekly reports.</p>
      </div>

      <ErrorBanner message={serverError || fetchError?.data?.message} />

      <SectionCard title={editingProject ? 'Edit project' : 'Add a project'}>
        <form onSubmit={formik.handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <div>
            <input
              name="name"
              className={`${inputCls} ${formik.touched.name && formik.errors.name ? 'border-red-500' : ''}`}
              placeholder="Name (e.g. Client A)"
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
              name="description"
              className={inputCls}
              placeholder="Description (optional)"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saving}
            >
              {editingProject ? <FiCheck /> : <FiFolderPlus />}
              <span>{saving ? 'Saving...' : editingProject ? 'Save' : 'Add'}</span>
            </button>
            {editingProject && (
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1 rounded-md border border-line px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper"
                onClick={cancelEdit}
              >
                <FiX />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </form>
      </SectionCard>

      <SectionCard title="All projects">
        {isLoading ? (
          <Spinner />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FiFolder}
            title="No projects yet"
            description="Add your first project or category above."
          />
        ) : (
          <div className="divide-y divide-line">
            {projects.map((project) => (
              <div key={project._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    <span>{project.name}</span>
                    {!project.isActive && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 font-inter">
                        Inactive
                      </span>
                    )}
                  </p>
                  {project.description && <p className="text-xs text-ink/50 font-inter">{project.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex cursor-pointer items-center gap-1 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-paper"
                    onClick={() => toggleActive(project)}
                  >
                    <FiPower className="h-3.5 w-3.5" />
                    <span>{project.isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>
                  <button
                    className="flex cursor-pointer items-center gap-1 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-paper"
                    onClick={() => startEdit(project)}
                  >
                    <FiEdit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    className="flex cursor-pointer items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-red-700"
                    onClick={() => setToDelete(project)}
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete "${toDelete?.name}"?`}
        description="Reports already tagged with this project keep their reference, but it will no longer be selectable."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};

export default ProjectManagement;

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import {
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiSave,
  FiSend,
  FiTrash2,
  FiPlus,
} from 'react-icons/fi';
import {
  useGetReportsQuery,
  useGetProjectsQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
  useSubmitReportMutation,
} from '../redux/slices/apiSlice';
import { reportValidationSchema } from '../validations';
import { startOfWeekMonday, addDays, toISODate, formatWeekLabel } from '../utils/date';
import StatusBadge from '../components/StatusBadge';
import TaskTable from '../components/TaskTable';
import FlaggedList from '../components/FlaggedList';
import { Spinner, ErrorBanner, SectionCard } from '../components/Common';

const HOUR_TYPES = [
  ['development', 'Development'],
  ['testing', 'Testing'],
  ['meetings', 'Meetings'],
  ['documentation', 'Documentation'],
  ['other', 'Other'],
];

const NextWeekPlanEditor = ({ items = [], onChange }) => {
  const update = (targetIndex, value) => {
    onChange(items.map((item, index) => (index === targetIndex ? value : item)));
  };
  const remove = (targetIndex) => {
    onChange(items.filter((_, index) => index !== targetIndex));
  };
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            value={item}
            onChange={(event) => update(index, event.target.value)}
            placeholder="Planned task..."
          />
          <button
            type="button"
            className="flex cursor-pointer shrink-0 items-center justify-center rounded-md bg-red-600 p-2.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-red-700"
            onClick={() => remove(index)}
            title="Remove item"
            aria-label="Remove item"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="flex cursor-pointer items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-paper"
        onClick={() => onChange([...items, ''])}
      >
        <FiPlus className="h-3.5 w-3.5" />
        <span>Add planned task</span>
      </button>
    </div>
  );
};

const MyReportPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const weekParam = searchParams.get('week');
  const weekStart = toISODate(weekParam ? new Date(weekParam) : startOfWeekMonday());

  const { data: projData, isLoading: loadingProjects } = useGetProjectsQuery({ activeOnly: 'true' });
  const { data: repData, isLoading: loadingReports } = useGetReportsQuery({ week: weekStart });

  const [createReport, { isLoading: isCreating }] = useCreateReportMutation();
  const [updateReport, { isLoading: isUpdating }] = useUpdateReportMutation();
  const [submitReport, { isLoading: isSubmitting }] = useSubmitReportMutation();

  const [serverError, setServerError] = useState('');

  const projects = projData?.projects || [];
  const existingReport = repData?.reports?.[0] || null;

  const formik = useFormik({
    initialValues: {
      weekStart,
      weekEnd: toISODate(addDays(weekStart, 4)),
      project: '',
      tasksCompleted: [],
      tasksPlannedNextWeek: [],
      blockers: [],
      achievements: [],
      hoursByType: { development: 0, testing: 0, meetings: 0, documentation: 0, other: 0 },
      notes: '',
    },
    validationSchema: reportValidationSchema,
    onSubmit: async () => {},
  });

  // Keep form in sync when report data loads or week changes
  useEffect(() => {
    if (existingReport) {
      formik.resetForm({
        values: {
          weekStart: toISODate(existingReport.weekStart),
          weekEnd: toISODate(existingReport.weekEnd),
          project: existingReport.project?._id || existingReport.project || '',
          tasksCompleted: existingReport.tasksCompleted || [],
          tasksPlannedNextWeek: existingReport.tasksPlannedNextWeek || [],
          blockers: existingReport.blockers || [],
          achievements: existingReport.achievements || [],
          hoursByType: existingReport.hoursByType || {
            development: 0,
            testing: 0,
            meetings: 0,
            documentation: 0,
            other: 0,
          },
          notes: existingReport.notes || '',
        },
      });
    } else {
      formik.resetForm({
        values: {
          weekStart,
          weekEnd: toISODate(addDays(weekStart, 4)),
          project: '',
          tasksCompleted: [],
          tasksPlannedNextWeek: [],
          blockers: [],
          achievements: [],
          hoursByType: { development: 0, testing: 0, meetings: 0, documentation: 0, other: 0 },
          notes: '',
        },
      });
    }
  }, [existingReport, weekStart]);

  const editable = !existingReport || ['draft', 'needs_correction'].includes(existingReport.status);

  function changeWeek(offsetDays) {
    const next = addDays(new Date(weekStart), offsetDays);
    setSearchParams({ week: toISODate(next) });
  }

  async function persist({ andSubmit } = {}) {
    setServerError('');
    const values = formik.values;

    if (andSubmit && !values.project) {
      formik.setFieldTouched('project', true);
      toast.error('Please select a project before submitting');
      return;
    }

    try {
      let savedReport = existingReport;
      if (!savedReport) {
        const res = await createReport(values).unwrap();
        savedReport = res.report;
      } else {
        const res = await updateReport({ id: savedReport._id, ...values }).unwrap();
        savedReport = res.report;
      }

      if (andSubmit) {
        const submitRes = await submitReport(savedReport._id).unwrap();
        toast.success(
          existingReport?.status === 'needs_correction'
            ? 'Resubmitted report for review!'
            : 'Submitted report for review!'
        );
        navigate(`/app/reports/${submitRes.report._id}`);
        return;
      }

      toast.success('Draft saved successfully');
    } catch (error) {
      const msg = error?.data?.message || 'Could not save the report.';
      setServerError(msg);
      toast.error(msg);
    }
  }

  const saving = isCreating || isUpdating || isSubmitting;
  const inputCls =
    'w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40';

  if (loadingReports || loadingProjects) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">My Weekly Report</h1>
          <p className="text-sm text-ink/50 font-inter">{formatWeekLabel(formik.values.weekStart, formik.values.weekEnd)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 rounded-md border border-line px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper"
            onClick={() => changeWeek(-7)}
          >
            <FiChevronLeft className="h-4 w-4" />
            <span>Prev week</span>
          </button>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 rounded-md border border-line px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper"
            onClick={() => changeWeek(7)}
          >
            <span>Next week</span>
            <FiChevronRight className="h-4 w-4" />
          </button>
          {existingReport && <StatusBadge status={existingReport.status} />}
        </div>
      </div>

      <ErrorBanner message={serverError} />

      {existingReport?.status === 'needs_correction' && existingReport.currentReviewComment && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Your manager requested changes</p>
          <p className="mt-1 font-inter">{existingReport.currentReviewComment}</p>
        </div>
      )}

      {!editable && (
        <div className="flex items-center justify-between rounded-md border border-line bg-white px-4 py-3 text-sm text-ink/60">
          <span>
            This report is <strong className="text-ink">{existingReport.status.replace('_', ' ')}</strong> and is no longer editable here.
          </span>
          <button
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-accent hover:underline font-inter"
            onClick={() => navigate(`/app/reports/${existingReport._id}`)}
          >
            <span>View the full report</span>
            <FiArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <fieldset disabled={!editable} className="space-y-6 disabled:opacity-60">
        <SectionCard title="Project / category">
          <select
            name="project"
            className={`max-w-sm ${inputCls} ${
              formik.touched.project && formik.errors.project ? 'border-red-500' : ''
            }`}
            value={formik.values.project}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="">Select a project...</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
          {formik.touched.project && formik.errors.project && (
            <p className="mt-1 text-xs text-red-600 font-inter">{formik.errors.project}</p>
          )}
        </SectionCard>

        <SectionCard title="Tasks completed" subtitle="Priority, planned vs actual %, status, time, and output">
          <TaskTable
            tasks={formik.values.tasksCompleted}
            onChange={(tasks) => formik.setFieldValue('tasksCompleted', tasks)}
          />
        </SectionCard>

        <SectionCard title="Tasks planned for next week">
          <NextWeekPlanEditor
            items={formik.values.tasksPlannedNextWeek}
            onChange={(plannedTasks) => formik.setFieldValue('tasksPlannedNextWeek', plannedTasks)}
          />
        </SectionCard>

        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard title="Blockers / challenges" subtitle="Flag one as the key issue for the week">
            <FlaggedList
              items={formik.values.blockers}
              onChange={(blockers) => formik.setFieldValue('blockers', blockers)}
              addLabel="Add blocker"
              keyLabel="Key issue"
              emptyText="No blockers this week."
            />
          </SectionCard>
          <SectionCard title="Achievements / highlights" subtitle="Flag one as the key achievement for the week">
            <FlaggedList
              items={formik.values.achievements}
              onChange={(achievements) => formik.setFieldValue('achievements', achievements)}
              addLabel="Add achievement"
              keyLabel="Key achievement"
              emptyText="No achievements logged yet."
            />
          </SectionCard>
        </div>

        <SectionCard title="Hours by task type" subtitle="Optional">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {HOUR_TYPES.map(([key, label]) => (
              <div key={key}>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/70 font-inter">
                  {label}
                </label>
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={formik.values.hoursByType[key] || 0}
                  onChange={(e) =>
                    formik.setFieldValue(`hoursByType.${key}`, Number(e.target.value))
                  }
                />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Notes / links" subtitle="Optional">
          <textarea
            className={`min-h-[90px] ${inputCls}`}
            value={formik.values.notes}
            onChange={(e) => formik.setFieldValue('notes', e.target.value)}
            placeholder="Anything else worth sharing, or links to relevant docs/PRs..."
          />
        </SectionCard>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saving}
            onClick={() => persist()}
          >
            <FiSave className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save draft'}</span>
          </button>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saving || !formik.values.project}
            onClick={() => persist({ andSubmit: true })}
          >
            <FiSend className="h-4 w-4" />
            <span>
              {saving
                ? 'Submitting...'
                : existingReport?.status === 'needs_correction'
                ? 'Resubmit for review'
                : 'Submit for review'}
            </span>
          </button>
        </div>
      </fieldset>
    </div>
  );
};

export default MyReportPage;

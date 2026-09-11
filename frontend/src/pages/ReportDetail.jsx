import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import {
  FiArrowLeft,
  FiCheck,
  FiAlertCircle,
  FiClock,
  FiFileText,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import {
  useGetReportByIdQuery,
  useGetReportVersionsQuery,
  useReviewReportMutation,
} from '../redux/slices/apiSlice';
import { useAuth } from '../context/AuthContext';
import { reviewValidationSchema } from '../validations';
import StatusBadge from '../components/StatusBadge';
import TaskTable from '../components/TaskTable';
import FlaggedList from '../components/FlaggedList';
import { Spinner, ErrorBanner, SectionCard } from '../components/Common';
import { formatWeekLabel, formatDateTime } from '../utils/date';

const HOUR_LABELS = {
  development: 'Development',
  testing: 'Testing',
  meetings: 'Meetings',
  documentation: 'Documentation',
  other: 'Other',
};

function ContentView({ content }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Tasks completed">
        <TaskTable tasks={content.tasksCompleted} readOnly />
      </SectionCard>
      <SectionCard title="Tasks planned for next week">
        {content.tasksPlannedNextWeek?.length ? (
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink/80">
            {content.tasksPlannedNextWeek.map((task, index) => (
              <li key={index}>{task}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink/50 font-inter">Nothing planned yet.</p>
        )}
      </SectionCard>
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Blockers / challenges">
          <FlaggedList items={content.blockers} readOnly keyLabel="Key issue" emptyText="No blockers." />
        </SectionCard>
        <SectionCard title="Achievements / highlights">
          <FlaggedList items={content.achievements} readOnly keyLabel="Key achievement" emptyText="None logged." />
        </SectionCard>
      </div>
      <SectionCard title="Hours by task type">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {Object.entries(HOUR_LABELS).map(([key, label]) => (
            <div key={key}>
              <p className="text-xs text-ink/50 font-inter">{label}</p>
              <p className="text-lg font-semibold text-ink">{content.hoursByType?.[key] || 0}h</p>
            </div>
          ))}
        </div>
      </SectionCard>
      {content.notes && (
        <SectionCard title="Notes / links">
          <p className="whitespace-pre-wrap text-sm text-ink/80">{content.notes}</p>
        </SectionCard>
      )}
    </div>
  );
}

const ReportDetail = () => {
  const { id } = useParams();
  const { user, isManager } = useAuth();
  const navigate = useNavigate();

  const { data: reportData, isLoading: loadingReport, error: repError } = useGetReportByIdQuery(id);
  const { data: versionsData } = useGetReportVersionsQuery(id);
  const [reviewReport, { isLoading: reviewing }] = useReviewReportMutation();

  const [showVersions, setShowVersions] = useState(false);
  const [openVersion, setOpenVersion] = useState(null);
  const [reviewError, setReviewError] = useState('');

  const report = reportData?.report;
  const versions = versionsData?.versions || [];

  const formik = useFormik({
    initialValues: {
      action: 'approve',
      comment: '',
    },
    validationSchema: reviewValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setReviewError('');
      try {
        await reviewReport({ id, action: values.action, comment: values.comment }).unwrap();
        toast.success(
          values.action === 'approve'
            ? 'Report approved successfully!'
            : 'Requested changes sent to member.'
        );
        resetForm();
      } catch (error) {
        const msg = error?.data?.message || 'Could not submit your review.';
        setReviewError(msg);
        toast.error(msg);
      }
    },
  });

  if (loadingReport) return <Spinner />;
  if (repError) return <ErrorBanner message={repError?.data?.message || 'Could not load report.'} />;
  if (!report) return null;

  const isOwner = String(report.owner._id) === String(user?.id);
  const canReview = isManager && report.status === 'submitted';

  return (
    <div className="space-y-6">
      <button
        className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-accent hover:underline font-inter"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {formatWeekLabel(report.weekStart, report.weekEnd)}
          </h1>
          <p className="text-sm text-ink/50 font-inter">
            {isManager && !isOwner ? (
              <Link to={`/app/team/${report.owner._id}`} className="text-accent hover:underline">
                {report.owner.name}
              </Link>
            ) : (
              report.owner.name
            )}{' '}
            / {report.project?.name || 'No project'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={report.status} />
          {versions.length > 0 && (
            <button
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-paper"
              onClick={() => setShowVersions((isOpen) => !isOpen)}
            >
              <FiClock className="h-3.5 w-3.5" />
              <span>{showVersions ? 'Hide' : 'View'} versions ({versions.length})</span>
              {showVersions ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          )}
        </div>
      </div>

      {report.currentReviewComment && report.status === 'needs_correction' && (
        <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Manager requested changes</p>
            <p className="mt-1 font-inter">{report.currentReviewComment}</p>
          </div>
        </div>
      )}

      {canReview && (
        <SectionCard title="Review this report" subtitle="Approve it, or send it back with one clear comment.">
          <ErrorBanner message={reviewError} />
          <form onSubmit={formik.handleSubmit} className="mt-3 space-y-3">
            <div>
              <textarea
                name="comment"
                className={`w-full min-h-[80px] rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                  formik.touched.comment && formik.errors.comment ? 'border-red-500' : ''
                }`}
                placeholder="Comment (required when requesting changes)"
                value={formik.values.comment}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.comment && formik.errors.comment && (
                <p className="mt-1 text-xs text-red-600 font-inter">{formik.errors.comment}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
                disabled={reviewing}
                onClick={() => {
                  formik.setFieldValue('action', 'approve');
                  formik.handleSubmit();
                }}
              >
                <FiCheck className="h-4 w-4" />
                <span>{reviewing ? 'Saving...' : 'Approve'}</span>
              </button>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={reviewing}
                onClick={() => {
                  formik.setFieldValue('action', 'request_changes');
                  formik.handleSubmit();
                }}
              >
                <FiAlertCircle className="h-4 w-4" />
                <span>{reviewing ? 'Saving...' : 'Request changes'}</span>
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {showVersions && (
        <SectionCard title="Version history" subtitle="Each resubmission is kept so you can see what changed.">
          <div className="space-y-2">
            {versions
              .slice()
              .reverse()
              .map((version) => (
                <div key={version.versionNumber} className="rounded-md border border-line">
                  <button
                    className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm"
                    onClick={() => setOpenVersion(openVersion === version.versionNumber ? null : version.versionNumber)}
                  >
                    <span className="flex items-center gap-1.5 font-medium text-ink">
                      <FiFileText className="h-4 w-4 text-ink/60" />
                      <span>Version {version.versionNumber}</span>
                      {version.versionNumber === report.versionNumber && (
                        <span className="ml-2 rounded-full bg-accent-light px-2 py-0.5 text-xs text-accent-dark font-inter">
                          current
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-ink/50 font-inter">{formatDateTime(version.submittedAt)}</span>
                  </button>
                  {openVersion === version.versionNumber && (
                    <div className="border-t border-line px-4 py-4">
                      <ContentView content={version.snapshot} />
                    </div>
                  )}
                </div>
              ))}
          </div>

          {report.reviewHistory?.length > 0 && (
            <div className="mt-5 border-t border-line pt-4">
              <p className="mb-2 text-sm font-semibold text-ink">Review comments</p>
              <div className="space-y-2">
                {report.reviewHistory.map((historyItem, index) => (
                  <div key={index} className="rounded-md bg-paper px-3 py-2 text-sm">
                    <p className="text-ink/70 font-inter">
                      <span className="font-medium text-ink font-sans">{historyItem.reviewer?.name || 'Manager'}</span>{' '}
                      {historyItem.action === 'approved' ? 'approved' : 'requested changes on'} version {historyItem.versionNumber} /{' '}
                      {formatDateTime(historyItem.reviewedAt)}
                    </p>
                    {historyItem.comment && <p className="mt-1 text-ink/60 italic">"{historyItem.comment}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      )}

      <ContentView content={report} />
    </div>
  );
};

export default ReportDetail;

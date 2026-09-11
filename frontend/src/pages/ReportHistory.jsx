import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiFileText } from 'react-icons/fi';
import { useGetReportsQuery } from '../redux/slices/apiSlice';
import StatusBadge from '../components/StatusBadge';
import { formatWeekLabel } from '../utils/date';
import { Spinner, EmptyState, ErrorBanner, Pagination } from '../components/Common';

const ReportHistory = () => {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useGetReportsQuery({
    status: status || undefined,
    page,
    limit: 8,
  });

  const reports = data?.reports || [];
  const pagination = data?.pagination || { page: 1, pages: 1 };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Report History</h1>
          <p className="text-sm text-ink/50 font-inter">Every weekly report you've created, newest first.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="w-44 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="needs_correction">Needs Correction</option>
            <option value="approved">Approved</option>
          </select>
          <Link
            to="/app/report"
            className="flex cursor-pointer items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-dark"
          >
            <FiPlus className="h-4 w-4" />
            <span>This week's report</span>
          </Link>
        </div>
      </div>

      <ErrorBanner message={error?.data?.message} />

      {isLoading ? (
        <Spinner />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FiFileText}
          title="No reports yet"
          description="Start your first weekly report to see it show up here."
          action={
            <Link
              to="/app/report"
              className="mt-2 flex cursor-pointer items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-dark"
            >
              <FiPlus />
              <span>Create weekly report</span>
            </Link>
          }
        />
      ) : (
        <div className="divide-y divide-line rounded-xl border border-line bg-white shadow-sm">
          {reports.map((report) => (
            <Link
              key={report._id}
              to={`/app/reports/${report._id}`}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-paper"
            >
              <div>
                <p className="text-sm font-medium text-ink">{formatWeekLabel(report.weekStart, report.weekEnd)}</p>
                <p className="text-xs text-ink/50 font-inter">{report.project?.name || 'No project'}</p>
              </div>
              <StatusBadge status={report.status} />
            </Link>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
    </div>
  );
};

export default ReportHistory;

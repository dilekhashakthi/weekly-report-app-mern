import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInbox, FiClock } from 'react-icons/fi';
import { useGetReportsQuery } from '../redux/slices/apiSlice';
import StatusBadge from '../components/StatusBadge';
import { formatWeekLabel, formatDateTime } from '../utils/date';
import { Spinner, EmptyState, ErrorBanner, Pagination } from '../components/Common';

const ReviewQueue = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useGetReportsQuery({
    status: 'submitted',
    page,
    limit: 10,
  });

  const reports = data?.reports || [];
  const pagination = data?.pagination || { page: 1, pages: 1 };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">Review Queue</h1>
        <p className="text-sm text-ink/50 font-inter">Reports submitted by the team, waiting on your review.</p>
      </div>

      <ErrorBanner message={error?.data?.message} />

      {isLoading ? (
        <Spinner />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FiInbox}
          title="Nothing to review"
          description="You are all caught up. No submitted reports are waiting."
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
                <p className="text-sm font-medium text-ink">
                  {report.owner?.name} / {formatWeekLabel(report.weekStart, report.weekEnd)}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ink/50 font-inter">
                  <FiClock className="h-3 w-3" />
                  <span>
                    {report.project?.name || 'No project'} - submitted {formatDateTime(report.submittedAt)}
                  </span>
                </p>
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

export default ReviewQueue;

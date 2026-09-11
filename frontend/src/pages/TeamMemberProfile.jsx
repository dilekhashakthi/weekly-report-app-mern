import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiCheckCircle, FiAlertTriangle, FiFileText } from 'react-icons/fi';
import { useGetUsersQuery, useGetReportsQuery } from '../redux/slices/apiSlice';
import StatusBadge from '../components/StatusBadge';
import { formatWeekLabel } from '../utils/date';
import { Spinner, EmptyState, ErrorBanner, Pagination, SectionCard } from '../components/Common';

const initials = (name = '') => {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
};

const TeamMemberProfile = () => {
  const { memberId } = useParams();
  const [page, setPage] = useState(1);

  const { data: usersData, isLoading: loadingUsers } = useGetUsersQuery();
  const { data: reportsData, isLoading: loadingReports, error: repError } = useGetReportsQuery({
    member: memberId,
    page,
    limit: 8,
  });

  const member = (usersData?.users || []).find((user) => user.id === memberId);
  const reports = reportsData?.reports || [];
  const pagination = reportsData?.pagination || { page: 1, pages: 1, total: 0 };

  const approved = reports.filter((report) => report.status === 'approved').length;
  const needsCorrection = reports.filter((report) => report.status === 'needs_correction').length;

  return (
    <div className="space-y-6">
      <Link to="/app/users" className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-accent hover:underline font-inter">
        <FiArrowLeft className="h-4 w-4" />
        <span>Team members</span>
      </Link>

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-lg font-semibold text-white">
          {initials(member?.name) || <FiUser />}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-ink">{member?.name || 'Team member'}</h1>
          <p className="text-sm text-ink/50 font-inter">{member?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SectionCard>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-ink/40 font-inter">Total reports</p>
            <FiFileText className="h-4 w-4 text-ink/40" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-ink">{pagination.total}</p>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-ink/40 font-inter">Approved</p>
            <FiCheckCircle className="h-4 w-4 text-status-approved" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-status-approved">{approved}</p>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-ink/40 font-inter">Needs correction</p>
            <FiAlertTriangle className="h-4 w-4 text-status-correction" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-status-correction">{needsCorrection}</p>
        </SectionCard>
      </div>

      <ErrorBanner message={repError?.data?.message} />

      <SectionCard title="Report history">
        {loadingReports || loadingUsers ? (
          <Spinner />
        ) : reports.length === 0 ? (
          <EmptyState title="No reports from this member yet" />
        ) : (
          <div className="divide-y divide-line">
            {reports.map((report) => (
              <Link
                key={report._id}
                to={`/app/reports/${report._id}`}
                className="flex flex-wrap items-center justify-between gap-3 py-3 transition-colors hover:bg-paper"
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
      </SectionCard>
    </div>
  );
};

export default TeamMemberProfile;

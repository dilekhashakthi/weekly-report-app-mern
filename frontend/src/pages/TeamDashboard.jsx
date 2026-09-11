import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiFlag,
  FiMinus,
} from 'react-icons/fi';
import {
  useGetDashboardSummaryQuery,
  useGetStatusByMemberQuery,
  useGetTasksTrendQuery,
  useGetWorkloadByProjectQuery,
  useGetTimeByTypeQuery,
  useGetDashboardActivityQuery,
  useGetUsersQuery,
  useGetProjectsQuery,
  useGetReportsQuery,
} from '../redux/slices/apiSlice';
import { startOfWeekMonday, toISODate, formatWeekLabel, formatDateTime, addDays } from '../utils/date';
import StatusBadge from '../components/StatusBadge';
import { Spinner, ErrorBanner, SectionCard, Pagination, EmptyState } from '../components/Common';

const STATUS_COLOR = {
  draft: '#6B7280',
  submitted: '#2563EB',
  needs_correction: '#B45309',
  approved: '#15803D',
  not_started: '#D1D5DB',
};

function MetricCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-line bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink/40 font-inter">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-ink/50 font-inter">{sub}</p>}
      </div>
      {Icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper text-accent">
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

const TeamDashboard = () => {
  const [week, setWeek] = useState(toISODate(startOfWeekMonday()));
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ member: '', project: '', status: '', dateFrom: '', dateTo: '' });

  const { data: summaryData, isLoading: loadingSummary, error: summaryError } = useGetDashboardSummaryQuery({ week });
  const { data: statusData } = useGetStatusByMemberQuery({ week });
  const { data: trendData } = useGetTasksTrendQuery({ weeks: 8 });
  const { data: workloadData } = useGetWorkloadByProjectQuery({ week });
  const { data: timeData } = useGetTimeByTypeQuery({ week });
  const { data: activityData } = useGetDashboardActivityQuery({ limit: 8 });

  const { data: usersData } = useGetUsersQuery();
  const { data: projectsData } = useGetProjectsQuery();

  const { data: reportsData, isLoading: loadingReports } = useGetReportsQuery({
    member: filters.member || undefined,
    project: filters.project || undefined,
    status: filters.status || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    page,
    limit: 8,
  });

  const summary = summaryData;
  const statusByMember = statusData?.data || [];
  const trend = trendData?.data || [];
  const workload = workloadData?.data || [];
  const timeByType = (timeData?.data || []).map((entry) => ({
    ...entry,
    label: entry.type ? entry.type[0].toUpperCase() + entry.type.slice(1) : '',
  }));
  const activity = activityData?.data || [];

  const members = (usersData?.users || []).filter((user) => user.role === 'member');
  const projects = projectsData?.projects || [];
  const reports = reportsData?.reports || [];
  const pagination = reportsData?.pagination || { page: 1, pages: 1 };

  const inputCls =
    'w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40';

  if (loadingSummary && !summary) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Team Dashboard</h1>
          <p className="text-sm text-ink/50 font-inter">{formatWeekLabel(week, toISODate(addDays(week, 4)))}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 rounded-md border border-line px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper"
            onClick={() => setWeek(toISODate(addDays(week, -7)))}
          >
            <FiChevronLeft className="h-4 w-4" />
            <span>Prev week</span>
          </button>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 rounded-md border border-line px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper"
            onClick={() => setWeek(toISODate(addDays(week, 7)))}
          >
            <span>Next week</span>
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ErrorBanner message={summaryError?.data?.message} />

      {summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            label="Submitted this week"
            value={`${summary.submittedThisWeek}/${summary.totalTeamMembers}`}
            icon={FiCheckCircle}
          />
          <MetricCard
            label="Compliance rate"
            value={`${summary.complianceRate}%`}
            sub={`${summary.notStartedThisWeek} not started`}
            icon={FiClock}
          />
          <MetricCard
            label="Needs correction"
            value={summary.needsCorrectionCount}
            sub="currently outstanding"
            icon={FiAlertTriangle}
          />
          <MetricCard
            label="Open blockers"
            value={summary.openBlockersThisWeek}
            sub="this week"
            icon={FiFlag}
          />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Tasks completed trend" subtitle="Team-wide, last 8 weeks">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E1D8" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="completedTasks" stroke="#3B6E5E" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Status by team member" subtitle="For the selected week">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusByMember.map((memberStatus) => ({ ...memberStatus, value: 1 }))} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide domain={[0, 1]} />
              <YAxis dataKey="memberName" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(_, __, tooltipProps) => [tooltipProps.payload.status ? tooltipProps.payload.status.replace('_', ' ') : '', 'status']} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                {statusByMember.map((memberStatus, index) => (
                  <Cell key={index} fill={STATUS_COLOR[memberStatus.status] || STATUS_COLOR.draft} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Workload by project" subtitle="Hours spent, selected week">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={workload}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E1D8" />
              <XAxis dataKey="project" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="hoursSpent" fill="#3B6E5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Time by task type" subtitle="Team-wide, selected week">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={timeByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E1D8" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="hours" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Recent activity" subtitle="Latest review actions across the team">
        {activity.length === 0 ? (
          <p className="text-sm text-ink/50 font-inter">No review activity yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {activity.map((activityItem, index) => (
              <li key={index} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-ink/80">
                  <Link to={`/app/reports/${activityItem.reportId}`} className="font-medium text-ink hover:text-accent">
                    {activityItem.memberName}
                  </Link>
                  's report was {activityItem.action === 'approved' ? 'approved' : 'sent back for correction'} by {activityItem.reviewerName}
                </span>
                <span className="shrink-0 text-xs text-ink/40 font-inter">{formatDateTime(activityItem.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="All reports"
        subtitle="Filter across the whole team, then open any report to review it"
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <select
            className={inputCls}
            value={filters.member}
            onChange={(e) => {
              setPage(1);
              setFilters({ ...filters, member: e.target.value });
            }}
          >
            <option value="">All members</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          <select
            className={inputCls}
            value={filters.project}
            onChange={(e) => {
              setPage(1);
              setFilters({ ...filters, project: e.target.value });
            }}
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
          <select
            className={inputCls}
            value={filters.status}
            onChange={(e) => {
              setPage(1);
              setFilters({ ...filters, status: e.target.value });
            }}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="needs_correction">Needs Correction</option>
            <option value="approved">Approved</option>
          </select>
          <input
            type="date"
            className={inputCls}
            value={filters.dateFrom}
            onChange={(e) => {
              setPage(1);
              setFilters({ ...filters, dateFrom: e.target.value });
            }}
          />
          <input
            type="date"
            className={inputCls}
            value={filters.dateTo}
            onChange={(e) => {
              setPage(1);
              setFilters({ ...filters, dateTo: e.target.value });
            }}
          />
        </div>

        {loadingReports ? (
          <Spinner />
        ) : reports.length === 0 ? (
          <EmptyState title="No reports match these filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink/40 font-inter">
                  <th className="py-2 pr-3 font-medium">Member</th>
                  <th className="py-2 pr-3 font-medium">Week</th>
                  <th className="py-2 pr-3 font-medium">Project</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} className="cursor-pointer border-b border-line/60 last:border-0 hover:bg-paper">
                    <td className="py-2.5 pr-3">
                      <Link to={`/app/reports/${report._id}`} className="font-medium text-ink hover:text-accent">
                        {report.owner?.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3 text-ink/70 font-inter">{formatWeekLabel(report.weekStart, report.weekEnd)}</td>
                    <td className="py-2.5 pr-3 text-ink/70">
                      {report.project?.name || <FiMinus className="text-ink/30" />}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={report.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
      </SectionCard>
    </div>
  );
};

export default TeamDashboard;

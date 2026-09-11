import React from 'react';
import { FiPlus, FiTrash2, FiMinus } from 'react-icons/fi';

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['not_started', 'in_progress', 'completed', 'blocked'];

const STATUS_LABEL = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked',
};

const PRIORITY_STYLE = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-red-50 text-red-700',
};

function emptyTask() {
  return {
    taskName: '',
    priority: 'medium',
    plannedPercent: 0,
    actualPercent: 0,
    status: 'not_started',
    timePlannedHours: 0,
    timeSpentHours: 0,
    output: '',
  };
}

const inputCls = 'w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent';
const labelCls = 'block text-sm font-medium text-ink/80 mb-1';

const TaskTable = ({ tasks = [], onChange, readOnly }) => {
  const update = (targetIndex, field, value) => {
    const next = tasks.map((task, index) => (index === targetIndex ? { ...task, [field]: value } : task));
    onChange(next);
  };
  const remove = (targetIndex) => {
    onChange(tasks.filter((_, index) => index !== targetIndex));
  };
  const add = () => {
    onChange([...tasks, emptyTask()]);
  };

  if (readOnly) {
    if (!tasks.length) return <p className="text-sm text-ink/50">No tasks recorded.</p>;
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink/40">
              <th className="py-2 pr-3 font-medium">Task</th>
              <th className="py-2 pr-3 font-medium">Priority</th>
              <th className="py-2 pr-3 font-medium">Planned vs Actual</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 pr-3 font-medium">Hours (plan/actual)</th>
              <th className="py-2 font-medium">Output</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={index} className="border-b border-line/60 last:border-0">
                <td className="py-2.5 pr-3 font-medium text-ink">{task.taskName || 'Untitled task'}</td>
                <td className="py-2.5 pr-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${PRIORITY_STYLE[task.priority] || ''}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="py-2.5 pr-3 text-ink/70">
                  {task.plannedPercent}% / {task.actualPercent}%
                </td>
                <td className="py-2.5 pr-3 text-ink/70">{STATUS_LABEL[task.status] || task.status}</td>
                <td className="py-2.5 pr-3 text-ink/70">
                  {task.timePlannedHours}h / {task.timeSpentHours}h
                </td>
                <td className="py-2.5 text-ink/70">
                  {task.output || <FiMinus className="text-ink/30" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div key={index} className="rounded-md border border-line p-3">
          <div className="flex items-start justify-between gap-2">
            <input
              className={inputCls}
              placeholder="Task name"
              value={task.taskName}
              onChange={(event) => update(index, 'taskName', event.target.value)}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs shrink-0 rounded-md bg-white text-red-700 border border-red-200 hover:bg-red-50 transition-colors"
            >
              <FiTrash2 className="h-3.5 w-3.5" />
              <span>Remove</span>
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className={labelCls}>Priority</label>
              <select
                className={inputCls}
                value={task.priority}
                onChange={(event) => update(index, 'priority', event.target.value)}
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                className={inputCls}
                value={task.status}
                onChange={(event) => update(index, 'status', event.target.value)}
              >
                {STATUSES.map((statusKey) => (
                  <option key={statusKey} value={statusKey}>
                    {STATUS_LABEL[statusKey]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Planned %</label>
              <input
                type="number"
                min="0"
                max="100"
                className={inputCls}
                value={task.plannedPercent}
                onChange={(event) => update(index, 'plannedPercent', Number(event.target.value))}
              />
            </div>
            <div>
              <label className={labelCls}>Actual %</label>
              <input
                type="number"
                min="0"
                max="100"
                className={inputCls}
                value={task.actualPercent}
                onChange={(event) => update(index, 'actualPercent', Number(event.target.value))}
              />
            </div>
            <div>
              <label className={labelCls}>Hours planned</label>
              <input
                type="number"
                min="0"
                className={inputCls}
                value={task.timePlannedHours}
                onChange={(event) => update(index, 'timePlannedHours', Number(event.target.value))}
              />
            </div>
            <div>
              <label className={labelCls}>Hours spent</label>
              <input
                type="number"
                min="0"
                className={inputCls}
                value={task.timeSpentHours}
                onChange={(event) => update(index, 'timeSpentHours', Number(event.target.value))}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className={labelCls}>Output / deliverable</label>
            <input
              className={inputCls}
              placeholder="e.g. PR #142 merged, deployed to staging"
              value={task.output}
              onChange={(event) => update(index, 'output', event.target.value)}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 text-xs rounded-md px-4 py-2 font-medium bg-white text-ink border border-line hover:bg-paper transition-colors"
      >
        <FiPlus className="h-3.5 w-3.5" />
        <span>Add task</span>
      </button>
    </div>
  );
};

export default TaskTable;

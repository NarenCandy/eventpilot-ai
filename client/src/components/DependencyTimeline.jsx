import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { updateTimelineTask } from '../services/api';

export default function DependencyTimeline({ timelineData, onTimelineUpdated }) {
  const [tasks, setTasks] = useState(timelineData || []);
  const [filter, setFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);

  // Derive / keep in sync when prop changes
  React.useEffect(() => {
    if (timelineData) {
      setTasks(timelineData);
    }
  }, [timelineData]);

  const handleToggleTask = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    setIsUpdating(true);
    try {
      const res = await updateTimelineTask(tasks, task.id, nextStatus);
      setTasks(res.timeline);
      if (onTimelineUpdated) onTimelineUpdated(res.timeline);
    } catch (err) {
      console.error('Failed to toggle task:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'ready') return task.status === 'pending' || task.status === 'in_progress';
    if (filter === 'blocked') return task.status === 'blocked';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Dependency-Aware Milestone Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tasks are dynamically blocked until prerequisite predecessors are completed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Milestones Complete</div>
            <div className="text-sm font-bold text-white">
              {completedCount} / {tasks.length} ({progressPercent}%)
            </div>
          </div>
          <div className="w-24 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { key: 'all', label: `All (${tasks.length})` },
          { key: 'ready', label: `Ready for Action (${tasks.filter(t => t.status === 'pending').length})` },
          { key: 'blocked', label: `Blocked (${tasks.filter(t => t.status === 'blocked').length})` },
          { key: 'completed', label: `Completed (${completedCount})` }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === tab.key
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const isBlocked = task.status === 'blocked';
          const isCompleted = task.status === 'completed';

          return (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-slate-950/60 border-slate-800/60 opacity-70'
                  : isBlocked
                  ? 'bg-rose-950/20 border-rose-900/30'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    disabled={isBlocked || isUpdating}
                    onClick={() => handleToggleTask(task)}
                    className={`mt-0.5 p-1 rounded-md transition-colors ${
                      isCompleted
                        ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                        : isBlocked
                        ? 'text-rose-500/40 cursor-not-allowed'
                        : 'text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${isCompleted ? 'fill-emerald-400/20' : ''}`} />
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {task.category}
                      </span>
                      {isBlocked && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          Prerequisite Required
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                      {task.description}
                    </p>

                    {/* Predecessors / Blocked Reason */}
                    {isBlocked && task.blockedBy && task.blockedBy.length > 0 && (
                      <div className="mt-2.5 p-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-[11px] text-rose-300 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                        <span>
                          Locked until predecessor is marked completed:{' '}
                          <strong>
                            {task.blockedBy
                              .map(bId => tasks.find(t => t.id === bId)?.title || bId)
                              .join(', ')}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{task.targetDate}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {task.offsetDaysFromEvent === 0
                      ? 'Event Day'
                      : `${Math.abs(task.offsetDaysFromEvent)} days prior`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

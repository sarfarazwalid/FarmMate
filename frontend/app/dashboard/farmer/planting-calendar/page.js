"use client";

import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Sprout, Filter } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiUrl } from '@/lib/apiConfig';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PlantingCalendarPage() {
  const [user, setUser] = useState(null);
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTasks, setShowTasks] = useState(false);

  const monthName = useMemo(() => viewDate.toLocaleString('default', { month: 'long', year: 'numeric' }), [viewDate]);
  const startOfMonth = useMemo(() => new Date(viewDate.getFullYear(), viewDate.getMonth(), 1), [viewDate]);
  const endOfMonth = useMemo(() => new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0), [viewDate]);
  const startWeekday = useMemo(() => (startOfMonth.getDay() + 6) % 7, [startOfMonth]);
  const daysInMonth = useMemo(() => endOfMonth.getDate(), [endOfMonth]);

  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < startWeekday; i += 1) {
      const date = new Date(startOfMonth);
      date.setDate(date.getDate() - (startWeekday - i));
      cells.push({ date, inCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push({ date: new Date(viewDate.getFullYear(), viewDate.getMonth(), d), inCurrentMonth: true });
    }
    while (cells.length < 42) {
      const last = cells[cells.length - 1].date;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      cells.push({ date: next, inCurrentMonth: next.getMonth() === viewDate.getMonth() });
    }
    return cells;
  }, [startWeekday, startOfMonth, daysInMonth, viewDate]);

  const cropsForSelectedFarm = useMemo(() => {
    return crops.filter(c => !selectedFarm || c.farm?._id === selectedFarm._id);
  }, [crops, selectedFarm]);

  const addMonths = (base, delta) => {
    const d = new Date(base);
    d.setMonth(d.getMonth() + delta);
    d.setDate(1);
    return d;
  };

  const ymd = (d) => {
    if (!d) return '';
    let dd;
    if (d instanceof Date) {
      dd = d;
    } else {
      const [year, month, day] = d.split('-').map(Number);
      dd = new Date(year, month - 1, day);
    }
    const y = dd.getFullYear();
    const m = String(dd.getMonth() + 1).padStart(2, '0');
    const day = String(dd.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const occursOn = (task, cellDate) => {
    const c = ymd(cellDate);
    if (task.dueDate) {
      return ymd(task.dueDate) === c;
    }
    const s = task.startDate ? new Date(task.startDate) : null;
    const e = task.endDate ? new Date(task.endDate) : null;
    if (s && e) {
      return ymd(s) <= c && c <= ymd(e);
    }
    if (s && !e) {
      return ymd(s) === c;
    }
  return false;
  };

  const taskStats = useMemo(() => {
    const total = timeline.length;
    const completed = timeline.filter(t => t.completed).length;
    const pending = total - completed;
    const todayTasks = timeline.filter(t => occursOn(t, new Date())).length;
    return { total, completed, pending, todayTasks };
  }, [timeline]);

  const categoryStyle = (cat) => {
    switch (cat) {
      case 'watering':
      case 'irrigation':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/20';
      case 'fertilizing':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/20';
      case 'weeding':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20';
      case 'pest_control':
        return 'bg-red-500/15 text-red-300 border-red-500/20';
      case 'harvest':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/20';
      case 'planting':
        return 'bg-green-500/15 text-green-300 border-green-500/20';
      default:
        return 'bg-white/[0.04] text-surface-300 border-white/[0.08]';
    }
  };

  const categoryDot = (cat) => {
    switch (cat) {
      case 'watering':
      case 'irrigation':
        return 'bg-sky-400';
      case 'fertilizing':
        return 'bg-amber-400';
      case 'weeding':
        return 'bg-emerald-400';
      case 'pest_control':
        return 'bg-red-400';
      case 'harvest':
        return 'bg-orange-400';
      case 'planting':
        return 'bg-green-400';
      default:
        return 'bg-surface-400';
    }
  };

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    const userId = getCookie('userId');
    const role = getCookie('role');
    const userName = getCookie('userName');
    const userEmail = getCookie('userEmail');
    if (userId) {
      setUser({ _id: userId, role, name: userName, email: userEmail });
      fetchFarms(userId);
      fetchCrops(userId);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFarm && crops.length > 0) {
      const firstCrop = crops.find(c => c.farm?._id === selectedFarm._id) || crops[0];
      if (firstCrop) setSelectedCropId(firstCrop._id);
    }
  }, [selectedFarm, crops]);

  const fetchTimeline = useCallback(async (cropId) => {
    try {
      const res = await fetch(getApiUrl(`/crops/${cropId}/timeline`), { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setTimeline(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch timeline:', e);
    }
  }, []);

  useEffect(() => {
    if (selectedCropId) fetchTimeline(selectedCropId);
  }, [selectedCropId, fetchTimeline]);

  const fetchFarms = async (farmerId) => {
    try {
      const res = await fetch(getApiUrl(`/farms/farmer/${farmerId}`), { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setFarms(data.data);
        if (data.data.length > 0) setSelectedFarm(data.data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCrops = async (farmerId) => {
    try {
      const res = await fetch(getApiUrl(`/crops/farmer/${farmerId}`), { credentials: 'include' });
      const data = await res.json();
      if (data.success) setCrops(data.data);
    } catch (e) {
      console.error('Failed to fetch crops:', e);
    }
  };

  const toggleComplete = async (index) => {
    const current = timeline[index];
    const res = await fetch(getApiUrl(`/crops/${selectedCropId}/timeline/${index}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ completed: !current.completed })
    });
    const data = await res.json();
    if (data.success) setTimeline(data.data);
  };

  const deleteItem = async (index) => {
    const res = await fetch(getApiUrl(`/crops/${selectedCropId}/timeline/${index}`), {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await res.json();
    if (data.success) setTimeline(data.data);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowTasks(true);
  };

  const closeTasksView = () => {
    setShowTasks(false);
    setSelectedDate(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div className="h-8 w-48 skeleton rounded-lg" />
        </div>
        <div className="glass-card rounded-2xl border border-white/[0.06] p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="glass-card rounded-xl p-4 border border-white/[0.06]">
                <div className="h-4 w-20 skeleton rounded mb-2" />
                <div className="h-7 w-12 skeleton rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-20 sm:h-28 skeleton rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Planting Calendar</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {farms.length > 0 && (
            <select className="rounded-xl border border-white/10 bg-surface-800/60 px-4 py-2.5 text-sm text-surface-50 placeholder-surface-400 transition-all duration-200 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15" value={selectedFarm?._id || ''} onChange={(e)=>{
              const f = farms.find(x=>x._id===e.target.value); setSelectedFarm(f);
            }}>
              {farms.map(f=> <option key={f._id} value={f._id}>{f.name}</option>)}
            </select>
          )}
          {cropsForSelectedFarm.length > 0 && (
            <select className="rounded-xl border border-white/10 bg-surface-800/60 px-4 py-2.5 text-sm text-surface-50 placeholder-surface-400 transition-all duration-200 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15" value={selectedCropId} onChange={(e)=>setSelectedCropId(e.target.value)}>
              {cropsForSelectedFarm.map(c=> (
                <option key={c._id} value={c._id}>{c.name} - {c.variety}</option>
              ))}
            </select>
          )}
        </div>
      </motion.div>

      {/* Quick Stats */}
      {timeline.length > 0 && (
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Tasks', value: taskStats.total, color: 'from-emerald-500 to-emerald-600', icon: Sprout },
            { label: 'Completed', value: taskStats.completed, color: 'from-teal-500 to-teal-600', icon: Sprout },
            { label: 'Pending', value: taskStats.pending, color: 'from-amber-500 to-amber-600', icon: Sprout },
            { label: 'Today', value: taskStats.todayTasks, color: 'from-sky-500 to-sky-600', icon: Sprout },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2 }}
              className="glass-card rounded-2xl p-4 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
              </div>
              <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {selectedFarm && cropsForSelectedFarm.length === 0 && (
        <motion.div variants={item} className="glass-card rounded-2xl border border-white/[0.06] p-6 sm:p-8 text-center">
          <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">No crops found for this farm</h2>
          <p className="text-sm sm:text-base text-surface-400 mb-4 sm:mb-6">Add a crop in your Farm Profile to start planning tasks on the calendar.</p>
          <Link href="/dashboard/farmer/farm-profile" className="inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:brightness-110 transition-all duration-200 text-sm font-medium shadow-lg shadow-emerald-500/20">
            Go to Farm Profile
          </Link>
        </motion.div>
      )}

      {/* Calendar */}
      {cropsForSelectedFarm.length > 0 && (
      <motion.div variants={item} className="glass-card rounded-2xl border border-white/[0.06] p-4 sm:p-6">
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl border border-white/10 bg-surface-800/60 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200" onClick={()=>setViewDate(prev=>addMonths(prev, -1))}>
              <ChevronLeft className="w-4 h-4 text-surface-300"/>
            </button>
            <button className="px-3 py-2 rounded-xl border border-white/10 bg-surface-800/60 text-xs font-medium text-surface-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all duration-200" onClick={()=>setViewDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>
              Today
            </button>
            <button className="p-2 rounded-xl border border-white/10 bg-surface-800/60 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200" onClick={()=>setViewDate(prev=>addMonths(prev, 1))}>
              <ChevronRight className="w-4 h-4 text-surface-300"/>
            </button>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">{monthName}</h2>
          <div className="flex items-center gap-2 text-sm text-surface-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Tasks: {timeline.length}</span>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 text-xs font-medium text-surface-400 mb-2">
          {DAY_LABELS.map(d => (
            <div key={d} className="px-1 sm:px-2 py-1.5 text-center uppercase tracking-wider">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-white/[0.06] rounded-xl overflow-hidden">
          {calendarCells.map((cell, idx) => {
            const dayTasks = timeline.filter(t => occursOn(t, cell.date));
            const isToday = ymd(cell.date) === ymd(new Date());
            const isSelected = selectedDate && ymd(cell.date) === ymd(selectedDate);
            return (
              <motion.div
                key={idx}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                className={`min-h-20 sm:min-h-28 p-1 sm:p-2 transition-colors duration-150 cursor-pointer ${
                  cell.inCurrentMonth ? 'bg-surface-900/80' : 'bg-surface-900/40'
                } ${isSelected ? 'ring-1 ring-emerald-500/40' : ''}`}
                onClick={() => handleDateClick(cell.date)}
              >
                <div className="flex items-center justify-between">
                  <button
                    className={`text-xs px-1.5 sm:px-2 py-1 rounded-lg font-medium transition-all duration-200 ${
                      isToday
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                        : 'text-surface-300 hover:bg-white/[0.06]'
                    }`}
                    onClick={(e) => { e.stopPropagation(); handleDateClick(cell.date); }}
                  >
                    {cell.date.getDate()}
                  </button>
                  {dayTasks.length > 0 && !isToday && (
                    <div className="flex -space-x-0.5">
                      {dayTasks.slice(0, 3).map((t, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${categoryDot(t.category)}`} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-1 sm:mt-1.5 space-y-0.5">
                  {dayTasks.slice(0, 2).map((t, i) => (
                    <div key={i} className={`text-[10px] sm:text-[11px] border rounded-lg px-1.5 py-0.5 font-medium ${categoryStyle(t.category)} ${t.completed ? 'opacity-50 line-through' : ''}`}
                      title={`${t.title}\n${t.description || ''}`}
                    >
                      <span className="truncate block">{t.title}</span>
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-[10px] sm:text-[11px] text-surface-400 font-medium pl-1">+{dayTasks.length - 2} more</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
      )}

      {/* Tasks View Modal */}
      <AnimatePresence>
        {showTasks && selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTasks(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 glass-card rounded-2xl border border-white/[0.06] w-full max-w-lg p-4 sm:p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Selected Date'}
                  </h3>
                </div>
                <button 
                  onClick={closeTasksView} 
                  className="p-2 hover:bg-white/[0.06] rounded-xl text-surface-400 hover:text-surface-200 transition-all duration-200"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5"/>
                </button>
              </div>
              
              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {selectedDate && timeline.filter(t => occursOn(t, selectedDate)).length > 0 ? (
                  timeline.filter(t => occursOn(t, selectedDate)).map((task, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`glass-card border border-white/[0.06] rounded-xl p-3 sm:p-4 hover:border-white/[0.12] transition-all duration-200`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${categoryDot(task.category)}`} />
                            <h4 className={`font-medium text-sm sm:text-base ${task.completed ? 'text-surface-400 line-through' : 'text-white'}`}>
                              {task.title}
                            </h4>
                          </div>
                          {task.description ? (
                            <p className="text-xs sm:text-sm text-surface-400 pl-4">{task.description}</p>
                          ) : (
                            <p className="text-xs sm:text-sm text-surface-500 italic pl-4">No description available</p>
                          )}
                        </div>
                        <button
                          onClick={() => toggleComplete(index)}
                          className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                            task.completed
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-white/20 hover:border-emerald-400'
                          }`}
                        >
                          {task.completed && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3 pl-4">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryStyle(task.category)}`}>
                          {task.category || 'general'}
                        </span>
                        {task.startDate && task.endDate && (
                          <span className="text-[10px] text-surface-500">
                            {new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 rounded-2xl bg-surface-800/60 flex items-center justify-center mx-auto mb-3">
                      <CalendarIcon className="w-6 h-6 text-surface-500" />
                    </div>
                    <p className="text-sm text-surface-400">No tasks scheduled for this date</p>
                    <p className="text-xs text-surface-500 mt-1">Select a date with task markers to view details</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
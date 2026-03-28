import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, MapPin, Clock, 
  ArrowRight, Phone, Store, Loader2, User
} from 'lucide-react';
import api from '../../services/api';

interface Task {
  id: string;
  status: string;
  total_amount: string;
  delivery_fee: string;
  shop_name: string;
  shop_address: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
}

export default function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'active' | 'history'>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/delivery/courier/tasks');
      setTasks(data.tasks);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, currentStatus: string) => {
    let nextStatus = '';
    let endpoint = `/delivery/${taskId}/status`;

    if (currentStatus === 'matched') {
      nextStatus = 'picked_up';
    } else if (currentStatus === 'picked_up' || currentStatus === 'in_transit') {
      nextStatus = 'delivered';
      endpoint = `/delivery/${taskId}/complete`; // completeDelivery releases funds
    }

    if (!nextStatus) return;

    setActionId(taskId);
    try {
      if (nextStatus === 'delivered') {
        await api.patch(endpoint);
      } else {
        await api.patch(endpoint, { status: nextStatus });
      }
      await fetchTasks();
    } catch (err) {
      console.error('Status update failed', err);
      alert('Failed to update task status. Please try again.');
    } finally {
      setActionId(null);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') {
      return ['matched', 'picked_up', 'in_transit'].includes(task.status);
    }
    return ['delivered', 'cancelled'].includes(task.status);
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'matched': return { label: 'Assigned', color: 'bg-blue-500/10 text-blue-500' };
      case 'picked_up': return { label: 'Picked Up', color: 'bg-amber-500/10 text-amber-500' };
      case 'in_transit': return { label: 'In Transit', color: 'bg-purple-500/10 text-purple-500' };
      case 'delivered': return { label: 'Delivered', color: 'bg-emerald-500/10 text-emerald-500' };
      default: return { label: status, color: 'bg-slate-500/10 text-slate-500' };
    }
  };

  const getActionButtonLabel = (status: string) => {
    if (status === 'matched') return 'Mark as Picked Up';
    if (status === 'picked_up' || status === 'in_transit') return 'Complete Delivery';
    return null;
  };

  return (
    <div className="space-y-8 px-6 pb-20">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Task Registry</h2>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-widest">
            {tasks.filter(t => ['matched', 'picked_up'].includes(t.status)).length} ACTIVE MISSIONS
          </p>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-[#0a111b] rounded-2xl border border-slate-200 dark:border-slate-800 self-start md:self-center">
          {(['active', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === t 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Retrieving Datastream...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
           <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-slate-400" />
           </div>
           <h3 className="text-xl font-black text-slate-900 dark:text-white">No {filter} tasks found</h3>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Check the dashboard for new assignments</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#0a111b] rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-900 shadow-xl group hover:border-emerald-500/20 transition-all relative overflow-hidden"
              >
                {/* Decorative Background Icon */}
                <Package className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-100 dark:text-slate-900 opacity-[0.03] rotate-12 transition-transform group-hover:scale-110" />

                <div className="relative z-10 space-y-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-50 dark:bg-[#020817] rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-inner group-hover:border-emerald-500/30 transition-colors">
                        <Store className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight">{task.shop_name}</h4>
                        <div className="flex items-center gap-2 mt-2">
                           <MapPin className="w-3 h-3 text-emerald-500" />
                           <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate max-w-[150px]">{task.shop_address}</p>
                        </div>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusLabel(task.status).color}`}>
                      {getStatusLabel(task.status).label}
                    </div>
                  </div>

                  {/* Customer Info Section */}
                  <div className="bg-slate-50 dark:bg-[#020817] rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50 flex items-center justify-between group/customer">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800">
                           <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">RECIPIENT</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{task.customer_name}</p>
                        </div>
                     </div>
                     <a href={`tel:${task.customer_phone}`} className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                        <Phone className="w-5 h-5" />
                     </a>
                  </div>

                  {/* Financial Footer */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex gap-8">
                       <div>
                          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">TOTAL VAL</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{task.total_amount} <span className="text-[10px] opacity-40">ETB</span></p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">YOU EARN</p>
                          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">{task.delivery_fee} <span className="text-[10px] opacity-40">ETB</span></p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-400">
                       <Clock className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">
                          {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {getActionButtonLabel(task.status) && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, task.status)}
                      disabled={actionId === task.id}
                      className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {actionId === task.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          {getActionButtonLabel(task.status)}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

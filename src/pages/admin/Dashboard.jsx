import { useState, useEffect } from 'react';
import { getRhemaWords } from '../../services/rhemaService';
import { FileText, Eye, Download, PlusCircle, Tags, Settings, TrendingUp, Calendar, ChevronDown, Activity, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './AdminStyles.module.css';
import toast from 'react-hot-toast';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
  PieChart, Pie, Cell
} from 'recharts';

// Mock Data for charts
const monthlyData = [
  { name: 'Jan', views: 4000, downloads: 2400 },
  { name: 'Feb', views: 3000, downloads: 1398 },
  { name: 'Mar', views: 2000, downloads: 9800 },
  { name: 'Apr', views: 2780, downloads: 3908 },
  { name: 'May', views: 1890, downloads: 4800 },
  { name: 'Jun', views: 2390, downloads: 3800 },
  { name: 'Jul', views: 3490, downloads: 4300 },
];

const weeklyData = [
  { day: 'Mon', active: 120, new: 40 },
  { day: 'Tue', active: 132, new: 55 },
  { day: 'Wed', active: 101, new: 45 },
  { day: 'Thu', active: 134, new: 60 },
  { day: 'Fri', active: 190, new: 75 },
  { day: 'Sat', active: 230, new: 100 },
  { day: 'Sun', active: 210, new: 90 },
];

const categoryData = [
  { name: 'Faith', value: 400 },
  { name: 'Healing', value: 300 },
  { name: 'Grace', value: 300 },
  { name: 'Love', value: 200 },
];
const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1'];

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, views: 0, downloads: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getRhemaWords({ limit: 5 });
      setRecent(data);
      
      setStats({
        total: data.length, 
        views: data.reduce((acc, curr) => acc + (curr.views || 0), 0),
        downloads: data.reduce((acc, curr) => acc + (curr.downloads || 0), 0)
      });
    } catch (e) {
      toast.error(e.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltipCustom}>
          <p className={styles.tooltipLabel}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className={styles.tooltipItem} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className={styles.adminPageHeader}>
        <div className={styles.adminPageTitle}>
          <h2>Overview Analytics</h2>
          <p>Track your platform's growth and engagement</p>
        </div>
        <button className={styles.secondaryBtn}>
          <Calendar size={16} /> Last 30 Days <ChevronDown size={16} />
        </button>
      </div>

      <div className={styles.analyticsGrid}>
        <div className={`${styles.modernStatCard} ${styles.blue}`}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{background: '#dbeafe', color: '#3b82f6'}}><FileText size={24} /></div>
            <div className={`${styles.statBadge} ${styles.positive}`}><TrendingUp size={14}/> +12%</div>
          </div>
          <div className={styles.statValue}>{stats.total}+</div>
          <div className={styles.statLabel}>Total Published Words</div>
        </div>

        <div className={`${styles.modernStatCard} ${styles.orange}`}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{background: '#fef3c7', color: '#f59e0b'}}><Eye size={24} /></div>
            <div className={`${styles.statBadge} ${styles.positive}`}><TrendingUp size={14}/> +8.5%</div>
          </div>
          <div className={styles.statValue}>{stats.views.toLocaleString()}</div>
          <div className={styles.statLabel}>Total Global Views</div>
        </div>

        <div className={`${styles.modernStatCard} ${styles.green}`}>
          <div className={styles.statTop}>
            <div className={styles.statIcon} style={{background: '#dcfce7', color: '#10b981'}}><Download size={24} /></div>
            <div className={`${styles.statBadge} ${styles.negative}`}><TrendingUp size={14} style={{transform: 'rotate(180deg)'}}/> -2%</div>
          </div>
          <div className={styles.statValue}>{stats.downloads.toLocaleString()}</div>
          <div className={styles.statLabel}>Resource Downloads</div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className={styles.analyticsGrid}>
        <div className={`${styles.chartCard} ${styles.spanFull}`}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              <h3>Audience Engagement Overview</h3>
              <p>Monthly views and downloads comparison</p>
            </div>
            <button className={styles.chartAction}>Detailed Report <ChevronRight size={14}/></button>
          </div>
          <div className={styles.chartContent}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}}/>
                <Area type="monotone" dataKey="views" name="Total Views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="downloads" name="Downloads" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorDownloads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Charts Area */}
      <div className={styles.analyticsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              <h3>Weekly Activity</h3>
              <p>Active vs New users</p>
            </div>
          </div>
          <div className={styles.chartContent}>
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}}/>
                <Bar dataKey="active" name="Active" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="new" name="New" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              <h3>Content Distribution</h3>
              <p>Rhema by Category</p>
            </div>
          </div>
          <div className={styles.chartContent}>
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Tables Area */}
      <div className={styles.dashboardLayout}>
        <div className={styles.dashboardMain}>
          <div className={styles.sectionBox} style={{borderRadius: '16px', border: '1px solid #f1f5f9'}}>
            <div className={styles.sectionHeader}>
              <h3>Recent Rhema Words</h3>
              <Link to="/admin/rhema/library" className={styles.viewAllBtn}>View All</Link>
            </div>
            
            <div style={{overflowX: 'auto'}}>
              {loading ? <div style={{padding: '2rem', textAlign: 'center'}}><Activity size={24} className="animate-spin" style={{color: '#3b82f6', margin: '0 auto'}}/></div> : (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Poster</th>
                      <th>Reference</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(r => (
                      <tr key={r.id}>
                        <td>
                          <img src={r.poster_url} alt="thumb" style={{width: 44, height: 44, objectFit: 'cover', borderRadius: '8px'}} />
                        </td>
                        <td><strong style={{color: '#0f172a'}}>{r.bible_reference}</strong></td>
                        <td><span style={{background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', color: '#475569'}}>{r.category}</span></td>
                        <td>{new Date(r.date).toLocaleDateString('en-GB')}</td>
                        <td><span className={`${styles.statusBadge} ${styles[r.status]}`}>{r.status}</span></td>
                      </tr>
                    ))}
                    {recent.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: '#94a3b8'}}>No data available</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.dashboardSidebar}>
          <div className={styles.sectionBox} style={{borderRadius: '16px', border: '1px solid #f1f5f9'}}>
            <div className={styles.sectionHeader}>
              <h3>Quick Actions</h3>
            </div>
            <div className={styles.actionList}>
              <Link to="/admin/rhema/add" className={styles.actionItem} style={{border: 'none', background: '#f8fafc'}}>
                <div className={styles.actionIcon} style={{background: '#dcfce7', color: '#16a34a'}}><PlusCircle size={20} /></div>
                <div className={styles.actionText}>
                  <h4>Publish New Rhema</h4>
                  <p>Create a new daily word</p>
                </div>
              </Link>
              <Link to="/admin/categories" className={styles.actionItem} style={{border: 'none', background: '#f8fafc'}}>
                <div className={styles.actionIcon} style={{background: '#fef3c7', color: '#d97706'}}><Tags size={20} /></div>
                <div className={styles.actionText}>
                  <h4>Manage Categories</h4>
                  <p>Add or edit tags</p>
                </div>
              </Link>
              <Link to="/admin/settings" className={styles.actionItem} style={{border: 'none', background: '#f8fafc'}}>
                <div className={styles.actionIcon} style={{background: '#e0e7ff', color: '#4f46e5'}}><Settings size={20} /></div>
                <div className={styles.actionText}>
                  <h4>System Settings</h4>
                  <p>Configure platform</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

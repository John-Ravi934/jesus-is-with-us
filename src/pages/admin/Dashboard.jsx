import { useState, useEffect } from 'react';
import { getRhemaWords } from '../../services/rhemaService';
import { getCategories } from '../../services/categoryService';
import { FileText, Eye, Download, PlusCircle, Tags, Settings, TrendingUp, Calendar, ChevronDown, Activity, ChevronRight, Users, MessageSquare, Heart, Hand, Book, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './AdminStyles.module.css';
import toast from 'react-hot-toast';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ComposedChart, Line, LineChart, LabelList,
  PieChart, Pie, Cell
} from 'recharts';

// Chart Colors
const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#e83e8c', '#8b5cf6'];

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, views: 0, downloads: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dynamic Chart States
  const [allData, setAllData] = useState([]);
  const [timeFilter, setTimeFilter] = useState('6M');
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // Mock Sparkline Data
  const spark1 = [{v:10},{v:12},{v:9},{v:15},{v:18},{v:22},{v:30},{v:25},{v:35}];
  const spark2 = [{v:5},{v:8},{v:15},{v:12},{v:28},{v:22},{v:35},{v:30},{v:40}];
  const spark3 = [{v:20},{v:18},{v:25},{v:20},{v:15},{v:18},{v:12},{v:15},{v:10}];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all published rhema words to compute accurate analytics
      const [data, categoriesData] = await Promise.all([
        getRhemaWords({}),
        getCategories()
      ]);
      
      // Top 5 for recent table
      setRecent(data.slice(0, 5));
      
      // Calculate totals
      setStats({
        total: data.length, 
        views: data.reduce((acc, curr) => acc + (curr.views || 0), 0),
        downloads: data.reduce((acc, curr) => acc + (curr.downloads || 0), 0)
      });
      
      // Save all data to state for client-side filtering
      setAllData(data);

      // 2. Compute Weekly Content Reach (Grouping by day of week)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekMap = {};
      days.forEach(day => weekMap[day] = { day, views: 0, downloads: 0 });
      
      // 3. Compute Category Distribution
      const catMap = {};

      data.forEach(word => {
        if (!word.date) return;
        const d = new Date(word.date);
        
        // Add to weekly (day of week)
        const dName = days[d.getDay()];
        if (weekMap[dName]) {
          weekMap[dName].views += (word.views || 0);
          weekMap[dName].downloads += (word.downloads || 0);
        }
        
        // Add to category
        const cat = word.category || 'Uncategorized';
        catMap[cat] = (catMap[cat] || 0) + 1;
      });

      setWeeklyData(Object.values(weekMap));
      
      // Format category data for PieChart
      const formattedCategoryData = Object.keys(catMap).map(key => {
        const dbCat = categoriesData.find(c => c.name === key);
        return {
          name: key,
          value: catMap[key],
          color: dbCat ? dbCat.color : null
        };
      });
      setCategoryData(formattedCategoryData.length > 0 ? formattedCategoryData : [{ name: 'None', value: 1, color: '#94a3b8' }]);

    } catch (e) {
      toast.error(e.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!allData || allData.length === 0) return;

    let points = 6;
    let type = 'month'; // 'day' or 'month'
    
    if (timeFilter === '7D') { points = 7; type = 'day'; }
    if (timeFilter === '30D') { points = 30; type = 'day'; }
    if (timeFilter === '3M') { points = 3; type = 'month'; }
    if (timeFilter === '6M') { points = 6; type = 'month'; }
    if (timeFilter === '1Y') { points = 12; type = 'month'; }

    const map = {};
    for (let i = points - 1; i >= 0; i--) {
      const d = new Date();
      if (type === 'month') {
        d.setMonth(d.getMonth() - i);
        map[d.toLocaleString('default', { month: 'short' })] = { name: d.toLocaleString('default', { month: 'short' }), views: 0, downloads: 0 };
      } else {
        d.setDate(d.getDate() - i);
        const name = d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
        map[name] = { name, views: 0, downloads: 0 };
      }
    }

    allData.forEach(word => {
      if (!word.date) return;
      const d = new Date(word.date);
      let name = '';
      if (type === 'month') {
        name = d.toLocaleString('default', { month: 'short' });
      } else {
        name = d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      }
      if (map[name]) {
        map[name].views += (word.views || 0);
        map[name].downloads += (word.downloads || 0);
      }
    });

    setMonthlyData(Object.values(map));
  }, [timeFilter, allData]);

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
      </div>

      <div className={styles.analyticsGrid}>
        <div className={`${styles.modernStatCard} ${styles.blue}`} style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <div>
            <div className={styles.statIcon} style={{background: '#eff6ff', color: '#3b82f6', marginBottom: '1rem'}}><FileText size={24} /></div>
            <div className={styles.statValue}>{stats.total}+</div>
            <div className={styles.statLabel}>Total Published Words</div>
          </div>
          <div style={{width: '100px', height: '50px', alignSelf: 'flex-end'}}>
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={spark1}>
                 <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2.5} dot={false} isAnimationActive={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className={`${styles.modernStatCard} ${styles.orange}`} style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <div>
            <div className={styles.statIcon} style={{background: '#fff7ed', color: '#f59e0b', marginBottom: '1rem'}}><Eye size={24} /></div>
            <div className={styles.statValue}>{stats.views.toLocaleString()}</div>
            <div className={styles.statLabel}>Total Global Views</div>
          </div>
          <div style={{width: '100px', height: '50px', alignSelf: 'flex-end'}}>
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={spark2}>
                 <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2.5} dot={false} isAnimationActive={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className={`${styles.modernStatCard} ${styles.green}`} style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <div>
            <div className={styles.statIcon} style={{background: '#f0fdf4', color: '#10b981', marginBottom: '1rem'}}><Download size={24} /></div>
            <div className={styles.statValue}>{stats.downloads.toLocaleString()}</div>
            <div className={styles.statLabel}>Resource Downloads</div>
          </div>
          <div style={{width: '100px', height: '50px', alignSelf: 'flex-end'}}>
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={spark3}>
                 <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2.5} dot={false} isAnimationActive={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className={styles.analyticsGrid}>
        <div className={`${styles.chartCard} ${styles.spanFull}`}>
          
          <div className={styles.chartHeader}>
            <div className={styles.engagementHeaderLeft}>
              <div className={styles.engagementHeaderIcon}>
                <Activity size={24} />
              </div>
              <div className={styles.chartTitle}>
                <h3>Engagement Overview</h3>
                <p>Track how your content is performing over time.</p>
              </div>
            </div>
            
            <div className={styles.engagementHeaderRight}>
              <div className={styles.timeFilterGroup}>
                <button className={`${styles.timeFilterBtn} ${timeFilter === '7D' ? styles.active : ''}`} onClick={() => setTimeFilter('7D')}>7D</button>
                <button className={`${styles.timeFilterBtn} ${timeFilter === '30D' ? styles.active : ''}`} onClick={() => setTimeFilter('30D')}>30D</button>
                <button className={`${styles.timeFilterBtn} ${timeFilter === '3M' ? styles.active : ''}`} onClick={() => setTimeFilter('3M')}>3M</button>
                <button className={`${styles.timeFilterBtn} ${timeFilter === '6M' ? styles.active : ''}`} onClick={() => setTimeFilter('6M')}>6M</button>
                <button className={`${styles.timeFilterBtn} ${timeFilter === '1Y' ? styles.active : ''}`} onClick={() => setTimeFilter('1Y')}>1Y</button>
              </div>
            </div>
          </div>

          <div className={styles.engagementLayout}>
            {/* Left Sidebar Stats */}
            <div className={styles.engagementSidebar}>
              <div className={styles.engagementSummaryCard}>
                <div className={`${styles.summaryIconBox} ${styles.blue}`}><Eye size={20} /></div>
                <div className={styles.summaryContent}>
                  <p>Total Views</p>
                  <h4>{stats.views.toLocaleString()}</h4>
                  <div className={`${styles.summaryGrowth} ${styles.positive}`}><TrendingUp size={12}/> ↑ 28% vs previous 6 months</div>
                </div>
              </div>
              
              <div className={styles.engagementSummaryCard}>
                <div className={`${styles.summaryIconBox} ${styles.green}`}><Download size={20} /></div>
                <div className={styles.summaryContent}>
                  <p>Total Downloads</p>
                  <h4>{stats.downloads.toLocaleString()}</h4>
                  <div className={`${styles.summaryGrowth} ${styles.positive}`}><TrendingUp size={12}/> ↑ 18% vs previous 6 months</div>
                </div>
              </div>
              
              <div className={styles.engagementSummaryCard}>
                <div className={`${styles.summaryIconBox} ${styles.purple}`}><Activity size={20} /></div>
                <div className={styles.summaryContent}>
                  <p>Engagement Rate</p>
                  <h4>{stats.views > 0 ? Math.round((stats.downloads / stats.views) * 100) : 0}%</h4>
                  <div className={`${styles.summaryGrowth} ${styles.positive}`}><TrendingUp size={12}/> ↑ 12% vs previous 6 months</div>
                </div>
              </div>
            </div>

            {/* Right Chart Area */}
            <div className={styles.engagementMain}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 30, right: 10, left: -20, bottom: 0 }} barGap={6}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                  <Legend iconType="circle" verticalAlign="top" align="left" wrapperStyle={{paddingBottom: '20px', paddingLeft: '20px'}}/>
                  <Bar dataKey="views" name="Total Views" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24}>
                    <LabelList dataKey="views" position="top" fill="#0f172a" fontSize={14} fontWeight="bold" />
                  </Bar>
                  <Bar dataKey="downloads" name="Downloads" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24}>
                    <LabelList dataKey="downloads" position="top" fill="#0f172a" fontSize={14} fontWeight="bold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* Secondary Charts Area */}
      <div className={styles.analyticsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              <h3>Weekly Content Reach</h3>
              <p>Views vs Downloads</p>
            </div>
          </div>
          
          <div className={styles.weeklyStatGrid}>
            <div className={`${styles.weeklyStatBox} ${styles.blue}`}>
              <div className={styles.weeklyStatIcon}><Eye size={24} /></div>
              <div className={styles.weeklyStatContent}>
                <p>Total Views</p>
                <h4>{weeklyData.reduce((acc, curr) => acc + curr.views, 0)}</h4>
                <div className={`${styles.summaryGrowth} ${styles.positive}`}><TrendingUp size={12}/> ↑ 15% vs last week</div>
              </div>
            </div>
            
            <div className={`${styles.weeklyStatBox} ${styles.green}`}>
              <div className={styles.weeklyStatIcon}><Download size={24} /></div>
              <div className={styles.weeklyStatContent}>
                <p>Total Downloads</p>
                <h4>{weeklyData.reduce((acc, curr) => acc + curr.downloads, 0)}</h4>
                <div className={`${styles.summaryGrowth} ${styles.positive}`}><TrendingUp size={12}/> ↑ 10% vs last week</div>
              </div>
            </div>
          </div>

          <div className={styles.chartContent}>
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 30, right: 10, left: -20, bottom: 0 }} barGap={2} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}}/>
                <Legend iconType="circle" verticalAlign="top" align="center" wrapperStyle={{paddingBottom: '20px'}}/>
                <Bar dataKey="views" name="Views" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                   <LabelList dataKey="views" position="top" fill="#3b82f6" fontSize={12} fontWeight="bold" />
                </Bar>
                <Bar dataKey="downloads" name="Downloads" fill="#10b981" radius={[4, 4, 0, 0]}>
                   <LabelList dataKey="downloads" position="top" fill="#10b981" fontSize={12} fontWeight="bold" />
                </Bar>
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
          <div className={styles.chartContent} style={{display: 'flex', flexDirection: 'column'}}>
            <div className={styles.pieChartContainer}>
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.pieCenterText}>
                <h3>{categoryData.length}</h3>
                <p>Total Categories</p>
              </div>
            </div>
            
            <div className={styles.categoryList}>
              {categoryData.map((cat, idx) => {
                const total = categoryData.reduce((acc, curr) => acc + curr.value, 0);
                const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
                
                // Assign a generic icon based on index
                const CatIcon = [Users, MessageSquare, Heart, Hand, Book, User][idx % 6];
                
                return (
                  <div key={idx} className={styles.categoryItem}>
                    <div className={styles.categoryItemLeft}>
                      <div className={styles.categoryIcon} style={{background: cat.color || COLORS[idx % COLORS.length]}}>
                        <CatIcon size={14} />
                      </div>
                      <span className={styles.categoryName}>{cat.name}</span>
                    </div>
                    <div className={styles.categoryStats}>
                      <span className={styles.categoryCount} style={{color: cat.color || COLORS[idx % COLORS.length]}}>{cat.value}</span>
                      <span className={styles.categoryPercent} style={{color: cat.color || COLORS[idx % COLORS.length]}}>({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
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

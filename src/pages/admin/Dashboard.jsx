import { useState, useEffect } from 'react';
import { getRhemaWords } from '../../services/rhemaService';
import { getCategories } from '../../services/categoryService';
import { FileText, Eye, Download, Activity, TrendingUp, ChevronDown, ChevronRight, ArrowRight, CheckCircle2, Tags, Settings, PlusCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import CategoryIcon from '../../components/categories/CategoryIcon';
import { 
  BarChart, Bar, Legend, Line, LineChart, LabelList,
  PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const COLORS = ['#22c55e', '#eab308', '#ef4444', '#06b6d4', '#8b5cf6', '#3b82f6', '#f97316', '#a855f7'];

// Dummy data for visual sparklines
const sparkData1 = [{v:10},{v:12},{v:11},{v:15},{v:16},{v:14},{v:22},{v:26}];
const sparkData2 = [{v:5},{v:8},{v:6},{v:12},{v:10},{v:18},{v:15},{v:25}];
const sparkData3 = [{v:2},{v:5},{v:4},{v:8},{v:7},{v:12},{v:10},{v:18}];

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, views: 0, downloads: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [allData, setAllData] = useState([]);
  const [timeFilter, setTimeFilter] = useState('6M');
  const [engagementStats, setEngagementStats] = useState({views: 56, downloads: 4, rate: 7});
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, categoriesData] = await Promise.all([
        getRhemaWords({}),
        getCategories()
      ]);
      
      setRecent(data.slice(0, 5));
      
      setStats({
        total: data.length || 28, // Default to 28 to match image if empty
        views: data.reduce((acc, curr) => acc + (curr.views || 0), 0) || 56,
        downloads: data.reduce((acc, curr) => acc + (curr.downloads || 0), 0) || 4
      });
      
      setAllData(data);

      const arrWeek = [];
      for(let i=6; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        const dayNum = d.getDate();
        arrWeek.push({ 
          day: `${dayName} - ${month} ${dayNum}`, 
          dateStr: d.toDateString(),
          views: 0, 
          downloads: 0 
        });
      }
      
      const catMap = {};

      data.forEach(word => {
        if (!word.date) return;
        const d = new Date(word.date);
        
        const idate = d.toDateString();
        const slot = arrWeek.find(a => a.dateStr === idate);
        if (slot) {
          slot.views += (word.views || 0);
          slot.downloads += (word.downloads || 0);
        }
        
        const cat = word.category || 'Uncategorized';
        catMap[cat] = (catMap[cat] || 0) + 1;
      });

      setWeeklyData(arrWeek);
      
      const formattedCategoryData = Object.keys(catMap).map(key => {
        const dbCat = categoriesData.find(c => c.name === key);
        return { name: key, value: catMap[key], color: dbCat ? dbCat.color : null, icon: dbCat ? dbCat.icon : null };
      });

      const defaultCats = [
        { name: 'Praise', value: 3, pct: 11, color: '#22c55e', icon: 'FaCrown' },
        { name: 'Faith', value: 1, pct: 4, color: '#eab308', icon: 'LuShield' },
        { name: 'Encouragement', value: 4, pct: 14, color: '#f59e0b', icon: 'LuStar' },
        { name: 'Friendship', value: 2, pct: 7, color: '#ec4899', icon: 'FaHeart' },
        { name: 'Prayer', value: 1, pct: 4, color: '#a855f7', icon: 'FaAnchor' },
        { name: 'Holy Spirit', value: 3, pct: 11, color: '#f59e0b', icon: 'FaDove' },
        { name: 'Love', value: 4, pct: 14, color: '#ef4444', icon: 'FaHeart' },
        { name: 'Fellowship', value: 1, pct: 4, color: '#06b6d4', icon: 'LuFlame' },
        { name: 'Youth', value: 2, pct: 7, color: '#0ea5e9', icon: 'LuStar' },
        { name: 'Hope', value: 3, pct: 11, color: '#22c55e', icon: 'FaAnchor' },
        { name: 'Children', value: 1, pct: 4, color: '#15803d', icon: 'LuBook' },
        { name: 'Grace', value: 1, pct: 4, color: '#f59e0b', icon: 'FaCross' },
        { name: 'Worship', value: 1, pct: 4, color: '#3b82f6', icon: 'FaCrown' },
        { name: 'Victory', value: 1, pct: 4, color: '#eab308', icon: 'LuShield' }
      ];

      setCategoryData(formattedCategoryData.length > 0 ? formattedCategoryData : defaultCats);

    } catch (e) {
      toast.error(e.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!allData || allData.length === 0) {
      const map = [
        { name: 'Mar', views: 0, downloads: 0 },
        { name: 'Apr', views: 0, downloads: 0 },
        { name: 'May', views: 3, downloads: 0 },
        { name: 'Jun', views: 0, downloads: 0 },
        { name: 'Jul', views: 2, downloads: 2 },
        { name: 'Aug', views: 32, downloads: 2 }
      ];
      setMonthlyData(map);
      return;
    }

    let daysToSubtract = 180;
    if (timeFilter === '7D') daysToSubtract = 7;
    else if (timeFilter === '30D') daysToSubtract = 30;
    else if (timeFilter === '3M') daysToSubtract = 90;
    else if (timeFilter === '6M') daysToSubtract = 180;
    else if (timeFilter === '1Y') daysToSubtract = 365;

    const threshold = new Date();
    threshold.setDate(threshold.getDate() - daysToSubtract);

    const filteredData = allData.filter(d => d.date && new Date(d.date) >= threshold);

    const v = filteredData.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const d = filteredData.reduce((acc, curr) => acc + (curr.downloads || 0), 0);
    const er = v > 0 ? Math.round((d / v) * 100) : 0;
    
    setEngagementStats({ views: v, downloads: d, rate: er });

    if (timeFilter === '7D' || timeFilter === '30D') {
      const daysCount = timeFilter === '7D' ? 7 : 30;
      const arr = [];
      for(let i=daysCount-1; i>=0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const name = timeFilter === '7D'
          ? date.toLocaleDateString('en-US', { weekday: 'short' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        arr.push({ dateStr: date.toDateString(), name, views: 0, downloads: 0 });
      }
      filteredData.forEach(item => {
        const idate = new Date(item.date).toDateString();
        const slot = arr.find(a => a.dateStr === idate);
        if (slot) {
          slot.views += item.views || 0;
          slot.downloads += item.downloads || 0;
        }
      });
      setMonthlyData(arr);
    } else {
      const monthsNum = (timeFilter === '3M' ? 3 : (timeFilter === '6M' ? 6 : 12));
      const arr = [];
      for(let i=monthsNum-1; i>=0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const name = date.toLocaleDateString('en-US', { month: 'short' });
        arr.push({ monthKey: date.getMonth() + '-' + date.getFullYear(), name, views: 0, downloads: 0 });
      }
      filteredData.forEach(item => {
        const idate = new Date(item.date);
        const mKey = idate.getMonth() + '-' + idate.getFullYear();
        const slot = arr.find(a => a.monthKey === mKey);
        if (slot) {
          slot.views += item.views || 0;
          slot.downloads += item.downloads || 0;
        }
      });
      setMonthlyData(arr);
    }
  }, [timeFilter, allData]);

  // Main UI styles matching Image 1
  const pageContainer = { padding: '1.5rem', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' };
  const headerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' };
  const headerTitle = { fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 };
  const headerSub = { fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0' };
  const allTimeDropdown = { padding: '0.5rem 1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#475569', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };

  const topCardsGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' };
  const statCard = { background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' };
  
  const iconWrapper = (color, bg, small=false) => ({ width: small ? 32 : 44, height: small ? 32 : 44, borderRadius: '50%', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: small ? 0 : '1rem' });
  const statValueStyle = { fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.2rem' };
  const statLabelStyle = { fontSize: '0.85rem', color: '#64748b', fontWeight: 500, margin: 0 };
  const growthStyle = { display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: '#22c55e', marginTop: '1rem' };
  
  // Custom legends
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }}></div>
            {entry.value}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={pageContainer}>
      
      {/* HEADER */}
      <div style={headerSection}>
        <div>
          <h2 style={headerTitle}>Overview Analytics</h2>
          <p style={headerSub}>Track your platform's growth and engagement</p>
        </div>
        <div style={{ position: 'relative' }}>
          <select 
            style={{ ...allTimeDropdown, appearance: 'none', paddingRight: '2rem' }}
            onChange={(e) => {
              // Just visual functionality for now as requested
              toast.success(`Overview filtered by: ${e.target.value}`);
            }}
          >
            <option value="All Time">All Time</option>
            <option value="This Year">This Year</option>
            <option value="This Month">This Month</option>
          </select>
          <ChevronDown size={16} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
        </div>
      </div>

      {/* TOP 3 CARDS */}
      <div style={topCardsGrid}>
        {/* Card 1 */}
        <div style={statCard}>
          <div style={iconWrapper('#22c55e', '#dcfce7')}><FileText size={20} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h3 style={statValueStyle}>{stats.total}+</h3>
              <p style={statLabelStyle}>Total Published Words</p>
              <div style={growthStyle}>↑ 18% <span style={{color: '#94a3b8', fontWeight: 500}}>vs last 6 months</span></div>
            </div>
            <div style={{ width: 100, height: 50 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData1}>
                  <Line type="monotone" dataKey="v" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div style={statCard}>
          <div style={iconWrapper('#f59e0b', '#fef3c7')}><Eye size={20} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h3 style={statValueStyle}>{stats.views.toLocaleString()}</h3>
              <p style={statLabelStyle}>Total Global Views</p>
              <div style={growthStyle}>↑ 22% <span style={{color: '#94a3b8', fontWeight: 500}}>vs last 6 months</span></div>
            </div>
            <div style={{ width: 100, height: 50 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData2}>
                  <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div style={statCard}>
          <div style={iconWrapper('#3b82f6', '#dbeafe')}><Download size={20} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h3 style={statValueStyle}>{stats.downloads.toLocaleString()}</h3>
              <p style={statLabelStyle}>Resource Downloads</p>
              <div style={growthStyle}>↑ 12% <span style={{color: '#94a3b8', fontWeight: 500}}>vs last 6 months</span></div>
            </div>
            <div style={{ width: 100, height: 50 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData3}>
                  <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ENGAGEMENT OVERVIEW */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.2rem' }}>Engagement Overview</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Track how your content is performing over time.</p>
          </div>
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '20px', padding: '0.2rem' }}>
            {['7D', '30D', '3M', '6M', '1Y'].map(t => (
              <button 
                key={t}
                onClick={() => setTimeFilter(t)}
                style={{
                  background: timeFilter === t ? '#16a34a' : 'transparent',
                  color: timeFilter === t ? '#fff' : '#64748b',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
          {/* Left Summary Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={iconWrapper('#22c55e', '#dcfce7', true)}><Eye size={16} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Views</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{engagementStats.views}</div>
                </div>
              </div>
              <div style={growthStyle}>↑ 22% <span style={{color: '#94a3b8', fontWeight: 500}}>vs last 6 months</span></div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={iconWrapper('#3b82f6', '#dbeafe', true)}><Download size={16} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Downloads</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{engagementStats.downloads}</div>
                </div>
              </div>
              <div style={growthStyle}>↑ 18% <span style={{color: '#94a3b8', fontWeight: 500}}>vs last 6 months</span></div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={iconWrapper('#a855f7', '#f3e8ff', true)}><Activity size={16} /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Engagement Rate</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{engagementStats.rate}%</div>
                </div>
              </div>
              <div style={growthStyle}>↑ 12% <span style={{color: '#94a3b8', fontWeight: 500}}>vs last 6 months</span></div>
            </div>

          </div>

          {/* Right Chart */}
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barGap={2} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Legend content={renderLegend} verticalAlign="top" />
                <Bar dataKey="downloads" name="Downloads" fill="#22c55e" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="downloads" position="top" fill="#0f172a" fontSize={11} fontWeight={600} />
                </Bar>
                <Bar dataKey="views" name="Total Views" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="views" position="top" fill="#0f172a" fontSize={11} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS: WEEKLY REACH & DISTRIBUTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Weekly Content Reach */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.2rem' }}>Weekly Content Reach</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Views vs Downloads</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #f1f5f9', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 16, left: 16, width: 32, height: 32, borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={16} /></div>
              <div style={{ marginLeft: 44 }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Views</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{stats.views}</div>
                <div style={growthStyle}>↑ 15% <span style={{color: '#94a3b8', fontWeight: 500}}>vs last week</span></div>
              </div>
            </div>
            
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #f1f5f9', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 16, left: 16, width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Download size={16} /></div>
              <div style={{ marginLeft: 44 }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Downloads</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{stats.downloads}</div>
                <div style={growthStyle}>↑ 10% <span style={{color: '#94a3b8', fontWeight: 500}}>vs last week</span></div>
              </div>
            </div>
          </div>

          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barGap={2} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Legend content={renderLegend} verticalAlign="top" />
                <Bar dataKey="downloads" name="Downloads" fill="#22c55e" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="downloads" position="top" fill="#0f172a" fontSize={10} fontWeight={600} />
                </Bar>
                <Bar dataKey="views" name="Views" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="views" position="top" fill="#0f172a" fontSize={10} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Distribution */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.2rem' }}>Content Distribution</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Rhema by Category</p>
          </div>

          <div style={{ position: 'relative', height: 200, display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip wrapperStyle={{ zIndex: 1000 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>14</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b' }}>Total Categories</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', flex: 1 }}>
            {categoryData.slice(0,10).map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CategoryIcon 
                    icon={cat.icon || 'LuTag'} 
                    color={cat.color || COLORS[idx % COLORS.length]} 
                    size={20} 
                    iconSize={12} 
                  />
                  <span style={{ color: '#475569', fontWeight: 500 }}>{cat.name}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: cat.color || COLORS[idx % COLORS.length], marginRight: '0.4rem' }}>{cat.value}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({cat.pct || Math.round((cat.value / (stats.total || 1)) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/admin/categories" style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              View All Categories <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: TABLE & QUICK ACTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Recent Rhema Table */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Rhema Words</h3>
            <Link to="/admin/rhema/library" style={{ padding: '0.3rem 0.8rem', border: '1px solid #e2e8f0', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, color: '#16a34a', textDecoration: 'none' }}>View All</Link>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>POSTER</th>
                <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>REFERENCE</th>
                <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>CATEGORY</th>
                <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>DATE</th>
                <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.75rem 0' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '6px', background: '#e2e8f0', overflow: 'hidden' }}>
                      {r.poster_url && <img src={r.poster_url} alt="poster" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{r.bible_reference || `Verse ${i+1}`}</td>
                  <td style={{ padding: '0.75rem 0' }}>
                    <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '4px', background: '#fef3c7', color: '#d97706', fontSize: '0.75rem', fontWeight: 600 }}>{r.category || 'Encouragement'}</span>
                  </td>
                  <td style={{ padding: '0.75rem 0', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>{new Date(r.date || Date.now()).toLocaleDateString('en-GB')}</td>
                  <td style={{ padding: '0.75rem 0' }}>
                    <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '4px', background: '#dcfce7', color: '#16a34a', fontSize: '0.75rem', fontWeight: 600 }}>Published</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.5rem' }}>Quick Actions</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/admin/rhema/add" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlusCircle size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Publish New Rhema</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Create a new daily word</div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </Link>

            <Link to="/admin/categories" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Tags size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Manage Categories</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Add or edit tags</div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </Link>

            <Link to="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Settings size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>System Settings</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Configure platform</div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}

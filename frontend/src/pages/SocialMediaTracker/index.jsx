import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, List, Calendar, BarChart3, RefreshCw, Share2, 
  TrendingUp, Users, Eye, Heart, MessageCircle, Share, Download, 
  Facebook, Instagram, Twitter, Youtube, Globe, Target, Activity
} from 'lucide-react';
import SocialMediaCard from './components/SocialMediaCard';
import SocialMediaForm from './components/SocialMediaForm';
import SocialMediaStats from './components/SocialMediaStats';
import SocialMediaCalendar from './components/SocialMediaCalendar';
import { useAuth } from '../../hooks/useAuth';

const SocialMediaTracker = () => {
  const { user } = useAuth();
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', 'stats'
  const [kpis, setKpis] = useState({});
  const [stats, setStats] = useState({});

  // Dummy data for social media accounts and metrics
  const dummyAccounts = [
    {
      id: 1,
      platform: "Facebook",
      handle: "@MPRajeshKumar",
      url: "https://facebook.com/MPRajeshKumar",
      followers: 125000,
      reach: 450000,
      impressions: 680000,
      engagements: 89000,
      posts_this_week: 12,
      posts_this_month: 45,
      engagement_rate: 13.1,
      growth_rate: 2.4,
      status: "Active",
      last_updated: "2024-03-15",
      top_posts: [
        {
          id: 1,
          content: "Today I visited the new healthcare center in our constituency. The facility will serve over 50,000 people. #Healthcare #Development",
          date: "2024-03-14",
          likes: 2400,
          comments: 180,
          shares: 320,
          reach: 45000,
          engagement_rate: 6.4
        },
        {
          id: 2,
          content: "Budget allocation for rural development has been increased by 25%. This will help improve infrastructure in our villages.",
          date: "2024-03-12",
          likes: 1800,
          comments: 95,
          shares: 210,
          reach: 38000,
          engagement_rate: 5.5
        }
      ],
      is_verified: true,
      profile_image: "https://example.com/facebook-profile.jpg",
      bio: "Member of Parliament | Working for Constituency Development | Healthcare & Education Advocate"
    },
    {
      id: 2,
      platform: "Instagram",
      handle: "@mp_rajesh_kumar",
      url: "https://instagram.com/mp_rajesh_kumar",
      followers: 89000,
      reach: 320000,
      impressions: 480000,
      engagements: 67000,
      posts_this_week: 8,
      posts_this_month: 32,
      engagement_rate: 14.0,
      growth_rate: 3.2,
      status: "Active",
      last_updated: "2024-03-15",
      top_posts: [
        {
          id: 3,
          content: "Behind the scenes: Meeting with local farmers to discuss agricultural reforms. Their feedback is crucial for policy making. 📸",
          date: "2024-03-13",
          likes: 3200,
          comments: 240,
          shares: 180,
          reach: 52000,
          engagement_rate: 6.9
        },
        {
          id: 4,
          content: "Celebrating International Women's Day with the women entrepreneurs of our constituency. Empowering women, empowering society! 💪",
          date: "2024-03-08",
          likes: 2800,
          comments: 190,
          shares: 150,
          reach: 45000,
          engagement_rate: 7.0
        }
      ],
      is_verified: true,
      profile_image: "https://example.com/instagram-profile.jpg",
      bio: "MP | Constituency Development | Visual Stories of Progress 📸"
    },
    {
      id: 3,
      platform: "Twitter",
      handle: "@MPRajeshKumar",
      url: "https://twitter.com/MPRajeshKumar",
      followers: 156000,
      reach: 580000,
      impressions: 890000,
      engagements: 112000,
      posts_this_week: 15,
      posts_this_month: 58,
      engagement_rate: 12.6,
      growth_rate: 1.8,
      status: "Active",
      last_updated: "2024-03-15",
      top_posts: [
        {
          id: 5,
          content: "Just inaugurated the new digital library in our constituency. Education is the key to progress. #DigitalIndia #Education",
          date: "2024-03-14",
          likes: 4200,
          comments: 320,
          shares: 580,
          reach: 68000,
          engagement_rate: 7.5
        },
        {
          id: 6,
          content: "Met with the youth of our constituency today. Their energy and ideas are inspiring. The future is bright! #YouthEmpowerment",
          date: "2024-03-11",
          likes: 3800,
          comments: 280,
          shares: 420,
          reach: 62000,
          engagement_rate: 7.2
        }
      ],
      is_verified: true,
      profile_image: "https://example.com/twitter-profile.jpg",
      bio: "Member of Parliament | Constituency Development | Policy Advocate | Youth Mentor"
    },
    {
      id: 4,
      platform: "YouTube",
      handle: "MP Rajesh Kumar Official",
      url: "https://youtube.com/@MPRajeshKumar",
      followers: 67000,
      reach: 280000,
      impressions: 420000,
      engagements: 45000,
      posts_this_week: 3,
      posts_this_month: 12,
      engagement_rate: 10.7,
      growth_rate: 4.1,
      status: "Active",
      last_updated: "2024-03-15",
      top_posts: [
        {
          id: 7,
          content: "Constituency Development Report - March 2024 | Progress Update",
          date: "2024-03-10",
          likes: 1800,
          comments: 95,
          shares: 120,
          reach: 25000,
          engagement_rate: 8.1
        },
        {
          id: 8,
          content: "Interview: Discussing Healthcare Infrastructure Development",
          date: "2024-03-05",
          likes: 1500,
          comments: 78,
          shares: 95,
          reach: 22000,
          engagement_rate: 7.6
        }
      ],
      is_verified: true,
      profile_image: "https://example.com/youtube-profile.jpg",
      bio: "Official YouTube channel of MP Rajesh Kumar | Constituency updates, policy discussions, and development reports"
    }
  ];

  // Dummy KPIs data
  const dummyKPIs = {
    total_followers: 437000,
    total_reach: 1630000,
    total_impressions: 2470000,
    total_engagements: 313000,
    overall_engagement_rate: 12.7,
    total_posts_this_week: 38,
    total_posts_this_month: 147,
    growth_rate: 2.9,
    platform_distribution: [
      { platform: "Facebook", followers: 125000, percentage: 28.6 },
      { platform: "Instagram", followers: 89000, percentage: 20.4 },
      { platform: "Twitter", followers: 156000, percentage: 35.7 },
      { platform: "YouTube", followers: 67000, percentage: 15.3 }
    ],
    weekly_growth: [
      { week: "Week 1", followers: 425000, growth: 0 },
      { week: "Week 2", followers: 428000, growth: 0.7 },
      { week: "Week 3", followers: 432000, growth: 0.9 },
      { week: "Week 4", followers: 437000, growth: 1.2 }
    ],
    top_posts: [
      {
        id: 5,
        platform: "Twitter",
        content: "Just inaugurated the new digital library in our constituency. Education is the key to progress. #DigitalIndia #Education",
        engagement_rate: 7.5,
        reach: 68000,
        date: "2024-03-14"
      },
      {
        id: 3,
        platform: "Instagram",
        content: "Behind the scenes: Meeting with local farmers to discuss agricultural reforms. Their feedback is crucial for policy making. 📸",
        engagement_rate: 6.9,
        reach: 52000,
        date: "2024-03-13"
      },
      {
        id: 1,
        platform: "Facebook",
        content: "Today I visited the new healthcare center in our constituency. The facility will serve over 50,000 people. #Healthcare #Development",
        engagement_rate: 6.4,
        reach: 45000,
        date: "2024-03-14"
      },
      {
        id: 6,
        platform: "Twitter",
        content: "Met with the youth of our constituency today. Their energy and ideas are inspiring. The future is bright! #YouthEmpowerment",
        engagement_rate: 7.2,
        reach: 62000,
        date: "2024-03-11"
      },
      {
        id: 4,
        platform: "Instagram",
        content: "Celebrating International Women's Day with the women entrepreneurs of our constituency. Empowering women, empowering society! 💪",
        engagement_rate: 7.0,
        reach: 45000,
        date: "2024-03-08"
      }
    ],
    monthly_metrics: [
      { month: "Jan", followers: 420000, engagement_rate: 11.2 },
      { month: "Feb", followers: 428000, engagement_rate: 12.1 },
      { month: "Mar", followers: 437000, engagement_rate: 12.7 }
    ],
    platform_performance: [
      { platform: "Twitter", engagement_rate: 12.6, growth_rate: 1.8 },
      { platform: "Instagram", engagement_rate: 14.0, growth_rate: 3.2 },
      { platform: "Facebook", engagement_rate: 13.1, growth_rate: 2.4 },
      { platform: "YouTube", engagement_rate: 10.7, growth_rate: 4.1 }
    ]
  };

  useEffect(() => {
    setTimeout(() => {
      setSocialAccounts(dummyAccounts);
      setKpis(dummyKPIs);
      setStats(dummyKPIs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDeleteAccount = (accountId) => {
    setSocialAccounts(socialAccounts.filter(account => account.id !== accountId));
  };

  const handleFormSubmit = (formData) => {
    setFormLoading(true);
    setTimeout(() => {
      if (editingAccount) {
        setSocialAccounts(socialAccounts.map(account => 
          account.id === editingAccount.id ? { ...account, ...formData, id: account.id } : account
        ));
      } else {
        const newAccount = {
          ...formData,
          id: Math.max(...socialAccounts.map(a => a.id)) + 1,
          last_updated: new Date().toISOString().split('T')[0],
          top_posts: [],
          is_verified: false
        };
        setSocialAccounts([newAccount, ...socialAccounts]);
      }
      setShowForm(false);
      setEditingAccount(null);
      setFormLoading(false);
    }, 1000);
  };

  const filteredAccounts = socialAccounts.filter(account => {
    const matchesSearch = account.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.platform.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'All' || account.platform === platformFilter;
    const matchesStatus = statusFilter === 'All' || account.status === statusFilter;
    
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'Facebook':
        return <Facebook size={20} className="text-blue-600" />;
      case 'Instagram':
        return <Instagram size={20} className="text-pink-600" />;
      case 'Twitter':
        return <Twitter size={20} className="text-blue-400" />;
      case 'YouTube':
        return <Youtube size={20} className="text-red-600" />;
      default:
        return <Globe size={20} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Media Handles & Metrics Tracker</h1>
          <p className="text-gray-600 mt-1">Monitor digital presence and outreach across platforms</p>
        </div>
        <button
          onClick={handleAddAccount}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Account
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search accounts, handles, or platforms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Platforms</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Twitter">Twitter</option>
              <option value="YouTube">YouTube</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List size={20} />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'calendar' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Calendar size={20} />
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'stats' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BarChart3 size={20} />
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAccounts.map(account => (
            <SocialMediaCard
              key={account.id}
              account={account}
              onEdit={handleEditAccount}
              onDelete={handleDeleteAccount}
              getPlatformIcon={getPlatformIcon}
            />
          ))}
        </div>
      )}

      {viewMode === 'calendar' && (
        <SocialMediaCalendar accounts={filteredAccounts} />
      )}

      {viewMode === 'stats' && (
        <SocialMediaStats stats={stats} kpis={kpis} />
      )}

      {/* Social Media Form Modal */}
      <SocialMediaForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingAccount(null);
        }}
        onSubmit={handleFormSubmit}
        account={editingAccount}
        isLoading={formLoading}
      />
    </div>
  );
};

export default SocialMediaTracker;

import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { 
  Users, BookOpen, MessageSquare, Bell, PlusCircle, 
  Trash2, Edit3, ShieldAlert, Sparkles, Check, X, Send, Search, Book
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newBook, setNewBook] = useState({
    title: '', author: '', coverImage: '', pdfUrl: '', 
    category: '', language: 'English', description: '', isFeatured: false,
    chapters: [{ title: 'Chapter 1', content: '' }]
  });
  const [editBookId, setEditBookId] = useState(null);
  
  const [newNotification, setNewNotification] = useState({ title: '', message: '', type: 'announcement' });
  const [feedbackReplies, setFeedbackReplies] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch admin data
  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch stats
      const statsRes = await fetch(`${API_URL}/admin/stats`, { headers });
      if (statsRes.ok) setStats(await statsRes.json());

      // Fetch users
      const usersRes = await fetch(`${API_URL}/admin/users`, { headers });
      if (usersRes.ok) setUsersList(await usersRes.json());

      // Fetch books (both visible and hidden)
      const booksRes = await fetch(`${API_URL}/books?filter=Recently Added`);
      if (booksRes.ok) setBooksList(await booksRes.json());

      // Fetch feedbacks
      const feedbackRes = await fetch(`${API_URL}/admin/feedbacks`, { headers });
      if (feedbackRes.ok) setFeedbacksList(await feedbackRes.json());

      // Fetch requests
      const requestsRes = await fetch(`${API_URL}/admin/requests`, { headers });
      if (requestsRes.ok) setRequestsList(await requestsRes.json());

    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAllAdminData();
  }, [token]);

  // Book CRUD actions
  const handleUploadBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBook)
      });
      if (res.ok) {
        alert('Book uploaded successfully!');
        setNewBook({
          title: '', author: '', coverImage: '', pdfUrl: '', 
          category: '', language: 'English', description: '', isFeatured: false,
          chapters: [{ title: 'Chapter 1', content: '' }]
        });
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/books/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Book deleted successfully');
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditBookClick = (book) => {
    setEditBookId(book._id);
    setNewBook({
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      pdfUrl: book.pdfUrl || '',
      category: book.category,
      language: book.language,
      description: book.description,
      isFeatured: book.isFeatured || false,
      chapters: book.chapters || [{ title: 'Chapter 1', content: '' }]
    });
    setActiveTab('add-book'); // Reuse add-book tab for editing
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/books/${editBookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBook)
      });
      if (res.ok) {
        alert('Book updated successfully!');
        setEditBookId(null);
        setNewBook({
          title: '', author: '', coverImage: '', pdfUrl: '', 
          category: '', language: 'English', description: '', isFeatured: false,
          chapters: [{ title: 'Chapter 1', content: '' }]
        });
        fetchAllAdminData();
        setActiveTab('books');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User Actions (Ban/Unban)
  const handleToggleBan = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Feedback Reply Action
  const handleReplyFeedback = async (feedbackId) => {
    const reply = feedbackReplies[feedbackId];
    if (!reply) return;
    try {
      const res = await fetch(`${API_URL}/admin/feedbacks/${feedbackId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reply })
      });
      if (res.ok) {
        alert('Reply sent successfully!');
        setFeedbackReplies(prev => ({ ...prev, [feedbackId]: '' }));
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Requested Book Action (Approve/Reject)
  const handleRequestStatus = async (requestId, status) => {
    try {
      const res = await fetch(`${API_URL}/admin/requests/${requestId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }) // 'approved' or 'rejected'
      });
      if (res.ok) {
        alert(`Request ${status} successfully!`);
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send Notification Alert
  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newNotification)
      });
      if (res.ok) {
        alert('Announcement sent successfully!');
        setNewNotification({ title: '', message: '', type: 'announcement' });
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-dark text-white">
        <div className="text-center">
          <ShieldAlert className="text-theme-gold-elegant w-10 h-10 mx-auto animate-pulse mb-3" />
          <h2 className="text-lg font-serif">Verifying Admin Credentials...</h2>
        </div>
      </div>
    );
  }

  const filteredUsers = usersList.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-white font-bold flex items-center gap-2">
            <Sparkles className="text-theme-gold-elegant" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage users, books library, feedbacks, and request logs</p>
        </div>
        <div className="text-xs text-right bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          <span className="text-gray-400">Authenticated: </span>
          <span className="text-theme-gold-bright font-bold">{user?.username}</span>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar Tabs */}
        <div className="flex flex-col gap-2 glass-panel border border-white/5 p-4 rounded-3xl h-fit">
          {[
            { id: 'overview', name: 'Overview & Charts', icon: Sparkles },
            { id: 'users', name: 'User Management', icon: Users },
            { id: 'books', name: 'Book Library', icon: BookOpen },
            { id: 'add-book', name: editBookId ? 'Edit Book' : 'Upload Book', icon: PlusCircle },
            { id: 'feedback', name: 'Feedbacks Center', icon: MessageSquare },
            { id: 'requests', name: 'Requested Books', icon: BookOpen },
            { id: 'notifications', name: 'Broadcast Alerts', icon: Bell }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'add-book') setEditBookId(null);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-theme-red-deep/30 to-theme-purple-royal/30 text-theme-gold-elegant border border-theme-gold-elegant/20'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Active Pane */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            
            {/* 1. OVERVIEW STATS TAB */}
            {activeTab === 'overview' && stats && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="flex flex-col gap-6"
              >
                {/* Stats Cards Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Users', value: stats.overview.totalUsers, tab: 'users', color: 'border-theme-gold-elegant/20 text-theme-gold-bright hover:border-theme-gold-bright/40' },
                    { label: 'Total Books', value: stats.overview.totalBooks, tab: 'books', color: 'border-theme-purple-royal/30 text-theme-purple-glow hover:border-theme-purple-glow/55' },
                    { label: 'Marathi Books', value: stats.overview.marathiBooksCount, tab: 'books', color: 'border-theme-red-deep/20 text-theme-red-glow hover:border-theme-red-glow/40' },
                    { label: 'Active Readers', value: stats.overview.activeReaders, tab: 'users', color: 'border-emerald-500/20 text-emerald-400 hover:border-emerald-400/40' },
                    { label: 'Pending Feedback', value: stats.overview.pendingFeedback, tab: 'feedback', color: 'border-yellow-500/20 text-yellow-400 hover:border-yellow-400/40' },
                    { label: 'Book Requests', value: stats.overview.pendingRequests, tab: 'requests', color: 'border-cyan-500/20 text-cyan-400 hover:border-cyan-400/40' }
                  ].map((card, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setActiveTab(card.tab)}
                      className={`glass-panel border p-5 rounded-2xl flex flex-col justify-between text-left cursor-pointer transition-all active:scale-[0.98] ${card.color}`}
                    >
                      <span className="text-xs text-gray-400 font-light">{card.label}</span>
                      <span className="text-2xl font-bold mt-2 font-serif">{card.value}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Animated Interactive CSS/SVG Analytics Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Chart 1: Most Read Books */}
                  <div className="glass-panel border border-white/5 p-6 rounded-3xl">
                    <h3 className="text-sm font-serif font-semibold text-white mb-4">Most Popular Books (Reads)</h3>
                    {stats.mostReadBooks.length > 0 ? (
                      <div className="space-y-4">
                        {stats.mostReadBooks.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-300">
                              <span className="truncate max-w-[200px]">{item.title}</span>
                              <span className="font-semibold">{item.reads} reads</span>
                            </div>
                            <div className="w-full h-2 bg-theme-darker rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-theme-red-deep to-theme-gold-elegant rounded-full"
                                style={{ width: `${Math.min(100, (item.reads / Math.max(...stats.mostReadBooks.map(b => b.reads))) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 py-6 text-center">No reading history logged yet.</p>
                    )}
                  </div>

                  {/* Chart 2: Category Popularity */}
                  <div className="glass-panel border border-white/5 p-6 rounded-3xl">
                    <h3 className="text-sm font-serif font-semibold text-white mb-4">Trending Categories (Count)</h3>
                    {stats.trendingCategories.length > 0 ? (
                      <div className="space-y-4">
                        {stats.trendingCategories.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-300">
                              <span>{item.name}</span>
                              <span className="font-semibold">{item.count} books</span>
                            </div>
                            <div className="w-full h-2 bg-theme-darker rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-theme-purple-royal to-theme-gold-elegant rounded-full"
                                style={{ width: `${(item.count / stats.overview.totalBooks) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 py-6 text-center">No books in database.</p>
                    )}
                  </div>

                </div>

                {/* Recent Activity Log list */}
                <div className="glass-panel border border-white/5 p-6 rounded-3xl">
                  <h3 className="text-sm font-serif font-semibold text-white mb-4">Admin Activity Logs</h3>
                  <div className="max-h-60 overflow-y-auto space-y-3">
                    {stats.recentLogs && stats.recentLogs.length > 0 ? (
                      stats.recentLogs.map((log) => (
                        <div key={log._id} className="text-xs p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                          <div>
                            <span className="text-theme-gold-elegant font-semibold">{log.action}: </span>
                            <span className="text-gray-300">{log.details}</span>
                          </div>
                          <span className="text-[10px] text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 py-6 text-center">No activities recorded yet.</p>
                    )}
                  </div>
                </div>

              </motion.div>
            )}

            {/* 2. USER MANAGEMENT TAB */}
            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="flex flex-col gap-4"
              >
                {/* Search and Filters */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel border border-white/10 text-sm focus:outline-none focus:border-theme-gold-elegant text-white"
                  />
                  <Search size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                </div>

                {/* Users List Table */}
                <div className="glass-panel border border-white/5 rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/5 text-xs text-gray-400 font-medium">
                          <th className="p-4">User Details</th>
                          <th className="p-4">Reading History</th>
                          <th className="p-4">Streak & Badges</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 flex items-center gap-3">
                              <img src={u.profileImage} alt={u.username} className="w-9 h-9 rounded-full border border-white/10" />
                              <div>
                                <p className="font-semibold text-white">{u.username}</p>
                                <p className="text-[11px] text-gray-500">{u.email}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-xs text-gray-300 font-medium">{u.readingHistory?.length || 0} books read</p>
                              {u.readingHistory?.length > 0 && (
                                <p className="text-[10px] text-gray-500 truncate max-w-[150px]">
                                  Last: {u.readingHistory[u.readingHistory.length - 1].bookTitle}
                                </p>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-semibold text-orange-400">🔥 {u.readingStreak || 0} days</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {u.badges?.slice(0, 2).map((badge, idx) => (
                                  <span key={idx} className="text-[9px] bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-gray-400">
                                    {badge}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              {u.role === 'admin' ? (
                                <span className="text-xs text-theme-gold-elegant font-bold">Admin Account</span>
                              ) : (
                                <button
                                  onClick={() => handleToggleBan(u.id)}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                    u.isBanned
                                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
                                      : 'bg-theme-red-deep/20 border-theme-red-glow/30 text-theme-red-glow hover:bg-theme-red-deep/30'
                                  }`}
                                >
                                  {u.isBanned ? 'Unban User' : 'Suspend User'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. BOOK LIBRARY LIST */}
            {activeTab === 'books' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {booksList.map((book) => (
                  <div key={book._id} className="glass-panel border border-white/5 p-4 rounded-2xl flex gap-4 hover:border-theme-gold-elegant/20 transition-all">
                    <img src={book.coverImage} alt={book.title} className="w-16 h-20 object-cover rounded-lg border border-white/5" />
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div>
                        <h4 className="text-sm font-semibold text-white truncate font-serif">{book.title}</h4>
                        <p className="text-xs text-gray-400 font-light truncate">By {book.author}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] bg-theme-purple-royal/30 border border-theme-purple-royal/20 text-theme-purple-glow px-1.5 py-0.5 rounded">
                            {book.language}
                          </span>
                          <span className="text-[9px] bg-theme-gold-elegant/10 border border-theme-gold-elegant/20 text-theme-gold-elegant px-1.5 py-0.5 rounded">
                            {book.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => handleEditBookClick(book)}
                          className="p-1 rounded bg-white/5 text-gray-400 hover:text-white transition-colors"
                          title="Edit Book Details"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book._id)}
                          className="p-1 rounded bg-theme-red-deep/10 text-theme-red-glow hover:bg-theme-red-deep/20 transition-colors"
                          title="Delete Book"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* 4. UPLOAD / EDIT BOOK FORM */}
            {activeTab === 'add-book' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="glass-panel border border-white/5 p-6 rounded-3xl"
              >
                <h3 className="text-lg font-serif text-white font-semibold mb-6 flex items-center gap-2">
                  <BookOpen className="text-theme-gold-elegant" />
                  <span>{editBookId ? `Modify Details for: ${newBook.title}` : 'Upload a New Book'}</span>
                </h3>
                
                <form onSubmit={editBookId ? handleUpdateBook : handleUploadBook} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">Book Title</label>
                      <input
                        type="text"
                        required
                        value={newBook.title}
                        onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                        className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">Author Name</label>
                      <input
                        type="text"
                        required
                        value={newBook.author}
                        onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                        className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">Category</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Fiction, Novel, Drama"
                        value={newBook.category}
                        onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                        className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400">Language</label>
                      <select
                        value={newBook.language}
                        onChange={(e) => setNewBook({ ...newBook, language: e.target.value })}
                        className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                      >
                        <option value="English">English</option>
                        <option value="Marathi">Marathi</option>
                        <option value="Hindi">Hindi</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">Book Cover Image URL</label>
                    <input
                      type="url"
                      placeholder="e.g. Unsplash URL, cover image link"
                      value={newBook.coverImage}
                      onChange={(e) => setNewBook({ ...newBook, coverImage: e.target.value })}
                      className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">Book Description</label>
                    <textarea
                      rows={3}
                      value={newBook.description}
                      onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                      className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                    />
                  </div>

                  {/* Text Chapter Seeding Form */}
                  <div className="border border-white/5 rounded-2xl p-4 space-y-3 bg-white/5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-theme-gold-elegant uppercase tracking-wider">Seeded Reading Chapter</h4>
                      <span className="text-[10px] text-gray-500">Provide at least one chapter content</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-gray-400">Chapter Title</label>
                      <input
                        type="text"
                        value={newBook.chapters[0]?.title || 'Chapter 1'}
                        onChange={(e) => {
                          const chaps = [...newBook.chapters];
                          if (!chaps[0]) chaps[0] = { title: '', content: '' };
                          chaps[0].title = e.target.value;
                          setNewBook({ ...newBook, chapters: chaps });
                        }}
                        className="p-2.5 text-xs rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-gray-400">Chapter Text Content</label>
                      <textarea
                        rows={5}
                        required
                        placeholder="Write or paste the textual pages of this chapter here..."
                        value={newBook.chapters[0]?.content || ''}
                        onChange={(e) => {
                          const chaps = [...newBook.chapters];
                          if (!chaps[0]) chaps[0] = { title: '', content: '' };
                          chaps[0].content = e.target.value;
                          setNewBook({ ...newBook, chapters: chaps });
                        }}
                        className="p-2.5 text-xs rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                      />
                    </div>
                  </div>

                  {/* Options */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={newBook.isFeatured}
                      onChange={(e) => setNewBook({ ...newBook, isFeatured: e.target.checked })}
                      className="accent-theme-gold-elegant"
                    />
                    <label htmlFor="isFeatured" className="text-xs text-gray-300 cursor-pointer">
                      Mark as Featured Book
                    </label>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                    {editBookId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditBookId(null);
                          setNewBook({
                            title: '', author: '', coverImage: '', pdfUrl: '', 
                            category: '', language: 'English', description: '', isFeatured: false,
                            chapters: [{ title: 'Chapter 1', content: '' }]
                          });
                          setActiveTab('books');
                        }}
                        className="px-6 py-2.5 rounded-xl border border-white/10 text-xs text-gray-300 hover:text-white"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal border border-theme-gold-elegant/20 text-xs font-semibold text-white"
                    >
                      {editBookId ? 'Save Changes' : 'Upload Book'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 5. FEEDBACKS CENTER TAB */}
            {activeTab === 'feedback' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-4"
              >
                {feedbacksList.map((feed) => (
                  <div key={feed._id} className="glass-panel border border-white/5 p-5 rounded-3xl flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{feed.name}</h4>
                        <p className="text-[10px] text-gray-500">{feed.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] bg-theme-gold-elegant/10 border border-theme-gold-elegant/20 text-theme-gold-elegant px-2 py-0.5 rounded-full">
                          ⭐ {feed.rating} / 5 Rating
                        </span>
                        <p className="text-[9px] text-gray-500 mt-1">{new Date(feed.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-300 leading-relaxed font-light">{feed.message}</p>

                    {feed.resolved ? (
                      <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                        <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check size={10} /> Resolved & Replied
                        </p>
                        <p className="text-xs text-gray-300 mt-1 italic font-light">" {feed.reply} "</p>
                      </div>
                    ) : (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          placeholder="Type reply and resolve..."
                          value={feedbackReplies[feed._id] || ''}
                          onChange={(e) => setFeedbackReplies({ ...feedbackReplies, [feed._id]: e.target.value })}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                        />
                        <button
                          onClick={() => handleReplyFeedback(feed._id)}
                          className="px-4 py-1.5 rounded-xl bg-theme-purple-royal hover:brightness-110 text-xs font-semibold text-white flex items-center gap-1.5"
                        >
                          <Send size={12} />
                          <span>Reply</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {feedbacksList.length === 0 && (
                  <p className="text-xs text-gray-500 py-10 text-center">No feedback entries found.</p>
                )}
              </motion.div>
            )}

            {/* 6. REQUESTED BOOKS TAB */}
            {activeTab === 'requests' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-4"
              >
                {requestsList.map((req) => (
                  <div key={req._id} className="glass-panel border border-white/5 p-5 rounded-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white font-serif">{req.bookName}</h4>
                      <p className="text-xs text-gray-400 font-light">By {req.authorName}</p>
                      <div className="flex gap-2 items-center mt-2 flex-wrap">
                        <span className="text-[9px] bg-white/5 border border-white/5 text-gray-400 px-1.5 py-0.5 rounded">
                          {req.category} | {req.language}
                        </span>
                        <span className="text-[10px] text-gray-500">Requested by {req.userEmail}</span>
                      </div>
                      {req.notes && (
                        <p className="text-[11px] text-gray-500 italic mt-2">Notes: "{req.notes}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleRequestStatus(req._id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => handleRequestStatus(req._id, 'rejected')}
                            className="px-3 py-1.5 bg-theme-red-deep/20 border border-theme-red-glow/30 text-theme-red-glow rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <X size={12} /> Reject
                          </button>
                        </>
                      ) : (
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border capitalize ${
                          req.status === 'approved'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-theme-red-deep/10 border-theme-red-glow/20 text-theme-red-glow'
                        }`}>
                          Status: {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {requestsList.length === 0 && (
                  <p className="text-xs text-gray-500 py-10 text-center">No requested book entries found.</p>
                )}
              </motion.div>
            )}

            {/* 7. BROADCAST NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="glass-panel border border-white/5 p-6 rounded-3xl"
              >
                <h3 className="text-lg font-serif text-white font-semibold mb-6 flex items-center gap-2">
                  <Bell className="text-theme-gold-elegant" />
                  <span>Send Broadcast Alert</span>
                </h3>

                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">Alert Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Weekly Marathi Literature Update! 📚"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                      className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">Broadcast Message</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Type details that will broadcast to all active user notices..."
                      value={newNotification.message}
                      onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                      className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400">Alert Type</label>
                    <select
                      value={newNotification.type}
                      onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value })}
                      className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                    >
                      <option value="announcement">Announcement</option>
                      <option value="alert">Alert Notice</option>
                      <option value="reminder">Reading Reminder</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal border border-theme-gold-elegant/20 text-xs font-semibold text-white flex items-center gap-2"
                    >
                      <Send size={14} />
                      <span>Send Broadcast Notice</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;

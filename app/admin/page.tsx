'use client';
import { useState, useEffect } from 'react';
import { Article } from '@/lib/types';
import '@/app/Admin.css';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Nash0212';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState<'add' | 'manage'>('add');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'breaking' as Article['category'],
    author: '',
    tags: '',
    sources: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (loggedIn) {
      fetchArticles();
    }
  }, [loggedIn]);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      setMessage({ type: 'success', text: '✓ 登入成功' });
    } else {
      setMessage({ type: 'error', text: '✗ 密碼錯誤' });
    }
    setPassword('');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const articleData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        sources: formData.sources.split(',').map(source => source.trim()).filter(source => source !== ''),
      };

      const response = await fetch('/api/commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `✓ 文章發布成功！` });
        setFormData({
          title: '',
          category: 'breaking',
          author: '',
          tags: '',
          sources: '',
          content: '',
          date: new Date().toISOString().split('T')[0],
        });
        fetchArticles(); // Refresh article list
      } else {
        setMessage({ error: `✗ 發布失敗: ${result.error}`, type: 'error' } as any);
      }
    } catch (error) {
      setMessage({ type: 'error', text: `✗ 發生錯誤: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleDeleteArticle = async (slug: string) => {
    if (!confirm(`確定要刪除文章 '${slug}' 嗎？`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/commit', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `✓ 文章 '${slug}' 刪除成功！` });
        fetchArticles(); // Refresh article list
      } else {
        setMessage({ type: 'error', text: `✗ 刪除失敗: ${result.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `✗ 發生錯誤: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (!loggedIn) {
    return (
      <div className="admin-login-page">
        <div className="login-container glass-panel glow-border">
          <h1 className="text-glow">管理員登入</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="輸入管理員密碼"
              className="w-full px-4 py-2 bg-white/10 border border-cyan-400/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 mb-4"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-cyan-400/20 border border-cyan-400 rounded text-cyan-400 font-bold hover:bg-cyan-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              登入
            </button>
          </form>
          {message && (
            <p className={`mt-4 text-center ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <h1 className="text-glow">管理後台</h1>
        {message && (
          <div className={`admin-message ${message.type === 'success' ? 'success' : 'error'}`}>
            {message.text}
          </div>
        )}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${tab === 'add' ? 'active' : ''}`}
            onClick={() => setTab('add')}
          >
            + 新增文章
          </button>
          <button
            className={`tab-btn ${tab === 'manage' ? 'active' : ''}`}
            onClick={() => setTab('manage')}
          >
            📋 管理文章 ({articles.length})
          </button>
        </div>

        {tab === 'add' && (
          <div className="admin-panel glass-panel glow-border">
            <form onSubmit={handleAddArticle} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-cyan-400">
                  文章標題 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 bg-white/10 border border-cyan-400/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  placeholder="輸入文章標題"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-cyan-400">
                    分類 *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 bg-white/10 border border-cyan-400/30 rounded text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="breaking">即時快訊</option>
                    <option value="deep-dive">深度報導</option>
                    <option value="opinion-expansion">社論 - 擴張派</option>
                    <option value="opinion-stability">社論 - 穩定派</option>
                    <option value="galactic-review">銀河銳評</option>
                    <option value="cycle-report">循環郵報</option>
                    <option value="cold-eye">冷眼</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-cyan-400">
                    作者 *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-cyan-400/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                    placeholder="作者名稱"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-cyan-400">
                  發布日期
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-white/10 border border-cyan-400/30 rounded text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-cyan-400">
                  標籤 (逗號分隔)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-white/10 border border-cyan-400/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  placeholder="標籤1, 標籤2, 標籤3"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-cyan-400">
                  資料來源 (逗號分隔)
                </label>
                <input
                  type="text"
                  name="sources"
                  value={formData.sources}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-white/10 border border-cyan-400/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  placeholder="來源1, 來源2"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-cyan-400">
                  內容 (Markdown) *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleFormChange}
                  required
                  rows={12}
                  className="w-full px-4 py-2 bg-white/10 border border-cyan-400/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                  placeholder="輸入文章內容（支援 Markdown 格式）"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-cyan-400/20 border border-cyan-400 rounded text-cyan-400 font-bold hover:bg-cyan-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '發佈中...' : '發佈文章'}
              </button>
            </form>
          </div>
        )}

        {tab === 'manage' && (
          <div className="admin-panel glass-panel glow-border">
            {articles.length === 0 ? (
              <p className="text-gray-400 text-center">暫無文章</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {articles.map(article => (
                  <div key={article.slug} className="glass-panel glow-border p-4 flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-bold">{article.title}</h4>
                      <p className="text-sm text-gray-400">{article.date} | {article.author} | {article.category}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteArticle(article.slug)}
                      disabled={loading}
                      className="px-3 py-2 bg-red-600/20 border border-red-600 rounded text-red-400 hover:bg-red-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      刪除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

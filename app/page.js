'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import AddToolModal from '@/components/AddToolModal';

export default function Home() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ show: false, tool: null });
  const snackbarTimeoutRef = useRef(null);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTools(data || []);
      setErrorMsg(null);
    } catch (error) {
      console.warn('Error fetching tools:', error);
      if (error.code === 'PGRST205') {
        setErrorMsg("Connected to Supabase! But the 'tools' table is missing. Please run the SQL script in your Supabase SQL Editor!");
      } else {
        setErrorMsg("Could not connect to database. Have you configured your Supabase credentials in .env.local?");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTool = (newTool) => {
    setTools(prev => [newTool, ...prev]);
  };

  const handleUpdateTool = (updatedTool) => {
    setTools(prev => prev.map(t => t.id === updatedTool.id ? updatedTool : t));
  };

  const handleDeleteTool = async (id, e) => {
    e.stopPropagation(); // prevent modal from opening
    
    // Find tool before deleting
    const toolToDelete = tools.find(t => t.id === id);
    if (!toolToDelete) return;

    // Optimistic UI update
    setTools(prev => prev.filter(t => t.id !== id));

    try {
      const { error } = await supabase.from('tools').delete().eq('id', id);
      if (error) throw error;
      
      setSnackbar({ show: true, tool: toolToDelete });
      if (snackbarTimeoutRef.current) clearTimeout(snackbarTimeoutRef.current);
      
      snackbarTimeoutRef.current = setTimeout(() => {
        setSnackbar({ show: false, tool: null });
      }, 5000);
    } catch (err) {
      console.error('Failed to delete tool:', err);
      // Revert optimistic update
      setTools(prev => [toolToDelete, ...prev].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
      alert('Failed to delete this tool.');
    }
  };

  const handleUndoDelete = async () => {
    const { tool } = snackbar;
    if (!tool) return;
    
    if (snackbarTimeoutRef.current) clearTimeout(snackbarTimeoutRef.current);
    setSnackbar({ show: false, tool: null });

    // Optimistically add back
    setTools(prev => [tool, ...prev].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

    try {
      // Re-insert exactly as it was
      const { error } = await supabase.from('tools').insert([tool]);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to undo delete:', err);
      // Revert optimistic add
      setTools(prev => prev.filter(t => t.id !== tool.id));
      alert('Failed to restore tool.');
    }
  };

  const openAddModal = () => {
    setEditingTool(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tool) => {
    setEditingTool(tool);
    setIsModalOpen(true);
  };

  const filteredTools = tools.filter(tool => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    return (
      (tool.name && tool.name.toLowerCase().includes(q)) ||
      (tool.description && tool.description.toLowerCase().includes(q)) ||
      (tool.revenue && tool.revenue.toLowerCase().includes(q)) ||
      (tool.category && tool.category.toLowerCase().includes(q)) ||
      (tool.audience && tool.audience.toLowerCase().includes(q))
    );
  });

  return (
    <div className="container">
      <header className="header">
        <h1>AI Tool Tracker</h1>
        <p>Your personal directory of awesome AI tools & companies.</p>
      </header>

      {errorMsg ? (
        <div className="empty-state" style={{ borderColor: 'var(--success)', color: 'var(--foreground)' }}>
          <h3>⚠️ Configuration Needed</h3>
          <p>{errorMsg}</p>
        </div>
      ) : loading ? (
        <div className="empty-state">Loading tools...</div>
      ) : tools.length === 0 ? (
        <div className="empty-state">
          <p>No tools added yet. Click the + button to add your first one!</p>
        </div>
      ) : (
        <>
          <div className="filters-container">
            <input 
              type="text" 
              className="filter-input" 
              placeholder="Search tools, categories, tech stacks, or descriptions..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>What it does</th>
                  <th className="hide-on-mobile">ARR / MRR</th>
                  <th>Category</th>
                  <th className="hide-on-mobile">Audience</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {filteredTools.length > 0 ? filteredTools.map(tool => (
                  <tr key={tool.id} onClick={() => openEditModal(tool)}>
                    <td className="font-medium">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button className="delete-btn" title="Delete tool" onClick={e => handleDeleteTool(tool.id, e)} style={{ opacity: 0.8, filter: 'grayscale(100%)', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.filter='none'; e.currentTarget.style.opacity='1'}} onMouseOut={e => {e.currentTarget.style.filter='grayscale(100%)'; e.currentTarget.style.opacity='0.8'}}>
                          🗑️
                        </button>
                        <span 
                          title={`Built in 7 days: ${tool.built_in_7_days === 'Yes' || tool.built_in_7_days === 'yes' ? 'Yes' : 'No'}`}
                          style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: tool.built_in_7_days === 'Yes' || tool.built_in_7_days === 'yes' ? 'var(--success)' : '#ffffff',
                            boxShadow: tool.built_in_7_days === 'Yes' || tool.built_in_7_days === 'yes' ? '0 0 8px var(--success)' : '0 0 6px rgba(255,255,255,0.4)',
                            flexShrink: 0
                          }} 
                        />
                        <span>{tool.name}</span>
                      </div>
                    </td>
                    <td className="desc-cell">{tool.description}</td>
                    <td className="hide-on-mobile">{tool.revenue ? <span className="badge">💰 {tool.revenue}</span> : <span className="text-muted">-</span>}</td>
                    <td className="text-muted">{tool.category || '-'}</td>
                    <td className="text-muted hide-on-mobile">{tool.audience || '-'}</td>
                    <td>
                      <a href={tool.link} target="_blank" rel="noopener noreferrer" className="table-link" onClick={e => e.stopPropagation()}>
                        Visit
                      </a>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No tools match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <button 
        className="fab" 
        onClick={openAddModal}
        aria-label="Add new tool"
      >
        +
      </button>

      <AddToolModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddTool} 
        onUpdate={handleUpdateTool}
        initialData={editingTool}
      />

      {/* Snackbar */}
      {snackbar.show && (
        <div className="snackbar" onClick={e => e.stopPropagation()}>
          <span>Tool deleted.</span>
          <button className="snackbar-undo" onClick={handleUndoDelete}>Undo</button>
        </div>
      )}
    </div>
  );
}

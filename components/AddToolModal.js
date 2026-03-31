'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const defaultForm = {
  name: '',
  description: '',
  revenue: '',
  category: '',
  audience: '',
  built_in_7_days: 'No',
  link: ''
};

export default function AddToolModal({ isOpen, onClose, onAdd, onUpdate, initialData }) {
  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData(defaultForm);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData && initialData.id) {
        // Update existing record
        const { data, error } = await supabase
          .from('tools')
          .update(formData)
          .eq('id', initialData.id)
          .select();

        if (error) throw error;
        onUpdate(data[0]);
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('tools')
          .insert([formData])
          .select();

        if (error) throw error;
        onAdd(data[0]);
      }
      
      onClose();
    } catch (error) {
      console.warn('Error saving data:', error);
      alert('Failed to save tool. Ensure Supabase is configured correctly in .env.local.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{initialData ? 'Edit Tool' : 'Add New Tool'}</h2>
          <button type="button" className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Name *</label>
            <input type="text" id="name" name="name" className="form-input" required value={formData.name} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">What it does *</label>
            <textarea id="description" name="description" className="form-textarea" required value={formData.description} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="revenue">ARR / MRR</label>
            <input type="text" id="revenue" name="revenue" className="form-input" value={formData.revenue} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">Category</label>
            <input type="text" id="category" name="category" className="form-input" placeholder="e.g. Productivity, Design" value={formData.category || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="audience">Audience</label>
            <input type="text" id="audience" name="audience" className="form-input" placeholder="e.g. Developers, Marketers" value={formData.audience || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Build in 7 days</label>
            <div className="button-group">
              <button 
                type="button" 
                className={`choice-btn ${formData.built_in_7_days === 'Yes' || formData.built_in_7_days === 'yes' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, built_in_7_days: 'Yes' }))}
              >
                Yes
              </button>
              <button 
                type="button" 
                className={`choice-btn ${formData.built_in_7_days === 'No' || formData.built_in_7_days === 'no' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, built_in_7_days: 'No' }))}
              >
                No
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="link">Link *</label>
            <input type="url" id="link" name="link" className="form-input" required value={formData.link} onChange={handleChange} />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Saving...' : (initialData ? 'Update Tool' : 'Add Tool')}
          </button>
        </form>
      </div>
    </div>
  );
}

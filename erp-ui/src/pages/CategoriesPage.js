// src/pages/CategoriesPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/categoriesService';
import { FiTag, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import '../styles/CategoriesPage.css';

export default function CategoriesPage({ token }) {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Memoized data loader
  const loadCategories = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const data = await getCategories(token);
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const resetForm = () => {
    setCategoryName('');
    setEditingId(null);
  };

  const validateForm = () => {
    if (!categoryName.trim()) {
      setError('Category name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setError('');
      if (editingId) {
        await updateCategory(editingId, { category: categoryName.trim() }, token);
      } else {
        await createCategory({ category: categoryName.trim() }, token);
      }
      resetForm();
      await loadCategories();
    } catch (err) {
      setError(err.message || (editingId ? 'Update failed' : 'Creation failed'));
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setCategoryName(cat.category);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      setError('');
      await deleteCategory(id, token);
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="categories-page" aria-busy="true">
        <div className="loading-spinner">Loading categories…</div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <h2 className="page-title">Categories</h2>
        <p className="page-subtitle">Manage product categories</p>
      </div>

      {/* Form card */}
      <div className="form-card">
        <h3 className="form-title">
          {editingId ? 'Edit Category' : 'Add New Category'}
        </h3>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="categoryName" className="input-label">
                Category Name <span aria-hidden="true">*</span>
              </label>
              <div className="input-wrapper">
                <FiTag className="input-icon" aria-hidden="true" />
                <input
                  type="text"
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Olive Oil, Balsamic Vinegar"
                  className="input-field"
                  required
                  aria-required="true"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              aria-label={editingId ? 'Update category' : 'Add category'}
            >
              {editingId ? <FiEdit2 aria-hidden="true" /> : <FiPlus aria-hidden="true" />}
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
                aria-label="Cancel editing"
              >
                <FiX aria-hidden="true" /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Categories table */}
      <div className="table-container">
        <h3 className="table-title">Categories List</h3>
        <table className="categories-table">
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Created At</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map(({ _id, category, createdAt }) => (
                <tr key={_id}>
                  <td>{category}</td>
                  <td>{new Date(createdAt).toLocaleString()}</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleEdit({ _id, category })}
                      className="icon-btn edit-btn"
                      title="Edit category"
                      aria-label={`Edit category ${category}`}
                    >
                      <FiEdit2 aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDelete(_id)}
                      className="icon-btn delete-btn"
                      title="Delete category"
                      aria-label={`Delete category ${category}`}
                    >
                      <FiTrash2 aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="empty-message">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
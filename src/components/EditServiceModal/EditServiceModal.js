import React, { useState } from 'react';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';
import './EditServiceModal.css';

const EditServiceModal = ({ service, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    serviceName: service.serviceName || '',
    category: service.category || '',
    price: service.price || '',
    description: service.description || '',
    imageURL: service.imageURL || '',
    providerName: service.providerName || '',
    providerEmail: service.providerEmail || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.patch(`/services/${service._id}`, formData);
      toast.success('Service updated successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FiX />
        </button>

        <h2>Edit Service</h2>

        <form onSubmit={handleSubmit} className="service-form">
          <div className="form-group">
            <label htmlFor="serviceName">Service Name</label>
            <input
              type="text"
              id="serviceName"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageURL">Image URL</label>
            <input
              type="url"
              id="imageURL"
              name="imageURL"
              value={formData.imageURL}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="providerName">Provider Name</label>
            <input
              type="text"
              id="providerName"
              name="providerName"
              value={formData.providerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="providerEmail">Provider Email</label>
            <input
              type="email"
              id="providerEmail"
              name="providerEmail"
              value={formData.providerEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceModal;


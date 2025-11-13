import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import './AddService.css';

const AddService = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serviceName: '',
    category: '',
    price: '',
    description: '',
    imageURL: '',
    providerName: user?.displayName || '',
    providerEmail: user?.email || ''
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
      await api.post('/services', formData);
      toast.success('Service added successfully!');
      navigate('/my-services');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-service-page">
      <div className="container">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="page-title"
        >
          Add New Service
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="add-service-card"
        >
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
                placeholder="Enter service name"
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
                placeholder="e.g., Plumbing, Electrical, Cleaning"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (৳ BDT)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="1"
                placeholder="Enter price in BDT (e.g., 2000)"
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
                rows="6"
                placeholder="Describe your service in detail"
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
                placeholder="https://example.com/image.jpg"
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
                placeholder="Your name"
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
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Adding Service...' : 'Add Service'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddService;


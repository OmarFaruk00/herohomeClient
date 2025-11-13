import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../config/api';
import Loading from '../../components/Loading/Loading';
import toast from 'react-hot-toast';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Initial load
  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search - only fetch after user stops typing for 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() || minPrice || maxPrice) {
        fetchServices();
      } else if (!searchQuery && !minPrice && !maxPrice) {
        // If all filters are cleared, fetch all services
        fetchServices();
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, minPrice, maxPrice]);

  const fetchServices = async () => {
    setIsSearching(true);
    try {
      const params = {};
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      
      const response = await api.get('/services', { params });
      console.log('Services fetched:', response.data.length);
      setServices(response.data || []);
      
      // Only show error if we got an error response, not if we got empty array
      if (response.data && response.data.length === 0 && !minPrice && !maxPrice && !searchQuery.trim()) {
        // Empty array is valid - might mean no services or DB not connected
        // Don't show error for empty array
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Only show error if it's a network error or 5xx error
      // Don't show error for 4xx (client errors) or empty responses
      if (!error.response || error.response.status >= 500) {
        toast.error('Failed to load services. Please check if backend server is running.');
      }
      setServices([]);
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchServices();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by useEffect with debouncing, but we can trigger it immediately
    fetchServices();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Don't fetch here - let the debounced useEffect handle it
  };

  const clearFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    // Fetch will be triggered by useEffect when values change
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="services-page">
      <div className="container">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="page-title"
        >
          All Services
        </motion.h1>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="filter-section"
        >
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-group">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by service name, category, or description..."
                className="search-input"
              />
              <button type="submit" className="btn btn-primary" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Price Filter */}
          <form onSubmit={handleFilter} className="filter-form">
            <div className="filter-group">
              <label>Min Price</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                min="0"
              />
            </div>
            <div className="filter-group">
              <label>Max Price</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                min="0"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSearching}>
              {isSearching ? 'Filtering...' : 'Filter'}
            </button>
            {(minPrice || maxPrice || searchQuery) && (
              <button type="button" onClick={clearFilter} className="btn btn-secondary">
                Clear All
              </button>
            )}
          </form>
        </motion.div>

        {/* Services Grid */}
        {isSearching ? (
          <div className="loading-services">
            <div className="spinner-small"></div>
            <p>Searching services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="no-services">
            <p>No services found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="services-grid">
            {services.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="service-card"
              >
                <img src={service.imageURL || 'https://via.placeholder.com/300'} alt={service.serviceName} />
                <div className="service-card-content">
                  <h3>{service.serviceName}</h3>
                  <p className="service-category">{service.category}</p>
                  <p className="service-description">
                    {service.description?.substring(0, 120)}...
                  </p>
                  <div className="service-footer">
                    <span className="service-price">৳{service.price}</span>
                    <Link to={`/services/${service._id}`} className="btn btn-primary btn-sm">
                      Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;


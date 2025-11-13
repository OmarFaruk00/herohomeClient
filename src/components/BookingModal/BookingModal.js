import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';
import './BookingModal.css';

const BookingModal = ({ service, onClose, onSuccess }) => {
  const { user, loading: authLoading } = useAuth();
  const [bookingDate, setBookingDate] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is not available, close modal and show error
  if (!authLoading && !user) {
    onClose();
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !user.email) {
      toast.error('You must be logged in to book a service');
      onClose();
      return;
    }
    
    if (!bookingDate) {
      toast.error('Please select a booking date');
      return;
    }

    setLoading(true);

    try {
      // Refresh token before making the booking request
      let token = localStorage.getItem('firebaseToken');
      if (user && typeof user.getIdToken === 'function') {
        try {
          token = await user.getIdToken(true); // Force refresh
          localStorage.setItem('firebaseToken', token);
        } catch (tokenError) {
          console.error('Error refreshing token:', tokenError);
        }
      }

      await api.post('/bookings', {
        userEmail: user.email,
        serviceId: service._id,
        bookingDate,
        price: service.price
      });
      toast.success('Booking successful!');
      onSuccess();
    } catch (error) {
      console.error('Booking error:', error);
      console.error('Error response:', error.response);
      
      // Handle different error types - NEVER redirect from booking modal
      if (error.response?.status === 401 || error.response?.status === 403) {
        const errorMessage = error.response?.data?.error || 'Authentication failed';
        
        // Check if it's a booking-specific error
        if (errorMessage.includes('book') || 
            errorMessage.includes('service') || 
            errorMessage.includes('cannot book') ||
            errorMessage.includes('own service')) {
          toast.error(errorMessage);
        } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('token')) {
          // It's an auth error, but don't redirect - just show error
          toast.error('Authentication failed. Please refresh the page and try again.');
        } else {
          toast.error(errorMessage || 'Booking failed. Please try again.');
        }
        // DO NOT redirect - let user stay on the page
      } else if (error.response?.status === 404) {
        toast.error('Service not found. Please try again.');
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Booking failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FiX />
        </button>

        <h2>Book Service</h2>

        <div className="service-summary">
          <h3>{service.serviceName}</h3>
          <p className="service-category">{service.category}</p>
          <p className="service-price">Price: ৳{service.price}</p>
          <p className="service-provider">Provider: {service.providerName}</p>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="userEmail">Your Email</label>
            <input
              type="email"
              id="userEmail"
              value={user.email}
              readOnly
              className="read-only"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bookingDate">Booking Date</label>
            <input
              type="date"
              id="bookingDate"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={today}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Total Price</label>
            <input
              type="text"
              id="price"
              value={`৳${service.price}`}
              readOnly
              className="read-only"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;


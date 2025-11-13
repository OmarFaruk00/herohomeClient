import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import Loading from '../../components/Loading/Loading';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiTrash2, FiStar } from 'react-icons/fi';
import RatingModal from '../../components/RatingModal/RatingModal';
import './MyBookings.css';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingService, setRatingService] = useState(null);

  const fetchBookings = async () => {
    try {
      const response = await api.get(`/bookings/${user.email}`);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCancel = async (bookingId) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span>Are you sure you want to cancel this booking?</span>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              cancelBooking(bookingId);
            }}
            style={{
              padding: '5px 15px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cancel Booking
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: '5px 15px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Keep Booking
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      icon: '⚠️'
    });
  };

  const cancelBooking = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleRate = (booking) => {
    setRatingService(booking.service);
  };

  const handleRatingSuccess = () => {
    setRatingService(null);
    fetchBookings();
  };

  const hasRated = (serviceId) => {
    // Check if user has already rated this service
    // This would need to be implemented based on your review structure
    return false;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="my-bookings-page">
      <div className="container">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="page-title"
        >
          My Bookings
        </motion.h1>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>You haven't made any bookings yet.</p>
          </div>
        ) : (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Provider</th>
                  <th>Booking Date</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <motion.tr
                    key={booking._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                  >
                    <td>
                      <div className="service-info">
                        {booking.service?.imageURL && (
                          <img
                            src={booking.service.imageURL}
                            alt={booking.service.serviceName}
                            className="service-thumbnail"
                          />
                        )}
                        <div>
                          <strong>{booking.service?.serviceName || 'N/A'}</strong>
                          <p className="service-category">{booking.service?.category || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td>{booking.service?.providerName || 'N/A'}</td>
                    <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                    <td>৳{booking.price}</td>
                    <td>
                      <div className="action-buttons">
                        {booking.service && !hasRated(booking.service._id) && (
                          <button
                            onClick={() => handleRate(booking)}
                            className="btn-icon btn-rate"
                            title="Rate Service"
                          >
                            <FiStar />
                          </button>
                        )}
                        <button
                          onClick={() => handleCancel(booking._id)}
                          className="btn-icon btn-delete"
                          title="Cancel Booking"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {ratingService && (
        <RatingModal
          service={ratingService}
          onClose={() => setRatingService(null)}
          onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
};

export default MyBookings;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import Loading from '../../components/Loading/Loading';
import BookingModal from '../../components/BookingModal/BookingModal';
import toast from 'react-hot-toast';
import { FaStar, FaUser, FaEnvelope, FaDollarSign } from 'react-icons/fa';
import './ServiceDetails.css';

const ServiceDetails = () => {
  const { _id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchService();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_id]);

  const fetchService = async () => {
    try {
      const response = await api.get(`/services/${_id}`);
      setService(response.data);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Service not found');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (!service?.reviews || service.reviews.length === 0) return 0;
    const sum = service.reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / service.reviews.length).toFixed(1);
  };

  const canBook = user && user.email !== service?.providerEmail;

  // Wait for auth to finish loading before checking user
  if (loading || authLoading) {
    return <Loading />;
  }

  if (!service) {
    return null;
  }

  return (
    <div className="service-details-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="service-details"
        >
          <div className="service-details-image">
            <img src={service.imageURL || 'https://via.placeholder.com/600'} alt={service.serviceName} />
          </div>

          <div className="service-details-content">
            <h1>{service.serviceName}</h1>
            <p className="service-category">{service.category}</p>

            <div className="service-info-grid">
              <div className="info-item">
                <FaDollarSign />
                <div>
                  <span className="info-label">Price</span>
                  <span className="info-value">৳{service.price}</span>
                </div>
              </div>
              <div className="info-item">
                <FaUser />
                <div>
                  <span className="info-label">Provider</span>
                  <span className="info-value">{service.providerName}</span>
                </div>
              </div>
              <div className="info-item">
                <FaEnvelope />
                <div>
                  <span className="info-label">Email</span>
                  <span className="info-value">{service.providerEmail}</span>
                </div>
              </div>
              {service.reviews && service.reviews.length > 0 && (
                <div className="info-item">
                  <FaStar />
                  <div>
                    <span className="info-label">Rating</span>
                    <span className="info-value">{calculateAverageRating()} / 5.0</span>
                  </div>
                </div>
              )}
            </div>

            <div className="service-description-section">
              <h2>Description</h2>
              <p>{service.description}</p>
            </div>

            <div className="service-actions">
              {!user ? (
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-primary"
                >
                  Login to Book
                </button>
              ) : !canBook ? (
                <button
                  className="btn btn-secondary"
                  disabled
                  onClick={() => toast.error('You cannot book your own service')}
                >
                  Cannot Book Own Service
                </button>
              ) : (
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="btn btn-primary"
                >
                  Book Now
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Reviews Section */}
        {service.reviews && service.reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="reviews-section"
          >
            <h2>Reviews ({service.reviews.length})</h2>
            <div className="reviews-list">
              {service.reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < review.rating ? 'star-filled' : 'star-empty'}
                        />
                      ))}
                    </div>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && <p className="review-comment">{review.comment}</p>}
                  <p className="review-author">- {review.userEmail}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {showBookingModal && (
        <BookingModal
          service={service}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            fetchService();
          }}
        />
      )}
    </div>
  );
};

export default ServiceDetails;


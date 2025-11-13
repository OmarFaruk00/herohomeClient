import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import api from '../../config/api';
import Loading from '../../components/Loading/Loading';
import { FaStar, FaCheckCircle, FaUsers, FaAward } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const [services, setServices] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    fetchTopRated();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      console.log('Home services fetched:', response.data.length);
      setServices(response.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching services:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopRated = async () => {
    try {
      const response = await api.get('/services/top-rated');
      setTopRated(response.data);
    } catch (error) {
      console.error('Error fetching top rated:', error);
    }
  };

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
      headline: 'Professional Home Services',
      details: 'Connect with trusted service providers for all your home needs'
    },
    {
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200',
      headline: 'Quality Guaranteed',
      details: 'Every service provider is verified and rated by our community'
    },
    {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
      headline: 'Book Anytime, Anywhere',
      details: 'Schedule services at your convenience with our easy booking system'
    }
  ];

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="hero-slide" style={{ backgroundImage: `url(${slide.image})` }}>
                <div className="hero-overlay">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="hero-content"
                  >
                    <h1>{slide.headline}</h1>
                    <p>{slide.details}</p>
                    <Link to="/services" className="btn btn-primary">
                      Explore Services
                    </Link>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Services Section */}
      <section className="section services-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-title"
          >
            Our Services
          </motion.h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="service-card"
              >
                <img src={service.imageURL || 'https://via.placeholder.com/300'} alt={service.serviceName} />
                <div className="service-card-content">
                  <h3>{service.serviceName}</h3>
                  <p className="service-category">{service.category}</p>
                  <p className="service-description">{service.description?.substring(0, 100)}...</p>
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
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
            style={{ marginTop: '2rem' }}
          >
            <Link to="/services" className="btn btn-primary">
              View All Services
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Top Rated Services */}
      {topRated.length > 0 && (
        <section className="section top-rated-section">
          <div className="container">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="section-title"
            >
              Top Rated Services
            </motion.h2>
            <div className="services-grid">
              {topRated.map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="service-card featured"
                >
                  <div className="rating-badge">
                    <FaStar /> {calculateAverageRating(service.reviews)}
                  </div>
                  <img src={service.imageURL || 'https://via.placeholder.com/300'} alt={service.serviceName} />
                  <div className="service-card-content">
                    <h3>{service.serviceName}</h3>
                    <p className="service-category">{service.category}</p>
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
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="section why-choose-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-title"
          >
            Why Choose Us
          </motion.h2>
          <div className="features-grid">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="feature-card"
            >
              <FaCheckCircle className="feature-icon" />
              <h3>Verified Providers</h3>
              <p>All service providers are verified and background checked for your peace of mind.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="feature-card"
            >
              <FaUsers className="feature-icon" />
              <h3>Community Rated</h3>
              <p>Real reviews and ratings from customers help you make the best choice.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="feature-card"
            >
              <FaAward className="feature-icon" />
              <h3>Quality Guaranteed</h3>
              <p>We ensure high-quality service delivery with our satisfaction guarantee.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="section testimonials-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-title"
          >
            What Our Customers Say
          </motion.h2>
          <div className="testimonials-grid">
            {[
              {
                name: 'Sarah Johnson',
                rating: 5,
                text: 'Excellent service! The provider was professional and completed the job perfectly.'
              },
              {
                name: 'Michael Chen',
                rating: 5,
                text: 'Quick response time and great quality. Highly recommend this platform!'
              },
              {
                name: 'Emily Davis',
                rating: 5,
                text: 'Easy to use and reliable. Found exactly what I needed in minutes.'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="testimonial-card"
              >
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <p className="testimonial-author">- {testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


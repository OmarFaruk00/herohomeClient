import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import Loading from '../../components/Loading/Loading';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import EditServiceModal from '../../components/EditServiceModal/EditServiceModal';
import './MyServices.css';

const MyServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    if (user) {
      fetchServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchServices = async () => {
    try {
      const response = await api.get(`/services/provider/${user.email}`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span>Are you sure you want to delete this service?</span>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              deleteService(serviceId);
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
            Delete
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
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      icon: '⚠️'
    });
  };

  const deleteService = async (serviceId) => {
    try {
      await api.delete(`/services/${serviceId}`);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
  };

  const handleUpdateSuccess = () => {
    setEditingService(null);
    fetchServices();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="my-services-page">
      <div className="container">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="page-title"
        >
          My Services
        </motion.h1>

        {services.length === 0 ? (
          <div className="no-services">
            <p>You haven't added any services yet.</p>
          </div>
        ) : (
          <div className="services-table-container">
            <table className="services-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Service Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => (
                  <motion.tr
                    key={service._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                  >
                    <td>
                      <img
                        src={service.imageURL || 'https://via.placeholder.com/100'}
                        alt={service.serviceName}
                        className="service-thumbnail"
                      />
                    </td>
                    <td>{service.serviceName}</td>
                    <td>{service.category}</td>
                    <td>৳{service.price}</td>
                    <td className="description-cell">
                      {service.description?.substring(0, 100)}...
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(service)}
                          className="btn-icon btn-edit"
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="btn-icon btn-delete"
                          title="Delete"
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

      {editingService && (
        <EditServiceModal
          service={editingService}
          onClose={() => setEditingService(null)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default MyServices;


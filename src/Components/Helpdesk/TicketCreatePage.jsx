import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TicketForm from './TicketForm';

const TicketCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const contractData = location.state; // Get data from Contract

  const handleSubmit = (ticketData) => {
    // Here you would typically send the data to your API
    console.log('Creating new ticket:', ticketData);
    
    // After successful creation, navigate back to helpdesk
    navigate('/helpdesk');
  };

  const handleClose = () => {
    navigate('/helpdesk');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TicketForm
        isOpen={true}
        onClose={handleClose}
        ticket={null}
        onSubmit={handleSubmit}
        prefilledData={contractData} // Pass contract data to TicketForm
      />
    </div>
  );
};

export default TicketCreatePage;

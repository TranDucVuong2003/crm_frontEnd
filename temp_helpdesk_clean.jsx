  // ==================== STATES ====================
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketDetailModalOpen, setIsTicketDetailModalOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [modalPriority, setModalPriority] = useState('all');

  // ==================== API CALLS ====================
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await getAllTickets();
        
        // Handle different API response structures
        const ticketsData = Array.isArray(response.data?.data) 
          ? response.data.data 
          : Array.isArray(response.data) 
          ? response.data 
          : [];

        setTickets(ticketsData);
        
      } catch (error) {
        console.error('Error fetching tickets:', error);
        // Fallback to empty array if API fails
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);
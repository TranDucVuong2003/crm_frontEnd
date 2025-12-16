import React, { useState, useEffect } from "react";
import {
  UsersIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  CalendarIcon,
  LifebuoyIcon as SupportIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
import {
  getAllCustomers,
  getAllQuotes,
  getAllContracts,
  getAllTickets,
  getAllSaleOrders,
} from "../Service/ApiService";
import { useAuth } from "../Context/AuthContext";

const StatCard = ({ title, value, change, icon: Icon, color }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
        {change !== 0 && (
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span
                className={`${
                  change >= 0 ? "text-green-600" : "text-red-600"
                } font-medium`}
              >
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-gray-500 ml-2">so với tháng trước</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalQuotes: 0,
    totalContracts: 0,
    totalTickets: 0,
    totalRevenue: 0,
    openTickets: 0,
  });

  const [recentQuotes, setRecentQuotes] = useState([]);
  const [recentContracts, setRecentContracts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chart data states
  const [salesPipelineData, setSalesPipelineData] = useState([]);
  const [ticketsTrendData, setTicketsTrendData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data
      const [customersRes, quotesRes, contractsRes, ticketsRes, saleOrdersRes] =
        await Promise.all([
          getAllCustomers(),
          getAllQuotes(),
          getAllContracts(),
          getAllTickets(),
          getAllSaleOrders(),
        ]);

      const customers = customersRes.data || [];
      const quotes = quotesRes.data || [];
      const contracts = contractsRes.data || [];
      let tickets = ticketsRes.data || [];
      const saleOrders = saleOrdersRes.data || [];

      // Filter tickets based on user role
      // Admin sees all tickets, User only sees tickets created by them or assigned to them
      const isAdmin = user?.role?.toLowerCase() === "admin";
      if (!isAdmin && user?.id) {
        tickets = tickets.filter(
          (ticket) =>
            ticket.createdBy?.id === user.id ||
            ticket.assignedTo?.id === user.id
        );
      }

      // Debug: Log tickets data to check status values
      console.log("Dashboard - Tickets data:", tickets);
      console.log(
        "Dashboard - Tickets statuses:",
        tickets.map((t) => t.status)
      );
      console.log("Dashboard - Contracts data:", contracts);
      console.log(
        "Dashboard - Contract details:",
        contracts.map((c) => ({
          id: c.id,
          status: c.status,
          paidAmount: c.paidAmount,
          totalAmount: c.totalAmount,
          saleOrderValue: c.saleOrder?.totalValue,
        }))
      );

      // Calculate stats - Tổng doanh thu = tổng paidAmount từ tất cả hợp đồng (bao gồm đặt cọc)
      // Nếu paidAmount = 0, tính từ totalAmount hoặc saleOrder.totalValue cho các hợp đồng đã thanh toán/đặt cọc
      const totalRevenue = contracts.reduce((sum, contract) => {
        let paid = parseFloat(contract.paidAmount) || 0;

        // Nếu paidAmount = 0 nhưng status cho thấy đã thanh toán, lấy từ totalAmount
        const status = (contract.status || "").toLowerCase();
        if (
          paid === 0 &&
          (status.includes("paid") ||
            status.includes("cọc") ||
            status.includes("deposit"))
        ) {
          // Lấy giá trị từ totalAmount hoặc saleOrder
          const total =
            parseFloat(contract.totalAmount) ||
            parseFloat(contract.saleOrder?.totalValue) ||
            0;
          if (status.includes("50%") || status.includes("cọc")) {
            paid = total * 0.5; // Đặt cọc 50%
          } else {
            paid = total; // Thanh toán full
          }
        }

        return sum + paid;
      }, 0);
      const openTickets = tickets.filter(
        (t) => t.status !== "closed" && t.status !== "resolved"
      ).length;

      setStats({
        totalCustomers: customers.length,
        totalQuotes: quotes.length,
        totalContracts: contracts.length,
        totalTickets: tickets.length,
        totalRevenue: totalRevenue,
        openTickets: openTickets,
      });

      // Get recent quotes (last 5)
      const sortedQuotes = [...quotes]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentQuotes(sortedQuotes);

      // Get recent contracts (last 5)
      const sortedContracts = [...contracts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentContracts(sortedContracts);

      // Calculate top customers by total quote amount
      const customerQuotes = {};
      quotes.forEach((quote) => {
        const customerId = quote.customerId;
        if (!customerQuotes[customerId]) {
          customerQuotes[customerId] = {
            customer: quote.customer,
            totalAmount: 0,
            quoteCount: 0,
          };
        }
        customerQuotes[customerId].totalAmount += parseFloat(quote.amount) || 0;
        customerQuotes[customerId].quoteCount += 1;
      });

      const topCustomersList = Object.values(customerQuotes)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5);
      setTopCustomers(topCustomersList);

      // Prepare Sales Pipeline Data (Funnel)
      // Count all items regardless of status to show actual data
      const leadsCount = saleOrders.length;
      const opportunitiesCount = saleOrders.filter(
        (order) =>
          order.status === "opportunity" ||
          order.status === "qualified" ||
          order.status === "Active" ||
          order.status === "Inactive"
      ).length;
      const quotesCount = quotes.length;
      const contractsCount = contracts.length;

      setSalesPipelineData([
        { stage: "Đơn hàng", count: leadsCount, fill: "#3b82f6" },
        { stage: "Cơ hội", count: opportunitiesCount, fill: "#8b5cf6" },
        { stage: "Báo giá", count: quotesCount, fill: "#ec4899" },
        { stage: "Hợp đồng", count: contractsCount, fill: "#10b981" },
      ]);

      // Prepare Tickets Trend Data (Last 7 days)
      // Show tickets by their current status, filtered by last update or creation date
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      const ticketsByDay = last7Days.map((date) => {
        const dateStr = date.toISOString().split("T")[0];

        // Filter tickets that were created OR updated on this date
        const dayTickets = tickets.filter((ticket) => {
          const createdDate = new Date(ticket.createdAt)
            .toISOString()
            .split("T")[0];
          const updatedDate = ticket.updatedAt
            ? new Date(ticket.updatedAt).toISOString().split("T")[0]
            : createdDate;
          return createdDate === dateStr || updatedDate === dateStr;
        });

        // Count tickets by actual status from API
        const statusLower = (status) => (status || "").toLowerCase();
        const open = dayTickets.filter(
          (t) =>
            statusLower(t.status) === "new" ||
            statusLower(t.status) === "open" ||
            statusLower(t.status) === "pending"
        ).length;
        const inProgress = dayTickets.filter(
          (t) =>
            statusLower(t.status) === "in_progress" ||
            statusLower(t.status) === "in-progress" ||
            statusLower(t.status) === "processing"
        ).length;
        const resolved = dayTickets.filter(
          (t) =>
            statusLower(t.status) === "resolved" ||
            statusLower(t.status) === "closed" ||
            statusLower(t.status) === "completed"
        ).length;

        return {
          date: date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          }),
          Mới: open,
          "Đang xử lý": inProgress,
          "Đã giải quyết": resolved,
        };
      });

      setTicketsTrendData(ticketsByDay);

      // Prepare Revenue Data (Last 6 months)
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return date;
      });

      const revenueByMonth = last6Months.map((date) => {
        const month = date.getMonth();
        const year = date.getFullYear();

        const monthQuotes = quotes.filter((quote) => {
          const quoteDate = new Date(quote.createdAt);
          return (
            quoteDate.getMonth() === month && quoteDate.getFullYear() === year
          );
        });

        const monthContracts = contracts.filter((contract) => {
          const contractDate = new Date(contract.createdAt);
          return (
            contractDate.getMonth() === month &&
            contractDate.getFullYear() === year
          );
        });

        const quotesRevenue = monthQuotes.reduce(
          (sum, q) => sum + (parseFloat(q.amount) || 0),
          0
        );
        const contractsRevenue = monthContracts.reduce(
          (sum, c) => sum + (parseFloat(c.totalAmount) || 0),
          0
        );

        return {
          month: date.toLocaleDateString("vi-VN", { month: "short" }),
          "Báo giá": quotesRevenue / 1000000, // Convert to millions
          "Hợp đồng": contractsRevenue / 1000000,
        };
      });

      setRevenueData(revenueByMonth);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Chart.js options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed.y} mục`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
    borderRadius: 8,
  };

  const areaChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          font: {
            size: 13,
            weight: "500",
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y} tickets`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
          stepSize: 1,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          font: {
            size: 13,
            weight: "500",
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(
              2
            )} triệu`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  // Prepare Chart.js data
  const salesPipelineChartData = {
    labels: salesPipelineData.map((d) => d.stage),
    datasets: [
      {
        label: "Số lượng",
        data: salesPipelineData.map((d) => d.count),
        backgroundColor: salesPipelineData.map((d) => d.fill),
        borderColor: salesPipelineData.map((d) => d.fill),
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: ["#2563eb", "#7c3aed", "#db2777", "#059669"],
      },
    ],
  };

  const ticketsTrendChartData = {
    labels: ticketsTrendData.map((d) => d.date),
    datasets: [
      {
        label: "Mới",
        data: ticketsTrendData.map((d) => d["Mới"]),
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        borderColor: "#ef4444",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#ef4444",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
      {
        label: "Đang xử lý",
        data: ticketsTrendData.map((d) => d["Đang xử lý"]),
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        borderColor: "#f59e0b",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#f59e0b",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
      {
        label: "Đã giải quyết",
        data: ticketsTrendData.map((d) => d["Đã giải quyết"]),
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderColor: "#10b981",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const revenueChartData = {
    labels: revenueData.map((d) => d.month),
    datasets: [
      {
        label: "Báo giá",
        data: revenueData.map((d) => d["Báo giá"]),
        borderColor: "#8b5cf6",
        backgroundColor: "#8b5cf6",
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#8b5cf6",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: "#7c3aed",
        pointHoverBorderColor: "#fff",
      },
      {
        label: "Hợp đồng",
        data: revenueData.map((d) => d["Hợp đồng"]),
        borderColor: "#10b981",
        backgroundColor: "#10b981",
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: "#059669",
        pointHoverBorderColor: "#fff",
      },
    ],
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-indigo-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Tổng khách hàng",
      value: stats.totalCustomers.toLocaleString(),
      change: 0,
      icon: UsersIcon,
      color: "text-blue-600",
    },
    {
      title: "Tổng doanh thu (Hợp đồng)",
      value: formatPrice(stats.totalRevenue),
      change: 0,
      icon: CurrencyDollarIcon,
      color: "text-green-600",
    },
    {
      title: "Báo giá",
      value: stats.totalQuotes.toLocaleString(),
      change: 0,
      icon: DocumentTextIcon,
      color: "text-purple-600",
    },
    {
      title: "Hợp đồng",
      value: stats.totalContracts.toLocaleString(),
      change: 0,
      icon: CheckCircleIcon,
      color: "text-indigo-600",
    },
    {
      title: "Ticket hỗ trợ",
      value: stats.totalTickets.toLocaleString(),
      change: 0,
      icon: SupportIcon,
      color: "text-red-600",
    },
    {
      title: "Ticket đang mở",
      value: stats.openTickets.toLocaleString(),
      change: 0,
      icon: SupportIcon,
      color: "text-orange-600",
    },
  ];

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {dashboardStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Pipeline Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quy trình bán hàng
          </h3>
          <div style={{ height: "300px" }}>
            <Bar data={salesPipelineChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Tickets Trend Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Xu hướng Tickets (7 ngày)
          </h3>
          <div style={{ height: "300px" }}>
            <Line data={ticketsTrendChartData} options={areaChartOptions} />
          </div>
        </div>
      </div>

      {/* Revenue Chart - Full Width */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Doanh thu 6 tháng gần đây (Triệu VNĐ)
        </h3>
        <div style={{ height: "300px" }}>
          <Line data={revenueChartData} options={lineChartOptions} />
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Quotes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Báo giá gần đây
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentQuotes.length > 0 ? (
                recentQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Báo giá #{quote.id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {quote.customer?.name ||
                          quote.customer?.companyName ||
                          "N/A"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getTimeAgo(quote.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        {formatPrice(quote.amount)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có báo giá nào
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Contracts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Hợp đồng gần đây
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentContracts.length > 0 ? (
                recentContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Hợp đồng #{contract.id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {contract.customer?.name ||
                          contract.customer?.companyName ||
                          "N/A"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getTimeAgo(contract.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          contract.status === "active"
                            ? "bg-green-100 text-green-800"
                            : contract.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {contract.status === "active"
                          ? "Đang hoạt động"
                          : contract.status === "pending"
                          ? "Chờ duyệt"
                          : contract.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có hợp đồng nào
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

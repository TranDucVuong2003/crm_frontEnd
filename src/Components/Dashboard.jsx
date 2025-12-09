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
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  getAllCustomers,
  getAllQuotes,
  getAllContracts,
  getAllTickets,
  getAllSaleOrders,
} from "../Service/ApiService";

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
      const tickets = ticketsRes.data || [];
      const saleOrders = saleOrdersRes.data || [];

      // Calculate stats
      const totalRevenue = quotes.reduce(
        (sum, quote) => sum + (parseFloat(quote.amount) || 0),
        0
      );
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
      const leadsCount = saleOrders.filter(
        (order) => order.status === "lead" || order.status === "new"
      ).length;
      const opportunitiesCount = saleOrders.filter(
        (order) =>
          order.status === "opportunity" || order.status === "qualified"
      ).length;
      const quotesCount = quotes.filter(
        (quote) => quote.status === "pending" || quote.status === "sent"
      ).length;
      const contractsCount = contracts.filter(
        (contract) =>
          contract.status === "active" || contract.status === "signed"
      ).length;

      setSalesPipelineData([
        { stage: "Leads", count: leadsCount, fill: "#3b82f6" },
        { stage: "Opportunities", count: opportunitiesCount, fill: "#8b5cf6" },
        { stage: "Quotes", count: quotesCount, fill: "#ec4899" },
        { stage: "Contracts", count: contractsCount, fill: "#10b981" },
      ]);

      // Prepare Tickets Trend Data (Last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      const ticketsByDay = last7Days.map((date) => {
        const dateStr = date.toISOString().split("T")[0];
        const dayTickets = tickets.filter((ticket) => {
          const ticketDate = new Date(ticket.createdAt)
            .toISOString()
            .split("T")[0];
          return ticketDate === dateStr;
        });

        const open = dayTickets.filter((t) => t.status === "open").length;
        const inProgress = dayTickets.filter(
          (t) => t.status === "in_progress" || t.status === "in-progress"
        ).length;
        const resolved = dayTickets.filter(
          (t) => t.status === "resolved" || t.status === "closed"
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
      title: "Tổng doanh thu (Quotes)",
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesPipelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="Số lượng">
                {salesPipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets Trend Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Xu hướng Tickets (7 ngày)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ticketsTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="Mới"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
              />
              <Area
                type="monotone"
                dataKey="Đang xử lý"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
              />
              <Area
                type="monotone"
                dataKey="Đã giải quyết"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Chart - Full Width */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Doanh thu 6 tháng gần đây (Triệu VNĐ)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toFixed(2)} triệu`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="Báo giá"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Hợp đồng"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
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

      {/* Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Top khách hàng theo doanh thu
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topCustomers.length > 0 ? (
                topCustomers.map((customerData, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-indigo-600">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {customerData.customer?.name ||
                            customerData.customer?.companyName ||
                            "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {customerData.quoteCount} báo giá
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        {formatPrice(customerData.totalAmount)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có dữ liệu
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Thống kê tổng quan
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-sm text-gray-700">Tổng báo giá</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {stats.totalQuotes}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-indigo-600 mr-3" />
                  <span className="text-sm text-gray-700">Tổng hợp đồng</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {stats.totalContracts}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm text-gray-700">Tổng khách hàng</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {stats.totalCustomers}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center">
                  <SupportIcon className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-sm text-gray-700">Ticket đang mở</span>
                </div>
                <span className="text-lg font-semibold text-red-600">
                  {stats.openTickets}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm text-gray-700">Tổng doanh thu</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {formatPrice(stats.totalRevenue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

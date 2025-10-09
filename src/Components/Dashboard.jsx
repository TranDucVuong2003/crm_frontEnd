import React from 'react';
import { 
  UsersIcon, 
  ArrowTrendingUpIcon as TrendingUpIcon, 
  CalendarIcon, 
  LifebuoyIcon as SupportIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

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
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            <span className={`${change >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-gray-500 ml-2">so với tháng trước</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentActivity = () => {
  const activities = [
    { id: 1, type: 'customer', message: 'Khách hàng mới: Công ty ABC đã đăng ký', time: '2 giờ trước', color: 'bg-green-500' },
    { id: 2, type: 'deal', message: 'Chốt deal thành công với Công ty XYZ', time: '4 giờ trước', color: 'bg-blue-500' },
    { id: 3, type: 'task', message: 'Hoàn thành task: Gọi điện cho khách hàng', time: '6 giờ trước', color: 'bg-yellow-500' },
    { id: 4, type: 'support', message: 'Ticket mới từ khách hàng DEF', time: '1 ngày trước', color: 'bg-red-500' }
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
      </div>
      <div className="p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== activities.length - 1 && (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full ${activity.color} flex items-center justify-center ring-8 ring-white`}>
                        <div className="h-2 w-2 bg-white rounded-full" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-900">{activity.message}</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const SalesChart = () => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Doanh số bán hàng</h3>
      </div>
      <div className="p-6">
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Biểu đồ doanh số sẽ hiển thị ở đây</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TopCustomers = () => {
  const customers = [
    { name: 'Công ty ABC', value: '500,000,000 VNĐ', growth: '+12%' },
    { name: 'Công ty XYZ', value: '350,000,000 VNĐ', growth: '+8%' },
    { name: 'Công ty DEF', value: '280,000,000 VNĐ', growth: '+5%' },
    { name: 'Công ty GHI', value: '220,000,000 VNĐ', growth: '-2%' }
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Top khách hàng</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {customers.map((customer, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-500">{customer.value}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                customer.growth.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {customer.growth}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const stats = [
    {
      title: 'Tổng khách hàng',
      value: '1,234',
      change: 12,
      icon: UsersIcon,
      color: 'text-blue-600'
    },
    {
      title: 'Doanh số tháng này',
      value: '2.5 tỷ VNĐ',
      change: 8.3,
      icon: CurrencyDollarIcon,
      color: 'text-green-600'
    },
    {
      title: 'Cơ hội bán hàng',
      value: '89',
      change: -2.1,
      icon: TrendingUpIcon,
      color: 'text-yellow-600'
    },
    {
      title: 'Ticket hỗ trợ',
      value: '24',
      change: 5.2,
      icon: SupportIcon,
      color: 'text-red-600'
    }
  ];

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <SalesChart />
        <RecentActivity />
      </div>

      {/* Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopCustomers />
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks cần hoàn thành</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded" />
              <span className="ml-3 text-sm text-gray-900">Gọi điện cho khách hàng ABC</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded" />
              <span className="ml-3 text-sm text-gray-900">Chuẩn bị báo giá cho XYZ</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded" />
              <span className="ml-3 text-sm text-gray-900">Họp team sales 2PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
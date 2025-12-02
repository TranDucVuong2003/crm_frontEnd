import React, { useState, useRef, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {
  getAllUsers,
  getAllCustomers,
  getAllTicketCategories,
  createTicket,
} from "../../Service/ApiService";
import { useAuth } from "../../Context/AuthContext";
import {
  PlusIcon,
  MagnifyingGlassIcon as SearchIcon,
  FunnelIcon as FilterIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  PaperClipIcon,
  ChevronDownIcon,
  XMarkIcon,
  EyeIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { showSuccess, showError } from "../../utils/sweetAlert";

const TicketForm = ({ ticket, onSubmit, prefilledData }) => {
  // Lấy thông tin user đang đăng nhập từ AuthContext
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: ticket?.title || prefilledData?.contractName || "",
    description:
      ticket?.description ||
      (prefilledData
        ? `Ticket liên quan đến hợp đồng: ${prefilledData.contractName}\nDịch vụ: ${prefilledData.serviceName}\nTrạng thái hợp đồng: ${prefilledData.contractStatus}`
        : ""),
    customer:
      ticket?.customer ||
      (prefilledData
        ? {
            id: prefilledData.customerId || "",
            name: prefilledData.customerName || "",
            email: prefilledData.customerEmail || "",
            phone: prefilledData.customerPhone || "",
          }
        : { id: "", name: "", email: "", phone: "" }),
    category: ticket?.category || "technical",
    assignedTo: ticket?.assignedTo || { id: "", name: "", email: "" },
    tags:
      ticket?.tags ||
      (prefilledData ? ["Hợp đồng", prefilledData.contractName] : []),
    status: ticket?.status || "new",
    stars: ticket?.stars || 1,
  });

  // Customer search states
  const [customerSearchTerm, setCustomerSearchTerm] = useState(
    prefilledData?.customerName || ""
  );
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isCustomerPopupOpen, setIsCustomerPopupOpen] = useState(false);
  const customerDropdownRef = useRef(null);
  const customerInputRef = useRef(null);

  // Data states
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // User/Assignee search states
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(ticket?.assignedTo || null);
  const userDropdownRef = useRef(null);
  const userInputRef = useRef(null);

  // Helper function to generate avatar from name
  const generateAvatar = (name) => {
    if (!name) return "U";
    const nameParts = name.trim().split(" ");
    if (nameParts.length >= 2) {
      return (
        nameParts[0][0] + nameParts[nameParts.length - 1][0]
      ).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [usersResponse, customersResponse, categoriesResponse] =
          await Promise.all([
            getAllUsers(),
            getAllCustomers(),
            getAllTicketCategories(),
          ]);

        // Process users data and add avatar
        const usersData = Array.isArray(usersResponse.data?.data)
          ? usersResponse.data.data.map((user) => ({
              ...user,
              avatar: generateAvatar(
                user.name || user.username || user.fullName
              ),
              // Normalize role, position, department to be strings for display
              roleDisplay: user.role?.name || user.role || "N/A",
              positionDisplay:
                user.position?.positionName || user.position || "",
              departmentDisplay: user.department?.name || user.department || "",
            }))
          : Array.isArray(usersResponse.data)
          ? usersResponse.data.map((user) => ({
              ...user,
              avatar: generateAvatar(
                user.name || user.username || user.fullName
              ),
              // Normalize role, position, department to be strings for display
              roleDisplay: user.role?.name || user.role || "N/A",
              positionDisplay:
                user.position?.positionName || user.position || "",
              departmentDisplay: user.department?.name || user.department || "",
            }))
          : [];

        // Handle different API response structures
        const customersData = Array.isArray(customersResponse.data?.data)
          ? customersResponse.data.data
          : Array.isArray(customersResponse.data)
          ? customersResponse.data
          : [];

        const categoriesData = Array.isArray(categoriesResponse.data?.data)
          ? categoriesResponse.data.data
          : Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : [];

        setUsers(usersData);
        setCustomers(customersData);
        setTicketCategories(categoriesData);

        console.log("Fetched data:", {
          users: usersData,
          customers: customersData,
          categories: categoriesData,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to static data if API fails
        setUsers([
          {
            id: 1,
            name: "Trần Thị B",
            email: "tranthib@company.com",
            role: "Support Agent",
            avatar: "TB",
          },
          {
            id: 2,
            name: "Phạm Văn D",
            email: "phamvand@company.com",
            role: "Senior Agent",
            avatar: "PD",
          },
          {
            id: 3,
            name: "Vũ Văn F",
            email: "vuvanf@company.com",
            role: "Technical Lead",
            avatar: "VF",
          },
        ]);
        setCustomers([
          {
            id: 1,
            name: "Nguyen Van A",
            email: "nguyenvana@email.com",
            phone: "0901234567",
            company: "ABC Corp",
          },
        ]);
        setTicketCategories([
          { id: 1, name: "Thanh toán" },
          { id: 2, name: "Tài khoản" },
          { id: 4, name: "Nâng cấp hệ thống" },
          { id: 5, name: "Báo cáo lỗi" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (event, editor) => {
    const data = editor.getData();
    setFormData((prev) => ({
      ...prev,
      description: data,
    }));
  };

  const handleCustomerChange = (e) => {
    const selectedCustomer = customers.find(
      (c) => c.id === parseInt(e.target.value)
    );
    setFormData((prev) => ({
      ...prev,
      customer: selectedCustomer || { id: "", name: "", email: "", phone: "" },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      showError("Vui lòng nhập tiêu đề ticket");
      return;
    }

    if (!formData.customer.id) {
      showError("Vui lòng chọn khách hàng");
      return;
    }

    if (!formData.description.trim()) {
      showError("Vui lòng nhập mô tả");
      return;
    }

    if (!formData.category) {
      showError("Vui lòng chọn danh mục");
      return;
    }

    try {
      setLoading(true);

      // Prepare data for backend according to the API format
      const ticketData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        customerId: parseInt(formData.customer.id),
        status: "Open", // String status as required
        categoryId: parseInt(formData.category),
        urgencyLevel: formData.stars,
        assignedToId: selectedUser?.id ? parseInt(selectedUser.id) : null, // Người được phân công xử lý ticket
        createdById: user?.id ? parseInt(user.id) : null, // ID người tạo ticket (người đang đăng nhập)
      };

      console.log("Submitting ticket data:", ticketData);

      // Call the actual API
      const response = await createTicket(ticketData);

      console.log("Ticket created successfully:", response.data);

      // Success notification
      showSuccess(
        "Tạo phiếu hỗ trợ thành công!",
        "Phiếu hỗ trợ đã được tạo và gửi đến hệ thống."
      );

      // Call the onSubmit callback if provided (for parent component handling)
      if (onSubmit) {
        onSubmit(response.data);
      }

      // Reset form or redirect as needed
      // You might want to redirect to ticket list or reset the form here
    } catch (error) {
      console.error("Error creating ticket:", error);

      // More detailed error handling
      if (error.response?.data?.message) {
        showError("Lỗi tạo phiếu hỗ trợ", error.response.data.message);
      } else if (error.response?.status === 400) {
        showError(
          "Dữ liệu không hợp lệ",
          "Vui lòng kiểm tra lại thông tin đã nhập."
        );
      } else if (error.response?.status === 401) {
        showError(
          "Không có quyền",
          "Bạn không có quyền thực hiện thao tác này."
        );
      } else {
        showError(
          "Có lỗi xảy ra",
          "Vui lòng thử lại sau hoặc liên hệ quản trị viên."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (starNumber) => {
    setFormData((prev) => ({
      ...prev,
      stars: starNumber,
    }));
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)}
          className={`p-1 transition-colors ${
            i <= formData.stars
              ? "text-yellow-500 hover:text-yellow-600"
              : "text-gray-300 hover:text-gray-400"
          }`}
        >
          {i <= formData.stars ? (
            <StarIconSolid className="h-6 w-6" />
          ) : (
            <StarIcon className="h-6 w-6" />
          )}
        </button>
      );
    }
    return stars;
  };

  // Filter customers based on search term
  const filteredCustomers = Array.isArray(customers)
    ? customers.filter(
        (customer) =>
          customer.name
            ?.toLowerCase()
            .includes(customerSearchTerm.toLowerCase()) ||
          customer.email
            ?.toLowerCase()
            .includes(customerSearchTerm.toLowerCase()) ||
          customer.phone?.includes(customerSearchTerm) ||
          customer.company
            ?.toLowerCase()
            .includes(customerSearchTerm.toLowerCase())
      )
    : [];

  // Filter users based on search term
  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (user) =>
          user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.roleDisplay
            ?.toLowerCase()
            .includes(userSearchTerm.toLowerCase()) ||
          user.positionDisplay
            ?.toLowerCase()
            .includes(userSearchTerm.toLowerCase()) ||
          user.departmentDisplay
            ?.toLowerCase()
            .includes(userSearchTerm.toLowerCase())
      )
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target)
      ) {
        setIsCustomerDropdownOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCustomerSelect = (customer) => {
    setFormData((prev) => ({
      ...prev,
      customer: customer,
    }));
    setCustomerSearchTerm(customer.name);
    setIsCustomerDropdownOpen(false);
    setIsCustomerPopupOpen(false);
  };

  const handleCustomerInputFocus = () => {
    setIsCustomerDropdownOpen(true);
    if (!customerSearchTerm && formData.customer.name) {
      setCustomerSearchTerm("");
    }
  };

  const handleCustomerSearchChange = (e) => {
    setCustomerSearchTerm(e.target.value);
    setIsCustomerDropdownOpen(true);
  };

  // User selection handlers
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setFormData((prev) => ({
      ...prev,
      assignedTo: user,
    }));
    setUserSearchTerm(user.name);
    setIsUserDropdownOpen(false);
  };

  const handleUserInputFocus = () => {
    setIsUserDropdownOpen(true);
    if (!userSearchTerm && selectedUser?.name) {
      setUserSearchTerm("");
    }
  };

  const handleUserSearchChange = (e) => {
    setUserSearchTerm(e.target.value);
    setIsUserDropdownOpen(true);
  };

  // Initialize search terms when form opens
  useEffect(() => {
    if (formData.customer.name) {
      setCustomerSearchTerm(formData.customer.name);
    }
    if (selectedUser?.name) {
      setUserSearchTerm(selectedUser.name);
    }
  }, [formData.customer.name, selectedUser?.name]);

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-t-lg px-6 py-4">
            <h2 className="text-2xl font-bold text-white mb-1">
              {ticket ? "Edit Ticket" : "Create New Ticket"}
            </h2>
            <p className="text-indigo-100 text-sm">
              {ticket
                ? "Update the ticket information below"
                : "Fill out the form below to create a new support ticket"}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span className="text-gray-600">Loading form data...</span>
              </div>
            </div>
          )}

          {/* Form Content */}
          {!loading && (
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Ticket Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ticket Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter a clear, descriptive ticket title"
                    required
                  />
                </div>

                {/* Customer Selection with Search */}
                <div className="relative" ref={customerDropdownRef}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customer *
                  </label>
                  <div className="relative">
                    <input
                      ref={customerInputRef}
                      type="text"
                      value={customerSearchTerm}
                      onChange={handleCustomerSearchChange}
                      onFocus={handleCustomerInputFocus}
                      className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder={
                        loading
                          ? "Loading customers..."
                          : "Search customers by name, email, or company..."
                      }
                      disabled={loading}
                      required
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => setIsCustomerPopupOpen(true)}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Advanced Search"
                      >
                        <SearchIcon className="h-4 w-4" />
                      </button>
                      <ChevronDownIcon
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          isCustomerDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {/* Dropdown List */}
                    {isCustomerDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map((customer) => (
                            <div
                              key={customer.id}
                              onClick={() => handleCustomerSelect(customer)}
                              className="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {customer.name}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {customer.email}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {customer.company} • {customer.phone}
                                  </div>
                                </div>
                                <UserIcon className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-gray-500 text-center">
                            No customers found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stars Rating */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Mức độ khẩn cấp (Sao) *
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {renderStars()}
                    </div>
                    <span className="ml-4 text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full border">
                      {formData.stars} sao -{" "}
                      {formData.stars === 1
                        ? "Bình thường"
                        : formData.stars === 2
                        ? "Quan trọng"
                        : formData.stars === 3
                        ? "Khẩn cấp"
                        : formData.stars === 4
                        ? "Rất khẩn cấp"
                        : "Cực kỳ khẩn cấp"}
                    </span>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white transition-colors"
                      required
                      disabled={loading}
                    >
                      <option value="">Select a category</option>
                      {Array.isArray(ticketCategories) &&
                        ticketCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assigned To
                  </label>
                  <div className="relative" ref={userDropdownRef}>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        ref={userInputRef}
                        type="text"
                        value={userSearchTerm}
                        onChange={handleUserSearchChange}
                        onFocus={handleUserInputFocus}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder={
                          loading
                            ? "Loading users..."
                            : "Search and select user to assign..."
                        }
                        disabled={loading}
                      />
                      <ChevronDownIcon
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform ${
                          isUserDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {/* User Dropdown */}
                    {isUserDropdownOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                          <div className="py-1">
                            {filteredUsers.map((user) => (
                              <div
                                key={user.id}
                                onClick={() => handleUserSelect(user)}
                                className={`px-4 py-3 cursor-pointer hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                                  selectedUser?.id === user.id
                                    ? "bg-indigo-50 border-l-4 border-l-indigo-500"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                      <span className="text-sm font-medium text-indigo-600">
                                        {user.avatar}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                      <h4 className="text-sm font-medium text-gray-900 truncate">
                                        {user.name}
                                      </h4>
                                      {selectedUser?.id === user.id && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                          Selected
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-4 mt-1">
                                      <span className="text-sm text-gray-600 truncate">
                                        {user.email}
                                      </span>
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {user.positionDisplay ||
                                          user.roleDisplay}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                              No users found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Try adjusting your search criteria
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected User Display */}
                    {selectedUser && !isUserDropdownOpen && (
                      <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-indigo-600">
                                {selectedUser.avatar}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {selectedUser.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {selectedUser.positionDisplay ||
                                selectedUser.roleDisplay}{" "}
                              • {selectedUser.email}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(null);
                              setUserSearchTerm("");
                              setFormData((prev) => ({
                                ...prev,
                                assignedTo: { id: "", name: "", email: "" },
                              }));
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description with CKEditor */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <div className="border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.description || ""}
                      onChange={handleDescriptionChange}
                      config={{
                        toolbar: [
                          "heading",
                          "|",
                          "bold",
                          "italic",
                          "underline",
                          "strikethrough",
                          "|",
                          "bulletedList",
                          "numberedList",
                          "|",
                          "outdent",
                          "indent",
                          "|",
                          "link",
                          "blockQuote",
                          "|",
                          "insertTable",
                          "tableColumn",
                          "tableRow",
                          "mergeTableCells",
                          "|",
                          "undo",
                          "redo",
                        ],
                        heading: {
                          options: [
                            {
                              model: "paragraph",
                              title: "Paragraph",
                              class: "ck-heading_paragraph",
                            },
                            {
                              model: "heading1",
                              view: "h1",
                              title: "Heading 1",
                              class: "ck-heading_heading1",
                            },
                            {
                              model: "heading2",
                              view: "h2",
                              title: "Heading 2",
                              class: "ck-heading_heading2",
                            },
                            {
                              model: "heading3",
                              view: "h3",
                              title: "Heading 3",
                              class: "ck-heading_heading3",
                            },
                          ],
                        },
                        placeholder:
                          "Describe the issue or request in detail...",
                        height: 350,
                        removePlugins: [
                          "ImageUpload",
                          "EasyImage",
                          "ImageInsert",
                          "MediaEmbed",
                        ],
                        table: {
                          contentToolbar: [
                            "tableColumn",
                            "tableRow",
                            "mergeTableCells",
                          ],
                        },
                      }}
                      onReady={(editor) => {
                        // Set minimum height for the editing area
                        editor.editing.view.change((writer) => {
                          writer.setStyle(
                            "min-height",
                            "280px",
                            editor.editing.view.document.getRoot()
                          );
                        });
                        console.log("CKEditor is ready to use!", editor);
                      }}
                      onError={(error, { willEditorRestart }) => {
                        if (willEditorRestart) {
                          console.log("CKEditor will restart");
                        } else {
                          console.error("CKEditor error:", error);
                        }
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Use rich text formatting to provide detailed information
                    about the ticket
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-md focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 font-medium shadow-lg ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </div>
                    ) : ticket ? (
                      "Update Ticket"
                    ) : (
                      "Create Ticket"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Customer Search Popup */}
      {isCustomerPopupOpen && (
        <CustomerSearchPopup
          isOpen={isCustomerPopupOpen}
          onClose={() => setIsCustomerPopupOpen(false)}
          customers={customers}
          onSelectCustomer={handleCustomerSelect}
          selectedCustomer={formData.customer}
        />
      )}
    </>
  );
};

// Customer Search Popup Component
const CustomerSearchPopup = ({
  isOpen,
  onClose,
  customers,
  onSelectCustomer,
  selectedCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    company: "",
    hasPhone: false,
    hasEmail: true,
  });

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany =
      !selectedFilters.company ||
      customer.company
        .toLowerCase()
        .includes(selectedFilters.company.toLowerCase());

    const matchesPhone = !selectedFilters.hasPhone || customer.phone;
    const matchesEmail = !selectedFilters.hasEmail || customer.email;

    return matchesSearch && matchesCompany && matchesPhone && matchesEmail;
  });

  const companies = Array.isArray(customers)
    ? [...new Set(customers.map((c) => c.company).filter(Boolean))].sort()
    : [];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-[60]"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="bg-white rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Customers
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search by name, email, phone, or company..."
                  />
                </div>
              </div>

              {/* Company Filter */}
              <div className="w-48">
                <select
                  value={selectedFilters.company}
                  onChange={(e) =>
                    setSelectedFilters((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Companies</option>
                  {Array.isArray(companies) &&
                    companies.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="overflow-y-auto max-h-96">
            {filteredCustomers.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => onSelectCustomer(customer)}
                    className={`p-4 hover:bg-indigo-50 cursor-pointer transition-colors ${
                      selectedCustomer?.id === customer.id
                        ? "bg-indigo-100 border-l-4 border-indigo-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-indigo-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {customer.name}
                              </h4>
                              {selectedCustomer?.id === customer.id && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                  Selected
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600 truncate">
                                {customer.email}
                              </span>
                              <span className="text-sm text-gray-500">
                                {customer.phone}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {customer.company}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <ChevronDownIcon className="h-5 w-5 text-gray-400 rotate-[-90deg]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No customers found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {filteredCustomers.length} customer
              {filteredCustomers.length !== 1 ? "s" : ""} found
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketForm;

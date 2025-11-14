import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import {
  getAllCategoryServiceAddons,
  getAllCustomers,
  getCategoryServiceAddonById,
  updateQuote,
  getQuoteById,
} from "../../Service/ApiService";
import { showError, showSuccess } from "../../utils/sweetAlert";
import { useAuth } from "../../Context/AuthContext";

const QuoteEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    categoryId: "",
    customerId: "",
  });

  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCustomSelection, setIsCustomSelection] = useState(false);
  const [summaryItems, setSummaryItems] = useState([]);
  const [detailItems, setDetailItems] = useState([]);
  const [availableServicesAndAddons, setAvailableServicesAndAddons] = useState(
    []
  );
  const [originalPrices, setOriginalPrices] = useState({}); // Track original prices
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingCategoryDetails, setIsLoadingCategoryDetails] =
    useState(false);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchCustomers();
    if (id) {
      fetchQuoteData();
    }
  }, [id]);

  const fetchQuoteData = async () => {
    try {
      setIsLoadingQuote(true);
      const response = await getQuoteById(id);
      const quoteData = response.data;

      console.log("Quote data loaded:", quoteData);

      // Set customer
      setFormData({
        categoryId: quoteData.categoryServiceAddonId || "custom",
        customerId: quoteData.customerId || "",
      });

      // Load category if exists
      if (quoteData.categoryServiceAddonId) {
        await loadCategoryAndPopulateData(
          quoteData.categoryServiceAddonId,
          quoteData
        );
      } else {
        // Custom quote
        setIsCustomSelection(true);
        populateCustomQuoteData(quoteData);
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
      showError("Lỗi!", "Không thể tải thông tin báo giá");
      navigate("/quotes");
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const loadCategoryAndPopulateData = async (categoryId, quoteData) => {
    try {
      setIsLoadingCategoryDetails(true);
      const response = await getCategoryServiceAddonById(categoryId);
      const categoryData = response.data;

      setSelectedCategory(categoryData);
      setIsCustomSelection(false);

      // Combine services and addons
      const combinedList = [];
      if (categoryData.services) {
        categoryData.services.forEach((service) => {
          combinedList.push({
            id: `service-${service.id}`,
            originalId: service.id,
            name: service.name,
            price: service.price || 0,
            type: "service",
            isActive: service.isActive,
            tax: service.tax?.rate || 0,
          });
        });
      }
      if (categoryData.addons) {
        categoryData.addons.forEach((addon) => {
          combinedList.push({
            id: `addon-${addon.id}`,
            originalId: addon.id,
            name: addon.name,
            price: addon.price || 0,
            type: "addon",
            isActive: addon.isActive,
            tax: addon.tax?.rate || 0,
          });
        });
      }

      setAvailableServicesAndAddons(combinedList);

      // Populate summary items
      const summary = [];
      if (quoteData.services && quoteData.services.length > 0) {
        quoteData.services.forEach((service, index) => {
          const serviceInfo = combinedList.find(
            (s) => s.type === "service" && s.originalId === service.serviceId
          );
          if (serviceInfo) {
            const itemId = Date.now() + index;
            const unitPrice = service.unitPrice || serviceInfo.price;
            const quantity = service.quantity || 1;
            const tax = service.service?.tax?.rate || serviceInfo.tax || 0;

            summary.push({
              id: itemId,
              serviceId: serviceInfo.id,
              serviceName: service.serviceName || serviceInfo.name,
              unitPrice: unitPrice,
              quantity: quantity,
              tax: tax,
              total: unitPrice * quantity * (1 + tax / 100),
              originalServiceId: service.serviceId,
              serviceType: "service",
              notes: service.notes || "",
            });
            // Track original price
            setOriginalPrices((prev) => ({
              ...prev,
              [itemId]: serviceInfo.price,
            }));
          }
        });
      }

      if (quoteData.addons && quoteData.addons.length > 0) {
        quoteData.addons.forEach((addon, index) => {
          const addonInfo = combinedList.find(
            (a) => a.type === "addon" && a.originalId === addon.addonId
          );
          if (addonInfo) {
            const itemId = Date.now() + 1000 + index;
            const unitPrice = addon.unitPrice || addonInfo.price;
            const quantity = addon.quantity || 1;
            const tax = addon.addon?.tax?.rate || addonInfo.tax || 0;

            summary.push({
              id: itemId,
              serviceId: addonInfo.id,
              serviceName: addon.addonName || addonInfo.name,
              unitPrice: unitPrice,
              quantity: quantity,
              tax: tax,
              total: unitPrice * quantity * (1 + tax / 100),
              originalServiceId: addon.addonId,
              serviceType: "addon",
              notes: addon.notes || "",
            });
            // Track original price
            setOriginalPrices((prev) => ({
              ...prev,
              [itemId]: addonInfo.price,
            }));
          }
        });
      }

      if (summary.length === 0) {
        summary.push({
          id: Date.now(),
          serviceId: "",
          serviceName: "",
          unitPrice: 0,
          quantity: 1,
          tax: 0,
          total: 0,
          originalServiceId: null,
          serviceType: null,
          notes: "",
        });
      }
      setSummaryItems(summary);

      // Populate detail items
      if (quoteData.customService && quoteData.customService.length > 0) {
        const details = quoteData.customService.map((custom, index) => ({
          id: Date.now() + 2000 + index,
          serviceName: custom.serviceName || "",
          unitPrice: custom.unitPrice || 0,
          quantity: custom.quantity || 1,
          relatedService: custom.relatedService || "",
          tax: custom.tax || 0,
          total: custom.total || 0,
        }));
        setDetailItems(details);
      } else {
        setDetailItems([
          {
            id: Date.now() + 1,
            serviceName: "",
            unitPrice: 0,
            quantity: 1,
            relatedService: "",
            tax: 0,
            total: 0,
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading category:", error);
      showError("Lỗi!", "Không thể tải chi tiết category");
    } finally {
      setIsLoadingCategoryDetails(false);
    }
  };

  const populateCustomQuoteData = (quoteData) => {
    const summary = [];

    if (quoteData.services && quoteData.services.length > 0) {
      quoteData.services.forEach((service, index) => {
        const unitPrice = service.unitPrice || service.service?.price || 0;
        const quantity = service.quantity || 1;
        const tax = service.service?.tax?.rate || 0;

        summary.push({
          id: Date.now() + index,
          serviceId: "",
          serviceName:
            service.serviceName || service.service?.name || "Dịch vụ",
          unitPrice: unitPrice,
          quantity: quantity,
          tax: tax,
          total: unitPrice * quantity * (1 + tax / 100),
          originalServiceId: service.serviceId,
          serviceType: "service",
          notes: service.notes || "",
        });
      });
    }

    if (quoteData.addons && quoteData.addons.length > 0) {
      quoteData.addons.forEach((addon, index) => {
        const unitPrice = addon.unitPrice || addon.addon?.price || 0;
        const quantity = addon.quantity || 1;
        const tax = addon.addon?.tax?.rate || 0;

        summary.push({
          id: Date.now() + 1000 + index,
          serviceId: "",
          serviceName: addon.addonName || addon.addon?.name || "Addon",
          unitPrice: unitPrice,
          quantity: quantity,
          tax: tax,
          total: unitPrice * quantity * (1 + tax / 100),
          originalServiceId: addon.addonId,
          serviceType: "addon",
          notes: addon.notes || "",
        });
      });
    }

    if (summary.length === 0) {
      summary.push({
        id: Date.now(),
        serviceId: "",
        serviceName: "",
        unitPrice: 0,
        quantity: 1,
        tax: 0,
        total: 0,
        originalServiceId: null,
        serviceType: null,
        notes: "",
      });
    }
    setSummaryItems(summary);

    // Detail items
    if (quoteData.customService && quoteData.customService.length > 0) {
      const details = quoteData.customService.map((custom, index) => ({
        id: Date.now() + 2000 + index,
        serviceName: custom.serviceName || "",
        unitPrice: custom.unitPrice || 0,
        quantity: custom.quantity || 1,
        relatedService: custom.relatedService || "",
        tax: custom.tax || 0,
        total: custom.total || 0,
      }));
      setDetailItems(details);
    } else {
      setDetailItems([
        {
          id: Date.now() + 1,
          serviceName: "",
          unitPrice: 0,
          quantity: 1,
          relatedService: "",
          tax: 0,
          total: 0,
        },
      ]);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await getAllCategoryServiceAddons();
      const categoriesList = response.data || [];

      // Fetch full details for each category to get services and addons count
      const categoriesWithDetails = await Promise.all(
        categoriesList.map(async (category) => {
          try {
            const detailResponse = await getCategoryServiceAddonById(
              category.id
            );
            return detailResponse.data;
          } catch (error) {
            console.error(
              `Error fetching details for category ${category.id}:`,
              error
            );
            return category; // Return original if fetch fails
          }
        })
      );

      setCategories(categoriesWithDetails);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showError("Lỗi!", "Không thể tải danh sách category");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setIsLoadingCustomers(true);
      const response = await getAllCustomers();
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      showError("Lỗi!", "Không thể tải danh sách khách hàng");
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const handleCategoryChange = async (categoryId) => {
    setFormData({ ...formData, categoryId });

    if (!categoryId) {
      setSelectedCategory(null);
      setIsCustomSelection(false);
      setQuoteItems([]);
      setSummaryItems([]);
      setDetailItems([]);
      setAvailableServicesAndAddons([]);
      return;
    }

    // Check if "custom" option is selected
    if (categoryId === "custom") {
      setIsCustomSelection(true);
      setSelectedCategory(null);
      setAvailableServicesAndAddons([]);
      // Initialize with default summary (1 empty row) and detail items (1 empty row)
      setSummaryItems([
        {
          id: Date.now(),
          serviceId: "",
          serviceName: "",
          unitPrice: 0,
          quantity: 1,
          tax: 0,
          total: 0,
          originalServiceId: null,
          serviceType: null,
          notes: "",
        },
      ]);
      setDetailItems([
        {
          id: Date.now() + 1,
          serviceName: "",
          unitPrice: 0,
          quantity: 1,
          relatedService: "",
          tax: 0,
          total: 0,
        },
      ]);
      return;
    }

    // Fetch category details
    setIsCustomSelection(false);
    try {
      setIsLoadingCategoryDetails(true);
      const response = await getCategoryServiceAddonById(categoryId);
      setSelectedCategory(response.data);

      // Combine services and addons into one array for the select dropdown
      const combinedList = [];

      if (response.data.services) {
        response.data.services.forEach((service) => {
          combinedList.push({
            id: `service-${service.id}`,
            originalId: service.id,
            name: service.name,
            price: service.price || 0,
            type: "service",
            isActive: service.isActive,
            tax: service.tax?.rate || 0, // ✅ Thêm tax rate
          });
        });
      }

      if (response.data.addons) {
        response.data.addons.forEach((addon) => {
          combinedList.push({
            id: `addon-${addon.id}`,
            originalId: addon.id,
            name: addon.name,
            price: addon.price || 0,
            type: "addon",
            isActive: addon.isActive,
            tax: addon.tax?.rate || 0, // ✅ Thêm tax rate
          });
        });
      }

      setAvailableServicesAndAddons(combinedList);

      // Initialize summary with single empty row
      setSummaryItems([
        {
          id: Date.now(),
          serviceId: "",
          serviceName: "",
          unitPrice: 0,
          quantity: 1,
          tax: 0,
          total: 0,
          originalServiceId: null,
          serviceType: null,
          notes: "",
        },
      ]);

      // Initialize detail items with single empty row
      setDetailItems([
        {
          id: Date.now() + 1,
          serviceName: "",
          unitPrice: 0,
          quantity: 1,
          relatedService: "",
          tax: 0,
          total: 0,
        },
      ]);
    } catch (error) {
      console.error("Error fetching category details:", error);
      showError("Lỗi!", "Không thể tải chi tiết category");
    } finally {
      setIsLoadingCategoryDetails(false);
    }
  };

  const handleCategorySelect = async (categoryId) => {
    await handleCategoryChange(categoryId);
    setShowCategoryPopup(false);
  };

  const handleClosePopup = () => {
    if (!formData.categoryId) {
      // If no category selected, go back to quotes list
      navigate("/quotes");
    } else {
      setShowCategoryPopup(false);
    }
  };

  const handleCustomerChange = (customerId) => {
    setFormData({ ...formData, customerId });
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Summary table handlers
  const handleSummaryChange = (id, field, value) => {
    const updatedItems = summaryItems.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };

        // If serviceId changed, update the related fields
        if (field === "serviceId") {
          const selectedService = availableServicesAndAddons.find(
            (s) => s.id === value
          );
          if (selectedService) {
            updated.serviceName = selectedService.name;
            updated.unitPrice = selectedService.price;
            updated.serviceId = value;
            updated.originalServiceId = selectedService.originalId;
            updated.serviceType = selectedService.type;
            updated.tax = selectedService.tax || 0; // ✅ Tự động điền tax rate

            // Store original price for comparison
            setOriginalPrices((prev) => ({
              ...prev,
              [id]: selectedService.price,
            }));

            // Recalculate total with tax
            const subtotal = selectedService.price * updated.quantity;
            const tax = selectedService.tax || 0;
            updated.total = subtotal + (subtotal * tax) / 100;
          } else {
            updated.serviceName = "";
            updated.unitPrice = 0;
            updated.serviceId = "";
            updated.originalServiceId = null;
            updated.serviceType = null;
            updated.total = 0;
          }
        }

        // Auto calculate total with tax
        if (field === "unitPrice" || field === "quantity" || field === "tax") {
          const subtotal = updated.unitPrice * updated.quantity;
          const tax = updated.tax || 0;
          updated.total = subtotal + (subtotal * tax) / 100;
        }

        return updated;
      }
      return item;
    });
    setSummaryItems(updatedItems);
  };

  const addSummaryRow = () => {
    setSummaryItems([
      ...summaryItems,
      {
        id: Date.now(),
        serviceId: "",
        serviceName: "",
        unitPrice: 0,
        quantity: 1,
        tax: 0,
        total: 0,
        originalServiceId: null,
        serviceType: null,
        notes: "",
      },
    ]);
  };

  const removeSummaryRow = (id) => {
    if (summaryItems.length > 1) {
      setSummaryItems(summaryItems.filter((item) => item.id !== id));
    }
  };

  // Detail table handlers
  const handleDetailChange = (id, field, value) => {
    const updatedItems = detailItems.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };

        // ✅ Auto-fill tax when selecting relatedService
        if (field === "relatedService" && value) {
          const relatedSummaryItem = summaryItems.find(
            (s) => s.serviceName === value
          );
          if (relatedSummaryItem) {
            updated.tax = relatedSummaryItem.tax || 0;
          }
        }

        // Auto calculate total with tax
        if (
          field === "unitPrice" ||
          field === "quantity" ||
          field === "tax" ||
          field === "relatedService"
        ) {
          const subtotal = updated.unitPrice * updated.quantity;
          const tax = updated.tax || 0;
          updated.total = subtotal + (subtotal * tax) / 100;
        }

        return updated;
      }
      return item;
    });
    setDetailItems(updatedItems);
  };

  const addDetailRow = () => {
    setDetailItems([
      ...detailItems,
      {
        id: Date.now(),
        serviceName: "",
        unitPrice: 0,
        quantity: 1,
        relatedService: "",
        tax: 0,
        total: 0,
      },
    ]);
  };

  const removeDetailRow = (id) => {
    if (detailItems.length > 1) {
      setDetailItems(detailItems.filter((item) => item.id !== id));
    }
  };

  const calculateSummaryTotal = () => {
    return summaryItems.reduce(
      (sum, item) => sum + parseFloat(item.total || 0),
      0
    );
  };

  const calculateDetailTotal = () => {
    return detailItems.reduce(
      (sum, item) => sum + parseFloat(item.total || 0),
      0
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleBack = () => {
    navigate("/quotes");
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.customerId) {
      showError("Lỗi!", "Vui lòng chọn khách hàng");
      return;
    }

    if (!formData.categoryId) {
      showError("Lỗi!", "Vui lòng chọn category");
      return;
    }

    if (summaryItems.length === 0 && detailItems.length === 0) {
      showError(
        "Lỗi!",
        "Vui lòng thêm ít nhất một mục vào bảng tóm tắt hoặc chi tiết"
      );
      return;
    }

    // ✅ Validate: Dịch vụ liên kết là required trong bảng chi tiết
    const invalidDetailItems = detailItems.filter(
      (item) =>
        item.serviceName &&
        (!item.relatedService || item.relatedService.trim() === "")
    );
    if (invalidDetailItems.length > 0) {
      showError(
        "Lỗi xác thực!",
        "Vui lòng chọn Dịch vụ liên kết cho tất cả các mục trong Bảng Chi Tiết Dịch Vụ"
      );
      return;
    }

    // ✅ Validate: Tổng tiền 2 bảng phải bằng nhau
    const summaryTotal = calculateSummaryTotal();
    const detailTotal = calculateDetailTotal();

    if (Math.abs(summaryTotal - detailTotal) > 0.01) {
      // Cho phép sai số nhỏ do làm tròn
      showError(
        "Lỗi xác thực!",
        `Tổng tiền 2 bảng không khớp!\n` +
          `Bảng Tóm Tắt Chi Phí: ${formatPrice(summaryTotal)}\n` +
          `Bảng Chi Tiết Dịch Vụ: ${formatPrice(detailTotal)}\n\n` +
          `Vui lòng kiểm tra lại số liệu.`
      );
      return;
    }

    // Prepare quote data
    const quoteData = {
      customerId: parseInt(formData.customerId),
      createdByUserId: user?.id || 1, // Lấy userId từ AuthContext
      categoryServiceAddonId:
        formData.categoryId === "custom" ? null : parseInt(formData.categoryId),
      filePath: null, // Có thể thêm chức năng upload file sau
      amount: 0, // Sẽ tính sau
    };

    // Process summary items into services and addons
    const services = [];
    const addons = [];
    let totalAmount = 0;

    summaryItems.forEach((item) => {
      if (item.originalServiceId && item.serviceType) {
        const originalPrice = originalPrices[item.id];
        const currentPrice = parseFloat(item.unitPrice || 0);
        const quantity = parseInt(item.quantity || 1);

        const itemData = {
          quantity: quantity,
          unitPrice: currentPrice, // Luôn gửi unitPrice (0 nếu dùng giá DB)
        };

        // If price was not modified, send 0 to use DB price
        if (originalPrice !== undefined && currentPrice === originalPrice) {
          itemData.unitPrice = 0;
        }

        // Calculate total for this item
        const itemTotal = parseFloat(item.total || 0);
        totalAmount += itemTotal;

        if (item.serviceType === "service") {
          itemData.serviceId = item.originalServiceId;
          services.push(itemData);
        } else if (item.serviceType === "addon") {
          itemData.addonId = item.originalServiceId;
          addons.push(itemData);
        }
      }
    });

    // Add services and addons to quote data if they exist
    if (services.length > 0) {
      quoteData.services = services;
    }
    if (addons.length > 0) {
      quoteData.addons = addons;
    }

    // Process detail items into customService array
    const customService = detailItems
      .filter((item) => item.serviceName && item.serviceName.trim() !== "")
      .map((item) => {
        const unitPrice = parseFloat(item.unitPrice || 0);
        const quantity = parseInt(item.quantity || 1);
        const tax = parseFloat(item.tax || 0);

        // Calculate total with tax: (unitPrice * quantity) * (1 + tax/100)
        const subtotal = unitPrice * quantity;
        const total = subtotal + (subtotal * tax) / 100;

        totalAmount += total;

        return {
          serviceName: item.serviceName,
          unitPrice: unitPrice,
          quantity: quantity,
          tax: tax,
          total: total,
          relatedService: item.relatedService || null,
        };
      });

    // Add customService to quote data if there are items
    if (customService.length > 0) {
      quoteData.customService = customService;
    }

    // Set total amount
    quoteData.amount = totalAmount;

    // Log dữ liệu request để kiểm tra
    console.log("=== QUOTE REQUEST DATA ===");
    console.log("Full Request:", JSON.stringify(quoteData, null, 2));
    console.log("\n--- Services (Từ Bảng Tóm Tắt) ---");
    console.log("Services:", quoteData.services || []);
    console.log("\n--- Addons (Từ Bảng Tóm Tắt) ---");
    console.log("Addons:", quoteData.addons || []);
    console.log("\n--- Custom Services (Từ Bảng Chi Tiết) ---");
    console.log("Custom Services:", quoteData.customService || []);
    console.log("=========================\n");

    try {
      await updateQuote(id, quoteData);
      showSuccess("Thành công!", "Đã cập nhật báo giá");
      navigate("/quotes");
    } catch (error) {
      console.error("Error updating quote:", error);
      showError(
        "Lỗi!",
        error.response?.data?.message || "Không thể cập nhật báo giá"
      );
    }
  };

  if (isLoadingQuote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4"
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
          <p className="text-gray-600">Đang tải thông tin báo giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Category Selection Popup - Hidden in edit mode */}
      {showCategoryPopup && (
        <div
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Popup Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Chọn Category
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Vui lòng chọn category để bắt đầu tạo báo giá
              </p>
            </div>

            {/* Popup Body */}
            <div className="px-6 py-4">
              {isLoadingCategories ? (
                <div className="flex items-center justify-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-indigo-600"
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
                  <span className="ml-2 text-sm text-gray-600">
                    Đang tải danh sách category...
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Custom Selection Option */}
                  <button
                    onClick={() => handleCategorySelect("custom")}
                    className="w-full text-left px-4 py-3 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-400 transition-all"
                  >
                    <div className="font-medium text-gray-900">Tự chọn</div>
                    <div className="text-sm text-gray-600">
                      Tạo báo giá tùy chỉnh với các dịch vụ riêng
                    </div>
                  </button>

                  {/* Category Options */}
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className="w-full text-left px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <div className="font-medium text-gray-900">
                        {category.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {category.services?.length || 0} dịch vụ,{" "}
                        {category.addons?.length || 0} addon
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popup Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-full mx-auto px-2">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-3 transition-colors text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Quay lại danh sách báo giá
          </button>

          <div className="flex items-center">
            <DocumentTextIcon className="h-6 w-6 mr-2 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Cập nhật Báo Giá #{id}
              </h1>
              <p className="text-gray-600 text-sm">
                Chỉnh sửa thông tin báo giá
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Selection Section */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Thông tin cơ bản
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Chọn Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                  disabled={isLoadingCategories}
                >
                  <option value="">-- Chọn Category --</option>
                  <option value="custom">Tự chọn</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {isLoadingCategories && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    Đang tải danh sách category...
                  </p>
                )}
              </div>

              {/* Customer Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Chọn Khách hàng <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
                  disabled={isLoadingCustomers}
                >
                  <option value="">-- Chọn Khách hàng --</option>
                  {customers.map((customer) => {
                    const displayName =
                      customer.customerType === "individual"
                        ? customer.name || customer.fullName || "N/A"
                        : customer.companyName || "N/A";
                    const phone =
                      customer.phoneNumber ||
                      customer.representativePhone ||
                      "";
                    return (
                      <option key={customer.id} value={customer.id}>
                        {displayName} {phone ? `- ${phone}` : ""}
                      </option>
                    );
                  })}
                </select>
                {isLoadingCustomers && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    Đang tải danh sách khách hàng...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quote Tables Section */}
          <div className="p-4">
            {isLoadingCategoryDetails ? (
              <div className="flex items-center justify-center py-8">
                <svg
                  className="animate-spin h-6 w-6 text-indigo-600"
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
                <span className="ml-2 text-sm text-gray-600">
                  Đang tải dữ liệu...
                </span>
              </div>
            ) : summaryItems.length > 0 || detailItems.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-base font-semibold text-gray-900">
                  {isCustomSelection
                    ? "Tạo báo giá tùy chỉnh"
                    : `Báo giá từ Category: ${selectedCategory?.name || ""}`}
                </h3>

                {/* BẢNG 1: TÓM TẮT CHI PHÍ */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-indigo-700 uppercase">
                      📊 Bảng Tóm Tắt Chi Phí
                    </h4>
                    <button
                      onClick={addSummaryRow}
                      className="px-3 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                    >
                      + Thêm dòng
                    </button>
                  </div>

                  <div className="overflow-x-auto border-2 border-indigo-200 rounded-lg">
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-indigo-100">
                          <th className="border border-indigo-200 px-3 py-2 text-left text-xs font-semibold text-gray-700 w-8">
                            STT
                          </th>
                          <th className="border border-indigo-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Tên dịch vụ
                          </th>
                          <th className="border border-indigo-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Đơn giá
                          </th>
                          <th className="border border-indigo-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Số lượng
                          </th>
                          <th className="border border-indigo-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Thuế (%)
                          </th>
                          <th className="border border-indigo-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Tổng tiền
                          </th>
                          <th className="border border-indigo-200 px-3 py-2 text-center text-xs font-semibold text-gray-700 w-16">
                            Xóa
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {summaryItems.map((item, index) => (
                          <tr key={item.id} className="hover:bg-indigo-50">
                            <td className="border border-indigo-200 px-3 py-2 text-center text-gray-700">
                              {index + 1}
                            </td>
                            <td className="border border-indigo-200 px-2 py-1.5">
                              <select
                                value={item.serviceId}
                                onChange={(e) =>
                                  handleSummaryChange(
                                    item.id,
                                    "serviceId",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              >
                                <option value="">
                                  -- Chọn dịch vụ/addon --
                                </option>
                                {availableServicesAndAddons.map((service) => (
                                  <option key={service.id} value={service.id}>
                                    {service.name} -{" "}
                                    {formatPrice(service.price)} (
                                    {service.type === "service"
                                      ? "Dịch vụ"
                                      : "Addon"}
                                    )
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="border border-indigo-200 px-2 py-1.5">
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleSummaryChange(
                                    item.id,
                                    "unitPrice",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right"
                              />
                            </td>
                            <td className="border border-indigo-200 px-2 py-1.5">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleSummaryChange(
                                    item.id,
                                    "quantity",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                min="1"
                                className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center"
                              />
                            </td>
                            <td className="border border-indigo-200 px-2 py-1.5">
                              <input
                                type="number"
                                value={item.tax || 0}
                                onChange={(e) =>
                                  handleSummaryChange(
                                    item.id,
                                    "tax",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                min="0"
                                max="100"
                                placeholder="0"
                                className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right"
                              />
                            </td>
                            <td className="border border-indigo-200 px-3 py-2 text-right font-medium text-gray-900">
                              {formatPrice(item.total)}
                            </td>
                            <td className="border border-indigo-200 px-2 py-1.5 text-center">
                              <button
                                onClick={() => removeSummaryRow(item.id)}
                                className="text-red-600 hover:text-red-800 font-medium text-lg"
                                title="Xóa dòng"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-indigo-200 font-bold">
                          <td
                            colSpan="5"
                            className="border border-indigo-200 px-3 py-2 text-right text-gray-900"
                          >
                            TỔNG CỘNG:
                          </td>
                          <td className="border border-indigo-200 px-3 py-2 text-right text-lg text-indigo-900">
                            {formatPrice(calculateSummaryTotal())}
                          </td>
                          <td className="border border-indigo-200"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* BẢNG 2: CHI TIẾT DỊCH VỤ */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-green-700 uppercase">
                      📋 Bảng Chi Tiết Dịch Vụ
                    </h4>
                    <button
                      onClick={addDetailRow}
                      className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      + Thêm dòng
                    </button>
                  </div>

                  <div className="overflow-x-auto border-2 border-green-200 rounded-lg">
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-green-100">
                          <th className="border border-green-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Tên dịch vụ
                          </th>
                          <th className="border border-green-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Đơn giá
                          </th>
                          <th className="border border-green-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Số lượng
                          </th>
                          <th className="border border-green-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Dịch vụ liên kết
                          </th>
                          <th className="border border-green-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Thuế (%)
                          </th>
                          <th className="border border-green-200 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Tổng tiền
                          </th>
                          <th className="border border-green-200 px-3 py-2 text-center text-xs font-semibold text-gray-700 w-16">
                            Xóa
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailItems.map((item, index) => (
                          <tr key={item.id} className="hover:bg-green-50">
                            <td className="border border-green-200 px-2 py-1.5">
                              <input
                                type="text"
                                value={item.serviceName}
                                onChange={(e) =>
                                  handleDetailChange(
                                    item.id,
                                    "serviceName",
                                    e.target.value
                                  )
                                }
                                placeholder="Tên dịch vụ"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                            </td>
                            <td className="border border-green-200 px-2 py-1.5">
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleDetailChange(
                                    item.id,
                                    "unitPrice",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-right"
                              />
                            </td>
                            <td className="border border-green-200 px-2 py-1.5">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleDetailChange(
                                    item.id,
                                    "quantity",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                min="1"
                                className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
                              />
                            </td>
                            <td className="border border-green-200 px-2 py-1.5">
                              <select
                                value={item.relatedService || ""}
                                onChange={(e) =>
                                  handleDetailChange(
                                    item.id,
                                    "relatedService",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              >
                                <option value="">
                                  -- Chọn dịch vụ liên kết --
                                </option>
                                {summaryItems
                                  .filter(
                                    (summary) =>
                                      summary.serviceName &&
                                      summary.serviceName.trim() !== ""
                                  )
                                  .map((summary) => (
                                    <option
                                      key={summary.id}
                                      value={summary.serviceName}
                                    >
                                      {summary.serviceName}
                                    </option>
                                  ))}
                              </select>
                            </td>
                            <td className="border border-green-200 px-2 py-1.5">
                              <input
                                type="number"
                                value={item.tax || 0}
                                onChange={(e) =>
                                  handleDetailChange(
                                    item.id,
                                    "tax",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                min="0"
                                max="100"
                                placeholder="0"
                                className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-right"
                              />
                            </td>
                            <td className="border border-green-200 px-3 py-2 text-right font-medium text-gray-900">
                              {formatPrice(item.total)}
                            </td>
                            <td className="border border-green-200 px-2 py-1.5 text-center">
                              <button
                                onClick={() => removeDetailRow(item.id)}
                                className="text-red-600 hover:text-red-800 font-medium text-lg"
                                title="Xóa dòng"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-green-200 font-bold">
                          <td
                            colSpan="5"
                            className="border border-green-200 px-3 py-2 text-right text-gray-900"
                          >
                            TỔNG CỘNG:
                          </td>
                          <td className="border border-green-200 px-3 py-2 text-right text-lg text-green-900">
                            {formatPrice(calculateDetailTotal())}
                          </td>
                          <td className="border border-green-200"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Validation Message - Show if totals don't match */}
                {(() => {
                  const summaryTotal = calculateSummaryTotal();
                  const detailTotal = calculateDetailTotal();
                  const difference = Math.abs(summaryTotal - detailTotal);

                  if (difference > 0.01) {
                    return (
                      <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                        <div className="flex items-start">
                          <svg
                            className="w-6 h-6 text-red-600 mr-3 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-red-800 mb-2">
                              ⚠️ Cảnh báo: Tổng tiền không khớp!
                            </h3>
                            <div className="text-sm text-red-700 space-y-1">
                              <p>
                                • Bảng Tóm Tắt Chi Phí:{" "}
                                <span className="font-bold">
                                  {formatPrice(summaryTotal)}
                                </span>
                              </p>
                              <p>
                                • Bảng Chi Tiết Dịch Vụ:{" "}
                                <span className="font-bold">
                                  {formatPrice(detailTotal)}
                                </span>
                              </p>
                              <p className="mt-2 text-red-800 font-semibold">
                                Chênh lệch: {formatPrice(difference)}
                              </p>
                              <p className="mt-2 italic">
                                Vui lòng điều chỉnh để 2 bảng có cùng tổng tiền
                                trước khi tạo báo giá.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                      <div className="flex items-center">
                        <svg
                          className="w-6 h-6 text-green-600 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <h3 className="text-sm font-semibold text-green-800">
                            ✓ Tổng tiền khớp nhau: {formatPrice(summaryTotal)}
                          </h3>
                          <p className="text-xs text-green-700 mt-1">
                            Báo giá đã sẵn sàng để tạo mới.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3 justify-end border-t pt-4">
                  <button
                    onClick={handleBack}
                    className="px-6 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={
                      !formData.customerId ||
                      (summaryItems.length === 0 && detailItems.length === 0) ||
                      Math.abs(
                        calculateSummaryTotal() - calculateDetailTotal()
                      ) > 0.01
                    }
                    className="px-6 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    💾 Cập nhật báo giá
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="mx-auto h-10 w-10 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Chưa chọn thông tin
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Vui lòng chọn Category và Khách hàng để bắt đầu tạo báo giá
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteEditPage;

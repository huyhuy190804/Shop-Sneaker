import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CircleCheckBig,
  Clock3,
  CreditCard,
  FileDown,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import HeaderAdmin from '../../components/headerAdmin';
import SidebarAdmin from '../../components/sidebarAdmin';
import { getAdminOrderById, getAdminOrders, updateAdminOrderStatus } from '../../services/api';

const PAGE_SIZE = 8;
const FETCH_LIMIT = 100;

const statusMeta = {
  ALL: { label: 'All Orders', tone: 'bg-black text-white' },
  Pending: { label: 'Pending', tone: 'bg-[#f4f4f4] text-[#555]' },
  'Awaiting Payment': { label: 'Awaiting Payment', tone: 'bg-[#fef3c7] text-[#92400e]' },
  Shipped: { label: 'Shipped', tone: 'bg-[#dbeafe] text-[#1d4ed8]' },
  Delivered: { label: 'Delivered', tone: 'bg-[#dcfce7] text-[#166534]' },
  Cancelled: { label: 'Cancelled', tone: 'bg-[#fee2e2] text-[#b91c1c]' },
};

const orderFilters = ['ALL', 'Pending', 'Awaiting Payment', 'Shipped', 'Delivered', 'Cancelled'];

const orderTransitions = {
  Pending: ['Delivered', 'Cancelled'],
  'Awaiting Payment': ['Pending', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const formatDate = (value) => {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return new Intl.DateTimeFormat('vi-VN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const getOrderItemCount = (order) =>
  (order?.orderItems || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

const getOrderItemImage = (item) =>
  item?.imageUrl || 'https://placehold.co/96x96/faf8f4/111111?text=Shoe';

const OrderItemCard = ({ item, index, compact = false }) => {
  const quantity = Number(item.quantity) || 0;
  const price = Number(item.price) || 0;
  const subtotal = price * (quantity || 1);
  const metadata = [
    item.color,
    item.size ? `Size ${item.size}` : '',
    quantity ? `Qty ${quantity}` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  return (
    <div className={`flex gap-3 rounded-2xl bg-[#faf8f4] p-3 ${compact ? '' : 'border border-[#eee8de]'}`}>
      <img
        src={getOrderItemImage(item)}
        alt={item.name || `Order item ${index + 1}`}
        className={`${compact ? 'h-14 w-14' : 'h-16 w-16'} shrink-0 rounded-xl bg-white object-cover`}
      />
      <div className="min-w-0 flex-1">
        <div className={`${compact ? 'text-[12px]' : 'text-[13px]'} font-semibold text-[#2d2a26]`}>
          {item.name || 'Unnamed item'}
        </div>
        {metadata && <div className="mt-1 text-[11px] text-[#6f6a61]">{metadata}</div>}
        <div className="mt-2 text-[11px] font-bold text-[#111] md:hidden">
          Unit price: {moneyFormatter.format(price)}
        </div>
        <div className="mt-1 text-[11px] font-semibold text-[#6f6a61] md:hidden">
          Subtotal: {moneyFormatter.format(subtotal)}
        </div>
      </div>
      <div className="hidden shrink-0 text-right md:block">
        <div className="text-[10px] font-black uppercase tracking-[1px] text-[#9b968d]">
          Unit price
        </div>
        <div className="mt-1 text-[13px] font-black text-[#111]">
          {moneyFormatter.format(price)}
        </div>
        <div className="mt-1 text-[11px] font-semibold text-[#6f6a61]">
          Subtotal: {moneyFormatter.format(subtotal)}
        </div>
      </div>
    </div>
  );
};

const formatShippingAddress = (shippingAddress) =>
  [
    shippingAddress?.address || shippingAddress?.street,
    shippingAddress?.city,
    shippingAddress?.state,
    shippingAddress?.postalCode || shippingAddress?.zipCode,
    shippingAddress?.country,
  ]
    .filter(Boolean)
    .join(', ');

const getCustomerName = (order) => order?.userId?.name || order?.customer || 'Unknown customer';

const getCustomerEmail = (order) => order?.userId?.email || order?.email || 'Unknown email';

const getRecentOrdersCount = (orders, days = 30) => {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return orders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    return !Number.isNaN(createdAt.getTime()) && createdAt.getTime() >= threshold;
  }).length;
};

const OrderManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [orderDetail, setOrderDetail] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [orderDetailError, setOrderDetailError] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');

    try {
      let page = 1;
      let totalPages = 1;
      let allOrders = [];

      do {
        const response = await getAdminOrders({ page, limit: FETCH_LIMIT });
        allOrders = allOrders.concat(response.orders || []);
        totalPages = response.pages || 1;
        page += 1;
      } while (page <= totalPages);

      setOrders(allOrders);
    } catch (requestError) {
      setError(requestError.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!statusMessage) return;

    const timer = setTimeout(() => setStatusMessage(''), 2800);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const filteredOrders = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter = activeFilter === 'ALL' || order.orderStatus === activeFilter;
      const matchesSearch =
        !keyword ||
        order._id?.toLowerCase().includes(keyword) ||
        getCustomerName(order).toLowerCase().includes(keyword) ||
        getCustomerEmail(order).toLowerCase().includes(keyword);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, orders, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchTerm]);

  useEffect(() => {
    if (filteredOrders.length === 0) {
      setSelectedOrderId('');
      return;
    }

    const stillVisible = filteredOrders.some((order) => order._id === selectedOrderId);
    if (!stillVisible) {
      setSelectedOrderId(filteredOrders[0]._id);
    }
  }, [filteredOrders, selectedOrderId]);

  const selectedOrder =
    filteredOrders.find((order) => order._id === selectedOrderId) ||
    filteredOrders[0] ||
    orders[0] ||
    null;

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const pagedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalValue = filteredOrders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);
  const totalPaidRevenue = orders.filter((order) => order.isPaid).reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);
  const pendingQueue = orders.filter((order) => order.orderStatus === 'Pending').length;
  const inTransit = orders.filter((order) => order.orderStatus === 'Shipped').length;
  const recentOrders = getRecentOrdersCount(orders);

  const dashboardMetrics = [
    { label: 'Total Orders', value: loading ? '...' : orders.length.toLocaleString('en-US'), hint: 'Live from /api/orders/admin/all', icon: Package },
    { label: 'Pending Queue', value: loading ? '...' : pendingQueue.toLocaleString('en-US'), hint: 'Waiting for confirmation', icon: Clock3 },
    { label: 'In Transit', value: loading ? '...' : inTransit.toLocaleString('en-US'), hint: 'Currently with couriers', icon: Truck },
    { label: 'Completed Revenue', value: loading ? '...' : moneyFormatter.format(totalPaidRevenue), hint: `Recent orders: ${recentOrders.toLocaleString('en-US')}`, icon: CircleCheckBig },
  ];

  const handleUpdateStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    setError('');
    try {
      await updateAdminOrderStatus({ id: orderId, status });
      await loadOrders();
      setStatusMessage(`Order ${orderId.slice(-6)} updated to ${status}.`);
    } catch (requestError) {
      setError(requestError.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId('');
    }
  };

  const selectedOrderActions = selectedOrder ? orderTransitions[selectedOrder.orderStatus] || [] : [];
  const primaryAction = selectedOrderActions[0] || '';
  const secondaryAction = selectedOrderActions[1] || '';
  const primaryLabel =
    primaryAction === 'Shipped'
      ? 'Mark Shipped'
      : primaryAction === 'Pending'
        ? 'Confirm Payment'
      : primaryAction === 'Delivered'
        ? 'Mark Delivered'
      : primaryAction === 'Cancelled'
        ? 'Cancel Order'
        : 'Refresh';

  const handlePrimaryAction = async () => {
    if (!selectedOrder) return;
    if (!primaryAction) {
      await loadOrders();
      return;
    }

    await handleUpdateStatus(selectedOrder._id, primaryAction);
  };

  const handleSecondaryAction = async () => {
    if (!selectedOrder) return;
    if (!secondaryAction) {
      await loadOrders();
      return;
    }

    await handleUpdateStatus(selectedOrder._id, secondaryAction);
  };

  const openOrderDetail = async (orderId) => {
    setIsOrderModalOpen(true);
    setOrderDetailLoading(true);
    setOrderDetailError('');

    try {
      const detail = await getAdminOrderById(orderId);
      setOrderDetail(detail);
    } catch (requestError) {
      setOrderDetailError(requestError.message || 'Failed to load order details');
      setOrderDetail(selectedOrder && selectedOrder._id === orderId ? selectedOrder : null);
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const currentPageStart = filteredOrders.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const currentPageEnd = Math.min(currentPage * PAGE_SIZE, filteredOrders.length);

  const handleExportCsv = () => {
    if (!filteredOrders.length) return;

    const headers = ['order_id', 'created_at', 'customer_name', 'customer_email', 'status', 'payment_method', 'shipping_method', 'item_count', 'total_price'];
    const lines = filteredOrders.map((order) => [
      order._id || '',
      order.createdAt || '',
      getCustomerName(order),
      getCustomerEmail(order),
      order.orderStatus || '',
      order.paymentMethod || '',
      order.shippingMethod || '',
      getOrderItemCount(order),
      Number(order.totalPrice || 0),
    ]);

    const csv = [headers, ...lines]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!pagedOrders.length) return;

    const isVisible = pagedOrders.some((order) => order._id === selectedOrderId);
    if (!isVisible) {
      setSelectedOrderId(pagedOrders[0]._id);
    }
  }, [pagedOrders, selectedOrderId]);

  return (
    <div className="flex min-h-screen bg-[#f6f5f2] text-[#111] font-sans">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}
      >
        <SidebarAdmin />
      </div>

      <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        <HeaderAdmin
          toggleSidebar={() => setIsSidebarOpen((value) => !value)}
          title="ORDER MANAGEMENT"
          navItems={[
            { label: 'Live Queue', active: true },
            { label: 'Fulfillment', active: false },
          ]}
          actionLabel="REFRESH"
          onActionClick={loadOrders}
        />

        <main className="flex-1 px-4 py-6 md:px-10 md:py-8 lg:px-14 lg:py-10">
          <section className="relative overflow-hidden rounded-[28px] bg-black text-white p-6 md:p-8 mb-6 md:mb-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.10),transparent_30%)]" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black tracking-[1.5px] uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  Fulfillment live
                </div>
                <h2 className="mt-4 text-[30px] md:text-[42px] leading-[0.95] font-black tracking-[-1.5px]">
                  Manage every order from checkout to delivery.
                </h2>
                <p className="mt-4 max-w-xl text-sm md:text-base text-white/70">
                  Track new orders, review payment flow, and keep the fulfillment team moving without leaving the admin panel.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 w-full lg:w-auto lg:min-w-[320px]">
                <button
                  type="button"
                  onClick={loadOrders}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-[11px] font-black tracking-[1px] uppercase hover:bg-white/15 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing' : 'Refresh'}
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={loading || filteredOrders.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[11px] font-black tracking-[1px] uppercase text-black hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FileDown className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 mb-6 md:mb-8">
            {dashboardMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <article key={metric.label} className="rounded-2xl border border-[#e9e6df] bg-white p-5 shadow-[0_10px_30px_rgba(17,17,17,0.04)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black tracking-[1.5px] text-[#9b968d] uppercase">{metric.label}</p>
                      <h3 className="mt-3 block w-full max-w-full truncate text-[32px] leading-none font-black tracking-[-1.5px] md:whitespace-normal md:overflow-visible">
                        {metric.value}
                      </h3>
                      <p className="mt-2 text-[11px] font-semibold text-[#6f6a61]">{metric.hint}</p>
                    </div>
                    <div className="rounded-2xl bg-[#f4f1ea] p-3">
                      <Icon className="h-5 w-5 text-black" />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
            <article className="rounded-[28px] border border-[#e9e6df] bg-white shadow-[0_12px_40px_rgba(17,17,17,0.04)] overflow-hidden">
              <div className="p-5 md:p-6 border-b border-[#eee8de]">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[10px] font-black tracking-[1.5px] text-[#9b968d] uppercase">Order list</p>
                    <h3 className="mt-2 text-[22px] md:text-[26px] font-black tracking-[-1px]">Today&apos;s operational queue</h3>
                    <p className="mt-2 text-[12px] text-[#6f6a61] max-w-2xl">
                      {loading ? 'Loading orders...' : `${filteredOrders.length} orders shown. Current revenue in view: ${moneyFormatter.format(totalValue)}.`}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center rounded-xl bg-[#f4f1ea] px-4 py-3 min-w-0 sm:w-[280px]">
                      <Search className="h-4 w-4 text-[#7d766d] shrink-0" />
                      <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="ml-3 w-full bg-transparent border-none outline-none text-[12px] font-semibold placeholder:text-[#8f887f]"
                        type="text"
                        placeholder="Search order, customer, or email"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setActiveFilter('ALL');
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e9e6df] px-4 py-3 text-[11px] font-black tracking-[1px] uppercase text-[#111] hover:bg-[#faf8f4] transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {orderFilters.map((filter) => {
                    const active = activeFilter === filter;
                    return (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`rounded-full px-4 py-2 text-[10px] font-black tracking-[1px] uppercase transition-colors ${
                          active ? 'bg-black text-white' : 'bg-[#f4f1ea] text-[#6f6a61] hover:bg-[#ebe6db]'
                        }`}
                      >
                        {statusMeta[filter].label}
                      </button>
                    );
                  })}
                </div>
                {statusMessage && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-[12px] font-semibold text-emerald-700">
                    {statusMessage}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse">
                  <thead>
                    <tr className="text-left text-[10px] font-black tracking-[1.4px] text-[#9b968d] uppercase">
                      <th className="px-6 py-4">Order</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="inline-flex items-center gap-3 text-[11px] font-black tracking-[1px] uppercase text-[#555]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading orders...
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="mx-auto max-w-md">
                            <p className="text-[12px] font-black tracking-[1px] uppercase text-[#b91c1c]">Failed to load orders</p>
                            <p className="mt-2 text-[13px] text-[#6f6a61]">{error}</p>
                          </div>
                        </td>
                      </tr>
                    ) : pagedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center">
                          <div className="mx-auto max-w-sm">
                            <p className="text-[12px] font-black tracking-[1px] uppercase text-[#9b968d]">No orders found</p>
                            <p className="mt-2 text-[13px] text-[#6f6a61]">
                              Try a different keyword or switch to another status filter.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : pagedOrders.map((order) => {
                      const active = order._id === selectedOrder?._id;
                      return (
                        <tr
                          key={order._id}
                          onClick={() => setSelectedOrderId(order._id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setSelectedOrderId(order._id);
                            }
                          }}
                          tabIndex={0}
                          className={`cursor-pointer border-t border-[#f0ebe3] transition-colors ${
                            active ? 'bg-[#faf8f4]' : 'hover:bg-[#fcfbf8]'
                          }`}
                        >
                          <td className="px-6 py-5 align-middle">
                            <div className="max-w-[140px] truncate font-black tracking-[-0.3px] sm:max-w-none">
                              {order._id}
                            </div>
                            <div className="mt-1 text-[11px] text-[#8f887f]">{formatDate(order.createdAt)}</div>
                          </td>
                          <td className="px-6 py-5 align-middle">
                            <div className="font-semibold text-[13px]">{getCustomerName(order)}</div>
                            <div className="mt-1 text-[11px] text-[#8f887f]">{getCustomerEmail(order)}</div>
                            <div className="mt-1 text-[10px] font-bold uppercase tracking-[1px] text-[#b1ab9f]">
                              {getOrderItemCount(order)} items
                            </div>
                          </td>
                          <td className="px-6 py-5 align-middle">
                            <div className="text-[12px] font-semibold">{order.paymentMethod || 'N/A'}</div>
                            <div className="mt-1 text-[11px] text-[#8f887f]">{order.shippingMethod || 'Standard'}</div>
                          </td>
                          <td className="px-6 py-5 align-middle">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black tracking-[1px] uppercase ${statusMeta[order.orderStatus]?.tone || statusMeta.ALL.tone}`}>
                              {statusMeta[order.orderStatus]?.label || order.orderStatus}
                            </span>
                          </td>
                          <td className="px-6 py-5 align-middle">
                            <div className="font-black text-[14px]">{moneyFormatter.format(order.totalPrice || 0)}</div>
                          </td>
                          <td className="px-6 py-5 align-middle text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openOrderDetail(order._id);
                                }}
                                className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-[10px] font-black uppercase tracking-[1px] text-white hover:bg-black/90 transition-colors"
                              >
                                <ShoppingBag className="h-3.5 w-3.5" />
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center px-5 md:px-6 py-5 border-t border-[#eee8de] gap-4">
                <span className="text-[9px] md:text-[10px] font-extrabold text-[#999] tracking-[1px] text-center sm:text-left">
                  SHOWING {currentPageStart}-{currentPageEnd} OF {filteredOrders.length.toLocaleString('en-US')} ORDERS
                </span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const prevPage = Math.max(1, currentPage - 1);
                      const prevOrder = filteredOrders[(prevPage - 1) * PAGE_SIZE] || filteredOrders[0];
                      setCurrentPage(prevPage);
                      setSelectedOrderId(prevOrder?._id || '');
                    }}
                    disabled={currentPage <= 1 || loading}
                    className="flex-1 sm:flex-none bg-[#eee] text-[#666] py-3 md:py-[14px] px-4 md:px-6 text-[9px] md:text-[10px] font-black border-none cursor-pointer tracking-[1px] rounded-sm hover:bg-[#e4e4e4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    PREVIOUS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextPage = Math.min(totalPages, currentPage + 1);
                      const nextOrder = filteredOrders[(nextPage - 1) * PAGE_SIZE] || filteredOrders[0];
                      setCurrentPage(nextPage);
                      setSelectedOrderId(nextOrder?._id || '');
                    }}
                    disabled={currentPage >= totalPages || loading}
                    className="flex-1 sm:flex-none bg-black text-white py-3 md:py-[14px] px-4 md:px-6 text-[9px] md:text-[10px] font-black border-none cursor-pointer tracking-[1px] rounded-sm hover:bg-opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    NEXT PAGE
                  </button>
                </div>
              </div>
            </article>

            <aside className="space-y-6">
              <article className="rounded-[28px] border border-[#e9e6df] bg-white p-6 shadow-[0_12px_40px_rgba(17,17,17,0.04)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black tracking-[1.5px] text-[#9b968d] uppercase">Selected order</p>
                    <h3 className="mt-2 max-w-[220px] truncate text-[22px] font-black tracking-[-1px] sm:max-w-none">
                      {selectedOrder?._id || 'No order selected'}
                    </h3>
                    <p className="mt-1 truncate text-[12px] text-[#6f6a61]">
                      {selectedOrder ? getCustomerName(selectedOrder) : 'Choose an order from the list'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f4f1ea] p-3">
                    <ShoppingBag className="h-5 w-5 text-black" />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-[#faf8f4] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black tracking-[1px] uppercase ${statusMeta[selectedOrder?.orderStatus]?.tone || statusMeta.ALL.tone}`}>
                      {statusMeta[selectedOrder?.orderStatus]?.label || 'N/A'}
                    </span>
                    <span className="text-[11px] font-bold text-[#7d766d]">{selectedOrder ? formatDate(selectedOrder.createdAt) : 'N/A'}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                    <div>
                      <p className="text-[#9b968d] text-[10px] font-black tracking-[1px] uppercase">Items</p>
                      <p className="mt-1 font-semibold">{selectedOrder ? `${getOrderItemCount(selectedOrder)} pcs` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[#9b968d] text-[10px] font-black tracking-[1px] uppercase">Total</p>
                      <p className="mt-1 font-semibold">{selectedOrder ? moneyFormatter.format(selectedOrder.totalPrice || 0) : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[#9b968d] text-[10px] font-black tracking-[1px] uppercase">Payment</p>
                      <p className="mt-1 font-semibold">{selectedOrder?.paymentMethod || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[#9b968d] text-[10px] font-black tracking-[1px] uppercase">Shipment</p>
                      <p className="mt-1 font-semibold">{selectedOrder?.shippingMethod || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 text-[12px] text-[#6f6a61]">
                    <MapPin className="h-4 w-4 text-black" />
                    {selectedOrder ? formatShippingAddress(selectedOrder.shippingAddress) : 'No shipping address'}
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-[#6f6a61]">
                    <CreditCard className="h-4 w-4 text-black" />
                    {selectedOrder
                      ? selectedOrder.isPaid
                        ? `Paid ${selectedOrder.paymentMethod}${selectedOrder.paymentResult?.update_time ? ` on ${formatDate(selectedOrder.paymentResult.update_time)}` : ''}`
                        : 'Payment pending'
                      : 'No payment info'}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-[10px] font-black tracking-[1.5px] text-[#9b968d] uppercase">Order items</p>
                  <div className="mt-3 space-y-3">
                    {selectedOrder?.orderItems?.length ? (
                      selectedOrder.orderItems.map((item, index) => (
                        <OrderItemCard
                          key={`${item.productId}-${item.variantId || index}`}
                          item={item}
                          index={index}
                          compact
                        />
                      ))
                    ) : (
                      <div className="rounded-2xl bg-[#faf8f4] p-4 text-[12px] text-[#6f6a61]">No items available.</div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handlePrimaryAction}
                    disabled={!selectedOrder || loading || !primaryAction || updatingOrderId === selectedOrder?._id}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-[11px] font-black tracking-[1px] uppercase text-white hover:bg-black/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-4 w-4 ${updatingOrderId === selectedOrder?._id ? 'animate-spin' : ''}`} />
                    {updatingOrderId === selectedOrder?._id ? 'Updating...' : primaryLabel}
                  </button>
                  <button
                    type="button"
                    onClick={handleSecondaryAction}
                    disabled={!selectedOrder || loading || !secondaryAction || updatingOrderId === selectedOrder?._id}
                    className={`inline-flex items-center justify-center rounded-xl border px-4 py-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      secondaryAction === 'Cancelled'
                        ? 'border-[#fee2e2] text-[#b91c1c] hover:bg-[#fff1f1]'
                        : 'border-[#e9e6df] text-[#6f6a61] hover:bg-[#faf8f4]'
                    }`}
                  >
                    {secondaryAction === 'Cancelled' ? <FileDown className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </article>

              <article className="rounded-[28px] border border-[#e9e6df] bg-white p-6 shadow-[0_12px_40px_rgba(17,17,17,0.04)]">
                <p className="text-[10px] font-black tracking-[1.5px] text-[#9b968d] uppercase">Ops notes</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl bg-[#faf8f4] p-4">
                    <div className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[1px]">
                      <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                      Fulfillment queue
                    </div>
                    <p className="mt-2 text-[12px] text-[#6f6a61]">
                      {pendingQueue} orders are waiting for confirmation or shipment.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#faf8f4] p-4">
                    <div className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[1px]">
                      <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                      Payment review
                    </div>
                    <p className="mt-2 text-[12px] text-[#6f6a61]">
                      {orders.filter((order) => !order.isPaid).length} orders still show payment pending.
                    </p>
                  </div>
                </div>
              </article>
            </aside>
          </section>
        </main>
      </div>

      {isOrderModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 px-4 py-6 flex items-end md:items-center justify-center">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#eee8de] p-5 md:p-6">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black tracking-[1.5px] text-[#9b968d] uppercase">Order detail</p>
                <h3 className="mt-2 max-w-[220px] truncate text-[22px] font-black tracking-[-1px] sm:max-w-none">
                  {orderDetail?._id || selectedOrder?._id || 'Order'}
                </h3>
                <p className="mt-1 truncate text-[12px] text-[#6f6a61]">
                  {orderDetail ? getCustomerName(orderDetail) : getCustomerName(selectedOrder)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOrderModalOpen(false);
                  setOrderDetail(null);
                  setOrderDetailError('');
                }}
                className="rounded-full border border-[#e9e6df] px-3 py-2 text-[11px] font-black uppercase tracking-[1px] text-[#6f6a61] hover:bg-[#faf8f4]"
              >
                Close
              </button>
            </div>

            <div className="max-h-[calc(90vh-92px)] overflow-y-auto p-5 md:p-6">
              {orderDetailLoading ? (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center gap-3 text-[11px] font-black tracking-[1px] uppercase text-[#555]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading order products...
                  </div>
                </div>
              ) : (
                <>
                  {orderDetailError && (
                    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      {orderDetailError}
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-[#faf8f4] p-4">
                      <p className="text-[10px] font-black tracking-[1.5px] text-[#9b968d] uppercase">Customer</p>
                      <div className="mt-2 text-[14px] font-black text-[#111]">
                        {orderDetail ? getCustomerName(orderDetail) : getCustomerName(selectedOrder)}
                      </div>
                      <div className="mt-1 text-[12px] text-[#6f6a61]">
                        {orderDetail ? getCustomerEmail(orderDetail) : getCustomerEmail(selectedOrder)}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#faf8f4] p-4">
                      <p className="text-[10px] font-black tracking-[1.5px] text-[#9b968d] uppercase">Status</p>
                      <div className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[1px] bg-black text-white">
                        {(orderDetail || selectedOrder)?.orderStatus || 'N/A'}
                      </div>
                      <div className="mt-2 text-[12px] text-[#6f6a61]">
                        {(orderDetail || selectedOrder)?.shippingMethod || 'Standard'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-black tracking-[1.5px] text-[#9b968d] uppercase">Purchased products</p>
                      <span className="text-[11px] font-bold text-[#7d766d]">
                        {getOrderItemCount(orderDetail || selectedOrder || { orderItems: [] })} items
                      </span>
                    </div>

                    <div className="mt-3 space-y-3">
                      {(orderDetail || selectedOrder)?.orderItems?.length ? (
                        (orderDetail || selectedOrder).orderItems.map((item, index) => (
                          <OrderItemCard
                            key={`${item.productId}-${item.variantId || index}`}
                            item={item}
                            index={index}
                          />
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-[#e9e6df] p-6 text-center text-[13px] text-[#6f6a61]">
                          No purchased products found.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

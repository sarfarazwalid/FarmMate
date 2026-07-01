'use client';

import { AlertCircle, Calendar, CheckCircle, Clock, FileDown, MapPin, Package, ShoppingBag, Truck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/apiConfig';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    const userId = cookies.userId;
    if (userId) setUser({ _id: userId });
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});

      const userId = cookies.userId;
      if (!userId) {
        alert('Please log in to view your orders');
        return;
      }

      const response = await fetch(getApiUrl(`/orders/user/${userId}`), {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setOrders(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <AlertCircle className="w-5 h-5 text-sky-400" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Package className="w-5 h-5 text-surface-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-300';
      case 'confirmed':
        return 'bg-sky-500/10 text-sky-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-300';
      case 'cancelled':
        return 'bg-red-500/50/10 text-red-300';
      default:
        return 'bg-white/[0.04] text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helpers to split a single order into per-farmer sub-orders
  const aggregateStatus = (items) => {
    const statuses = items.map(i => i.status || 'pending');
    if (statuses.every(s => s === 'cancelled')) return 'cancelled';
    if (statuses.every(s => s === 'delivered')) return 'delivered';
    if (statuses.some(s => s === 'shipped')) return 'shipped';
    if (statuses.some(s => s === 'confirmed')) return 'confirmed';
    return 'pending';
  };

  const splitOrderByFarmer = (order) => {
    const groups = new Map();
    order.items.forEach(item => {
      const farmerId = item?.farmer?._id || item?.farmer || 'unknown';
      if (!groups.has(farmerId)) {
        groups.set(farmerId, {
          parentOrderId: order._id,
          orderDate: order.orderDate,
          deliveryDate: order.deliveryDate,
          paymentMethod: order.paymentMethod,
          shippingAddress: order.shippingAddress,
          notes: order.notes,
          buyerTotal: order.total,
          farmer: item.farmer,
          items: [],
          total: 0,
          status: 'pending'
        });
      }
      const g = groups.get(farmerId);
      g.items.push(item);
      g.total += item.price * item.quantity;
    });
    // finalize status per group
    groups.forEach(g => { g.status = aggregateStatus(g.items); });
    return Array.from(groups.values());
  };

  const groupedOrders = orders.flatMap(splitOrderByFarmer);

  const downloadPayslip = async (g) => {
    try {
      const [{ default: html2pdf }] = await Promise.all([
        import('html2pdf.js')
      ]);

      const container = document.createElement('div');
      container.style.padding = '24px';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.color = '#111827';
      container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <h1 style="margin:0 0 4px 0;font-size:22px;">FarmMate Payslip</h1>
            <div style="color:#6B7280;">Sub-order for ${g.farmer?.name || 'Unknown farmer'}</div>
          </div>
          <div style="color:#6B7280;">Generated: ${new Date().toLocaleString()}</div>
        </div>

        <div style="display:flex;gap:24px;">
          <div style="flex:1;">
            <h2 style="margin:16px 0 8px;font-size:16px;">Order</h2>
            <div style="color:#6B7280;">Parent Order ID: ${g.parentOrderId}</div>
            <div style="color:#6B7280;">Order Date: ${new Date(g.orderDate).toLocaleString()}</div>
            <div style="color:#6B7280;">Status: ${g.status}</div>
          </div>
          <div style="flex:1;">
            <h2 style="margin:16px 0 8px;font-size:16px;">Shipping</h2>
            ${g.shippingAddress ? `
              <div>${g.shippingAddress.street || ''}</div>
              <div>${g.shippingAddress.city || ''}, ${g.shippingAddress.state || ''} ${g.shippingAddress.zipCode || ''}</div>
              <div>${g.shippingAddress.country || ''}</div>
            ` : '<div style="color:#6B7280;">N/A</div>'}
          </div>
        </div>

        <h2 style="margin:16px 0 8px;font-size:16px;">Items</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
          <thead>
            <tr>
              <th style="border:1px solid #E5E7EB;padding:8px;text-align:left;font-size:14px;background:#F9FAFB;">Product</th>
              <th style="border:1px solid #E5E7EB;padding:8px;text-align:left;font-size:14px;background:#F9FAFB;">Qty</th>
              <th style="border:1px solid #E5E7EB;padding:8px;text-align:left;font-size:14px;background:#F9FAFB;">Price</th>
              <th style="border:1px solid #E5E7EB;padding:8px;text-align:left;font-size:14px;background:#F9FAFB;">Subtotal</th>
              <th style="border:1px solid #E5E7EB;padding:8px;text-align:left;font-size:14px;background:#F9FAFB;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${g.items.map(i => `
              <tr>
                <td style="border:1px solid #E5E7EB;padding:8px;text-align:left;font-size:14px;">${i.name}</td>
                <td style="border:1px solid #E5E7EB;padding:8px;text-align:left;font-size:14px;">${i.quantity}</td>
                <td style="border:1px solid #E5E7EB;padding:8px;text-align:left;font-size:14px;">$${Number(i.price).toFixed(2)}</td>
                <td style="border:1px solid #E5E7EB;padding:8px;text-align:left;font-size:14px;">$${(Number(i.price) * Number(i.quantity)).toFixed(2)}</td>
                <td style="border:1px solid #E5E7EB;padding:8px;text-align:left;font-size:14px;">${i.status || 'pending'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="text-align:right;margin-top:12px;font-weight:600;">Total due: $${g.total.toFixed(2)}</div>
        ${g.notes ? `<h2 style=\"margin:16px 0 8px;font-size:16px;\">Notes</h2><div>${g.notes}</div>` : ''}
      `;

      document.body.appendChild(container);

      const fileName = `payslip-${g.parentOrderId.slice(-8)}-${(g.farmer?.name || 'farmer').replace(/\s+/g, '_')}.pdf`;

      await html2pdf()
        .set({
          margin: 10,
          filename: fileName,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(container)
        .save();

      container.remove();
    } catch (e) {
      console.error('Payslip generation failed', e);
      alert('Could not generate payslip.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Orders</h1>
          <p className="text-surface-400 mt-2">Track your current and past orders</p>
        </div>
      </div>

      <div className="bg-surface-800/80 rounded-2xl shadow-sm border border-white/[0.06] p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {loading ? 'Loading orders...' : `${groupedOrders.length} Orders Found`}
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-white mb-2">No orders found</h3>
            <p className="text-surface-400">You haven&apos;t placed any orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedOrders.map((g, idx) => (
              <div key={`${g.parentOrderId}-${idx}`} className="border border-white/[0.06] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Order #{g.parentOrderId.slice(-8)} • {g.farmer?.name || 'Unknown farmer'}</h3>
                      <p className="text-sm text-surface-400">
                        Placed on {formatDate(g.orderDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(g.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(g.status)}`}>
                      {g.status.charAt(0).toUpperCase() + g.status.slice(1)}
                    </span>
                    {(g.status === 'confirmed' || g.status === 'shipped' || g.status === 'delivered') && (
                      <button
                        onClick={() => downloadPayslip(g)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:brightness-110"
                        title="Download payslip"
                      >
                        <FileDown className="w-4 h-4" /> Payslip
                      </button>
                    )}
                  </div>
                </div>

                {/* Items for this farmer */}
                <div className="space-y-3 mb-4">
                  {g.items.map((item, index) => (
                    <div key={index} className={`flex items-center gap-4 p-3 rounded-lg ${item.status === 'cancelled' ? 'bg-red-500/5' : 'bg-white/[0.02]'}`}>
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-lg">🌾</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{item.name}</h4>
                        <p className="text-sm text-surface-400">
                          Qty: {item.quantity} {item.productId?.unit || 'unit(s)'}
                        </p>
                        <p className="text-sm text-surface-400">
                          Farmer: {item.farmer?.name || 'Unknown'}
                          {item.status && (
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                              item.status === 'cancelled' ? 'bg-red-500/50/10 text-red-700' :
                              item.status === 'confirmed' ? 'bg-sky-500/10 text-blue-700' :
                              item.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                              item.status === 'delivered' ? 'bg-emerald-500/10 text-green-700' : 'bg-amber-500/10 text-amber-300'
                            }`}>
                              {item.status}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">${item.price.toFixed(2)}</p>
                        <p className="text-sm text-surface-400">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {g.shippingAddress && (
                    <div>
                      <h4 className="font-medium text-white mb-2">Shipping Address</h4>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-surface-500 mt-0.5" />
                        <div className="text-sm text-surface-400">
                          <p>{g.shippingAddress.street}</p>
                          <p>{g.shippingAddress.city}, {g.shippingAddress.state} {g.shippingAddress.zipCode}</p>
                          <p>{g.shippingAddress.country}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-white mb-2">Order Details</h4>
                    <div className="space-y-1 text-sm text-surface-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Order Date: {formatDate(g.orderDate)}</span>
                      </div>
                      {g.deliveryDate && (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          <span>Delivered: {formatDate(g.deliveryDate)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>Payment: {g.paymentMethod}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Total: ${g.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {g.notes && (
                  <div className="p-3 bg-sky-500/5 rounded-lg">
                    <h4 className="font-medium text-white mb-1">Notes</h4>
                    <p className="text-sm text-surface-400">{g.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
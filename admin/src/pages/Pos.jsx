import { useState, useEffect, useCallback } from "react";
import { orderApi } from "../services/modules/order.api";
import { dashboardApi } from "../services/modules/dashboard.api";
import { toast } from "sonner";
import "../style/Pos.css";

// ─── Cấu hình trạng thái đơn hàng ────────────────────────
const STATUS_CONFIG = {
  pending:   { label: "Chờ xử lý",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  next: "preparing", nextLabel: "Bắt đầu làm" },
  preparing: { label: "Đang làm",   color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  next: "ready",     nextLabel: "Báo xong"    },
  ready:     { label: "Sẵn sàng",   color: "#10b981", bg: "rgba(16,185,129,0.12)",  next: "complete",  nextLabel: "Hoàn thành"  },
  complete:  { label: "Hoàn thành", color: "#6b7280", bg: "rgba(107,114,128,0.12)", next: null,        nextLabel: null          },
  cancel:    { label: "Đã hủy",     color: "#ef4444", bg: "rgba(239,68,68,0.12)",   next: null,        nextLabel: null          },
};

const ALL_FILTERS = [
  { key: "all",      label: "Tất cả" },
  { key: "pending",  label: "Chờ xử lý" },
  { key: "preparing",label: "Đang làm" },
  { key: "ready",    label: "Sẵn sàng" },
  { key: "complete", label: "Hoàn thành" },
  { key: "cancel",   label: "Đã hủy" },
];

export default function Pos() {
  const [orders, setOrders]   = useState([]);
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);       // đơn đang xem chi tiết
  const [updating, setUpdating] = useState(null);       // id đang cập nhật

  // States cho Báo cáo Chốt Ca
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftDateStr, setShiftDateStr]     = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [shiftReport, setShiftReport]       = useState(null);
  const [shiftLoading, setShiftLoading]     = useState(false);

  // ─── Fetch đơn hàng ──────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      const res = await orderApi.getAllOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh mỗi 30 giây
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ─── Fetch Báo cáo chốt ca ───────────────────────────────
  const fetchShiftReport = useCallback(async (dateString) => {
    if (!dateString) return;
    setShiftLoading(true);
    try {
      const [yearStr, monthStr, dayStr] = dateString.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);

      const res = await dashboardApi.getShiftClosingReport(year, month);
      const dataForMonth = res.data || [];
      const dataForDay = dataForMonth.find(d => Number(d.day) === day);
      
      if (dataForDay) {
        setShiftReport(dataForDay);
      } else {
        setShiftReport({
          day, vnpayRevenue: 0, codRevenue: 0, cashRevenue: 0, totalRevenue: 0, orders: 0
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi lấy dữ liệu chốt ca");
    } finally {
      setShiftLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showShiftModal) {
      fetchShiftReport(shiftDateStr);
    }
  }, [showShiftModal, shiftDateStr, fetchShiftReport]);

  // ─── Cập nhật trạng thái ─────────────────────────────────
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selected?.id === orderId) setSelected(prev => ({ ...prev, status: newStatus }));
      toast.success(`Cập nhật trạng thái → ${STATUS_CONFIG[newStatus]?.label}`);
    } catch (err) {
      toast.error("Lỗi cập nhật trạng thái!");
    } finally {
      setUpdating(null);
    }
  };

  // ─── Lọc đơn hàng ────────────────────────────────────────
  const filtered = orders.filter(o => {
    const matchFilter = filter === "all" || o.status === filter;
    const matchSearch = !search ||
      String(o.id).includes(search) ||
      (o.recipientName || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.recipientPhone || "").includes(search);
    return matchFilter && matchSearch;
  });

  // ─── Thống kê nhanh ──────────────────────────────────────
  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === "pending").length,
    preparing: orders.filter(o => o.status === "preparing").length,
    ready:     orders.filter(o => o.status === "ready").length,
    complete:  orders.filter(o => o.status === "complete").length,
    revenue:   orders.filter(o => o.status === "complete")
                     .reduce((sum, o) => sum + (o.totalPrice || 0), 0),
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

  const formatTime = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="pos-page">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="pos-header">
        <div>
          <h2 className="pos-title">🖥️ Máy POS – Quản lý Đơn hàng</h2>
          <p className="pos-subtitle">Theo dõi và xử lý đơn hàng real-time</p>
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
          <button type="button" className="pos-refresh-btn" onClick={(e) => { e.preventDefault(); setShowShiftModal(true); }}>
            📊 Chốt Ca
          </button>
          <button type="button" className="pos-refresh-btn" onClick={fetchOrders} disabled={loading}>
            <span className={loading ? "spin" : ""}>↻</span> Làm mới
          </button>
        </div>
      </div>

      {/* ── THỐNG KÊ ───────────────────────────────────────── */}
      <div className="pos-stats">
        <div className="stat-card stat-total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Tổng đơn</div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Chờ xử lý</div>
        </div>
        <div className="stat-card stat-preparing">
          <div className="stat-value">{stats.preparing}</div>
          <div className="stat-label">Đang làm</div>
        </div>
        <div className="stat-card stat-ready">
          <div className="stat-value">{stats.ready}</div>
          <div className="stat-label">Sẵn sàng</div>
        </div>
        <div className="stat-card stat-revenue">
          <div className="stat-value">{formatCurrency(stats.revenue)}</div>
          <div className="stat-label">Doanh thu hoàn thành</div>
        </div>
      </div>

      {/* ── BỘ LỌC + TÌM KIẾM ────────────────────────────── */}
      <div className="pos-controls">
        <div className="pos-filters">
          {ALL_FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-btn ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {f.key !== "all" && (
                <span className="filter-count">
                  {orders.filter(o => o.status === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <input
          className="pos-search"
          type="text"
          placeholder="Tìm theo mã đơn, tên, SĐT..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── DANH SÁCH ĐƠN HÀNG ───────────────────────────── */}
      <div className="pos-layout">
        {/* PANEL TRÁI: Danh sách */}
        <div className="pos-list">
          {loading ? (
            <div className="pos-loading">
              <div className="loading-spinner"></div>
              <p>Đang tải đơn hàng...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="pos-empty">
              <span>📋</span>
              <p>Không có đơn hàng nào</p>
            </div>
          ) : (
            filtered.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const isSelected = selected?.id === order.id;
              const isUpdating = updating === order.id;

              return (
                <div
                  key={order.id}
                  className={`order-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelected(order)}
                >
                  <div className="order-card-header">
                    <span className="order-id">#{order.id}</span>
                    <span
                      className="order-status-badge"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  <div className="order-card-body">
                    <div className="order-customer">
                      <span>👤</span>
                      <strong>{order.recipientName || "Khách hàng"}</strong>
                    </div>
                    {order.recipientPhone && (
                      <div className="order-info-line">
                        <span>📞</span> {order.recipientPhone}
                      </div>
                    )}
                    <div className="order-info-line">
                      <span>🛒</span> {(order.items || []).length} món ·{" "}
                      <strong style={{ color: "#0b6b2d" }}>{formatCurrency(order.totalPrice)}</strong>
                    </div>
                    <div className="order-info-line order-time">
                      <span>🕐</span> {formatTime(order.createdAt)}
                    </div>
                  </div>

                  {/* Nút action nhanh */}
                  {cfg.next && (
                    <button
                      className="order-action-btn"
                      style={{ background: cfg.color }}
                      disabled={isUpdating}
                      onClick={e => {
                        e.stopPropagation();
                        handleUpdateStatus(order.id, cfg.next);
                      }}
                    >
                      {isUpdating ? "⏳ Đang xử lý..." : `✅ ${cfg.nextLabel}`}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* PANEL PHẢI: Chi tiết đơn */}
        <div className="pos-detail">
          {!selected ? (
            <div className="detail-empty">
              <span>👈</span>
              <p>Chọn một đơn hàng để xem chi tiết</p>
            </div>
          ) : (
            <>
              <div className="detail-header">
                <div>
                  <h3>Đơn hàng #{selected.id}</h3>
                  <p className="detail-time">{formatTime(selected.createdAt)}</p>
                </div>
                <button className="detail-close" onClick={() => setSelected(null)}>✕</button>
              </div>

              {/* Trạng thái pipeline */}
              <div className="status-pipeline">
                {["pending","preparing","ready","complete"].map((s, i) => {
                  const stepStatuses = ["pending","preparing","ready","complete"];
                  const currentIndex = stepStatuses.indexOf(selected.status);
                  const stepIndex = stepStatuses.indexOf(s);
                  const isDone   = stepIndex < currentIndex;
                  const isCurrent = stepIndex === currentIndex;
                  return (
                    <div key={s} className={`pipeline-step ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}>
                      <div className="step-dot">{isDone ? "✓" : i + 1}</div>
                      <div className="step-label">{STATUS_CONFIG[s]?.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Thông tin khách */}
              <div className="detail-section">
                <h4>Thông tin khách hàng</h4>
                <div className="detail-row">
                  <span>Họ tên</span>
                  <strong>{selected.recipientName || "—"}</strong>
                </div>
                <div className="detail-row">
                  <span>SĐT</span>
                  <strong>{selected.recipientPhone || "—"}</strong>
                </div>
                {selected.address && (
                  <div className="detail-row">
                    <span>Địa chỉ</span>
                    <strong>{selected.address}</strong>
                  </div>
                )}
                <div className="detail-row">
                  <span>Loại</span>
                  <strong>{selected.orderType === "delivery" ? "🛵 Giao hàng" : "🏠 Tại quán"}</strong>
                </div>
                <div className="detail-row">
                  <span>Thanh toán</span>
                  <strong>{selected.paymentMethod === "vnpay" ? "💳 VNPay" : "💵 Tiền mặt"}</strong>
                </div>
              </div>

              {/* Danh sách món */}
              <div className="detail-section">
                <h4>Các món đã đặt</h4>
                <div className="items-list">
                  {(selected.items || []).map((item, idx) => (
                    <div key={idx} className="item-row">
                      <div className="item-info">
                        <span className="item-name">{item.productName}</span>
                        {item.selectedSize && (
                          <span className="item-size">({item.selectedSize})</span>
                        )}
                        {item.note && <span className="item-note">📝 {item.note}</span>}
                      </div>
                      <div className="item-price-qty">
                        <span className="item-qty">x{item.amount}</span>
                        <span className="item-price">{formatCurrency(item.price * item.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng tiền */}
              <div className="detail-section detail-total">
                {selected.shippingFee > 0 && (
                  <div className="detail-row">
                    <span>Phí giao hàng</span>
                    <strong>{formatCurrency(selected.shippingFee)}</strong>
                  </div>
                )}
                {selected.discountAmount > 0 && (
                  <div className="detail-row" style={{ color: "#10b981" }}>
                    <span>Giảm giá</span>
                    <strong>-{formatCurrency(selected.discountAmount)}</strong>
                  </div>
                )}
                <div className="detail-row total-row">
                  <span>Tổng cộng</span>
                  <strong style={{ color: "#0b6b2d", fontSize: "18px" }}>
                    {formatCurrency(selected.totalPrice)}
                  </strong>
                </div>
              </div>

              {/* Nút cập nhật */}
              {selected.status !== "cancel" && selected.status !== "complete" && (() => {
                const cfg = STATUS_CONFIG[selected.status];
                return cfg.next ? (
                  <button
                    className="detail-update-btn"
                    style={{ background: cfg.color }}
                    disabled={updating === selected.id}
                    onClick={() => handleUpdateStatus(selected.id, cfg.next)}
                  >
                    {updating === selected.id ? "⏳ Đang xử lý..." : `✅ ${cfg.nextLabel}`}
                  </button>
                ) : null;
              })()}

              {/* Ghi chú hủy đơn */}
              {selected.status === "cancel" && selected.cancelReason && (
                <div className="cancel-reason-box">
                  <strong>Lý do hủy:</strong> {selected.cancelReason}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── MODAL CHỐT CA ───────────────────────────────────── */}
      {showShiftModal && (
        <div 
          onClick={() => setShowShiftModal(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999999
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '12px', width: '420px', maxWidth: '90vw',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)', padding: '0',
              overflow: 'hidden', display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>📊 Bảng Chốt Ca Tại Quán</h3>
              <button 
                onClick={() => setShowShiftModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', color: '#94a3b8', cursor: 'pointer' }}
              >✕</button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Chọn ngày đối soát:</label>
                <input 
                  type="date" 
                  value={shiftDateStr} 
                  onChange={e => setShiftDateStr(e.target.value)} 
                  max={new Date().toISOString().split('T')[0]}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>

              {shiftLoading ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                  <div className="loading-spinner" style={{ margin: '0 auto 10px' }}></div>
                  Đang tải...
                </div>
              ) : shiftReport ? (
                <div style={{ background: '#fcfcfd', borderRadius: '8px', padding: '16px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
                    <span>Tổng đơn hàng:</span>
                    <strong style={{ color: '#334155' }}>{shiftReport.orders} đơn</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
                    <span>💵 Tiền mặt (Tại quầy):</span>
                    <strong style={{ color: '#10b981' }}>{formatCurrency(shiftReport.cashRevenue)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
                    <span>🚚 Ship COD (Giao hàng):</span>
                    <strong style={{ color: '#f59e0b' }}>{formatCurrency(shiftReport.codRevenue)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
                    <span>💳 VNPay (Chuyển khoản):</span>
                    <strong style={{ color: '#3b82f6' }}>{formatCurrency(shiftReport.vnpayRevenue)}</strong>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '4px 0' }}/>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                    <span>TỔNG DOANH THU:</span>
                    <strong style={{ color: '#0b6b2d' }}>{formatCurrency(shiftReport.totalRevenue)}</strong>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

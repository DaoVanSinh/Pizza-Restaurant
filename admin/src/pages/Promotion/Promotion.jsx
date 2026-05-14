import { useState, useEffect } from "react";
import { toast } from "sonner";
import { promotionApi } from "../../services/modules/promotion.api";

const STATUS_CONFIG = {
  DRAFT: { label: "Nháp", bg: "#fef3c7", color: "#d97706", icon: "📝" },
  ACTIVE: { label: "Đang chạy", bg: "#d1fae5", color: "#10b981", icon: "✅" },
  PAUSED: { label: "Tạm dừng", bg: "#fed7aa", color: "#ea580c", icon: "⏸️" },
  EXPIRED: { label: "Hết hạn", bg: "#fee2e2", color: "#ef4444", icon: "⏰" },
};

export default function Promotion() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENT",
    discountValue: "",
    maxDiscountAmount: "",
    minOrderValue: "",
    startDate: "",
    endDate: "",
    totalUsageLimit: "",
    limitPerUser: 1,
    status: "DRAFT",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await promotionApi.getPromotions();
      setPromotions(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách voucher!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Bạn có chắc muốn xóa voucher "${code}"?`)) return;
    try {
      await promotionApi.deletePromotion(id);
      setPromotions(promotions.filter((p) => p.id !== id));
      toast.success(`Đã xóa voucher "${code}"`);
    } catch (error) {
      toast.error(error?.response?.data || "Lỗi khi xóa voucher!");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const next = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    const label = next === "PAUSED" ? "tạm dừng" : "kích hoạt";
    try {
      const res = await promotionApi.updateStatus(id, next);
      setPromotions(promotions.map((p) => (p.id === id ? res.data : p)));
      toast.success(`Đã ${label} voucher`);
    } catch (error) {
      toast.error(error?.response?.data || `Lỗi khi ${label} voucher`);
    }
  };

  const handleActivate = async (id) => {
    try {
      const res = await promotionApi.updateStatus(id, "ACTIVE");
      setPromotions(promotions.map((p) => (p.id === id ? res.data : p)));
      toast.success("Đã kích hoạt voucher");
    } catch (error) {
      toast.error(error?.response?.data || "Lỗi khi kích hoạt");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.minOrderValue || !formData.startDate || !formData.endDate) {
      toast.warning("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.warning("Ngày hết hạn phải lớn hơn ngày bắt đầu.");
      return;
    }
    if (formData.discountType === "PERCENT" && Number(formData.discountValue) > 100) {
      toast.warning("Phần trăm giảm không được vượt quá 100%.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        minOrderValue: Number(formData.minOrderValue),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        totalUsageLimit: formData.totalUsageLimit ? Number(formData.totalUsageLimit) : null,
        limitPerUser: Number(formData.limitPerUser) || 1,
        status: formData.status,
      };
      const res = await promotionApi.addPromotion(payload);
      toast.success("Tạo voucher thành công!");
      setPromotions([...promotions, res.data]);
      setShowModal(false);
      setFormData({ code: "", discountType: "PERCENT", discountValue: "", maxDiscountAmount: "", minOrderValue: "", startDate: "", endDate: "", totalUsageLimit: "", limitPerUser: 1, status: "DRAFT" });
    } catch (error) {
      toast.error(error?.response?.data || "Lỗi khi tạo voucher.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = promotions.filter((p) => p.code.toLowerCase().includes(search.toLowerCase()));

  const getStatus = (p) => {
    if (p.status === "PAUSED") return "PAUSED";
    if (p.status === "DRAFT") return "DRAFT";
    if (new Date(p.endDate) < new Date()) return "EXPIRED";
    if (new Date(p.startDate) > new Date()) return "DRAFT";
    return p.status;
  };

  const formatDiscount = (p) => {
    if (p.discountType === "FIXED") return `Giảm ${Number(p.discountValue).toLocaleString()}đ`;
    let text = `Giảm ${Number(p.discountValue)}%`;
    if (p.maxDiscountAmount) text += ` (tối đa ${Number(p.maxDiscountAmount).toLocaleString()}đ)`;
    return text;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  const inputStyle = { width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", outline: "none" };
  const labelStyle = { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#475569" };

  return (
    <div style={{ padding: "20px", background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", background: "#fff", padding: "16px 24px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div>
          <h2 style={{ margin: 0, color: "#1e293b", fontSize: "24px" }}>Quản lý Voucher</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>Tạo và quản lý mã giảm giá cho khách hàng</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <input type="text" placeholder="Tìm theo mã code..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "240px", outline: "none" }} />
          <button onClick={() => setShowModal(true)}
            style={{ padding: "8px 16px", background: "#0b6b2d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
            + Thêm voucher mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Đang tải...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead style={{ background: "#f1f5f9" }}>
              <tr>
                {["ID", "Mã Voucher", "Loại giảm", "Đơn tối thiểu", "Hiệu lực", "Đã dùng", "Per User", "Trạng thái", "Hành động"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "13px", color: "#475569", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const status = getStatus(p);
                const sc = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0", opacity: status === "EXPIRED" ? 0.6 : 1 }}>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#64748b" }}>#{p.id}</td>
                    <td style={{ padding: "12px 14px", fontSize: "15px", fontWeight: "bold", color: "#0f172a" }}>{p.code}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#ef4444", fontWeight: "600" }}>{formatDiscount(p)}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px" }}>{Number(p.minOrderValue).toLocaleString()}đ</td>
                    <td style={{ padding: "12px 14px", fontSize: "12px", color: "#64748b" }}>{formatDate(p.startDate)} → {formatDate(p.endDate)}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: "600" }}>
                      {p.usageCount}/{p.totalUsageLimit || "∞"}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "13px" }}>{p.limitPerUser} lần</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ padding: "4px 10px", background: sc.bg, color: sc.color, borderRadius: "12px", fontSize: "12px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                        {sc.icon} {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {status === "DRAFT" && (
                          <button onClick={() => handleActivate(p.id)}
                            style={{ padding: "5px 10px", background: "#d1fae5", color: "#059669", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                            Kích hoạt
                          </button>
                        )}
                        {(status === "ACTIVE" || status === "PAUSED") && (
                          <button onClick={() => handleToggleStatus(p.id, status)}
                            style={{ padding: "5px 10px", background: status === "ACTIVE" ? "#fed7aa" : "#d1fae5", color: status === "ACTIVE" ? "#ea580c" : "#059669", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                            {status === "ACTIVE" ? "Tạm dừng" : "Tiếp tục"}
                          </button>
                        )}
                        <button onClick={() => handleDelete(p.id, p.code)}
                          style={{ padding: "5px 10px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Chưa có voucher nào</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Create */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", width: "520px", maxHeight: "90vh", borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Tạo Voucher Mới</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "20px", overflowY: "auto", maxHeight: "calc(90vh - 70px)" }}>
              {/* Mã Voucher */}
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Mã Voucher <span style={{ color: "red" }}>*</span></label>
                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VD: GIAM50K, SUMMER20" style={{ ...inputStyle, textTransform: "uppercase" }} required />
              </div>

              {/* Loại giảm + Giá trị */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={labelStyle}>Loại giảm giá <span style={{ color: "red" }}>*</span></label>
                  <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value, maxDiscountAmount: "" })}
                    style={inputStyle}>
                    <option value="PERCENT">Giảm theo %</option>
                    <option value="FIXED">Giảm số tiền cố định</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Giá trị giảm <span style={{ color: "red" }}>*</span></label>
                  <input type="number" value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === "PERCENT" ? "VD: 20 (= 20%)" : "VD: 50000"}
                    min="1" max={formData.discountType === "PERCENT" ? "100" : undefined} style={inputStyle} required />
                </div>
              </div>

              {/* Max Discount (chỉ hiện khi PERCENT) */}
              {formData.discountType === "PERCENT" && (
                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>Giảm tối đa (VNĐ)</label>
                  <input type="number" value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="Để trống = không giới hạn" min="0" style={inputStyle} />
                </div>
              )}

              {/* Min Order */}
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Đơn tối thiểu (VNĐ) <span style={{ color: "red" }}>*</span></label>
                <input type="number" value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                  placeholder="VD: 200000" min="0" style={inputStyle} required />
              </div>

              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={labelStyle}>Ngày bắt đầu <span style={{ color: "red" }}>*</span></label>
                  <input type="datetime-local" value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Ngày hết hạn <span style={{ color: "red" }}>*</span></label>
                  <input type="datetime-local" value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} style={inputStyle} required />
                </div>
              </div>

              {/* Usage Limits */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={labelStyle}>Tổng lượt sử dụng</label>
                  <input type="number" value={formData.totalUsageLimit}
                    onChange={(e) => setFormData({ ...formData, totalUsageLimit: e.target.value })}
                    placeholder="Để trống = không giới hạn" min="1" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Mỗi khách hàng dùng tối đa <span style={{ color: "red" }}>*</span></label>
                  <input type="number" value={formData.limitPerUser}
                    onChange={(e) => setFormData({ ...formData, limitPerUser: e.target.value })}
                    min="1" style={inputStyle} required />
                </div>
              </div>

              {/* Status */}
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Trạng thái ban đầu</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={inputStyle}>
                  <option value="DRAFT">Nháp (chưa khả dụng)</option>
                  <option value="ACTIVE">Kích hoạt ngay</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: "10px 16px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>
                  Hủy
                </button>
                <button type="submit" disabled={submitting}
                  style={{ padding: "10px 16px", background: "#0b6b2d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>
                  {submitting ? "Đang tạo..." : "Tạo voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

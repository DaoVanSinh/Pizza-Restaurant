import { useState, useEffect } from "react";
import { toast } from "sonner";
import { promotionApi } from "../../services/modules/promotion.api";

export default function Promotion() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: 10,
    expiryDate: ""
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
      toast.error("Không thể tải danh sách khuyến mãi!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Bạn có chắc muốn xóa mã khuyến mãi "${code}"?`)) return;
    try {
      await promotionApi.deletePromotion(id);
      setPromotions(promotions.filter(p => p.id !== id));
      toast.success(`Đã xóa mã "${code}"`);
    } catch (error) {
      toast.error(error?.response?.data || "Lỗi khi xóa mã khuyến mãi!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || formData.discountPercent <= 0 || !formData.expiryDate) {
      toast.warning("Vui lòng nhập đầy đủ thông tin mã, % giảm và hạn sử dụng hợp lệ.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        // Convert local datetime-local string to ISO format including timezone info dynamically
        // Since backend expects Timestamp, an ISO 'YYYY-MM-DDTHH:mm:ss.SSSZ' works well if parsed properly,
        // but spring typically expects millis or formatted String.
        // Spring Timestamp easily parses 'YYYY-MM-DDTHH:mm:ss.000Z'
        expiryDate: new Date(formData.expiryDate).toISOString()
      };
      const res = await promotionApi.addPromotion(payload);
      toast.success("Tạo mã khuyến mãi thành công!");
      setPromotions([...promotions, res.data]);
      setShowModal(false);
      setFormData({ code: "", discountPercent: 10, expiryDate: "" });
    } catch (error) {
      toast.error(error?.response?.data || "Lỗi khi tạo mã khuyến mãi.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = promotions.filter(p => p.code.toLowerCase().includes(search.toLowerCase()));

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div style={{ padding: "20px", background: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", background: "#fff", padding: "16px 24px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div>
          <h2 style={{ margin: 0, color: "#1e293b", fontSize: "24px" }}>Quản lý Khuyến mãi</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>Thêm và quản lý mã Voucher giảm giá</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <input
            type="text"
            placeholder="Tìm theo mã code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "240px", outline: "none" }}
          />
          <button 
            onClick={() => setShowModal(true)}
            style={{ padding: "8px 16px", background: "#0b6b2d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", transition: "0.2s" }}
          >
            + Thêm mã mới
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Đang tải...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f1f5f9" }}>
              <tr>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "14px", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>ID</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "14px", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Mã Voucher</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "14px", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Giảm (%)</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "14px", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Ngày Tặng</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "14px", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Ngày Hết Hạn</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "14px", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Trạng thái</th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "14px", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const expired = isExpired(p.expiryDate);
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0", background: expired ? "#f8fafc" : "#fff", opacity: expired ? 0.7 : 1 }}>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#64748b" }}>#{p.id}</td>
                    <td style={{ padding: "12px 16px", fontSize: "15px", fontWeight: "bold", color: "#0f172a" }}>{p.code}</td>
                    <td style={{ padding: "12px 16px", fontSize: "15px", color: "#ef4444", fontWeight: "600" }}>-{p.discountPercent}%</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#64748b" }}>{new Date(p.createdAt).toLocaleDateString() || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: expired ? "#ef4444" : "#10b981" }}>
                      {new Date(p.expiryDate).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {expired ? (
                        <span style={{ padding: "4px 8px", background: "#fee2e2", color: "#ef4444", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>Hết hạn</span>
                      ) : (
                        <span style={{ padding: "4px 8px", background: "#d1fae5", color: "#10b981", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>Đang áp dụng</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button 
                        onClick={() => handleDelete(p.id, p.code)}
                        style={{ padding: "6px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "4px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "0.2s" }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Chưa có mã khuyến mãi nào</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", width: "400px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Tạo Mã Khuyến Mãi</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" }}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#475569" }}>Mã Voucher <span style={{color:"red"}}>*</span></label>
                <input 
                  type="text" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="Ví dụ: TET2026, SUMMER20"
                  style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", outline: "none", textTransform: "uppercase" }}
                  required 
                />
              </div>
              
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#475569" }}>Phần trăm giảm (%) <span style={{color:"red"}}>*</span></label>
                <input 
                  type="number" 
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({...formData, discountPercent: Number(e.target.value)})}
                  min="1" max="100"
                  style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", outline: "none" }}
                  required 
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#475569" }}>Ngày hết hạn <span style={{color:"red"}}>*</span></label>
                <input 
                  type="datetime-local" 
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", outline: "none" }}
                  required 
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ padding: "10px 16px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{ padding: "10px 16px", background: "#0b6b2d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}
                >
                  {submitting ? "Đang tạo..." : "Lưu mã"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

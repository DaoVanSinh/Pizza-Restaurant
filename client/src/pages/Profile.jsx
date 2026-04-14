import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { userApi } from "../services/modules/user.api";
import { orderApi } from "../services/modules/order.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  User, Mail, Phone, Camera, Loader2, LogOut,
  ShoppingBag, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle,
  Package, MapPin, Truck, CreditCard, CalendarDays, ChefHat,
  PackageCheck, Banknote, AlertCircle
} from "lucide-react";
import { getImg } from "../lib/utils";

// ── Status configs ─────────────────────────────────────────────────────────────
const ORDER_STATUS = {
  pending:   { label: "Chờ xử lý",     icon: Clock,        color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200",   step: 0 },
  preparing: { label: "Đang chế biến", icon: ChefHat,      color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200",    step: 1 },
  ready:     { label: "Đã xong",        icon: PackageCheck, color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200",  step: 2 },
  complete:  { label: "Hoàn thành",    icon: CheckCircle,  color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", step: 3 },
  cancel:    { label: "Đã huỷ",        icon: XCircle,      color: "text-red-500",     bg: "bg-red-50",     border: "border-red-200",     step: -1 },
};

const PAYMENT_STATUS = {
  pending: { label: "Chưa thanh toán",  icon: AlertCircle,    color: "text-orange-600", bg: "bg-orange-50",  border: "border-orange-200" },
  success: { label: "Đã thanh toán",    icon: CheckCircle,    color: "text-emerald-600",bg: "bg-emerald-50", border: "border-emerald-200" },
  cancel:  { label: "Thanh toán bị hủy",icon: XCircle,        color: "text-red-500",    bg: "bg-red-50",     border: "border-red-200" },
};

const PAYMENT_METHOD_LABEL = { cod: "Tiền mặt (COD)", vnpay: "VNPay" };

const formatPrice = (n) => Number(n).toLocaleString("vi-VN") + "₫";
const formatDate  = (ts) =>
  ts ? new Date(ts).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—";

// ── Timeline Steps ─────────────────────────────────────────────────────────────
const TIMELINE_STEPS = ["pending", "preparing", "ready", "complete"];

function OrderTimeline({ status, cancelReason }) {
  if (status === "cancel") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-red-500 text-xs font-medium py-1">
          <XCircle className="w-4 h-4" /> Đơn hàng đã bị huỷ
        </div>
        {cancelReason && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-600">Lý do huỷ</p>
              <p className="text-xs text-red-700 mt-0.5">{cancelReason}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
  const currentStep = ORDER_STATUS[status]?.step ?? 0;
  return (
    <div className="flex items-center gap-0 w-full">
      {TIMELINE_STEPS.map((s, idx) => {
        const cfg = ORDER_STATUS[s];
        const Icon = cfg.icon;
        const done = currentStep > idx;
        const active = currentStep === idx;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                done    ? "bg-emerald-500 border-emerald-500 text-white" :
                active  ? `${cfg.bg} ${cfg.border} ${cfg.color} border-2` :
                          "bg-slate-100 border-slate-200 text-slate-300"
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                done ? "text-emerald-600" : active ? cfg.color : "text-slate-400"
              }`}>
                {cfg.label}
              </span>
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 rounded mb-4 ${
                currentStep > idx ? "bg-emerald-400" : "bg-slate-200"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Payment Status Banner ──────────────────────────────────────────────────────
function PaymentStatusBanner({ paymentMethod, paymentStatus }) {
  const pCfg = PAYMENT_STATUS[paymentStatus] || PAYMENT_STATUS.pending;
  const Icon = pCfg.icon;
  const isVNPay = paymentMethod === "vnpay";

  return (
    <div className={`flex items-center gap-3 rounded-xl p-3 border ${pCfg.bg} ${pCfg.border}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${pCfg.bg}`}>
        {isVNPay
          ? <CreditCard className={`w-4 h-4 ${pCfg.color}`} />
          : <Banknote className={`w-4 h-4 ${pCfg.color}`} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold ${pCfg.color}`}>{pCfg.label}</p>
        <p className="text-xs text-slate-500">
          {PAYMENT_METHOD_LABEL[paymentMethod] || paymentMethod || "—"}
          {paymentStatus === "pending" && paymentMethod === "cod" && (
            <span className="ml-1 text-orange-500">· Chờ admin xác nhận thu tiền</span>
          )}
        </p>
      </div>
      <Icon className={`w-4 h-4 shrink-0 ${pCfg.color}`} />
    </div>
  );
}

// ── Order Status Badge (compact) ──────────────────────────────────────────────
function OrderStatusBadge({ status }) {
  const cfg = ORDER_STATUS[status] || ORDER_STATUS.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

// ── OrderCard ─────────────────────────────────────────────────────────────────
function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const cfg = ORDER_STATUS[order.status] || ORDER_STATUS.pending;

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${open ? "shadow-md" : "shadow-sm hover:shadow-md"}`}>
      {/* Header row */}
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 bg-white hover:bg-slate-50/70 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
            <ShoppingBag className={`w-4 h-4 ${cfg.color}`} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm">Đơn #{order.id}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <CalendarDays className="w-3 h-3" /> {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-slate-900">{formatPrice(order.totalPrice)}</p>
            <p className="text-xs text-slate-400">{order.items?.length || 0} món</p>
          </div>
          <OrderStatusBadge status={order.status} />
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Detail panel */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5 space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">

          {/* Timeline */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Tiến trình đơn hàng</p>
            <OrderTimeline status={order.status} cancelReason={order.cancelReason} />
          </div>

          {/* Payment status */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Trạng thái thanh toán</p>
            <PaymentStatusBanner paymentMethod={order.paymentMethod} paymentStatus={order.paymentStatus} />
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2 text-slate-600">
              <Truck className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
              <span>
                <span className="font-medium text-slate-700">Hình thức: </span>
                {order.orderType === "PICKUP" ? "Đến lấy" : "Giao hàng"}
              </span>
            </div>
            {order.address && (
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                <span><span className="font-medium text-slate-700">Địa chỉ: </span>{order.address}</span>
              </div>
            )}
            {order.note && (
              <div className="flex items-start gap-2 text-slate-600 col-span-full">
                <Package className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                <span><span className="font-medium text-slate-700">Ghi chú: </span>{order.note}</span>
              </div>
            )}
          </div>

          {/* Items list */}
          {order.items && order.items.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Sản phẩm</p>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
                    {item.productImage ? (
                      <img
                        src={getImg(item.productImage)}
                        alt={item.productName}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{item.productName}</p>
                      <p className="text-xs text-slate-400">
                        x{item.amount}
                        {item.selectedSize && <span className="ml-2 bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Size {item.selectedSize}</span>}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 shrink-0">{formatPrice(item.price * item.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price summary */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-50">
              {Number(order.shippingFee) > 0 && (
                <div className="flex justify-between px-4 py-2.5 text-sm text-slate-500">
                  <span>Phí giao hàng</span>
                  <span>{formatPrice(order.shippingFee)}</span>
                </div>
              )}
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between px-4 py-2.5 text-sm text-emerald-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-3 font-bold text-slate-900">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Profile Component ─────────────────────────────────────────────────────
export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState({ fullName: "", email: "", phone: "", address: "", avatarUrl: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!user) return;
    setProfile({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      avatarUrl: user.avatarUrl || "",
    });
    if (user.avatarUrl) setImagePreview(getImg(user.avatarUrl));

    userApi.getUserProfile()
      .then(res => {
        const p = res.data;
        setProfile(prev => ({
          ...prev,
          fullName: p.fullName || prev.fullName,
          address: p.address || prev.address,
          phone: p.user?.phone || prev.phone,
          email: p.user?.email || prev.email,
        }));
        if (p.avatar) setImagePreview(getImg(p.avatar));
      })
      .catch(err => console.error("Profile fetch error", err));

    setOrdersLoading(true);
    orderApi.getMyOrders()
      .then(res => setOrders(res.data || []))
      .catch(err => console.error("Orders fetch error", err))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await userApi.updateProfile({ fullName: profile.fullName, address: profile.address, user: { phone: profile.phone } });
      updateUser({ fullName: profile.fullName, address: profile.address, phone: profile.phone });
      toast.success("Cập nhật thông tin thành công!");
    } catch {
      toast.error("Lỗi cập nhật thông tin!");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB."); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUploadAvatar = async () => {
    if (!imageFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const res = await userApi.uploadAvatar(formData);
      updateUser({ avatarUrl: res.data.avatar });
      toast.success("Cập nhật ảnh đại diện thành công!");
      setImageFile(null);
    } catch {
      toast.error("Lỗi khi tải ảnh lên!");
    } finally {
      setUploading(false);
    }
  };

  // Filter tabs
  const FILTER_TABS = [
    { val: "all",      label: "Tất cả" },
    { val: "pending",  label: "Chờ xử lý" },
    { val: "preparing",label: "Đang chế biến" },
    { val: "ready",    label: "Đã xong" },
    { val: "complete", label: "Hoàn thành" },
    { val: "cancel",   label: "Đã huỷ" },
  ];

  const filteredOrders = filterStatus === "all"
    ? orders
    : orders.filter(o => o.status === filterStatus);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground text-lg text-center">Vui lòng đăng nhập để xem thông tin cá nhân.</p>
        <Button onClick={() => window.location.href = '/login'}>Đăng nhập ngay</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative">
          <div className="w-36 h-36 rounded-full border-4 border-slate-50 overflow-hidden bg-slate-100 flex items-center justify-center shadow-inner">
            {imagePreview
              ? <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover" />
              : <User className="w-16 h-16 text-slate-300" />
            }
          </div>
          <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/90 transition-all border-4 border-white">
            <Camera className="w-4 h-4" />
            <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
          </label>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{profile.fullName || "Người dùng Pizza"}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full"><Mail className="w-4 h-4" />{profile.email || "Chưa cập nhật"}</span>
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full"><Phone className="w-4 h-4" />{profile.phone || "Chưa cập nhật"}</span>
            <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
              <ShoppingBag className="w-4 h-4" />{orders.length} đơn hàng
            </span>
          </div>
          {imageFile && (
            <div className="mt-3">
              <Button onClick={handleUploadAvatar} disabled={uploading} className="gap-2 bg-green-600 hover:bg-green-700">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác nhận đổi ảnh"}
              </Button>
            </div>
          )}
        </div>

        <Button variant="outline" className="text-red-500 border-red-100 hover:bg-red-50 shrink-0" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
        </Button>
      </div>

      {/* Body: 2-col */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left: Personal info */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Thông tin cá nhân
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-600">Họ và tên</Label>
              <Input value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })} placeholder="Nhập họ và tên" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600">Email</Label>
              <Input value={profile.email} readOnly className="bg-slate-50/50 border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600">Số điện thoại</Label>
              <Input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="Nhập số điện thoại" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600">Địa chỉ *</Label>
              <Input value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder="Nhập địa chỉ nhận hàng" />
            </div>
            <div className="pt-2">
              <Button onClick={handleUpdateProfile} disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Cập nhật thông tin
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Order history */}
        <div className="lg:col-span-3 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" /> Lịch sử đơn hàng
            </h3>
            {/* Filter tabs — scrollable on mobile */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 text-xs overflow-x-auto max-w-full">
              {FILTER_TABS.map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setFilterStatus(val)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                    filterStatus === val
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {label}
                  {val !== "all" && (
                    <span className={`ml-1 text-[10px] px-1 py-0.5 rounded-full ${
                      filterStatus === val ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-500"
                    }`}>
                      {orders.filter(o => o.status === val).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Đang tải đơn hàng...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-500">
                {filterStatus === "all" ? "Bạn chưa có đơn hàng nào" : "Không có đơn hàng phù hợp"}
              </p>
              {filterStatus === "all" && (
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/"}>
                  Đặt hàng ngay
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

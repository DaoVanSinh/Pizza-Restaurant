import { useState } from "react";
import { useAdminOrders } from "../hooks/useAdminOrders";
import { orderApi } from "../services/modules/order.api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye, CheckCircle2, XCircle, Clock, ChefHat, PackageCheck,
  CreditCard, Banknote, ShieldCheck, AlertTriangle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { label: "Tất cả",        value: "" },
  { label: "Chờ xử lý",    value: "pending" },
  { label: "Đang chế biến",value: "preparing" },
  { label: "Đã xong",       value: "ready" },
  { label: "Hoàn thành",   value: "complete" },
  { label: "Đã huỷ",       value: "cancel" },
];

const ORDER_STATUS = {
  pending:   { label: "Chờ xử lý",     cls: "bg-amber-100 text-amber-700 border-amber-200",    icon: Clock },
  preparing: { label: "Đang chế biến", cls: "bg-blue-100 text-blue-700 border-blue-200",       icon: ChefHat },
  ready:     { label: "Đã xong",        cls: "bg-violet-100 text-violet-700 border-violet-200", icon: PackageCheck },
  complete:  { label: "Hoàn thành",    cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  cancel:    { label: "Đã huỷ",        cls: "bg-red-100 text-red-700 border-red-200",           icon: XCircle },
};

const PAYMENT_STATUS = {
  pending: { label: "Chưa thanh toán", cls: "bg-orange-100 text-orange-700 border-orange-200" },
  success: { label: "Đã thanh toán",   cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancel:  { label: "Đã huỷ TT",       cls: "bg-red-100 text-red-700 border-red-200" },
};

// Workflow: pressing "Chuyển" moves to next status
const NEXT_STATUS = {
  pending:   "preparing",
  preparing: "ready",
  ready:     "complete",
};

const formatPrice = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";
const formatDate  = (ts) =>
  ts ? new Date(ts).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—";

// ── Badges ────────────────────────────────────────────────────────────────────
function OrderStatusBadge({ status }) {
  const cfg = ORDER_STATUS[status] || ORDER_STATUS.pending;
  const Icon = cfg.icon;
  return (
    <Badge className={`border text-xs gap-1 ${cfg.cls}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </Badge>
  );
}

function PaymentBadge({ method, paymentStatus }) {
  const pCfg = PAYMENT_STATUS[paymentStatus] || PAYMENT_STATUS.pending;
  const isVNPay = method === "vnpay";
  return (
    <div className="flex flex-col gap-1">
      <Badge className={`border text-xs gap-1 w-fit ${isVNPay
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : "bg-slate-100 text-slate-600 border-slate-200"}`
      }>
        {isVNPay
          ? <><CreditCard className="w-3 h-3" /> VNPay</>
          : <><Banknote className="w-3 h-3" /> Tiền mặt</>
        }
      </Badge>
      <Badge className={`border text-xs w-fit ${pCfg.cls}`}>
        {pCfg.label}
      </Badge>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Orders() {
  const [activeTab, setActiveTab] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(null); // order to cancel
  const [cancelReason, setCancelReason] = useState("");

  const { orders, isLoading, mutate } = useAdminOrders();

  const handleUpdateStatus = async (orderId, newStatus, cancelReason) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus, cancelReason);
      toast.success(`Chuyển trạng thái → "${ORDER_STATUS[newStatus]?.label || newStatus}" thành công!`);
      mutate();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch {
      toast.error("Lỗi cập nhật trạng thái!");
    }
  };

  const handleConfirmCodPayment = async (orderId) => {
    try {
      await orderApi.confirmCodPayment(orderId);
      toast.success("Xác nhận thu tiền mặt thành công!");
      mutate();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, paymentStatus: "success" }));
      }
    } catch {
      toast.error("Lỗi xác nhận thanh toán!");
    }
  };

  // Mở dialog nhập lý do — không hủy ngay
  const handleCancel = (order) => {
    setCancelReason("");
    setCancelDialog(order);
  };

  // Thực sự gửi hủy sau khi có lý do
  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn!");
      return;
    }
    const orderId = cancelDialog.id;
    await handleUpdateStatus(orderId, "cancel", cancelReason.trim());
    setCancelDialog(null);
    if (selectedOrder?.id === orderId) setSelectedOrder(null);
  };

  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.value] = tab.value === ""
      ? orders.length
      : orders.filter(o => o.status === tab.value).length;
    return acc;
  }, {});

  const filteredOrders = activeTab
    ? orders.filter(o => o.status === activeTab)
    : orders;

  // Backend now returns flat DTO — paymentMethod and paymentStatus are top-level fields
  const getPaymentInfo = (order) => ({
    method: order.paymentMethod || "cod",
    status: order.paymentStatus || "pending",
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Xử Lý Đơn Hàng</h2>
        <p className="text-muted-foreground mt-1">Quản lý tiến độ chế biến và thanh toán.</p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map(tab => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? "default" : "outline"}
            className="rounded-full gap-2"
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
            <Badge
              variant="secondary"
              className={`rounded-full px-1.5 min-w-5 justify-center ${
                activeTab === tab.value ? "bg-white/20 text-white" : ""
              }`}
            >
              {counts[tab.value] || 0}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50 border-b">
              <TableRow>
                <TableHead className="w-24 text-center font-bold">Mã Đơn</TableHead>
                <TableHead className="font-bold">Khách hàng</TableHead>
                <TableHead className="font-bold">Tổng tiền</TableHead>
                <TableHead className="font-bold">Thanh toán</TableHead>
                <TableHead className="font-bold">Ngày đặt</TableHead>
                <TableHead className="font-bold">Trạng thái đơn</TableHead>
                <TableHead className="text-right font-bold">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground animate-pulse">
                    Đang tải danh sách đơn hàng...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    Không có đơn hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map(order => {
                  const { method, status: pStatus } = getPaymentInfo(order);
                  return (
                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-center">
                        <span className="font-bold text-primary">#{order.id}</span>
                        {order.orderType === "PICKUP" && (
                          <Badge className="block mt-1 bg-blue-100 text-blue-700 hover:bg-blue-200 text-[10px]">
                            Đến lấy
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold">{order.recipientName || "—"}</div>
                        <div className="text-xs text-muted-foreground">{order.recipientPhone || "—"}</div>
                      </TableCell>

                      <TableCell className="font-bold text-destructive">
                        {formatPrice(order.totalPrice)}
                      </TableCell>

                      <TableCell>
                        <PaymentBadge method={method} paymentStatus={pStatus} />
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(order.createdAt || order.orderDate)}
                      </TableCell>

                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end flex-wrap gap-1.5">
                          <Button
                            variant="outline" size="sm"
                            onClick={() => setSelectedOrder({ ...order, paymentMethod: method, paymentStatus: pStatus })}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Xem
                          </Button>

                          {/* COD confirm payment — ẩn khi đơn đã hủy */}
                          {method === "cod" && pStatus === "pending" && order.status !== "cancel" && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleConfirmCodPayment(order.id)}
                            >
                              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Thu tiền
                            </Button>
                          )}

                          {/* Next status button */}
                          {NEXT_STATUS[order.status] && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, NEXT_STATUS[order.status])}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              {ORDER_STATUS[NEXT_STATUS[order.status]]?.label}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Detail Modal ── */}
      <Dialog open={!!selectedOrder} onOpenChange={open => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pr-6">
              <span>Đơn Hàng #{selectedOrder?.id}</span>
              {selectedOrder && <OrderStatusBadge status={selectedOrder.status} />}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
              {/* Payment status banner */}
              <div className={`rounded-xl p-4 flex items-center gap-3 border ${
                selectedOrder.paymentStatus === "success"
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-orange-50 border-orange-200"
              }`}>
                {selectedOrder.paymentStatus === "success"
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  : <Clock className="w-5 h-5 text-orange-500 shrink-0" />
                }
                <div>
                  <p className={`font-semibold text-sm ${
                    selectedOrder.paymentStatus === "success" ? "text-emerald-700" : "text-orange-700"
                  }`}>
                    {selectedOrder.paymentStatus === "success" ? "Đã thanh toán" : "Chưa thanh toán"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedOrder.paymentMethod === "vnpay" ? "VNPay" : "Tiền mặt (COD)"}
                  </p>
                </div>
                {selectedOrder.paymentMethod === "cod" && selectedOrder.paymentStatus !== "success" && selectedOrder.status !== "cancel" && (
                  <Button
                    size="sm"
                    className="ml-auto bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleConfirmCodPayment(selectedOrder.id)}
                  >
                    <ShieldCheck className="w-4 h-4 mr-1" /> Xác nhận thu tiền
                  </Button>
                )}
              </div>

              {/* Order info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/30 rounded-xl p-3">
                  <p className="text-muted-foreground text-xs mb-1">Người nhận</p>
                  <p className="font-semibold">{selectedOrder.recipientName || "—"}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-3">
                  <p className="text-muted-foreground text-xs mb-1">Số điện thoại</p>
                  <p className="font-semibold">{selectedOrder.recipientPhone || "—"}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-3 col-span-2">
                  <p className="text-muted-foreground text-xs mb-1">
                    {selectedOrder.orderType === "PICKUP" ? "Hình thức" : "Địa chỉ"}
                  </p>
                  <p className="font-semibold">
                    {selectedOrder.orderType === "PICKUP"
                      ? <span className="text-blue-600">Đến lấy tại cửa hàng</span>
                      : selectedOrder.address || "—"
                    }
                  </p>
                </div>
                {selectedOrder.note && (
                  <div className="bg-amber-50 rounded-xl p-3 col-span-2 border border-amber-100">
                    <p className="text-amber-600 text-xs mb-1 font-medium">Ghi chú</p>
                    <p className="text-amber-800 text-sm">{selectedOrder.note}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <p className="font-semibold text-sm mb-2">Sản phẩm đặt mua</p>
                  <div className="border rounded-xl divide-y overflow-hidden">
                    {selectedOrder.items.map((item, idx) => {
                      const qty = item.amount || item.quantity || 1;
                      const price = item.price || 0;
                      const name = item.product?.name || item.productName || `Sản phẩm #${item.productId || idx}`;
                      return (
                        <div key={idx} className="flex justify-between items-center p-3 hover:bg-muted/20">
                          <div>
                            <p className="font-medium text-sm">{name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.selectedSize && <span className="mr-2">Size: {item.selectedSize}</span>}
                              SL: x{qty}
                            </p>
                            {item.note && <p className="text-xs text-destructive italic mt-0.5">"{item.note}"</p>}
                          </div>
                          <p className="font-bold text-sm">{formatPrice(price * qty)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                {Number(selectedOrder.shippingFee) > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Phí giao hàng</span>
                    <span>{formatPrice(selectedOrder.shippingFee)}</span>
                  </div>
                )}
                {Number(selectedOrder.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Tổng hóa đơn</span>
                  <span className="text-destructive">{formatPrice(selectedOrder.totalPrice)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-4 border-t flex-wrap">
            {selectedOrder && NEXT_STATUS[selectedOrder.status] && (
              <Button
                onClick={() => handleUpdateStatus(selectedOrder.id, NEXT_STATUS[selectedOrder.status])}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Chuyển: {ORDER_STATUS[NEXT_STATUS[selectedOrder.status]]?.label}
              </Button>
            )}
            {selectedOrder?.status !== "cancel" && selectedOrder?.status !== "complete" && (
              <Button
                variant="outline"
                onClick={() => handleCancel(selectedOrder)}
                className="border-destructive text-destructive hover:bg-destructive/10 gap-2"
              >
                <XCircle className="w-4 h-4" /> Huỷ Đơn
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Cancel Reason Dialog ── */}
      <Dialog open={!!cancelDialog} onOpenChange={open => !open && setCancelDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Xác nhận huỷ đơn #{cancelDialog?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Hành động này không thể hoàn tác. Lý do huỷ sẽ được thông báo đến khách hàng.
            </p>

            {/* Quick reason shortcuts */}
            <div className="flex flex-wrap gap-2">
              {["Hết nguyên liệu", "Khách yêu cầu huỷ", "Địa chỉ không hợp lệ", "Cửa hàng đóng cửa"].map(r => (
                <button
                  key={r}
                  onClick={() => setCancelReason(r)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    cancelReason === r
                      ? "bg-destructive/10 border-destructive text-destructive"
                      : "border-slate-200 text-slate-500 hover:border-slate-400"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Lý do huỷ <span className="text-destructive">*</span></label>
              <Textarea
                placeholder="Nhập lý do huỷ đơn hàng..."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelDialog(null)}>Quay lại</Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={!cancelReason.trim()}
            >
              <XCircle className="w-4 h-4 mr-1" /> Xác nhận huỷ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

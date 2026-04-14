import { useState, useEffect } from "react";
import { dashboardApi } from "../services/modules/dashboard.api";
import { orderApi } from "../services/modules/order.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, Users, Package, TrendingUp, ShoppingBag,
  CheckCircle2, Clock, ChefHat, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const formatPrice = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";
const formatDate = (ts) =>
  ts ? new Date(ts).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—";

const ORDER_STATUS = {
  pending:   { label: "Chờ xử lý",     cls: "bg-amber-100 text-amber-700 border-amber-200" },
  preparing: { label: "Đang chế biến", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  ready:     { label: "Đã xong",        cls: "bg-violet-100 text-violet-700 border-violet-200" },
  complete:  { label: "Hoàn thành",    cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancel:    { label: "Đã huỷ",        cls: "bg-red-100 text-red-700 border-red-200" },
};

export default function Dashboard() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    // Hàm gọi API lấy thống kê có tự động thử lại (retry)
    const fetchStats = async (retries = 3) => {
      try {
        const res = await dashboardApi.getStats();
        setStats(res.data);
      } catch (err) {
        if (err.code === "ERR_NETWORK" && retries > 0) {
          console.warn(`[Network Error] Backend chưa sẵn sàng, thử lại sau 3s... (Còn ${retries} lần)`);
          setTimeout(() => fetchStats(retries - 1), 3000);
        } else {
          console.error("Stats error:", err);
        }
      }
    };

    fetchStats();

    // Hàm gọi API đơn hàng
    orderApi.getAllOrders()
      .then(res => setRecentOrders((res.data || []).slice(0, 8)))
      .catch(err => {
        // Nếu lỗi 401 (Chưa đăng nhập) thì bỏ qua vì AuthGuard sẽ lo việc chuyển trang
        if (err.response?.status === 401) {
          console.warn("Chưa có JWT Token, backend chặn cấu hình lấy Order (401)");
        } else {
          console.error("Orders error:", err);
        }
      })
      .finally(() => setLoadingOrders(false));
  }, []);

  const statCards = [
    {
      label: "Doanh thu",
      value: formatPrice(stats.revenue),
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-600",
      sub: "Tổng đơn hoàn thành",
    },
    {
      label: "Đơn hoàn thành",
      value: stats.orders || 0,
      icon: CheckCircle2,
      gradient: "from-blue-500 to-indigo-600",
      sub: "Đơn đã giao thành công",
    },
    {
      label: "Khách hàng",
      value: stats.customers || 0,
      icon: Users,
      gradient: "from-orange-500 to-amber-600",
      sub: "Tài khoản đã đăng ký",
    },
    {
      label: "Sản phẩm",
      value: stats.products || 0,
      icon: Package,
      gradient: "from-purple-500 to-violet-600",
      sub: "Đang bán trên hệ thống",
    },
  ];

  const statusBadge = (status) => {
    const cfg = ORDER_STATUS[status] || ORDER_STATUS.pending;
    return <Badge className={`border text-xs ${cfg.cls}`}>{cfg.label}</Badge>;
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Tổng Quan</h2>
        <p className="text-muted-foreground mt-1">Chào mừng trở lại! Đây là tình hình hôm nay.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-0 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-br ${card.gradient} p-5 text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/75 text-sm font-medium">{card.label}</p>
                      <p className="text-3xl font-extrabold mt-1 tracking-tight">{card.value}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-white/60 text-xs mt-3">{card.sub}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Table — span 2 cols */}
        <Card className="xl:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" /> Đơn hàng gần đây
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">8 đơn mới nhất</p>
            </div>
            <Link
              to="/orders"
              className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 border-t">
            {loadingOrders ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm animate-pulse">
                Đang tải...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                Chưa có đơn hàng nào.
              </div>
            ) : (
              <div className="divide-y">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        Đơn #{order.id}
                        {order.orderType === "PICKUP" && (
                          <span className="ml-2 text-xs text-blue-600 font-normal">(Đến lấy)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.recipientName || "—"} · {formatDate(order.createdAt || order.orderDate)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-foreground">{formatPrice(order.totalPrice)}</p>
                      <div className="mt-0.5">{statusBadge(order.status)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Trạng thái hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Chờ xử lý",     icon: Clock,        cls: "bg-amber-100 text-amber-600",    status: "pending" },
                { label: "Đang chế biến", icon: ChefHat,      cls: "bg-blue-100 text-blue-600",      status: "preparing" },
                { label: "Đã xong",        icon: CheckCircle2, cls: "bg-violet-100 text-violet-600",  status: "ready" },
                { label: "Hoàn thành",    icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-600", status: "complete" },
              ].map(({ label, icon: Icon, cls, status }) => {
                const count = recentOrders.filter(o => o.status === status).length;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cls} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-muted-foreground flex-1">{label}</span>
                    <span className="font-bold text-sm">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span className="font-bold text-primary">Quản lý nhanh</span>
              </div>
              <div className="space-y-2">
                <Link
                  to="/orders"
                  className="block w-full text-center py-2 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Xử lý đơn hàng
                </Link>
                <Link
                  to="/transactions"
                  className="block w-full text-center py-2 px-4 rounded-lg border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
                >
                  Xem giao dịch
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
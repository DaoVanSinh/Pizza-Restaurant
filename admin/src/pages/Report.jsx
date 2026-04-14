import { useState, useEffect, useCallback } from "react";
import { dashboardApi } from "../services/modules/dashboard.api";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, DollarSign, ShoppingBag, Users, Package,
  CreditCard, Banknote, ChefHat, BarChart2, CalendarDays,
  ArrowUpRight, Award, ImageOff
} from "lucide-react";
import { getImg } from "../lib/utils";


// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt  = (n) => Number(n || 0).toLocaleString("vi-VN");
const fmtM = (n) => {
  const v = Number(n || 0);
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + "B";
  if (v >= 1_000_000)     return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000)         return (v / 1_000).toFixed(0) + "K";
  return v.toString();
};
const CURRENT_YEAR  = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];
const MONTHS = [
  "Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
  "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12",
];

// ── Pie label ─────────────────────────────────────────────────────────────────
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, gradient, suffix = "" }) {
  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
      <CardContent className="p-0">
        <div className={`bg-gradient-to-br ${gradient} p-5`}>
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">{label}</p>
              <p className="text-2xl md:text-3xl font-black text-white mt-1 tracking-tight truncate">
                {value}{suffix}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 ml-3">
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
          {sub && (
            <p className="text-white/55 text-xs mt-3 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> {sub}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Tooltip tùy chỉnh ──────────────────────────────────────────────────────────
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white rounded-xl shadow-xl px-4 py-3 text-sm">
      <p className="font-bold mb-1.5 text-slate-200">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-bold">
            {p.dataKey === "orders" ? p.value + " đơn" : fmt(p.value) + "đ"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Reports() {
  const [stats,        setStats]        = useState({});
  const [chartMode,    setChartMode]    = useState("monthly"); // monthly | daily
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth,setSelectedMonth]= useState(CURRENT_MONTH);
  const [chartData,    setChartData]    = useState([]);
  const [topProducts,  setTopProducts]  = useState([]);
  const [paymentData,  setPaymentData]  = useState([]);
  const [statusData,   setStatusData]   = useState([]);
  const [loading,      setLoading]      = useState(true);

  // Màu PieChart
  const PIE_COLORS_PAYMENT = ["#6366f1", "#10b981"];
  const STATUS_META = {
    pending:   { label: "Chờ xử lý",     color: "#f59e0b" },
    preparing: { label: "Đang chế biến", color: "#3b82f6" },
    ready:     { label: "Đã xong",        color: "#8b5cf6" },
    complete:  { label: "Hoàn thành",    color: "#10b981" },
    cancel:    { label: "Đã huỷ",        color: "#ef4444" },
  };

  // Fetch tổng quan + top products + payment + status
  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getTopProducts(10),
      dashboardApi.getPaymentAnalysis(),
      dashboardApi.getOrderStatusDist(),
    ]).then(([statsRes, topRes, payRes, statusRes]) => {
      setStats(statsRes.data || {});
      setTopProducts(topRes.data || []);
      setPaymentData((payRes.data || []).map(d => ({
        ...d,
        label: d.method === "vnpay" ? "VNPay" : "Tiền mặt",
      })));
      setStatusData((statusRes.data || []).map(d => ({
        ...d,
        label: STATUS_META[d.status]?.label || d.status,
        color: STATUS_META[d.status]?.color || "#94a3b8",
      })));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Fetch chart data theo mode
  const fetchChart = useCallback(() => {
    const req = chartMode === "monthly"
      ? dashboardApi.getMonthlyRevenue(selectedYear)
      : dashboardApi.getDailyRevenue(selectedYear, selectedMonth);
    req.then(res => setChartData(res.data || [])).catch(console.error);
  }, [chartMode, selectedYear, selectedMonth]);

  useEffect(() => { fetchChart(); }, [fetchChart]);

  const chartKey = chartMode === "monthly" ? "month" : "day";
  const totalChartRevenue = chartData.reduce((s, d) => s + Number(d.revenue || 0), 0);

  // Top product max for progress bar
  const maxQty = topProducts[0]?.totalQty || 1;

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Báo Cáo & Thống Kê</h2>
          <p className="text-slate-500 mt-1 text-sm">Theo dõi hiệu suất kinh doanh của cửa hàng.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <CalendarDays className="w-4 h-4" />
          Cập nhật theo thời gian thực
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Tổng doanh thu"    value={fmtM(stats.revenue)}    suffix="đ" icon={DollarSign}  gradient="from-emerald-500 to-green-600"   sub="Đơn đã hoàn thành" />
          <KpiCard label="Đơn hoàn thành"    value={fmt(stats.orders)}                 icon={ShoppingBag} gradient="from-blue-500 to-indigo-600"    sub="Tổng đơn thành công" />
          <KpiCard label="Khách hàng"        value={fmt(stats.customers)}              icon={Users}       gradient="from-orange-500 to-amber-600"   sub="Tài khoản đã đăng ký" />
          <KpiCard label="Sản phẩm"          value={fmt(stats.products)}               icon={Package}     gradient="from-violet-500 to-purple-600"  sub="Đang bán trên hệ thống" />
        </div>
      )}

      {/* ── Revenue Chart ── */}
      <Card className="shadow-sm border-slate-200/70">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <BarChart2 className="w-5 h-5 text-indigo-500" />
                Biểu đồ doanh thu
              </CardTitle>
              <p className="text-slate-400 text-xs mt-1">
                Tổng: <span className="font-bold text-indigo-600">{fmt(totalChartRevenue)}đ</span>
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Mode toggle */}
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
                <button
                  onClick={() => setChartMode("monthly")}
                  className={`px-3 py-1.5 font-medium transition-colors ${chartMode === "monthly" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  Theo tháng
                </button>
                <button
                  onClick={() => setChartMode("daily")}
                  className={`px-3 py-1.5 font-medium transition-colors border-l border-slate-200 ${chartMode === "daily" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  Theo ngày
                </button>
              </div>

              {/* Year */}
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              {/* Month (only in daily mode) */}
              {chartMode === "daily" && (
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey={chartKey} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={fmtM}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={45}
              />
              <Tooltip content={<RevenueTooltip />} cursor={{ stroke: "#6366f1", strokeWidth: 1, strokeDasharray: "4 2" }} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#revGrad)"
                dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#6366f1" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Bottom Grid: Top Products + Pie charts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Top Products */}
        <Card className="xl:col-span-2 shadow-sm border-slate-200/70">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Award className="w-5 h-5 text-amber-500" />
              Top sản phẩm bán chạy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 p-0">
            {topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <ChefHat className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-sm font-medium">Chưa có dữ liệu sản phẩm</p>
                <p className="text-xs mt-1">Cần có đơn hàng không bị huỷ để thống kê</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {topProducts.map((p, idx) => {
                  const pct = Math.round((Number(p.totalQty) / Number(maxQty)) * 100);
                  const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;
                  const imgSrc = p.imageUrl ? getImg(p.imageUrl) : null;
                  return (
                    <div key={idx} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/80 transition-colors group">
                      {/* Rank */}
                      <div className="w-7 text-center shrink-0">
                        {medal
                          ? <span className="text-lg leading-none">{medal}</span>
                          : <span className="text-xs font-bold text-slate-400">#{p.rank}</span>
                        }
                      </div>

                      {/* Product image */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.innerHTML = '<span class="text-slate-300"><svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\'><path d=\'m21 15-5-5L5 21\'/><circle cx=\'9\' cy=\'9\' r=\'2\'/><rect x=\'3\' y=\'3\' width=\'18\' height=\'18\' rx=\'2\' ry=\'2\'/></svg></span>'; }}
                          />
                        ) : (
                          <ImageOff className="w-4 h-4 text-slate-300" />
                        )}
                      </div>

                      {/* Name + progress bar */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-indigo-700 transition-colors">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                background: idx < 3
                                  ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                                  : "linear-gradient(90deg, #6366f1, #8b5cf6)"
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 shrink-0">
                            {fmt(p.totalQty)} lượt
                          </span>
                        </div>
                      </div>

                      {/* Revenue */}
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm text-emerald-600">{fmtM(p.totalRevenue)}đ</p>
                        <p className="text-[10px] text-slate-400">{fmt(p.totalRevenue)}đ</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>


        {/* Right column: Pie charts */}
        <div className="space-y-5">

          {/* Payment method pie */}
          <Card className="shadow-sm border-slate-200/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                Phương thức thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {paymentData.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={paymentData}
                        dataKey="revenue"
                        nameKey="label"
                        cx="50%" cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        labelLine={false}
                        label={renderPieLabel}
                      >
                        {paymentData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS_PAYMENT[i % PIE_COLORS_PAYMENT.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => fmt(v) + "đ"} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {paymentData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: PIE_COLORS_PAYMENT[i] }} />
                          <div className="flex items-center gap-1 text-slate-600">
                            {d.method === "vnpay" ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                            {d.label}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-700">{fmt(d.count)}</span>
                          <span className="text-slate-400 ml-1">đơn</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order status distribution */}
          <Card className="shadow-sm border-slate-200/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Phân bổ đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {statusData.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="count"
                        nameKey="label"
                        cx="50%" cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        labelLine={false}
                        label={renderPieLabel}
                      >
                        {statusData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => v + " đơn"} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {statusData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                          <span className="text-slate-600">{d.label}</span>
                        </div>
                        <Badge className="text-[10px] h-5 px-1.5 font-bold" style={{ background: d.color + "20", color: d.color, border: `1px solid ${d.color}40` }}>
                          {fmt(d.count)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ── Orders Bar summary ── */}
      <Card className="shadow-sm border-slate-200/70">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <ShoppingBag className="w-4 h-4 text-blue-500" />
            Số đơn theo tháng ({selectedYear})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartMode === "monthly" ? chartData : []} margin={{ top: 0, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                formatter={(v) => [v + " đơn", "Đơn hàng"]}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", fontSize: 12 }}
              />
              <Bar dataKey="orders" name="Đơn hàng" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={index === CURRENT_MONTH - 1 ? "#10b981" : "#6366f1"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {chartMode === "daily" && (
            <p className="text-center text-slate-400 text-xs mt-2">
              Chuyển sang chế độ "Theo tháng" để xem biểu đồ số đơn.
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
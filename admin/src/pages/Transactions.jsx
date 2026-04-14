import { useState, useEffect, useCallback } from "react";
import { transactionApi } from "../services/modules/transaction.api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown, Search, RefreshCw, CheckCircle2, Hash,
  CreditCard, Receipt, CalendarDays, User, TrendingUp
} from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (ts) =>
  ts ? new Date(ts).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "medium" }) : "—";

const formatPrice = (n) =>
  n != null ? Number(n).toLocaleString("vi-VN") + "đ" : "—";

const PAYMENT_LABEL = { cod: "Tiền mặt (COD)", vnpay: "VNPay" };

const PAYMENT_BADGE = {
  vnpay: "bg-blue-100 text-blue-700 border-blue-200",
  cod:   "bg-slate-100 text-slate-700 border-slate-200",
};

// ── Summary Cards ────────────────────────────────────────────────────────────
function SummaryCards({ transactions }) {
  const total = transactions.length;
  const totalAmount = transactions.reduce((s, t) => s + (Number(t.orderTotal) || 0), 0);
  const vnpayCount = transactions.filter(t => t.paymentMethod === "vnpay").length;
  const codCount   = transactions.filter(t => t.paymentMethod === "cod").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-emerald-100 text-sm font-medium">Tổng giao dịch</p>
            <p className="text-3xl font-extrabold">{total}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-blue-100 text-sm font-medium">Tổng doanh thu</p>
            <p className="text-2xl font-extrabold">{formatPrice(totalAmount)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-violet-100 text-sm font-medium">VNPay / Tiền mặt</p>
            <p className="text-3xl font-extrabold">{vnpayCount} / {codCount}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [filterOrderId, setFilterOrderId] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionApi.getAll(filterOrderId ? Number(filterOrderId) : undefined);
      setTransactions(res.data || []);
    } catch (err) {
      console.error("Không thể tải giao dịch", err);
    } finally {
      setLoading(false);
    }
  }, [filterOrderId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter by search (mã giao dịch or người nhận)
  const filtered = transactions
    .filter(t =>
      !search ||
      t.transactionCode?.toLowerCase().includes(search.toLowerCase()) ||
      t.recipientName?.toLowerCase().includes(search.toLowerCase()) ||
      String(t.orderId).includes(search)
    )
    .sort((a, b) =>
      sortDesc
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Lịch sử Giao dịch</h2>
          <p className="text-muted-foreground mt-1">
            Toàn bộ giao dịch đã thanh toán thành công (VNPay &amp; Tiền mặt COD).
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2 self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Summary */}
      <SummaryCards transactions={transactions} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm mã giao dịch, tên khách, mã đơn..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Lọc theo đơn #ID"
            type="number"
            value={filterOrderId}
            onChange={e => setFilterOrderId(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setSortDesc(p => !p)}
          className="gap-2 whitespace-nowrap"
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortDesc ? "Mới nhất trước" : "Cũ nhất trước"}
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50 border-b">
              <TableRow>
                <TableHead className="w-16 text-center font-bold">#</TableHead>
                <TableHead className="font-bold">Mã giao dịch</TableHead>
                <TableHead className="font-bold">Đơn hàng</TableHead>
                <TableHead className="font-bold">Khách hàng</TableHead>
                <TableHead className="font-bold">Số tiền</TableHead>
                <TableHead className="font-bold">Phương thức</TableHead>
                <TableHead className="font-bold">Thời gian</TableHead>
                <TableHead className="font-bold text-center">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center text-muted-foreground animate-pulse">
                    Đang tải dữ liệu giao dịch...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Receipt className="w-12 h-12 opacity-20" />
                      <p className="font-medium">Chưa có giao dịch nào</p>
                      <p className="text-sm">Giao dịch xuất hiện khi: VNPay thanh toán thành công, hoặc Admin xác nhận thu tiền mặt (COD).</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((tx, idx) => (
                  <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center font-bold text-muted-foreground text-sm">
                      {idx + 1}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.transactionCode?.startsWith("COD-")
                            ? "bg-slate-100"
                            : "bg-emerald-100"
                        }`}>
                          <CheckCircle2 className={`w-4 h-4 ${
                            tx.transactionCode?.startsWith("COD-")
                              ? "text-slate-500"
                              : "text-emerald-600"
                          }`} />
                        </div>
                        <code className="font-mono text-sm font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {tx.transactionCode}
                        </code>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-primary text-base">#{tx.orderId}</span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">{tx.recipientName || "—"}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-emerald-600 text-base">
                        {formatPrice(tx.orderTotal)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge className={`border text-xs ${PAYMENT_BADGE[tx.paymentMethod] || PAYMENT_BADGE.cod}`}>
                        <CreditCard className="w-3 h-3 mr-1" />
                        {PAYMENT_LABEL[tx.paymentMethod] || tx.paymentMethod || "—"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(tx.createdAt)}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Thành công
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t text-sm text-muted-foreground bg-muted/20">
              Hiển thị <strong>{filtered.length}</strong> / <strong>{transactions.length}</strong> giao dịch
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

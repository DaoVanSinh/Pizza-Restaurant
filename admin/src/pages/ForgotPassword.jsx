import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UtensilsCrossed, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { authApi } from "../services/modules/auth.api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập địa chỉ email!");
      return;
    }
    setLoading(true);

    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      toast.success("Đã gửi hướng dẫn đặt lại mật khẩu qua email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <UtensilsCrossed className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">Quên mật khẩu</CardTitle>
          <CardDescription className="text-base">
            Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Kiểm tra email của bạn</p>
                <p className="text-sm text-muted-foreground">
                  Kiểm tra email <strong>{email}</strong> để nhận hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.
                </p>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => { setSent(false); setEmail(""); }}
              >
                Gửi lại
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Địa chỉ Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@pizza.com"
                    className="h-11 pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={loading}
              >
                {loading ? "Đang gửi..." : "Gửi hướng dẫn đặt lại"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center pt-4 pb-8">
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại đăng nhập
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

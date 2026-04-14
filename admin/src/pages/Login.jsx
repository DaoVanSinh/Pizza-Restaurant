import { useState } from "react";
import { authApi } from "../services/modules/auth.api";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UtensilsCrossed, LogIn } from "lucide-react";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error("Vui lòng nhập số điện thoại và mật khẩu!");
      return;
    }
    setLoading(true);

    try {
      const res = await authApi.login({
        identifier: phone,
        password,
      });

      // Backend trả về: { status: 200, message: "...", data: { token, role, ... } }
      const responseData = res.data.data;
      
      if (!responseData || !responseData.token) {
        console.error("Login Error: Missing data.token in response", res.data);
        toast.error("Lỗi dữ liệu từ Server.");
        setLoading(false);
        return;
      }

      const { token, role, fullName, ...otherProps } = responseData;
      
      // 1. Lưu JWT mới vào Storage (Dùng 'jwt_token' cho đồng bộ với AuthGuard)
      localStorage.setItem("jwt_token", token);
      
      // 2. Lưu User info kèm Role
      localStorage.setItem("user_info", JSON.stringify({ role, fullName, ...otherProps }));

      // 3. Đá vào Admin Dashboard
      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      console.error("Login Fail:", err);
      toast.error("Sai số điện thoại hoặc mật khẩu (401)");
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
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">Admin Portal</CardTitle>
          <CardDescription className="text-base">
            Hệ thống quản lý Nhà Hàng Pizza
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="text"
                placeholder="0909090909"
                className="h-11"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                className="h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold mt-4"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : <><LogIn className="w-5 h-5 mr-2" /> Đăng Nhập</>}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground pt-4 pb-8">
          &copy; {new Date().getFullYear()} Pizza Restaurant
        </CardFooter>
      </Card>
    </div>
  );
}

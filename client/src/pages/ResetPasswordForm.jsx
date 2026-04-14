import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "../services/modules/auth.api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordForm() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    // Lấy token từ URL (ví dụ: /reset-password?token=abcxyz)
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!token) {
            toast.error("Không tìm thấy mã xác thực khôi phục mật khẩu.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }

        setIsLoading(true);
        try {
            await authApi.resetPassword({ 
                token, 
                newPassword 
            });
            toast.success("Mật khẩu của bạn đã được đặt lại thành công.");
            // Chờ 2 giây rồi điều hướng về đăng nhập
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
             toast.error(err.response?.data?.message || err.message || "Đổi mật khẩu thất bại!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-10 min-h-[calc(100vh-350px)]">
            <Card className="w-[420px] shadow-[0_6px_20px_rgba(0,0,0,0.08)] border-none rounded-2xl">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="text-center pb-8 pt-8">
                        <CardTitle className="text-2xl font-semibold">Tạo Mật khẩu mới</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 px-10">
                        {!token && (
                           <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center mb-4">
                               Đường dẫn không hợp lệ. Vui lòng kiểm tra lại email.
                           </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-light">Mật khẩu mới</label>
                            <Input 
                                type="password" 
                                placeholder="Nhập mật khẩu mới" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                required 
                                className="h-11 rounded-lg"
                                disabled={!token}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-light">Xác nhận mật khẩu</label>
                            <Input 
                                type="password" 
                                placeholder="Nhập lại mật khẩu" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                                className="h-11 rounded-lg"
                                disabled={!token}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="px-10 pb-10">
                        <Button type="submit" disabled={isLoading || !token} className="w-full h-12 text-base rounded-xl">
                            {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

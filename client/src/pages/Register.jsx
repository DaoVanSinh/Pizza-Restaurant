import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "../services/modules/auth.api";
import { Copy, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }

        setIsLoading(true);
        try {
            await authApi.register({
                fullName: formData.fullName,
                username: formData.email.split("@")[0] + Math.floor(Math.random() * 1000), // Auto-generate username
                phone: formData.phone,
                email: formData.email,
                password: formData.password,
                role: "user"
            });
            toast.success("Đăng ký tài khoản thành công!");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data || "Lỗi đăng ký");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-10 min-h-[calc(100vh-350px)]">
            <Card className="w-[450px] shadow-[0_6px_20px_rgba(0,0,0,0.08)] border-none rounded-2xl overflow-hidden">
                <CardHeader className="text-center pb-6 pt-8 bg-slate-50/50">
                    <CardTitle className="text-2xl font-bold text-slate-900">Đăng ký thành viên</CardTitle>
                    <p className="text-slate-500 text-sm mt-2">Tham gia cùng chúng tôi ngay hôm nay</p>
                </CardHeader>

                <CardContent className="px-10 pt-8">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Họ và Tên *</label>
                            <Input 
                                name="fullName"
                                type="text" 
                                placeholder="Nhập họ và tên" 
                                value={formData.fullName} 
                                onChange={handleChange} 
                                required 
                                className="h-11 rounded-lg border-slate-200"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Email *</label>
                                <Input 
                                    name="email"
                                    type="email" 
                                    placeholder="email@example.com" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                    className="h-11 rounded-lg border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Số điện thoại *</label>
                                <Input 
                                    name="phone"
                                    type="text" 
                                    placeholder="09xx xxx xxx" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                    required 
                                    className="h-11 rounded-lg border-slate-200"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Mật khẩu *</label>
                            <Input 
                                name="password"
                                type="password" 
                                placeholder="••••••••" 
                                value={formData.password} 
                                onChange={handleChange} 
                                required 
                                className="h-11 rounded-lg border-slate-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Xác nhận mật khẩu *</label>
                            <Input 
                                name="confirmPassword"
                                type="password" 
                                placeholder="••••••••" 
                                value={formData.confirmPassword} 
                                onChange={handleChange} 
                                required 
                                className="h-11 rounded-lg border-slate-200"
                            />
                        </div>
                        
                        <Button type="submit" disabled={isLoading} className="w-full h-12 text-base rounded-xl mt-6 font-bold shadow-lg shadow-slate-200">
                            {isLoading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="px-10 pb-10 flex justify-center mt-2 text-sm text-slate-500 border-t border-slate-50 pt-6">
                    Đã có tài khoản? <Link to="/login" className="text-primary hover:underline ml-1 font-bold">Đăng nhập</Link>
                </CardFooter>
            </Card>
        </div>
    );
}
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [agree, setAgree] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // Hook Context thay vì gọi Axios thẳng

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agree) {
            toast.error("Bạn cần đồng ý các điều khoản");
            return;
        }

        setIsLoading(true);
        try {
            const user = await login(identifier, password);
            toast.success("Đăng nhập thành công!");
            
            if (user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "staff") {
                const adminUrl = import.meta.env.VITE_ADMIN_URL || "http://localhost:5174/";
                window.location.href = adminUrl; // Redirect qua Admin portal
            } else {
                navigate("/");
            }
        } catch (err) {
            toast.error(err.message || "Sai tài khoản hoặc mật khẩu!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-10 min-h-[calc(100vh-450px)]">
            <Card className="w-[420px] shadow-[0_6px_20px_rgba(0,0,0,0.08)] border-none rounded-2xl">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="text-center pb-8 pt-8">
                        <CardTitle className="text-2xl font-semibold">Đăng nhập</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 px-10">
                        <div className="space-y-2">
                            <label className="text-sm font-light">Số điện thoại hoặc Email</label>
                            <Input 
                                type="text" 
                                placeholder="Nhập SĐT hoặc Email" 
                                value={identifier} 
                                onChange={(e) => setIdentifier(e.target.value)} 
                                required 
                                className="h-11 rounded-lg"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-light">Mật khẩu</label>
                            <div className="relative">
                                <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Nhập mật khẩu" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    className="h-11 rounded-lg pr-10"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="text-sm pt-2">
                            <Link to="/forgot-password" className="text-primary hover:underline font-medium">
                                Quên mật khẩu
                            </Link>
                        </div>

                        <div className="flex items-center space-x-2 pt-4 pb-2 text-sm text-muted-foreground">
                            <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                checked={agree} 
                                onChange={(e) => setAgree(e.target.checked)} 
                            />
                            <span>Tôi đồng ý với điều khoản</span>
                        </div>
                    </CardContent>

                    <CardFooter className="px-10 pb-10">
                        <Button 
                            type="submit" 
                            className="w-full h-12 text-base rounded-xl"
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};
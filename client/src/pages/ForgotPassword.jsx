import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "../services/modules/auth.api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authApi.forgotPassword({ 
                email,
                origin: window.location.origin
            });
            toast.success("Đường link khôi phục mật khẩu đã được gửi đến email của bạn.");
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Email không tồn tại!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-10 min-h-[calc(100vh-350px)]">
            <Card className="w-[420px] shadow-[0_6px_20px_rgba(0,0,0,0.08)] border-none rounded-2xl">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="text-center pb-8 pt-8">
                        <CardTitle className="text-2xl font-semibold">Khôi phục mật khẩu</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 px-10">
                        <div className="space-y-2">
                            <label className="text-sm font-light">Email đã đăng ký</label>
                            <Input 
                                type="email" 
                                placeholder="example@gmail.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                className="h-11 rounded-lg"
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="px-10 pb-10 flex flex-col gap-4">
                        <Button type="submit" disabled={isLoading} className="w-full h-12 text-base rounded-xl">
                            {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
                        </Button>
                        <div className="text-sm">
                            <Link to="/login" className="text-primary hover:underline font-medium">Quay lại đăng nhập</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

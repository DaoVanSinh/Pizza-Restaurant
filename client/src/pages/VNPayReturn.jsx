import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { orderApi } from "../services/modules/order.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function VNPayReturn() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("loading"); // "loading", "success", "error"
    const [payInfo, setPayInfo] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            const queryParams = Object.fromEntries(searchParams.entries());
        
            // Nếu không có param nào, có thể user truy cập trực tiếp
            if (Object.keys(queryParams).length === 0) {
                setStatus("error");
                return;
            }

            try {
                // Gắn query parameters lên API backend
                const queryString = new URLSearchParams(queryParams).toString();
                const res = await orderApi.verifyVNPayReturn(queryString);
                
                if (res.data && res.data.success) {
                    setStatus("success");
                    setPayInfo(res.data);
                } else {
                    setStatus("error");
                    setPayInfo(res.data);
                }
            } catch (error) {
                console.error("Lỗi xác minh thanh toán:", error);
                setStatus("error");
            }
        };

        verifyPayment();
    }, [searchParams]);

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
                <p className="text-lg font-medium text-gray-600">Đang xác minh giao dịch...</p>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 p-4">
            <Card className="w-full max-w-lg shadow-[0_10px_40px_rgba(0,0,0,0.1)] border-none overflow-hidden">
                {status === "success" ? (
                    <div className="bg-green-600 p-6 flex flex-col items-center text-white">
                        <CheckCircle2 className="h-20 w-20 mb-4" />
                        <h2 className="text-2xl font-bold">Thanh Toán Thành Công!</h2>
                        <p className="opacity-90 mt-2">Cảm ơn bạn đã đặt hàng qua VNPay</p>
                    </div>
                ) : (
                    <div className="bg-red-600 p-6 flex flex-col items-center text-white">
                        <XCircle className="h-20 w-20 mb-4" />
                        <h2 className="text-2xl font-bold">Thanh Toán Thất Bại!</h2>
                        <p className="opacity-90 mt-2">Giao dịch bị hủy hoặc xảy ra lỗi</p>
                    </div>
                )}

                <CardContent className="p-6">
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Mã đơn hàng</span>
                            <span className="font-bold">{payInfo?.txnRef?.split('_')[0] || "N/A"}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Số tiền gốc</span>
                            <span className="font-bold text-red-600">
                                {payInfo?.amount ? (Number(payInfo.amount) / 100).toLocaleString() + 'đ' : "0đ"}
                            </span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Mã giao dịch VNPay</span>
                            <span className="font-bold">{payInfo?.transactionNo || "N/A"}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Thời gian GD</span>
                            <span className="font-bold">{payInfo?.payDate || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Thông tin</span>
                            <span className="font-bold text-sm max-w-[60%] text-right">{payInfo?.orderInfo || "Giao dịch qua VNPay"}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link to="/" className="w-full">
                            <Button className="w-full h-12 bg-gray-900 rounded-xl hover:bg-gray-800 text-white font-bold">
                                Về Trang Chủ
                            </Button>
                        </Link>
                        {status === "error" && (
                            <Link to="/cart" className="w-full">
                                <Button variant="outline" className="w-full h-12 rounded-xl border-gray-300 font-bold">
                                    Thử Thanh Toán Lại
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

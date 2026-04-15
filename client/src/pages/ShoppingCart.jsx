import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { orderApi } from "../services/modules/order.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { getImg } from "../lib/utils";
import vnpayLogo from "../assets/vnpay.png";
import { promotionApi } from "../services/modules/promotion.api";

const MOCK_STORES = [
    { id: 1, name: "THE PIZZA COMPANY CẦU GIẤY", address: "333 Cầu Giấy, P. Dịch Vọng, Q. Cầu Giấy, Hà Nội", phone: "1900 633 606" },
    { id: 2, name: "THE PIZZA COMPANY ĐỐNG ĐA", address: "245 Đống Đa, P. Ô Chợ Dừa, Q. Đống Đa, Hà Nội", phone: "1900 633 606" },
];

export default function ShoppingCart() {
    const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart, orderType, setOrderType } = useCart();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [recipientName, setRecipientName] = useState("");
    const [recipientPhone, setRecipientPhone] = useState("");
    const [address, setAddress] = useState("");
    const [note, setNote] = useState("");
    const [selectedStore, setSelectedStore] = useState(MOCK_STORES[0]);
    const [pickupTimeType, setPickupTimeType] = useState("NOW");
    const [paymentMethod, setPaymentMethod] = useState("COD");

    useEffect(() => {
        if (user) {
            setRecipientName(user.fullName || user.username || "");
            setRecipientPhone(user.phone || "");
            setAddress(user.address || "");
        }
    }, [user]);

    const [voucherCode, setVoucherCode] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [applyingVoucher, setApplyingVoucher] = useState(false);

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) {
            toast.warning("Vui lòng nhập mã giảm giá");
            return;
        }
        setApplyingVoucher(true);
        try {
            const res = await promotionApi.checkPromotion(voucherCode);
            const data = res.data;
            setAppliedVoucher({ code: data.code, percent: data.discountPercent });
            toast.success(`Mã hợp lệ! Đã giảm ${data.discountPercent}% cho tổng hình thức đặt`);
        } catch (err) {
            toast.error(err?.response?.data || "Mã không hợp lệ hoặc đã hết hạn");
            setAppliedVoucher(null);
        } finally {
            setApplyingVoucher(false);
        }
    };

    const removeVoucher = () => {
        setAppliedVoucher(null);
        setVoucherCode("");
    };

    const baseTotal = getCartTotal();
    const shippingFee = orderType === "DELIVERY" ? 30000 : 0;
    const discountAmount = appliedVoucher ? (baseTotal * appliedVoucher.percent) / 100 : 0;
    const finalTotal = baseTotal + shippingFee - discountAmount;

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để thanh toán!");
            navigate("/login");
            return;
        }

        if (cartItems.length === 0) {
            toast.warning("Giỏ hàng đang trống");
            return;
        }

        if (orderType === "DELIVERY" && !address.trim()) {
            toast.error("Vui lòng nhập địa chỉ giao hàng!");
            return;
        }

        if (!recipientName.trim() || !recipientPhone.trim()) {
            toast.error("Vui lòng nhập đầy đủ tên và số điện thoại người nhận!");
            return;
        }

        try {
            const payload = {
                orderType,
                recipientName,
                recipientPhone,
                address: orderType === "DELIVERY" ? address : `Nhận tại: ${selectedStore?.name} - ${selectedStore?.address}`,
                note: orderType === "PICKUP" ? `[Thời gian: ${pickupTimeType === 'NOW' ? 'Sớm nhất (15p)' : 'Hẹn giờ'}] ${note}` : note,
                shippingFee,
                discountAmount,
                voucherCode: appliedVoucher ? appliedVoucher.code : null,
                paymentMethod: paymentMethod.toLowerCase(), 
                totalPrice: finalTotal,
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    size: item.size,
                    note: item.note
                }))
            };

            const res = await orderApi.createOrder(payload);
            
            if (paymentMethod === "VNPAY") {
                // Call VNPay API to get payment URL
                try {
                    const { data } = await orderApi.createVNPayUrl({
                        orderId: res.data.id,
                        amount: finalTotal,
                        orderInfo: `Thanh toan don hang ${res.data.id}`
                    });
                    if (data && data.paymentUrl) {
                        clearCart();
                        window.location.href = data.paymentUrl;
                        return;
                    }
                } catch (e) {
                    toast.error("Không thể khởi tạo thanh toán VNPay");
                    console.error("Lỗi VNPay:", e);
                }
            } else {
                toast.success("Đặt hàng thành công!");
                clearCart();
                navigate("/"); // Hoặc qua trang lịch sử đơn hàng
            }
        } catch (err) {
            toast.error("Lỗi khi tạo đơn hàng: " + (err.response?.data?.message || err.message));
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <h2 className="text-2xl font-semibold">Giỏ hàng của bạn đang trống</h2>
                <Link to="/">
                    <Button className="rounded-full px-8">Quay lại mua sắm</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <h2 className="text-3xl font-bold mb-8 text-primary">
                {step === 1 ? `Giỏ hàng (${cartItems.length})` : "Thông tin thanh toán"}
            </h2>

            {step === 1 ? (
                <>
                    <Card className="border-none shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-[muted]">
                                    <TableRow>
                                        <TableHead className="w-[100px]">Sản phẩm</TableHead>
                                        <TableHead className="min-w-[200px]">Thông tin</TableHead>
                                        <TableHead className="text-center w-[150px]">Số lượng</TableHead>
                                        <TableHead className="text-right w-[150px]">Giá</TableHead>
                                        <TableHead className="text-center w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cartItems.map((item, index) => (
                                        <TableRow key={`${item.id}-${item.size}-${index}`}>
                                            <TableCell>
                                                <img src={getImg(item.imageUrl)} alt={item.name} className="w-[80px] h-[80px] object-cover rounded-lg" />
                                            </TableCell>
                                            <TableCell>
                                                <h3 className="font-bold text-lg">{item.name}</h3>
                                                {item.size && <p className="text-sm text-muted-foreground mr-2">Kích cỡ: {item.size}</p>}
                                                {item.note && <p className="text-sm text-muted-foreground italic tracking-tight">Ghi chú: "{item.note}"</p>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center border border-input rounded-md overflow-hidden max-w-[120px] mx-auto">
                                                    <button 
                                                        className="px-3 py-2 bg-muted hover:bg-gray-200 transition-colors"
                                                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                                    >-</button>
                                                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                                                    <button 
                                                        className="px-3 py-2 bg-muted hover:bg-gray-200 transition-colors"
                                                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                                    >+</button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-lg text-primary">
                                                {(item.price * item.quantity).toLocaleString()}đ
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id, item.size)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col md:flex-row justify-between items-center mt-8 p-6 bg-white rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">Tổng Thanh Toán</span>
                            <span className="text-3xl font-extrabold text-red-600">{getCartTotal().toLocaleString()}đ</span>
                        </div>
                        <div className="flex gap-4 mt-6 md:mt-0 w-full md:w-auto">
                            <Button variant="outline" className="h-14 px-8 rounded-xl font-bold flex-1 md:flex-none" onClick={() => navigate("/")}>Tiếp tục mua hàng</Button>
                            <Button className="h-14 px-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-md transition-transform hover:scale-[1.02] flex-1 md:flex-none" onClick={() => setStep(2)}>
                                Thanh Toán
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-6 cursor-pointer text-gray-500 hover:text-primary transition-colors" onClick={() => setStep(1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/></svg>
                        <span className="font-bold">Quay lại Giỏ hàng</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* FOR DELIVERY: Left Info, Right Summary */}
                {/* FOR PICKUP: Left Info, Right Stores, Bottom Summary */}
                
                {orderType === "DELIVERY" ? (
                    <>
                        <div className="space-y-6">
                            <Card className="border-none shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2 mb-6"><span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">1</span> Hình thức nhận hàng</h3>
                                    <div className="flex gap-4">
                                        <label className={`flex items-center space-x-2 border p-4 rounded-lg flex-1 cursor-pointer transition-colors ${orderType === 'DELIVERY' ? 'border-primary bg-primary/5' : ''}`}>
                                            <input type="radio" name="orderType" value="DELIVERY" checked={orderType === 'DELIVERY'} onChange={() => setOrderType('DELIVERY')} className="w-4 h-4 text-primary accent-primary" />
                                            <span className="font-bold">Giao hàng tận nơi</span>
                                        </label>
                                        <label className={`flex items-center space-x-2 border p-4 rounded-lg flex-1 cursor-pointer transition-colors ${orderType === 'PICKUP' ? 'border-primary bg-primary/5' : ''}`}>
                                            <input type="radio" name="orderType" value="PICKUP" checked={orderType === 'PICKUP'} onChange={() => setOrderType('PICKUP')} className="w-4 h-4 text-primary accent-primary" />
                                            <span className="font-bold">Đến lấy tại quán</span>
                                        </label>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold border-b pb-2 mb-4 mt-8 text-green-700">Thông tin nhận hàng</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Họ và tên <span className="text-red-500">*</span></Label>
                                            <Input className="w-full" placeholder="Nhập họ và tên..." value={recipientName} onChange={e => setRecipientName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Số điện thoại <span className="text-red-500">*</span></Label>
                                            <Input className="w-full" placeholder="Nhập số điện thoại..." value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Địa chỉ giao hàng (Số nhà, tên đường, phường/xã...) <span className="text-red-500">*</span></Label>
                                            <Input className="w-full" placeholder="Ví dụ: 123 Nguyễn Văn Cừ, Phường 1, Quận 5..." value={address} onChange={e => setAddress(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Ghi chú đơn hàng (Tùy chọn)</Label>
                                            <Textarea placeholder="Lời nhắn hoặc yêu cầu thêm cho quán (VD: Ship tới cổng gọi điện)" value={note} onChange={e => setNote(e.target.value)} rows={2} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div>
                            <Card className="border-none shadow-[0_10px_25px_rgba(0,0,0,0.08)] sticky top-6">
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold mb-6 text-green-700 border-b pb-2">Thông tin thanh toán</h3>
                                    
                                    {/* Payment Method Selection */}
                                    <div className="mb-6 space-y-3">
                                        <h4 className="font-bold text-gray-800">Phương thức thanh toán:</h4>
                                        <label className={`flex items-center space-x-3 border p-3 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" name="paymentDelivery" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-4 h-4 text-primary accent-primary" />
                                            <span className="font-medium text-sm">Thanh toán khi nhận hàng (COD)</span>
                                        </label>
                                        <label className={`flex items-center space-x-3 border p-3 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'VNPAY' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" name="paymentDelivery" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} className="w-4 h-4 text-primary accent-primary" />
                                            <img src={vnpayLogo} alt="VNPay" className="h-4 object-contain" />
                                            <span className="font-medium text-sm">Thanh toán qua VNPay</span>
                                        </label>
                                    </div>

                                        <div className="flex justify-between items-center py-2">
                                            <div className="flex w-full max-w-sm items-center space-x-2">
                                                <Input 
                                                    placeholder="Nhập mã voucher..." 
                                                    value={voucherCode} 
                                                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                                    disabled={!!appliedVoucher}
                                                />
                                                {!appliedVoucher ? (
                                                    <Button variant="secondary" onClick={handleApplyVoucher} disabled={applyingVoucher}>
                                                        {applyingVoucher ? "..." : "Áp dụng"}
                                                    </Button>
                                                ) : (
                                                    <Button variant="destructive" onClick={removeVoucher}>Hủy bỏ</Button>
                                                )}
                                            </div>
                                        </div>
                                    
                                        <div className="space-y-4 text-sm font-medium">
                                            <div className="flex justify-between text-muted-foreground border-b pb-4">
                                                <span>Tổng tiền hàng ({cartItems.length} món)</span>
                                                <span>{baseTotal.toLocaleString()}đ</span>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground border-b pb-4">
                                                <span>Phí giao hàng</span>
                                                <span>{shippingFee > 0 ? `${shippingFee.toLocaleString()}đ` : 'Miễn phí'}</span>
                                            </div>
                                            {appliedVoucher && (
                                                <div className="flex justify-between text-green-600 border-b pb-4">
                                                    <span>Giảm giá ({appliedVoucher.percent}%)</span>
                                                    <span>-{discountAmount.toLocaleString()}đ</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-base font-bold">Thành tiền</span>
                                                <span className="text-3xl font-bold text-red-600">{finalTotal.toLocaleString()}đ</span>
                                            </div>
                                            <p className="text-right text-xs text-muted-foreground">(Đã bao gồm VAT nếu có)</p>
                                        </div>

                                    <Button onClick={handleCheckout} className="w-full h-14 mt-8 rounded-xl bg-red-600 hover:bg-red-700 text-white text-lg font-bold transition-all shadow-md">
                                        {paymentMethod === "VNPAY" ? "Thanh toán qua VNPay" : "Hoàn tất đặt hàng (Tiền mặt)"}
                                    </Button>
                                    <Link to="/">
                                        <Button variant="ghost" className="w-full mt-4 text-muted-foreground">Mua thêm sản phẩm</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-6">
                            <Card className="border-none shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                                <CardContent className="p-6">
                                    <div className="flex gap-4 mb-8">
                                        <label className={`flex items-center space-x-2 border p-4 rounded-lg flex-1 cursor-pointer transition-colors ${orderType === 'DELIVERY' ? 'border-primary bg-primary/5' : ''}`}>
                                            <input type="radio" name="orderType" value="DELIVERY" checked={orderType === 'DELIVERY'} onChange={() => setOrderType('DELIVERY')} className="w-4 h-4 text-primary accent-primary" />
                                            <span className="font-bold">Giao hàng tận nơi</span>
                                        </label>
                                        <label className={`flex items-center space-x-2 border p-4 rounded-lg flex-1 cursor-pointer transition-colors ${orderType === 'PICKUP' ? 'border-primary bg-primary/5' : ''}`}>
                                            <input type="radio" name="orderType" value="PICKUP" checked={orderType === 'PICKUP'} onChange={() => setOrderType('PICKUP')} className="w-4 h-4 text-primary accent-primary" />
                                            <span className="font-bold text-green-700">Đến lấy tại quán</span>
                                        </label>
                                    </div>

                                    <h3 className="text-xl font-bold text-green-700 border-b pb-2 mb-4">Thông tin nhận hàng</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Họ và tên <span className="text-red-500">*</span></Label>
                                            <Input placeholder="Nhập tên..." value={recipientName} onChange={e => setRecipientName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Số điện thoại <span className="text-red-500">*</span></Label>
                                            <Input placeholder="Nhập số..." value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-green-700 border-b pb-2 mt-8 mb-4">Chọn thời gian nhận hàng</h3>
                                    <div className="space-y-4">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input type="radio" name="pickupTime" checked={pickupTimeType === "NOW"} onChange={() => setPickupTimeType("NOW")} className="w-4 h-4 text-green-600 accent-green-600" />
                                            <span className="text-sm">Tối thiểu 15 phút sau khi đặt hàng thành công</span>
                                        </label>
                                        <div className="p-3 bg-red-50 text-red-600 text-sm italic rounded-md">
                                            Xin lỗi bạn, chúng tôi ngưng phục vụ giao hàng từ 21h30 ngày hôm trước đến 10h00 ngày hôm sau.
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="border-none shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold text-green-700 border-b pb-2 mb-4">Chọn cửa hàng đến lấy</h3>
                                    
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <select className="border border-gray-300 rounded-md p-2 text-sm text-gray-600 outline-none focus:ring-1 focus:ring-green-600">
                                            <option>Thành phố Hà Nội</option>
                                        </select>
                                        <select className="border border-gray-300 rounded-md p-2 text-sm text-gray-600 outline-none focus:ring-1 focus:ring-green-600">
                                            <option>Quận Cầu Giấy</option>
                                            <option>Quận Đống Đa</option>
                                        </select>
                                    </div>
                                    <div className="relative mb-4">
                                        <Input placeholder="Nhập tên cửa hàng để tìm kiếm" className="pr-10" />
                                        <span className="absolute right-3 top-3 text-gray-400 cursor-pointer">🔍</span>
                                    </div>

                                    <div className="flex gap-2 font-bold text-sm mb-4">
                                        <button className="bg-green-700 text-white px-4 py-2 rounded-md">Gần vị trí bạn</button>
                                        <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md border">Cửa hàng lọc được</button>
                                    </div>

                                    <div className="space-y-3">
                                        {MOCK_STORES.map((store) => (
                                            <label key={store.id} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${selectedStore?.id === store.id ? 'border-green-600 bg-green-50' : 'hover:bg-gray-50'}`}>
                                                <input type="radio" className="mt-1 w-4 h-4 accent-green-600" checked={selectedStore?.id === store.id} onChange={() => setSelectedStore(store)} />
                                                <div>
                                                    <div className="font-bold text-gray-800">{store.name}</div>
                                                    <div className="text-xs text-gray-600 mt-1 flex gap-1"><span className="text-red-500">📍</span> {store.address}</div>
                                                    <div className="text-xs text-gray-600 mt-1 flex gap-1"><span className="text-green-600">📞</span> Hotline: {store.phone}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold mb-6 text-green-700 border-b pb-2">Thông tin thanh toán</h3>
                                    
                                    {/* Payment Method Selection */}
                                    <div className="mb-6 space-y-3">
                                        <h4 className="font-bold text-gray-800">Phương thức thanh toán:</h4>
                                        <label className={`flex items-center space-x-3 border p-3 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" name="paymentPickup" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-4 h-4 text-primary accent-primary" />
                                            <span className="font-medium text-sm">Thanh toán tiền mặt tại quán (COD)</span>
                                        </label>
                                        <label className={`flex items-center space-x-3 border p-3 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'VNPAY' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" name="paymentPickup" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} className="w-4 h-4 text-primary accent-primary" />
                                            <img src={vnpayLogo} alt="VNPay" className="h-4 object-contain" />
                                            <span className="font-medium text-sm">Thanh toán qua VNPay</span>
                                        </label>
                                    </div>

                                    <div className="flex justify-between items-center py-2 mb-4 max-w-md">
                                        <div className="flex w-full items-center space-x-2">
                                            <Input 
                                                placeholder="Nhập mã voucher..." 
                                                value={voucherCode} 
                                                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                                disabled={!!appliedVoucher}
                                            />
                                            {!appliedVoucher ? (
                                                <Button variant="secondary" onClick={handleApplyVoucher} disabled={applyingVoucher}>
                                                    {applyingVoucher ? "..." : "Áp dụng"}
                                                </Button>
                                            ) : (
                                                <Button variant="destructive" onClick={removeVoucher}>Hủy bỏ</Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4 text-sm">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Tiền hàng:</span>
                                            <span>{baseTotal.toLocaleString()}đ</span>
                                        </div>
                                        {appliedVoucher && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Giảm giá ({appliedVoucher.percent}%):</span>
                                                <span>-{discountAmount.toLocaleString()}đ</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center mb-4 border-t pt-4">
                                        <span className="text-lg font-bold">Tổng thanh toán:</span>
                                        <span className="text-2xl font-bold text-red-600">{finalTotal.toLocaleString()}đ</span>
                                    </div>
                                    <Button onClick={handleCheckout} className="w-full h-14 rounded-xl bg-red-600 hover:bg-red-700 text-white text-lg font-bold transition-all shadow-md">
                                        {paymentMethod === "VNPAY" ? "Thanh toán qua VNPay" : "Hoàn tất đặt hàng (Tiền mặt)"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
            </div>
            )}
        </div>
    );
}
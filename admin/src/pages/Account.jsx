import { useState, useEffect } from "react";
import { userApi } from "../services/modules/user.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Camera, User, Mail, Phone, Lock, Save } from "lucide-react";
import { getImg } from "../lib/utils";

export default function AccountProfile() {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [user, setUser] = useState({
    username: "",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    avatarUrl: ""
  });

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
    const userId = userInfo.userId;

    if (userId) {
      userApi.getProfile() 
        .then(res => {
          const data = res.data;
          setUser({
            username: data.user?.username || userInfo.username || "",
            fullName: data.fullName || "",
            phone: data.user?.phone || "",
            email: data.user?.email || "",
            address: data.address || "",
            avatarUrl: data.avatar || ""
          });
          if (data.avatar) {
            setImagePreview(getImg(data.avatar));
          }
        })
        .catch(err => {
            console.error(err);
            // Fallback nếu profile chưa có
            setUser(prev => ({...prev, username: userInfo.username || ""}));
        });
    }
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadAvatar = async () => {
    if (!imageFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const res = await userApi.uploadAvatar(formData);
      toast.success("Cập nhật ảnh đại diện thành công!");
      
      const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
      userInfo.avatarUrl = res.data.avatar;
      localStorage.setItem("user_info", JSON.stringify(userInfo));
      
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error("Lỗi tải ảnh đại diện!");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await userApi.updateProfile({
        fullName: user.fullName,
        address: user.address,
        user: {
          phone: user.phone
        }
      });
      
      // Sync local storage
      const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
      userInfo.fullName = user.fullName;
      userInfo.address = user.address;
      localStorage.setItem("user_info", JSON.stringify(userInfo));
      
      toast.success("Cập nhật thông tin thành công!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error("Lỗi cập nhật thông tin!");
    } finally {
      setLoading(false);
    }
  };

  const displayRole = (role) => {
    if (!role) return "Người dùng";
    switch (role.toLowerCase()) {
      case "admin": return "Quản Trị Viên";
      case "staff": return "Nhân Viên";
      default:      return "Người Dùng";
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hồ Sơ Tài Khoản</h2>
          <p className="text-muted-foreground mt-1">Quản lý các thông tin cá nhân và cài đặt bảo mật của bạn</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 gap-2"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <Save className="w-5 h-5 animate-pulse" /> : <Save className="w-5 h-5" />}
          Lưu Thay Đổi
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT CARD: AVATAR */}
        <Card className="lg:col-span-1 shadow-md border-0 bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Ảnh đại diện</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pb-8">
            <div className="relative group">
              <div className="w-48 h-48 rounded-full border-4 border-muted overflow-hidden bg-muted/50 flex items-center justify-center shadow-inner">
                {imagePreview ? (
                  <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-24 h-24 text-muted-foreground opacity-20" />
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-2 right-2 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform"
              >
                <Camera className="w-6 h-6" />
                <input 
                  type="file" 
                  id="avatar-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="font-bold text-xl">{user.fullName || user.username}</h3>
              <p className="text-muted-foreground text-sm uppercase tracking-wider font-semibold opacity-70">
                {displayRole(JSON.parse(localStorage.getItem("user_info") || "{}").role)}
              </p>
            </div>

            {imageFile && (
              <Button 
                variant="outline" 
                className="w-full gap-2 border-primary/20 hover:bg-primary/5"
                onClick={handleUploadAvatar}
                disabled={loading}
              >
                {loading ? "Đang tải..." : "Xác nhận đổi ảnh"}
              </Button>
            )}
            
            <p className="text-xs text-center text-muted-foreground opacity-60 leading-relaxed px-4">
              Hỗ trợ tệp tin JPG, PNG hoặc WEBP.<br/>Dung lượng tối đa 2MB.
            </p>
          </CardContent>
        </Card>

        {/* RIGHT CARDS: DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-blue-500" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Tên đăng nhập</Label>
                <div className="relative">
                  <Input 
                    value={user.username} 
                    disabled 
                    className="pl-9 bg-muted/30 focus-visible:ring-0" 
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Họ và tên</Label>
                <div className="relative">
                  <Input 
                    name="fullName" 
                    value={user.fullName} 
                    onChange={handleChange} 
                    className="pl-9"
                    placeholder="Nhập họ tên của bạn"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Email</Label>
                <div className="relative">
                  <Input 
                    name="email" 
                    type="email" 
                    value={user.email} 
                    onChange={handleChange} 
                    className="pl-9"
                    placeholder="admin@pizza.com"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Số điện thoại</Label>
                <div className="relative">
                  <Input 
                    name="phone" 
                    value={user.phone} 
                    onChange={handleChange} 
                    className="pl-9"
                    placeholder="09xx xxx xxx"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-semibold">Địa chỉ</Label>
                <div className="relative">
                  <Input 
                    name="address" 
                    value={user.address} 
                    onChange={handleChange} 
                    className="pl-9"
                    placeholder="Nhập địa chỉ của bạn"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="w-5 h-5 text-amber-500" />
                Bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Mật khẩu mới</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Xác nhận mật khẩu</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                 <div className="mt-0.5 text-amber-600">
                   <Lock className="w-5 h-5" />
                 </div>
                 <p className="text-xs text-amber-800 leading-relaxed">
                   <strong>Lưu ý quan trọng:</strong> Mật khẩu của bạn nên chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và chữ số để đảm bảo tính an toàn cao nhất cho tài khoản Admin.
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
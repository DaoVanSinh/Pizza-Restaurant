import { useState } from "react";
import { productApi } from "../../services/modules/product.api";
import { Link, useNavigate } from "react-router-dom";
import { useCategories } from "../../hooks/useCategories";
import { useVariants } from "../../hooks/useVariants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save, UploadCloud, ImageIcon } from "lucide-react";

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { categories, isLoading: catLoading } = useCategories();
  const { variants, isLoading: varLoading } = useVariants();

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    variantId: "",
    price: "",
    description: "",
  });

  const [variantPrices, setVariantPrices] = useState({}); // { [variantId]: price }

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Kiểm tra danh mục đã chọn có phải Pizza không (dựa vào slug chứa "pizza")
  const selectedCategory = categories.find((c) => String(c.id) === String(form.categoryId));
  const isPizza = selectedCategory?.slug?.toLowerCase().includes("pizza") ?? false;

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Khi đổi danh mục sang không-pizza → xóa variant
      if (field === "categoryId") {
        const cat = categories.find((c) => String(c.id) === String(value));
        if (!cat?.slug?.toLowerCase().includes("pizza")) {
          next.variantId = "";
        }
      }
      return next;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const buildSlug = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm!");
      return;
    }
    if (!form.categoryId) {
      toast.error("Vui lòng chọn danh mục!");
      return;
    }

    if (isPizza) {
      // Kiểm tra xem đã nhập giá cho ít nhất một size chưa, hoặc bắt buộc tất cả size trong DB?
      // Thường là nên nhập tất cả các size hiện có trong DB cho Pizza
      const missingPrices = variants.some(v => !variantPrices[v.id]);
      if (missingPrices) {
        toast.error("Vui lòng nhập đầy đủ giá cho tất cả các kích thước!");
        return;
      }
    } else {
      if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
        toast.error("Vui lòng nhập giá hợp lệ!");
        return;
      }
    }

    setLoading(true);
    try {
      if (isPizza) {
        if (variants.length === 0) {
            toast.error("Hệ thống chưa có dữ liệu Kích thước (Variants) trong CSDL!");
            setLoading(false);
            return;
        }

        const pizzaConfig = Object.entries(variantPrices).map(([vId, price]) => ({
            variantId: parseInt(vId, 10),
            price: parseFloat(price)
        }));

        let baseSlug = buildSlug(form.name) + "-" + Date.now();

        // Gửi 3 API tuần tự để đảm bảo sinh đủ 3 sản phẩm
        for (const config of pizzaConfig) {
           const formData = new FormData();
           const payload = {
              name: form.name.trim(),
              description: form.description.trim(),
              price: config.price,
              slug: baseSlug + "-size-" + config.variantId,
              category: { id: parseInt(form.categoryId, 10) },
              variant: { id: parseInt(config.variantId, 10) },
           };
           formData.append("product", new Blob([JSON.stringify(payload)], { type: "application/json" }));
           if (imageFile) formData.append("image", imageFile);
           await productApi.addProduct(formData);
        }
      } else {
         const formData = new FormData();
         const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            price: parseFloat(form.price),
            slug: buildSlug(form.name) + "-" + Date.now(),
            category: { id: parseInt(form.categoryId, 10) },
            variant: null,
         };
         formData.append("product", new Blob([JSON.stringify(payload)], { type: "application/json" }));
         if (imageFile) formData.append("image", imageFile);
         await productApi.addProduct(formData);
      }

      toast.success("Thêm sản phẩm thành công!");
      navigate("/products");
    } catch (error) {
      console.error("Save product error:", error?.response ?? error);
      const msg = error?.response?.data?.message || "Lỗi khi lưu sản phẩm. Vui lòng thử lại!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedVariant = variants.find((v) => String(v.id) === String(form.variantId));

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/products">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Thêm Sản Phẩm Mới</h2>
          <p className="text-muted-foreground mt-1">Tạo món ăn hoặc combo mới vào hệ thống</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Form thông tin */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Tên sản phẩm */}
              <div className="space-y-2">
                <Label>Tên sản phẩm *</Label>
                <Input
                  placeholder="VD: Pizza Hải Sản Nhiệt Đới"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              {/* Danh mục + Kích thước */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Danh mục */}
                <div className="space-y-2">
                  <Label>Danh mục *</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.categoryId}
                    onChange={(e) => handleChange("categoryId", e.target.value)}
                    disabled={catLoading}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground w-full">Thông tin Kích thước</Label>
                  <div className="w-full h-10 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm flex items-center text-muted-foreground italic">
                     {isPizza ? "Pizza tự động tạo 3 kích thước S, M, L" : (form.categoryId ? "Không áp dụng cho danh mục này" : "Chọn danh mục trước")}
                  </div>
                </div>
              </div>

              {/* Mô tả */}
              <div className="space-y-2">
                <Label>Mô tả sản phẩm</Label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  placeholder="Mô tả thành phần, hương vị..."
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Giá bán */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thiết lập Giá bán</CardTitle>
            </CardHeader>
            <CardContent>
              {isPizza ? (
                <div className={`grid grid-cols-1 md:grid-cols-${Math.min(variants.length, 3)} gap-6 bg-primary/5 p-4 rounded-xl border border-primary/20`}>
                  {variants.map((v) => (
                    <div key={v.id} className="space-y-2">
                      <Label className="text-primary font-bold text-sm">Giá Size {v.size} *</Label>
                      <Input
                        type="number" min="0" placeholder={`Giá cho size ${v.size}`}
                        value={variantPrices[v.id] || ""} 
                        onChange={(e) => setVariantPrices(prev => ({ ...prev, [v.id]: e.target.value }))}
                        className="border-primary/30 text-base h-11 font-bold"
                      />
                    </div>
                  ))}
                  {variants.length === 0 && <p className="text-destructive text-sm col-span-full">Lỗi: Không tìm thấy kích thước nào trong DB!</p>}
                </div>
              ) : (
                <div className="space-y-2 bg-primary/5 p-4 rounded-xl border border-primary/20">
                  <Label className="text-primary font-bold">Giá chung (đồng) *</Label>
                  <Input
                    type="number" min="0" placeholder="VD: 200000"
                    value={form.price} onChange={(e) => handleChange("price", e.target.value)}
                    className="border-primary/30 text-lg h-12 font-bold"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Ảnh + Nút lưu */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hình ảnh sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tải ảnh lên</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button
                  variant="outline"
                  className="w-full h-11 border-dashed gap-2"
                  type="button"
                  onClick={() => document.getElementById("image-upload").click()}
                >
                  <UploadCloud className="w-5 h-5 opacity-70" />
                  {imageFile ? imageFile.name : "Chọn ảnh từ máy tính"}
                </Button>
              </div>

              {/* Preview ảnh */}
              <div className="aspect-square bg-muted/30 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center text-muted-foreground p-6">
                    <ImageIcon className="w-12 h-12 mx-auto opacity-30 mb-3" />
                    <p className="text-sm font-medium">Chưa có ảnh</p>
                    <p className="text-xs opacity-60 mt-1">Chọn file để xem trước</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full h-12 text-base font-bold gap-2"
            onClick={handleSave}
            disabled={loading}
            type="button"
          >
            {loading ? "Đang lưu..." : <><Save className="w-5 h-5" /> Lưu Sản Phẩm</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
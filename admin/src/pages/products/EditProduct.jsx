import { useState, useEffect } from "react";
import { productApi } from "../../services/modules/product.api";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useCategories } from "../../hooks/useCategories";
import { useVariants } from "../../hooks/useVariants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save, ImageIcon, UploadCloud } from "lucide-react";
import { getImg } from "../../lib/utils";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { categories } = useCategories();
  const { variants } = useVariants();
  const [product, setProduct] = useState({
    name: "",
    categoryId: "",
    variantId: "",
    price: "",
    description: "",
    imageUrl: "",
    slug: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productApi.getProductById(id);
        const data = response.data;
        setProduct({
          name: data.name || "",
          categoryId: data.category?.id || "",
          variantId: data.variant?.id || "",
          price: data.price || "",
          description: data.description || "",
          imageUrl: data.imageUrl || "",
          slug: data.slug || "",
        });
        if (data.imageUrl) {
          setImagePreview(getImg(data.imageUrl));
        }
      } catch (error) {
        toast.error("Không thể lấy dữ liệu sản phẩm.");
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  const selectedCategory = categories.find((c) => c.id == product.categoryId);
  const isPizza = selectedCategory?.slug?.toLowerCase().includes("pizza") || false;

  const handleChange = (field, value) => {
    setProduct((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "categoryId") {
        const cat = categories.find((c) => c.id == value);
        if (!(cat?.slug?.toLowerCase().includes("pizza"))) {
          next.variantId = "";
        }
      }
      return next;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!product.name || !product.price || !product.categoryId) {
      toast.error("Vui lòng điền đầy đủ: Tên, Danh mục và Giá!");
      return;
    }

    if (isPizza && !product.variantId) {
      toast.error("Vui lòng chọn Kích thước cho Pizza!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      const productPayload = {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        slug: product.slug,
        category: { id: parseInt(product.categoryId) },
        imageUrl: product.imageUrl, // Send current key in case no new image is selected
      };

      if (isPizza && product.variantId) {
        productPayload.variant = { id: parseInt(product.variantId) };
      } else {
        productPayload.variant = null; // Send null or omit it
      }

      formData.append("product", new Blob([JSON.stringify(productPayload)], { type: "application/json" }));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await productApi.editProduct(id, formData);
      toast.success("Cập nhật sản phẩm thành công!");
      navigate("/products");
    } catch (error) {
      console.error("Update product error:", error);
      toast.error("Lỗi khi cập nhật sản phẩm. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="p-10 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/products">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Sửa Sản Phẩm #{id}</h2>
          <p className="text-muted-foreground mt-1">Cập nhật thông tin chi tiết của món ăn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT FORM */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Tên sản phẩm *</Label>
                <Input
                  placeholder="VD: Pizza Hải Sản Nhiệt Đới"
                  value={product.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Danh mục *</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={product.categoryId}
                    onChange={(e) => handleChange("categoryId", e.target.value)}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {isPizza ? (
                  <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                    <Label className="text-primary font-bold">Kích thước (Bắt buộc) *</Label>
                    <select
                      className="w-full h-10 rounded-md border-2 border-primary/40 bg-primary/5 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={product.variantId}
                      onChange={(e) => handleChange("variantId", e.target.value)}
                    >
                      <option value="">-- Chọn Size --</option>
                      {variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          Size {v.size}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      💡 Phải có Kích thước đối với Pizza
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 opacity-50">
                    <Label>Kích thước</Label>
                    <div className="w-full h-10 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm flex items-center text-muted-foreground">
                      Không áp dụng
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Mô tả sản phẩm</Label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Mô tả thành phần, hương vị..."
                  value={product.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Giá bán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 bg-primary/5 p-4 rounded-xl border border-primary/20">
                <Label className="text-primary font-bold">
                  Giá (đồng) *{product.variantId && isPizza ? ` — Size ${variants.find(v => v.id == product.variantId)?.size || ""}` : ""}
                </Label>
                <Input
                  type="number"
                  placeholder="VD: 200000"
                  value={product.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="border-primary/30 text-lg h-12 font-bold"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: IMAGE PREVIEW & SAVE */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hình ảnh sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Thay đổi ảnh (File)</Label>
                <div className="flex items-center gap-2">
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
                    onClick={() => document.getElementById('image-upload').click()}
                  >
                    <UploadCloud className="w-5 h-5 opacity-70" />
                    {imageFile ? imageFile.name : "Chọn ảnh mới"}
                  </Button>
                </div>
              </div>

              {/* IMAGE PREVIEW */}
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full h-12 text-base font-bold gap-2 bg-primary hover:bg-primary/90 text-white"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : <><Save className="w-5 h-5" /> Lưu Thay Đổi</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

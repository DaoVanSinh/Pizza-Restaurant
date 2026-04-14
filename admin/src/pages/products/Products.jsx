import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import { useCategories } from "../../hooks/useCategories";
import { productApi } from "../../services/modules/product.api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, Tag } from "lucide-react";
import { getImg } from "../../lib/utils";

export default function Products() {
  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  
  // Categories from API
  const { categories } = useCategories();
  const categoryTabs = [{ label: "Tất cả", value: "" }, ...categories.map(c => ({ label: c.name, value: c.slug }))];
  
  // Dùng SWR Hook lấy data siêu tốc
  const { products, isLoading, mutate } = useAdminProducts(activeTab);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?")) {
      try {
        await productApi.deleteProduct(id);
        toast.success("Xóa sản phẩm thành công!");
        mutate(); // Tự động refetch danh sách không cần F5
      } catch (error) {
        toast.error("Lỗi khi xóa sản phẩm!");
      }
    }
  };

  const filtered = products
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      return 0;
    });

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Quản lý sản phẩm</h2>
          <p className="text-muted-foreground mt-1">Quản lý danh sách món ăn, biến thể và giá thành.</p>
        </div>
        <Link to="/addProducts">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> Thêm sản phẩm
          </Button>
        </Link>
      </div>

      {/* FILTER & SORT */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm tên sản phẩm..."
            className="pl-10 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="h-11 px-4 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="default">Sắp xếp: Mặc định</option>
          <option value="low">Giá thấp → cao</option>
          <option value="high">Giá cao → thấp</option>
        </select>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
        {categoryTabs.map((cat) => (
          <Button
            key={cat.value}
            variant={activeTab === cat.value ? "default" : "outline"}
            className={`rounded-full whitespace-nowrap ${activeTab === cat.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            onClick={() => setActiveTab(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
             <Card key={i} className="animate-pulse bg-muted rounded-xl h-64 border-none shadow-sm"></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
          <Tag className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.map((item) => (
            <Card key={item.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow group bg-card">
              <div className="h-[200px] overflow-hidden relative bg-muted/20">
                <img 
                  src={getImg(item.imageUrl)} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  onError={(e) => {
                    e.target.src = "https://placehold.co/400x400/png?text=No+Image";
                  }}
                />
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-primary">
                  {item.category?.name || item.category}
                </div>
              </div>
              <CardContent className="p-4">
                <h4 className="font-bold text-base truncate mb-2" title={item.name}>{item.name}</h4>
                <p className="text-primary font-bold">{item.price?.toLocaleString()}đ</p>
                {item.variant && (
                  <div className="mt-2">
                    <span className="bg-muted px-2 py-1 rounded text-[11px] text-muted-foreground">
                      Size {item.variant?.size || item.variant}
                    </span>
                  </div>
                )}
                
                <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/editProduct/${item.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs font-semibold gap-1 border-primary/20 hover:bg-primary/5 text-primary">
                      <Edit2 className="w-3 h-3"/> Sửa
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4"/>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
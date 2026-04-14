import { useState, useEffect } from "react";
import { productApi } from "../services/modules/product.api";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { Loader2 } from "lucide-react";
import { Tag } from "lucide-react";

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query.trim()) {
            setLoading(true);
            productApi.searchProducts(query)
                .then(res => {
                    const data = res.data || [];
                    // Nhóm các sản phẩm trùng tên, lấy giá thấp nhất
                    const map = {};
                    data.forEach((p) => {
                        const nameKey = p.name.trim().toLowerCase();
                        if (!map[nameKey] || p.price < map[nameKey].price) {
                            map[nameKey] = p;
                        }
                    });
                    setResults(Object.values(map));
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        } else {
            setResults([]);
            setLoading(false);
        }
    }, [query]);

    return (
        <div className="w-full px-[5%] py-[3%] min-h-[60vh]">
            <h2 className="text-3xl font-bold mb-8 text-foreground">
                Kết quả tìm kiếm cho: <span className="text-primary">"{query}"</span>
            </h2>
            
            {loading ? (
                <div className="flex justify-center items-center h-[300px]">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {results.map(p => (
                        <ProductCard key={p.id} product={p}/>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col flex-1 items-center justify-center p-8 text-center rounded-2xl bg-muted/40 border border-dashed border-border mt-10" style={{minHeight:"300px"}}>
                    <Tag className="w-12 h-12 mb-4 text-muted-foreground/30" />
                    <p className="text-[17px] font-semibold text-muted-foreground">Không tìm thấy sản phẩm nào phù hợp.</p>
                    <p className="text-sm mt-1 text-muted-foreground">Thử nhập từ khóa khác xem sao!</p>
                </div>
            )}
        </div>
    );
}

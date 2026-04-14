import { useState, useEffect } from "react";
import { productApi } from "../services/modules/product.api";
import ProductList from "./ProductList";

export default function MenuSection() {
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    productApi.getRaw("/client/products")
      .then(res => setAllProducts(res.data || []))
      .catch(err => console.error("Lỗi MenuSection:", err));
  }, []);
  const filterByCat = (cat) => allProducts.filter(item => item.category?.toLowerCase() === cat.toLowerCase());

  return (
    <>
      <ProductList title="Khuyến Mãi" products={filterByCat("khuyen-mai")}/>
      <ProductList title="Pizza" products={filterByCat("pizza")}/>
      <ProductList title="Gà Ngon Vibe" products={filterByCat("ga-ngon-vibe")}/>
      <ProductList title="Mì Ý" products={filterByCat("mi-y")}/>
      <ProductList title="Nui Bỏ Lò" products={filterByCat("nui-bo-lo")}/>
      <ProductList title="Khai Vị" products={filterByCat("khai-vi")}/>
      <ProductList title="Salad" products={filterByCat("salad")}/>
      <ProductList title="Thức Uống" products={filterByCat("thuc-uong")}/>
    </>
  );
}
import { Link } from "react-router-dom";
import { products} from "../data/products";
import ProductCard from "./ProductCard";
import ProductList from "./ProductList";

export default function MenuSection() {
  const promotionProducts = products.filter(
    item => item.category === "promotion"
  );
  const pizzaProducts = products.filter(
    item => item.category === "pizza"
  );
  const chickenVibeProducts = products.filter(
    item => item.category === "chickenVibe"
  );
  const pastaProducts = products.filter(
    item => item.category === "pasta"
  );
  const bakedProducts = products.filter(
    item => item.category ==="baked"
  );
  const appetizerProducts = products.filter(
    item => item.category === "appetizer"
  );
  const saladProducts = products.filter(
    item => item.category === "salad"
  );
  const drinkProducts = products.filter(
    item => item.category === "drink"
  );
  
  return (
    <>
    <ProductList title="Combo và những khuyến mãi" products={promotionProducts}/>
    <ProductList title="Pizza" products={pizzaProducts}/>
    <ProductList title="Gà Vibe" products={chickenVibeProducts}/>
    <ProductList title="Mì Ý" products={pastaProducts}/>
    <ProductList title="Nui bỏ lò" products={bakedProducts}/>
    <ProductList title="Khai vị" products={appetizerProducts}/>
    <ProductList title="Salad" products={saladProducts}/>
    <ProductList title="Thức uống" products={drinkProducts}/>
    </>
    
  )
}
import ProductList from "../components/ProductList";
import { useProducts } from "../hooks/useProducts";

export default function Drink() {
    return <ProductList category="thuc-uong" title="Thức uống" fetchHook={useProducts} />;
}

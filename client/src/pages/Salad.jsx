import ProductList from "../components/ProductList";
import { useProducts } from "../hooks/useProducts";

export default function Salad() {
    return <ProductList category="salad" title="Salad" fetchHook={useProducts} />;
}

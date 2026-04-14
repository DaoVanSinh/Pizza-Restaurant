import ProductList from "../components/ProductList";
import { useProducts } from "../hooks/useProducts";

export default function Pasta() {
    return <ProductList category="mi-y" title="Mì Ý" fetchHook={useProducts} />;
}
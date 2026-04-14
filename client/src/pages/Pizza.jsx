import ProductList from "../components/ProductList";
import { useProducts } from "../hooks/useProducts";

export default function Pizza() {
    return <ProductList category="pizza" title="Pizza" fetchHook={useProducts} />;
}

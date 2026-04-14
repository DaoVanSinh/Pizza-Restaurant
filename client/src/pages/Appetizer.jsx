import ProductList from "../components/ProductList";
import { useProducts } from "../hooks/useProducts";

export default function Appetizer() {
    return <ProductList category="khai-vi" title="Khai Vị" fetchHook={useProducts} />;
}

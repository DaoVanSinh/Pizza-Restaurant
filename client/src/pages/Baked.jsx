import ProductList from "../components/ProductList";
import { useProducts } from "../hooks/useProducts";

export default function Baked() {
    return <ProductList category="nui-bo-lo" title="Nui Bỏ Lò" fetchHook={useProducts} />;
}

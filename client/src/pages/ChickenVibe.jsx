import ProductList from "../components/ProductList";
import { useProducts } from "../hooks/useProducts";

export default function ChickenVibe() {
    return <ProductList category="ga-ngon-vibe" title="Gà Rán Xốt Vibe" fetchHook={useProducts} />;
}

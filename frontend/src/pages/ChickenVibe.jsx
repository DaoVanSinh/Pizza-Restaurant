import { products } from "../data/products"
import ProductCard from "../components/ProductCard"

export default function ChickenVibe({title}){
    const chickenVibeProducts = products.filter(p => p.category==="chickenVibe")

    return(
        <div className="productList">
            <h2>Gà Vibe</h2>

            <div className="product-list">
                {chickenVibeProducts.map(p => (
                    <ProductCard key={p.id} product={p}/>
                ))}
            </div>
        </div>
    )
}
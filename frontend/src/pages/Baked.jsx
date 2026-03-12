import { products } from "../data/products"
import ProductCard from "../components/ProductCard"

export default function Baked({title}){
    const bakedProducts = products.filter(p => p.category==="baked")

    return(
        <div className="productList">
            <h2>Nui bỏ lò</h2>

            <div className="product-list">
                {bakedProducts.map(p => (
                    <ProductCard key={p.id} product={p}/>
                ))}
            </div>
        </div>
    )
}
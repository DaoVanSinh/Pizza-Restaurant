import { products } from "../data/products"
import ProductCard from "../components/ProductCard"

export default function Salad({title}){
    const saladProducts = products.filter(p => p.category==="salad")

    return(
        <div className="productList">
            <h2>Salad</h2>

            <div className="product-list">
                {saladProducts.map(p => (
                    <ProductCard key={p.id} product={p}/>
                ))}
            </div>
        </div>
    )
}
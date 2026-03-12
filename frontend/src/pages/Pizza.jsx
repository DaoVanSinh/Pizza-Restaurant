import { products } from "../data/products"
import ProductCard from "../components/ProductCard"

export default function Pizza({title}){
    const pizzaProducts = products.filter(p => p.category==="pizza")

    return(
        <div className="productList">
            <h2>Pizza</h2>

            <div className="product-list">
                {pizzaProducts.map(p => (
                    <ProductCard key={p.id} product={p}/>
                ))}
            </div>
        </div>
    )
}
import { products } from "../data/products"
import ProductCard from "../components/ProductCard"

export default function Pasta({title}){
    const pastaProducts = products.filter(p => p.category==="pasta")

    return(
        <div className="productList">
            <h2>Mì Ý</h2>

            <div className="product-list">
                {pastaProducts.map(p => (
                    <ProductCard key={p.id} product={p}/>
                ))}
            </div>
        </div>
    )
}
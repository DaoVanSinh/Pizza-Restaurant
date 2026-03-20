import { products } from "../data/products"
import ProductCard from "../components/ProductCard"

export default function Appetizer({title}){
    const appetizerProducts = products.filter(p => p.category==="appetizer")

    return(
        <div className="productList">
            <h2>Khai vị</h2>

            <div className="product-list">
                {appetizerProducts.map(p => (
                    <ProductCard key={p.id} product={p}/>
                ))}
            </div>
        </div>
    )
}
import { products } from "../data/products"
import ProductCard from "../components/ProductCard"

export default function Drink({title}){
    const drinkProducts = products.filter(p => p.category==="drink")

    return(
        <div className="productList">
            <h2>Thức uống</h2>

            <div className="product-list">
                {drinkProducts.map(p => (
                    <ProductCard key={p.id} product={p}/>
                ))}
            </div>
        </div>
    )
}
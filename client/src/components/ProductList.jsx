import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";

export default function ProductList({ title, products }) {
    return (
        <div className="productList">
            <h2>{title}</h2>
            <div className="product-list">
                {}
                {products && products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            <div className="Link">
                <Link to="#">Xem thêm &rarr;</Link>
            </div>
        </div>
    )
}
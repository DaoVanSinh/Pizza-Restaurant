import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

export default function Pizza() {
    const [pizzaProducts, setPizzaProducts] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/api/products?category=Pizza")
            .then(res => {
                setPizzaProducts(res.data);
            })
            .catch(err => console.log("Lỗi kết nối Backend: ", err));
    }, []);

    return (
        <div className="productList">
            <h2>Pizza</h2>
            <div className="product-list">
                {pizzaProducts.map(p => (
                    <ProductCard key={p.id} product={p}/>
                ))}
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

export default function Drink() {
    const [drinkProducts, setDrinkProducts] = useState([]);

    useEffect(() => {
        
        axios.get("http://localhost:8080/api/products?category=Thức uống")
            .then(res => {
                setDrinkProducts(res.data);
            })
            .catch(err => console.log("Lỗi kết nối Backend: ", err));
    }, []);

    return (
        <div className="productList">
            <h2>Thức uống</h2>
            <div className="product-list">
                {drinkProducts.map(p => (
                    <ProductCard key={p.id} product={p}/>
                ))}
            </div>
        </div>
    );
}

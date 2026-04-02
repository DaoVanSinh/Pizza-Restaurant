import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

export default function Appetizer() {
    const [appetizerProducts, setAppetizerProducts] = useState([]);

    useEffect(() => {
        
        axios.get("http://localhost:8080/api/products?category=Khai vị")
            .then(res => {
                setAppetizerProducts(res.data);
            })
            .catch(err => console.log("Lỗi kết nối Backend: ", err));
    }, []);

    return (
        <div className="productList">
            <h2>Khai vị</h2>
            <div className="product-list">
                {appetizerProducts.map(p => (
                    <ProductCard key={p.id} product={p}/>
                ))}
            </div>
        </div>
    );
}

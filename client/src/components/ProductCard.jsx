import { useState } from "react";
import ProductModal from "./ProductModal";

export default function ProductCard({ product }) {
  const [showModal, setShowModal] = useState(false);
  // const [size, setSize] = useState(null);
  return (
    <>
    <div className="product-card" onClick={() => setShowModal(true)}>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="desc">{product.description}</p>
      <div className="bottom">
          <span>Giá chỉ từ</span>
        <div className="price">
          <h4>{product.price.toLocaleString()}đ</h4>
          <button onClick={() => setShowModal(true)}>Mua ngay &rarr;</button>
        </div>
      </div>
    </div>

    {showModal && 
    <ProductModal product={product} onClose={() => setShowModal(false)}/>}
    </>
  );
}

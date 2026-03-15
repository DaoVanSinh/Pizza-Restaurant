import { useState } from "react";

export default function ProductCard({ product }) {
  const [showModal, setShowModal] = useState(false);
  const [size, setSize] = useState(false)
  return (
    <>
    <div className="product-card">
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

    {showModal && (
      <div className="modal">
        <div className="modal-content">

          <button className="modal-close" onClick={() => setShowModal(false)}> &times; </button>

          <div className="modal-left">
            <img src={product.image} alt={product.name} />
            <div className="modal-price">
              {product.price.toLocaleString()}đ
            </div>
          </div>

          <div className="modal-right">
            <h3>{product.name}</h3>

            <label>Kích thước</label>
            <div className="size-group">
              <button className={size==="6" ? "size-btn active" : "size-btn"} onClick={() => setSize("6")}>Nhỏ 6"</button>

              <button className={size==="9" ? "size-btn active" : "size-btn"} onClick={() => setSize("9")}>Vừa 9"</button>

              <button className={size==="12" ? "size-btn active" : "size-btn"} onClick={() => setSize("12")}>Lớn 12"</button>
            </div>

            <label>Ghi chú</label>
            <textarea placeholder="Nhập ghi chú của bạn tại đây"></textarea>

            <button className="add-cart">
              Thêm vào giỏ hàng
            </button>
          </div>

        </div>
      </div>
    )}
    </>
  );
}

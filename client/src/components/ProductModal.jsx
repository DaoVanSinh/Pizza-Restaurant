import { useState } from "react"

export default function ProductModal({ product, onClose}){
    const [size, setSize] = useState(null);
    const sizes=[
        {label:'Nhỏ 6', value:"6"},
        {label:'Vừa 9', value:"9"},
        {label:'Lớn 12', value:"12"}
    ]
    return(
        <>
        <div className="modal">
        <div className="modal-content">

          <button className="modal-close" onClick={onClose}> &times; </button>

          <div className="modal-left">
            <img src={product.image} alt={product.name} />
            <div className="modal-price">
              {product.price.toLocaleString()}đ
            </div>
          </div>

          <div className="modal-right">
            <h3>{product.name}</h3>

            {product.category==="pizza" && (
                <>
                <label>Kích thước</label>
                <div className="size-group">
                {sizes.map((s) =>(
                    <button key={s.value} className={size===s.value ? "size-btn active" : "size-btn"} onClick={() => setSize(s.value)}>{s.label}</button>
                ))}
                </div>
                </>
            )}

            {product.category!=="pizza" && (
                <>
                <label>Mô tả</label>
                <p>{product.description}</p>
                </>
            )}

            <label>Ghi chú</label>
            <textarea placeholder="Nhập ghi chú của bạn tại đây"></textarea>

            <button className="add-cart">
              Thêm vào giỏ hàng
            </button>
          </div>

        </div>
      </div>
        </>
    )
}
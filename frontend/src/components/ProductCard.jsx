export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="desc">{product.description}</p>
      <div className="bottom">
          <span>Giá chỉ từ</span>
        <div className="price">
          <h4>{product.price.toLocaleString()}đ</h4>
          <button>Mua ngay &rarr;</button>
        </div>
      </div>
    </div>
  );
}




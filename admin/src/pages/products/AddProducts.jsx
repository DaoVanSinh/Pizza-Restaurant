import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function AddProduct() {

  const [product, setProduct] = useState({
    name: "",
    category: "Pizza",
    price: "",
    description: "",
    imageUrl: "",
    status: true
  });

  const handleSave = async () => {

    if (!product.name || !product.price) {
      alert("Vui lòng nhập tên và giá sản phẩm!");
      return;
    }
    try {
      // Gửi yêu cầu POST tới ProductController.java của bạn
      const response = await axios.post("http://localhost:8080/api/products/add", product);
      console.log("Kết quả từ Backend:", response.data);
      alert("Thêm sản phẩm thành công vào MySQL!");
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Lỗi khi lưu sản phẩm! Hãy kiểm tra Backend đã chạy chưa.");
    }
  };

  return (
    <div className="add-product">
      <div className="title-add">
        <Link className="come-back" to="/products">&larr;</Link>
        <h2>Thêm sản phẩm</h2>
      </div>

      <div className="form">
        {}
        <div className="form-left">
          <label>Tên sản phẩm</label>
          <input
            type="text"
            placeholder="Nhập tên pizza..."
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })} 
          />

          <label>Loại sản phẩm</label>
          <select
            value={product.category}
            onChange={(e) => setProduct({ ...product, category: e.target.value })}
          >
            <option value="Pizza">Pizza</option>
            <option value="Gà rán">Gà rán</option>
            <option value="Mì ý">Mì ý</option>
            <option value="Nui bỏ lò">Nui bỏ lò</option>
            <option value="Khai vị">Khai vị</option>
            <option value="Salad">Salad</option>
            <option value="Thức uống">Thức uống</option>
          </select>

          <label>Giá</label>
          <input
            type="number"
            placeholder="200000"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
          />

          <label>Mô tả</label>
          <textarea
            placeholder="Mô tả sản phẩm..."
            rows={4}
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
          ></textarea>
        </div>

        {}
        <div className="form-right">
          <label>URL Ảnh sản phẩm</label> {}
          <input
            type="text"
            placeholder="Dán link ảnh từ website tại đây..."
            value={product.imageUrl}
            onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
            style={{ marginBottom: '10px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <div className="upload-box" style={{ overflow: 'hidden' }}>
            {product.imageUrl ? <img src={product.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <p>+ Preview ảnh</p>}
          </div>

          <label>Trạng thái</label>
          <div className="status-toggle">
            <input
                type="checkbox"
                checked={product.status}
                onChange={(e) => setProduct({ ...product, status: e.target.checked })}
            />
            <span>Đang bán</span>
          </div>
        </div>
      </div>

      {}
      <div className="actions">
        <button className="cancel">Hủy</button>
        {}
        <button className="submit" onClick={handleSave}>Lưu sản phẩm</button>
      </div>
    </div>
  );
}
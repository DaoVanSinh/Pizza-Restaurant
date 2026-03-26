import { Link } from "react-router-dom";
import "../../style/products.css"


export default function AddProduct() {
  return (
    <div className="add-product">
        <div className="title-add">
            <Link className="come-back" to="/products">&larr;</Link>
            <h2>Thêm sản phẩm</h2>
        </div>

      <div className="form">
        {/* LEFT */}
        <div className="form-left">
          <label>Tên sản phẩm</label>
          <input type="text" placeholder="Nhập tên pizza..." />

          <label>Loại sản phẩm</label>
          <select>
            <option>Pizza</option>
            <option>Gà rán</option>
            <option>Mì ý</option>
            <option>Nui bỏ lò</option>
            <option>Khai vị</option>
            <option>Salad</option>
            <option>Thức uống</option>
          </select>

          <label>Giá</label>
          <input type="number" placeholder="200000" />

          <label>Mô tả</label>
          <textarea placeholder="Mô tả sản phẩm..." rows={4}></textarea>
        </div>

        {/* RIGHT */}
        <div className="form-right">
          <label>Ảnh sản phẩm</label>
          <div className="upload-box">
            <p>+ Tải ảnh lên</p>
          </div>

          <label>Trạng thái</label>
          <div className="status-toggle">
            <input type="checkbox" defaultChecked />
            <span>Đang bán</span>
          </div>
        </div>
      </div>

      {/* ACTION */}
      <div className="actions">
        <button className="cancel">Hủy</button>
        <button className="submit">Lưu sản phẩm</button>
      </div>
    </div>
  );
}
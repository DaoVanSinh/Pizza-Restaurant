import { useState, useEffect } from "react";
import axios from "axios";
import { FaBoxOpen } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../style/Products.css";

const categories = [
  "Pizza",
  "Gà rán",
  "Mì ý",
  "Nui bỏ lò",
  "Khai vị",
  "Salad",
  "Thức uống"
];

export default function Products() {
  const [activeTab, setActiveTab] = useState("Pizza");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  
  // 1. Tạo state để lưu danh sách sản phẩm thực tế từ Backend
  const [products, setProducts] = useState([]);

  // 2. Gọi API lấy dữ liệu mỗi khi đổi Tab hoặc load trang
  const fetchProducts = async () => {
    try {
      // Gọi đúng Endpoint lọc theo loại mà bạn đã viết ở Backend
      const response = await axios.get(`http://localhost:8080/api/products?category=${activeTab}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  // 3. Hàm xử lý Xóa sản phẩm thực tế trong MySQL
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?")) {
      try {
        await axios.delete(`http://localhost:8080/api/products/${id}`);
        alert("Xóa thành công!");
        fetchProducts(); // Tải lại danh sách sau khi xóa
      } catch (error) {
        alert("Lỗi khi xóa sản phẩm!");
      }
    }
  };

  // Logic lọc và sắp xếp dựa trên dữ liệu thật 'products'
  const filtered = products
    .filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      return 0;
    });

  return (
    <div className="padv-container">
      
      {/* HEADER */}
      <div className="padv-header">
        <div className="padv-title">
          <h2>Quản lý sản phẩm</h2>
        </div>
      </div>

      {/* FILTER */}
      <div className="padv-filter">
        <input
          placeholder="Tìm sản phẩm..."
          onChange={(e) => setSearch(e.target.value)}
        />

        <select onChange={(e) => setSort(e.target.value)}>
          <option value="default">Sắp xếp</option>
          <option value="low">Giá thấp → cao</option>
          <option value="high">Giá cao → thấp</option>
        </select>

         <Link to="/addProducts" className="padv-add-btn">
          + Thêm sản phẩm
        </Link>
      </div>

      {/* CATEGORY TABS */}
      <div className="padv-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={activeTab === cat ? "padv-active" : ""}
            onClick={() => setActiveTab(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID HIỂN THỊ DỮ LIỆU THẬT */}
      <div className="padv-grid">
        {filtered.length === 0 ? (
          <p className="padv-empty">Không có sản phẩm nào trong mục {activeTab}</p>
        ) : (
          filtered.map((item) => (
            <div className="padv-card" key={item.id}>
              {/* Lưu ý: Dùng item.imageUrl để khớp với Backend Sinh */}
              <img src={item.imageUrl} alt={item.name} />

              <div className="padv-info">
                <h4>{item.name}</h4>
                <p>{item.price?.toLocaleString()}đ</p>
              </div>

              <div className="padv-actions">
                <button className="edit">Sửa</button>
                {/* Gán hàm handleDelete vào nút Xóa */}
                <button className="danger" onClick={() => handleDelete(item.id)}>Xóa</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
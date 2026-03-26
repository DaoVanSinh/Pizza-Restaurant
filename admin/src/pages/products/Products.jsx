import { useState } from "react";
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

const mockData = [
  {
    id: 1,
    name: "Pizza Hải sản",
    category: "Pizza",
    price: "200.000đ",
    status: true,
    img: "http://thepizzacompany.vn/images/thumbs/000/0004576_chickenshrimplotusnulty_300.png"
  },
  {
    id: 2,
    name: "Gà rán giòn",
    category: "Gà rán",
    price: "120.000đ",
    status: true,
    img : "http://thepizzacompany.vn/images/thumbs/000/0004115_bbq-chicken-platter-2pcs_300.png"
  },
  {
    id: 3,
    name: "Mì ý Ngao xanh",
    category: "Mì ý",
    price: "120.000đ",
    status: true,
    img: "http://thepizzacompany.vn/images/thumbs/000/0004037_clams-spaghetti-with-thai-basil-sauce_300.png"
  },
  {
    id: 4,
    name: "Nui bỏ lò",
    category: "Nui bỏ lò",
    price: "120.000đ",
    status: true,
    img: "http://thepizzacompany.vn/images/thumbs/000/0004000_h-m-w-cream-sauce-macaroni_300.png"
  },
  {
    id: 5,
    name: "Khai vị",
    category: "Khai vị",
    price: "120.000đ",
    status: true,
    img : "http://thepizzacompany.vn/images/thumbs/000/0004137_platter-bbq_300.png"
  },
  {
    id: 6,
    name: "Salad trộn ngon",
    category: "Salad",
    price: "120.000đ",
    status: true,
    img : "http://thepizzacompany.vn/images/thumbs/000/0002252_garden-salad_300.png"
  },
  {
    id: 7,
    name: "7 up",
    category: "Thức uống",
    price: "120.000đ",
    status: true,
    img : "http://thepizzacompany.vn/images/thumbs/000/0004178_7-up-can_300.png"
    
  }
];

export default function Products() {
  const [activeTab, setActiveTab] = useState("Pizza");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [editItem, setEditItem] = useState(null);

  const filtered = mockData
    .filter(
      (item) =>
        item.category === activeTab &&
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
          <FaBoxOpen size={24} />
          <h2>Quản lý sản phẩm</h2>
        </div>

        <Link to="/addProducts" className="padv-add-btn">
          + Thêm sản phẩm
        </Link>
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
      </div>

      {/* CATEGORY */}
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

      {/* GRID */}
      <div className="padv-grid">
        {filtered.length === 0 ? (
          <p className="padv-empty">Không có sản phẩm</p>
        ) : (
          filtered.map((item) => (
            <div className="padv-card" key={item.id}>
              <img src={item.img} alt="" />

              <div className="padv-info">
                <h4>{item.name}</h4>
                <p>{item.price.toLocaleString()}đ</p>
              </div>

              <div className="padv-actions">
                <button onClick={() => setEditItem(item)}>Sửa</button>
                <button className="danger">Xóa</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL EDIT */}
      {editItem && (
        <div className="padv-overlay" onClick={() => setEditItem(null)}>
          <div
            className="padv-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Sửa sản phẩm</h3>

            <input defaultValue={editItem.name} />
            <input defaultValue={editItem.price} />

            <div className="padv-modal-actions">
              <button onClick={() => setEditItem(null)}>Hủy</button>
              <button className="save">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
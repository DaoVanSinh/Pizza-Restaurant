import LogoImg from "../assets/logo.png";
import { FaUser } from "react-icons/fa";
import AccountIcon from "../assets/account-icon.png";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";


export default function Header(){

    const menuItems = [
        { name: "Khuyến mãi", path: "/promotion" },
        { name: "Pizza", path: "/pizza" },
        { name: "Gà ngon Vibe", path: "/chickenvibe" },
        { name: "Nui bỏ lò", path: "/baked" },
        { name: "Mì ý", path: "/pasta" },
        { name: "Khai vi", path: "/appetizer" },
        { name: "Salad", path: "/salad" },
        { name: "Thức uống", path: "/drink" },
    ]

    return(
        <>
        
        <div className="header">
            <Link to="/">
                <img className="logo-icon" src={LogoImg} alt="Logo" />
            </Link>

            <div className="input">
                <input type="text" placeholder="Search..." />
                <button>Search</button>
            </div>

            <div className="account-section">
                <img className="account-icon" src={AccountIcon} alt="Account" />
                <h4>Đăng nhập / Đăng ký</h4>
            </div>
        </div>

        <nav className="topbar">
            <ul className="menu">
                {menuItems.map((item) => (
                <li key={item.name}>
                    <NavLink 
                    to={item.path} 
                    className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                    {item.name}
                    </NavLink>
                </li>
                ))}
            </ul>
        </nav>
        </>
        
    )
}
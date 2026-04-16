import LogoImg from "../assets/new_logo.png";
import AccountIcon from "../assets/account-icon.png";
import { Link, useNavigate, NavLink } from "react-router-dom";
import CartIcon from "./CartIcon";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getImg } from "../lib/utils";

export default function Header() {
    const menuItems = [
        { name: "Trang chủ", path: "/" },
        { name: "Pizza", path: "/pizza" },
        { name: "Gà Ngon Vibe", path: "/chickenvibe" },
        { name: "Nui Bỏ Lò", path: "/baked" },
        { name: "Mì Ý", path: "/pasta" },
        { name: "Khai Vị", path: "/appetizer" },
        { name: "Salad", path: "/salad" },
        { name: "Thức Uống", path: "/drink" },
    ];

    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const { user, isAuthenticated, logout } = useAuth(); // Dùng hook context
    const { orderType, setOrderType } = useCart();
    const displayAvatar = user?.avatarUrl ? getImg(user.avatarUrl) : AccountIcon;

    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-center sm:mx-4 md:mx-[50px] flex-wrap min-h-[100px] gap-4 py-4 md:py-0">
                <div className="flex gap-4 items-center">
                    <Link to="/">
                        <img className="w-[100px]" src={LogoImg} alt="Logo" />
                    </Link>
                    <div className="hidden lg:flex flex-col text-red-600 font-bold italic leading-tight">
                        <span className="text-3xl">0868612345</span>
                        <span className="text-xs uppercase bg-red-600 text-white w-max px-2 tracking-widest">Giao hàng nhanh</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row justify-center items-center gap-3 w-full lg:w-auto">
                    <div className="flex bg-gray-100 p-1 rounded-full shadow-inner w-full lg:w-auto">
                        <button
                            type="button"
                            onClick={() => setOrderType('DELIVERY')}
                            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-transform ${orderType === 'DELIVERY' ? 'bg-red-600 text-white shadow-md scale-105' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m.93 2.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2" /></svg>
                            Đặt giao hàng
                        </button>
                        <button
                            type="button"
                            onClick={() => setOrderType('PICKUP')}
                            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-transform ${orderType === 'PICKUP' ? 'bg-red-600 text-white shadow-md scale-105' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.93 1.707A1 1 0 0 1 4 1.5h8a1 1 0 0 1 .93.5l2 4a1 1 0 0 1 .07.5v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-7a1 1 0 0 1 .07-.5zM3 14h10V7h-1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7H3zm3-2v-1h4v1zm0-8h4v1H6zm-3.5 2H4v1a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4h1.5l-1.5-3H3.5l-1.5 3z" /></svg>

                            Đặt đến lấy
                        </button>
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto">
                        <div className="relative w-full lg:w-[240px]">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" /></svg>
                            <Input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-9 pr-4 rounded-full border-gray-300 focus-visible:ring-primary h-10"
                            />
                        </div>
                        <Button onClick={handleSearch} className="rounded-full bg-primary hover:bg-green-700 h-10 px-6 font-bold shadow-sm transition-transform hover:scale-105">
                            Tìm Kiếm
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link to={isAuthenticated ? "/profile" : "/login"}>
                        <img
                            className="w-[40px] md:w-[50px] h-[40px] md:h-[50px] rounded-full object-cover border border-slate-200"
                            src={displayAvatar}
                            alt="Account"
                            onError={(e) => { e.target.src = AccountIcon; }}
                        />
                    </Link>
                    {isAuthenticated ? (
                        <div className="flex flex-col">
                            <Link to="/profile" className="text-sm font-bold hover:text-primary transition-colors">
                                Chào, {user?.fullName || user?.username}
                            </Link>
                            <button
                                onClick={logout}
                                className="text-[11px] text-red-500 hover:text-red-700 hover:underline cursor-pointer text-left"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <div className="text-sm font-medium">
                            <Link to="/login" className="hover:text-primary hover:underline transition-colors">Đăng nhập</Link> /
                            <Link to="/register" className="hover:text-primary hover:underline transition-colors"> Đăng ký</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mục Menu (Topbar màu xanh) */}
            <nav className="bg-[#0b6b2d] py-[14px]">
                <ul className="flex justify-center items-center gap-2 md:gap-[25px] flex-wrap m-0 p-0 list-none">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            {item.isComingSoon ? (
                                <button
                                    onClick={() => toast.info("Tính năng Khuyến mãi đang được phát triển - Coming Soon!")}
                                    className="inline-block text-white opacity-70 cursor-not-allowed px-[14px] md:px-[22px] py-[8px] md:py-[10px] rounded-[30px] transition-colors duration-300 text-sm md:text-base"
                                >
                                    {item.name}
                                </button>
                            ) : (
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `inline-block text-white no-underline px-[14px] md:px-[22px] py-[8px] md:py-[10px] rounded-[30px] transition-colors duration-300 text-sm md:text-base ${isActive ? 'bg-[#063d1a]' : 'hover:bg-[#025421]'}`
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            )}
                        </li>
                    ))}
                    <div className="ml-4">
                        <CartIcon />
                    </div>
                </ul>
            </nav>
        </>
    );
}

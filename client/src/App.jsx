import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Drink from "./pages/Drink";
import Layout from "./components/Layout";
import Promotion from "./pages/Promotion";
import Pizza from "./pages/Pizza";
import ChickenVibe from "./pages/ChickenVibe";
import Baked from "./pages/Baked";
import Pasta from "./pages/Pasta";
import Appetizer from "./pages/Appetizer";
import Salad from "./pages/Salad";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ShoppingCart from "./pages/ShoppingCart";
import SearchPage from "./pages/Search";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordForm from "./pages/ResetPasswordForm";
import Profile from "./pages/Profile";
import VNPayReturn from "./pages/VNPayReturn";

import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { Toaster } from "./components/ui/Sonner";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/promotion" element={<Promotion />} />   
          <Route path="/pizza" element={<Pizza />} />   
          <Route path="/chickenvibe" element={<ChickenVibe />} />   
          <Route path="/baked" element={<Baked />} />   
          <Route path="/pasta" element={<Pasta />} />   
          <Route path="/appetizer" element={<Appetizer />} />   
          <Route path="/salad" element={<Salad />} />        
          <Route path="/drink" element={<Drink />} />        
          <Route path="/login" element={<Login />} />        
          <Route path="/forgot-password" element={<ForgotPassword />} />        
          <Route path="/reset-password" element={<ResetPasswordForm />} />        
          <Route path="/register" element={<Register />} />        
          <Route path="/shoppingcart" element={<ShoppingCart />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payment/vnpay-return" element={<VNPayReturn />} />
        </Route>
      </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
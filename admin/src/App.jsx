import './App.css'
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import AdminLayout from './components/AdminLayout';
import AuthGuard from './components/AuthGuard';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Report from './pages/Report';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products/Products';
import Account from './pages/Account';
import Staff from './pages/Staff/Staff';
import AddProduct from './pages/Products/AddProducts';
import EditProduct from './pages/products/EditProduct';
import AddStaff from './pages/staff/AddStaff';
import Pos from './pages/Pos';
import Orders from './pages/Orders';
import Transactions from './pages/Transactions';
import Promotion from './pages/Promotion/Promotion';
import { Toaster } from "@/components/ui/sonner";

function App() {

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Tất cả trang cho cả ADMIN và STAFF */}
        <Route path="/" element={<AuthGuard allowedRoles={["ADMIN", "STAFF"]}><AdminLayout/></AuthGuard>}>
          <Route index element={<Dashboard/>}/>
          <Route path="/orders" element={<Orders/>}/>
          <Route path="/transactions" element={<Transactions/>}/>
          <Route path="/account" element={<Account/>}/>
          <Route path="/pos" element={<Pos/>}/>

          {/* Trang chỉ dành cho ADMIN */}
          <Route path="/products" element={<AuthGuard allowedRoles={["ADMIN"]}><Products/></AuthGuard>}/>
          <Route path="/dashboard" element={<AuthGuard allowedRoles={["ADMIN"]}><Report/></AuthGuard>}/>
          <Route path="/staff" element={<AuthGuard allowedRoles={["ADMIN"]}><Staff/></AuthGuard>}/>
          <Route path="/promotions" element={<AuthGuard allowedRoles={["ADMIN"]}><Promotion/></AuthGuard>}/>
          <Route path="/addProducts" element={<AuthGuard allowedRoles={["ADMIN"]}><AddProduct/></AuthGuard>}/>
          <Route path="/editProduct/:id" element={<AuthGuard allowedRoles={["ADMIN"]}><EditProduct/></AuthGuard>}/>
          <Route path="/addStaff" element={<AuthGuard allowedRoles={["ADMIN"]}><AddStaff/></AuthGuard>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

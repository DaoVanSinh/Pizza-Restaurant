import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLayout from './components/AdminLayout';
import AuthGuard from './components/AuthGuard';
import Login from './pages/Login';
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
import { Toaster } from "@/components/ui/sonner";

function App() {

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Kẹp AuthGuard ở cấp Root để bảo vệ toàn bộ các trang Admin */}
        <Route path="/" element={<AuthGuard allowedRoles={["ADMIN", "STAFF"]}><AdminLayout/></AuthGuard>}>
          <Route index element={<Dashboard/>}/>
          <Route path="/orders" element={<Orders/>}/>
          <Route path="/transactions" element={<Transactions/>}/>
          <Route path="/products" element={<Products/>}/>
          {/* <Route path="/promotion" element={<Promotion/>}/> */}
          <Route path="/dashboard" element={<Report/>}/>
          <Route path="/staff" element={<Staff/>}/>
          <Route path="/account" element={<Account/>}/>
          <Route path="/addProducts" element={<AddProduct/>}/>
          <Route path="/editProduct/:id" element={<EditProduct/>}/>
          <Route path="/addStaff" element={<AddStaff/>}/>
          <Route path="/pos" element={<Pos/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

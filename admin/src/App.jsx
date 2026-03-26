import './App.css'
import Topbar from './components/AdminLayout'
// import Sidebar from './components/Sidebar'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLayout from './components/AdminLayout';
import Report from './pages/Report';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products/Products';
import Promotion from './pages/Promotion';
import Account from './pages/Account';
import Staff from './pages/Staff/Staff';
import AddProduct from './pages/Products/AddProducts';
// import AddStaff from './pages/Staff/AddStaff';
import AddStaff from './pages/staff/AddStaff';
import MoreAccount from './pages/Account';
import Pos from './pages/Pos';


function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<AdminLayout/>}>
        <Route index element={<Dashboard/>}/>
        <Route path="/products" element={<Products/>}/>
        <Route path="/promotion" element={<Promotion/>}/>
        <Route path="/dashboard" element={<Report/>}/>
        <Route path="/staff" element={<Staff/>}/>
        <Route path="/account" element={<Account/>}/>
        <Route path="/addProducts" element={<AddProduct/>}/>
        <Route path="/addStaff" element={<AddStaff/>}/>
        <Route path="/moreAccount" element={<MoreAccount/>}/>
        <Route path="/pos" element={<Pos/>}/>
      </Route>
    </Routes>
      <Topbar/>
    </BrowserRouter>
    </>
  )
}

export default App

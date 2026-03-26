import Topbar from "./AdminLayout.jsx"
import { Outlet } from "react-router-dom";


export default function Layout(){
    return(
        <>
            <Topbar/>
            <Outlet/>
        </>
    )
}
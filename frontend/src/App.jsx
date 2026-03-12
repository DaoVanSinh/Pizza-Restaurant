import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Drink from "./pages/Drink";
import Layout from "./components/Layout";
import Promotion from "./pages/Promotion/Promotion";
import Pizza from "./pages/Pizza";
import ChickenVibe from "./pages/ChickenVibe";
import Baked from "./pages/Baked";
import Pasta from "./pages/Pasta";
import Appetizer from "./pages/Appetizer";
import Salad from "./pages/Salad";


function App() {
  return (
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
        </Route>
         {/* <Route index element={<Home />}/>
         <Route path="/drink" element={<Drink />} /> */}
      </Routes>
  );
}

export default App;
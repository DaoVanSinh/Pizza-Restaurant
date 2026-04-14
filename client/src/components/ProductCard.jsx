import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductModal from "./ProductModal";
import { getImg } from "../lib/utils";

export default function ProductCard({ product }) {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <Card 
        className="flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.025] hover:shadow-xl rounded-2xl border-none shadow-[0_10px_25px_rgba(0,0,0,0.08)] bg-card"
        onClick={() => setShowModal(true)}
      >
        <div className="px-10 pt-6">
          <img 
            src={getImg(product.imageUrl)}
            alt={product.name} 
            className="w-full h-[200px] object-contain rounded-2xl block border-none outline-none"
            onError={(e) => {
              e.target.src = "https://placehold.co/400x400/png?text=No+Image";
            }}
          />
        </div>

        <CardHeader className="px-10 pb-0">
          <CardTitle className="min-h-[40px] text-lg font-bold">
            {product.name}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-10">
          <p className="min-h-[50px] text-muted-foreground text-sm line-clamp-3">
            {product.description}
          </p>
        </CardContent>

        <CardFooter className="px-10 pb-6 mt-auto flex flex-col items-start gap-2">
          <div className="w-full flex justify-between items-center">
             <div className="flex flex-col">
                 <span className="text-xs text-muted-foreground">Giá chỉ từ</span>
                 <h4 className="text-lg font-bold m-0">{product.price?.toLocaleString()}đ</h4>
             </div>
             <Button variant="outline" className="border-primary text-primary hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors w-[100px]" onClick={(e) => { e.stopPropagation(); setShowModal(true); }}>
               Mua ngay &rarr;
             </Button>
          </div>
        </CardFooter>
      </Card>

      {showModal && <ProductModal product={product} onClose={() => setShowModal(false)} />}
    </>
  );
}
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Promotion() {
  const navigate = useNavigate();
  const promotions = [
    {
      id: 1,
      image: "src/assets/promotion1.jpg",
      title: "MUA 1 TẶNG 1 THỨ 3 & THỨ 5",
      desc: "Chương trình Mua 1 Tặng 1 dành cho hạng thành viên của Pizza Ngon áp dụng khi mua Pizza size M hoặc size L kèm thức uống. Vui lòng liên hệ nhân viên để biết thêm chi tiết.",
    },
    {
      id: 2,
      image: "src/assets/promotion2.jpg",
      title: "COMBO XỊN XÒ CHỈ TỪ 199K",
      desc: "Combo 1 Pizza M + 1 Salad + 2 Nước tiết kiệm lên đến 50.000đ. Áp dụng cho ăn tại nhà hàng hoặc mang đi. Gọi ngay tổng đài để săn deal hot hôm nay!",
    }
  ];

  return (
    <div className="w-full px-[5%] md:px-[10%] py-[3%]">
      <h2 className="text-3xl font-bold mb-8 text-foreground">Chương trình khuyến mãi</h2>
      
      <div className="space-y-8">
        {promotions.map((promo) => (
          <Card key={promo.id} className="overflow-hidden border-none shadow-[0_10px_25px_rgba(0,0,0,0.08)] bg-card transition-transform duration-300 hover:scale-[1.015] hover:shadow-xl">
            <CardContent className="p-0 flex flex-col md:flex-row h-auto md:h-[220px]">
              {/* Hình ảnh */}
              <div className="w-full md:w-[400px] h-[200px] md:h-full shrink-0">
                <img 
                  src={promo.image} 
                  alt={promo.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Nội dung */}
              <div className="p-6 md:p-8 flex flex-col justify-center flex-grow">
                <h3 className="text-2xl font-bold mb-4 text-primary">{promo.title}</h3>
                <p className="text-muted-foreground line-clamp-3 mb-4">{promo.desc}</p>
                <div className="mt-auto">
                    <Button 
                        variant="outline" 
                        onClick={() => navigate("/")}
                        className="border-primary text-primary hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors w-[150px] rounded-lg"
                    >
                        Săn Deal Ngay &rarr;
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

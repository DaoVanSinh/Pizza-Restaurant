// import imgBanner from "../assets/banner.png"

// export default function Navbar() {
//   return (
//     <div className="navbar">
//       <img src={imgBanner} alt="banner"/>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import img1 from "../assets/banner.png"
import img2 from "../assets/banner2.png"
import img3 from "../assets/banner3.png"

export default function Slider() {
  
  const images = [
    img1,
    img2,
    img3,
  ];
  // clone ảnh đầu vào cuối để loop mượt
  const slides = [...images, images[0]];

  const [index, setIndex] = useState(0);
  const [transition, setTransition] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => prev + 1);
      setTransition(true);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // xử lý khi đến ảnh clone
  useEffect(() => {
    if (index === slides.length - 1) {
      setTimeout(() => {
        setTransition(false);
        setIndex(0);
      }, 500); // đúng bằng thời gian transition
    }
  }, [index, slides.length]);

  return (
    <div className="slider">
      <div
        className="slider-track"
        style={{
          transform: `translateX(-${index * 100}%)`,
          transition: transition ? "transform 0.5s ease" : "none",
        }}
      >
        {slides.map((img, i) => (
          <img key={i} src={img} alt="" />
        ))}
      </div>
    </div>
  );
} 
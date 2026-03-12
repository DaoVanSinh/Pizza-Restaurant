import {products} from "../../data/products";
import PromotionCard from "./PromotionCard";
import PromotionList from "./PromotionList";

export default function Promotion(){
    const promotionProducts = products.filter(p => p.category==="promotion")
    return(
        <>
        <PromotionList title="Các khuyến mãi và combo" product={promotionProducts} />
        </>
    )
}
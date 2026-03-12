import Promotion from "./Promotion";
import {products} from "../../data/products";
import PromotionCard from "./PromotionCard";


export default function PromotionList({title,product}) {
    return(
        <>
        <div className="promotionList">
            <h2>{title}</h2>
            <div>
                {product.map((product) => (
                    <PromotionCard key={product.id} product={product}/>
                ))}
            </div>
        </div>
        </>
    )
}
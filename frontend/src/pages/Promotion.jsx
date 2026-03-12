import { products } from "../data/products";

export default function Promotion(){
    const promotionProducts = products.filter(
        p => p.category === "promotion"
    );
    return(
        <>
            <PromotionList 
                title="Các khuyến mãi và combo" 
                product={promotionProducts} 
            />
        </>
    )
}

function PromotionList({title, product}) {
    return(
        <>
            <div className="promotionList">
                <h2>{title}</h2>
                <div>
                    {product.map((product) => (
                        <PromotionCard 
                            key={product.id} 
                            product={product}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

function PromotionCard({product}) {
    return(
        <>
            <div className="Promotion-container">
                <div className="Promotion-content">
                    <img 
                        src={product.image} 
                        alt="Promotion"
                    />
                    <div className="Promotion-details">
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <div className="promotion-price">
                        <button>
                            Xem chi tiết
                        </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
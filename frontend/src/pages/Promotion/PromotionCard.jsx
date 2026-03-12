export default function PromotionCard({product}) {
    return(
        <>  
        <div className="Promotion-container">
            <div className="Promotion-content">
                <img src={product.image} alt="Promotion"/>
                <div className="Promotion-details">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <button>Xem chi tiết</button>
                </div>
            </div>
        </div>
        </>
    )
}

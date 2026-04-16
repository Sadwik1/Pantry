const getExpiryStatus = (expiryDate) => {
    const diffDays = Math.ceil((new Date(expiryDate) - new Date().setHours(0,0,0,0)) / 86400000);
    if (diffDays < 0) return { status: 'Expired', color: '#cf6679' };
    if (diffDays <= 3) return { status: 'Soon', color: '#ffb74d' };
    return { status: 'OK', color: '#81c784' };
};

export default function ProductList({ products, onDelete }) {
    if (!products.length) return <p className="empty-pantry-text">You can see your future products here.</p>;

    return (
        <div className="pantry-scroll-container">
            <div className="products-container">
                {products.map((product) => {
                    const { status, color } = getExpiryStatus(product.expiryDate);
                    return (
                        <div key={product.id} className="product-card">
                            <div className="product-name">{product.name}</div>
                            <div className="product-expiry" style={{ color: color }}>
                                {product.expiryDate} ({status})
                            </div>
                            <button className="btn-delete-small" onClick={() => onDelete(product.id)}>
                                Remove
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
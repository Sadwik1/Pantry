const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expiryDate);
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'Expired', color: '#cf6679' };
    if (diffDays <= 2) return { status: 'Expiring Soon!', color: '#ffb74d' };
    return { status: 'Fresh', color: '#81c784' };
};

export default function ProductList({ products, onDelete }) {
    if (!products || products.length === 0) {
        return (
            <div className="form-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <h3>Pantry is empty</h3>
                <p style={{ color: '#a0a0a0', marginTop: '1rem' }}>Go to "Add Product" to restock.</p>
            </div>
        );
    }

    return (
        <div className="products-container">
            {products.map((product) => {
                const { status, color } = getExpiryStatus(product.expiryDate);
                return (
                    <div
                        key={product.id}
                        className="product-card"
                        style={{ borderLeft: `6px solid ${color}` }}
                    >
                        <div className="product-info">
                            <h3>{product.name} <span style={{ fontSize: '1rem', color: '#b3b3b3' }}>(x{product.quantity})</span></h3>
                            <div className="product-meta">
                                Expires: <strong style={{ color: '#e0e0e0' }}>{product.expiryDate}</strong> | Status: <span style={{ color: color, fontWeight: 'bold' }}>{status}</span>
                            </div>
                        </div>
                        <button className="btn-delete" onClick={() => onDelete(product.id)}>Consume</button>
                    </div>
                );
            })}
        </div>
    );
}
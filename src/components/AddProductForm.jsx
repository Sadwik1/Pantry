import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddProductForm({ onAdd }) {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [expiryDate, setExpiryDate] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !expiryDate) return;

        onAdd({
            id: Date.now(),
            name,
            quantity: Number(quantity),
            expiryDate,
        });
        navigate('/');
    };

    return (
        <div className="form-card">
            <h2>Add Product</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Product Name (EN)</label>
                    <input type="text" placeholder="e.g. Beef, Milk" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Quantity</label>
                    <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
                </div>
                <button type="submit" className="btn-submit">Add to Pantry</button>
            </form>
        </div>
    );
}
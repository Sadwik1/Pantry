
import { useState } from 'react';

export default function ShoppingList({ items, setItems, addToPantry }) {
    const [newItemName, setNewItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const addItem = (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        const newItem = {
            id: Date.now(),
            name: newItemName.trim(),
            quantity: quantity.trim(),
        };

        setItems([newItem, ...items]);
        setNewItemName('');
    };

    const toggleBought = (id) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, bought: !item.bought } : item
        ));
    };

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    return (
        <div className="shopping-list-page">
            <h2>Shopping List</h2>

            <div className="form-card" style={{ marginBottom: '2rem' }}>
                <form onSubmit={addItem} className="form-inline">
                    <div className="form-group">
                        <label>Product Name</label>
                        <input type="text" placeholder="e.g. Eggs" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Quantity</label>
                        <input type="text" placeholder="e.g. 100g" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-add-inline">Add</button>
                </form>
            </div>


            {items.length === 0 ? (
                <p className="empty-pantry-text">Your shopping list is empty.</p>
            ) : (
                <div className="pantry-scroll-container">
                    <div className="products-container">
                        {items.map(item => (
                            <div key={item.id} className="product-card">
                                <div className="product-name">
                                    {item.name}
                                </div>
                                <div className="product-quantity">
                                    Quantity: {item.quantity}
                                </div>
                                <button className="btn-delete-small" onClick={() => removeItem(item.id)}>
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
import React, { useState } from 'react';
import styles from './ShoppingList.module.css';

export default function ShoppingList({ items, setItems}) {
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
        setQuantity('');
    };

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    return (
        <div className="shopping-list-page">
            <h2>Shopping List</h2>

            <div className={styles.formCard} style={{ marginBottom: '2rem' }}>
                <form onSubmit={addItem} className={styles.formInline}>
                    <div className={styles.formGroup}>
                        <label>Product Name</label>
                        <input type="text" placeholder="e.g. Eggs" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Quantity</label>
                        <input type="text" placeholder="e.g. 100g" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                    </div>
                    <button type="submit" className={styles.btnAddInline}>Add</button>
                </form>
            </div>

            {items.length === 0 ? (
                <p className={styles.emptyPantryText}>Your shopping list is empty.</p>
            ) : (
                <div className={styles.pantryScrollContainer}>
                    <div className={styles.productsContainer}>
                        {items.map(item => (
                            <div key={item.id} className={`${styles.productCard} ${item.bought ? styles.itemBought : ''}`}>
                                <div className={styles.productName}>
                                    {item.name}
                                </div>
                                <div className={styles.productQuantity}>
                                    Quantity: {item.quantity}
                                </div>
                                <div className={styles.shoppingActions}>
                                    <button className={styles.btnDeleteSmall} onClick={() => removeItem(item.id)}>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
import { useState } from 'react';
import styles from './AddProductForm.module.css';

const getLevenshteinDistance = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

export default function AddProductForm({ onAdd, validIngredients }) {
    const [name, setName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [error, setError] = useState('');
    const [suggestion, setSuggestion] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuggestion('');

        if (!name || !expiryDate) return;

        const inputNameLower = name.toLowerCase().trim();

        if (validIngredients.length > 0 && !validIngredients.includes(inputNameLower)) {
            setError('Ingredient not recognized in the database.');
            
            let closest = '';
            let minDistance = Infinity;

            for (const ing of validIngredients) {
                const distance = getLevenshteinDistance(inputNameLower, ing);
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = ing;
                }
            }

            if (closest) {
                setSuggestion(closest);
            }
            return;
        }

        onAdd({
            id: Date.now(),
            name: name.trim(),
            expiryDate,
        });
        setName('');
        setExpiryDate('');
        setError('');
        setSuggestion('');
    };

    const applySuggestion = () => {
        setName(suggestion.charAt(0).toUpperCase() + suggestion.slice(1));
        setError('');
        setSuggestion('');
    };

    return (
        <div className={styles.formCard}>
            <form onSubmit={handleSubmit} className={styles.formInline}>
                <div className={styles.formGroup}>
                    <label>Product Name</label>
                    <input type="text" placeholder="e.g. Eggs" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                    <label>Expiry Date</label>
                    <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
                </div>
                <button type="submit" className={styles.btnAddInline}>Add Item</button>
            </form>
            
            {error && (
                <div className={styles.formError}>
                    {error}
                    {suggestion && (
                        <div className={styles.suggestionBox}>
                            Did you mean: <button type="button" className={styles.btnSuggestion} onClick={applySuggestion}>{suggestion}</button>?
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
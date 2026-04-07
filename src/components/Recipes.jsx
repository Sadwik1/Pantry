import { useState } from 'react';

export default function Recipes({ products }) {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchRecipes = async (ingredient) => {
        setLoading(true);
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient.toLowerCase()}`);
            const data = await response.json();
            setMeals(data.meals || []);
        } catch {
            setMeals([]);
        }
        setLoading(false);
    };

    return (
        <div>
            <h2>Recipe Finder</h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '1rem 0 2rem' }}>
                {products.map(p => (
                    <button key={p.id} className="btn-submit" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={() => fetchRecipes(p.name)}>
                        {p.name}
                    </button>
                ))}
            </div>
            {loading && <p>Searching...</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {meals.map(m => (
                    <div key={m.idMeal} className="form-card" style={{ textAlign: 'center' }}>
                        <img src={m.strMealThumb} alt={m.strMeal} style={{ width: '100%', borderRadius: '8px' }} />
                        <p style={{ marginTop: '10px' }}>{m.strMeal}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
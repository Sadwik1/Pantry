import { useState, useEffect } from 'react';

const getLevenshteinDistance = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
    }
    return matrix[b.length][a.length];
};

export default function Recipes({ products, validIngredients = [], onAddToShopping }) {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ingredientQuery, setIngredientQuery] = useState('');
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [allowMissing, setAllowMissing] = useState(true);
    const [limit, setLimit] = useState(9);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState('');
    const [suggestion, setSuggestion] = useState('');

    const fetchRecipesByIngredient = async (ingredient) => {
        if (!ingredient) return;
        setLoading(true);
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient.toLowerCase().trim()}`);
            const data = await response.json();
            const basicMeals = data.meals || [];
            const detailsPromises = basicMeals.slice(0, 20).map(async (m) => {
                const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`);
                const detailData = await res.json();
                return detailData.meals[0];
            });
            const detailedMeals = await Promise.all(detailsPromises);
            setMeals(detailedMeals);
        } catch {
            setMeals([]);
        }
        setLoading(false);
    };

    const handleSearchClick = () => {
        setError('');
        setSuggestion('');
        if (!ingredientQuery) return;
        const q = ingredientQuery.toLowerCase().trim();
        if (validIngredients.length > 0 && !validIngredients.includes(q)) {
            setError('Ingredient not recognized.');
            let closest = '';
            let minDistance = Infinity;
            for (const ing of validIngredients) {
                const distance = getLevenshteinDistance(q, ing);
                if (distance < minDistance) { minDistance = distance; closest = ing; }
            }
            if (closest) setSuggestion(closest);
            return;
        }
        fetchRecipesByIngredient(q);
        setCurrentPage(1);
    };

    const getIngredientsWithStatus = (meal) => {
        const pantryNames = products.map(p => p.name.toLowerCase().trim());
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ing = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ing && ing.trim() !== '') {
                const ingName = ing.toLowerCase().trim();
                const hasIngredient = pantryNames.some(p => p.includes(ingName) || ingName.includes(p));
                ingredients.push({ name: ing, measure: measure, isMissing: !hasIngredient });
            }
        }
        return ingredients;
    };

    const getMissingCount = (meal) => getIngredientsWithStatus(meal).filter(i => i.isMissing).length;

    let processedMeals = [...meals];
    if (!allowMissing) processedMeals = processedMeals.filter(m => getMissingCount(m) === 0);
    processedMeals.sort((a, b) => getMissingCount(a) - getMissingCount(b));

    const isUnlimited = limit === 'unlimited';
    const totalPages = isUnlimited ? 1 : Math.ceil(processedMeals.length / limit);
    const startIndex = isUnlimited ? 0 : (currentPage - 1) * limit;
    const paginatedMeals = isUnlimited ? processedMeals : processedMeals.slice(startIndex, startIndex + limit);

    return (
        <div>
            <h2>Recipe Finder</h2>
            <div className="recipe-toolbar">
                <div className="recipe-search-wrapper">
                    <div className="recipe-search-box">
                        <input
                            type="text"
                            placeholder="Search by main ingredient..."
                            value={ingredientQuery}
                            onChange={e => setIngredientQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearchClick()}
                            className="recipe-search-input"
                        />
                        <button className="btn-add-inline" onClick={handleSearchClick}>Search</button>
                    </div>
                </div>
                <div className="recipe-limit">
                    <label className="limit-label">Limit:</label>
                    <select value={limit} onChange={(e) => { setLimit(e.target.value === 'unlimited' ? 'unlimited' : Number(e.target.value)); setCurrentPage(1); }} className="limit-select">
                        <option value={6}>6</option>
                        <option value={9}>9</option>
                        <option value="unlimited">Unlimited</option>
                    </select>
                </div>
                <label className="checkbox-label">
                    <span>Missing ingredients</span>
                    <input type="checkbox" checked={allowMissing} onChange={(e) => { setAllowMissing(e.target.checked); setCurrentPage(1); }} />
                </label>
            </div>

            {loading && <p>Searching...</p>}

            <div className="recipe-grid">
                {paginatedMeals.map(m => (
                    <div key={m.idMeal} className="form-card recipe-card" onClick={() => setSelectedMeal(m)}>
                        <img src={m.strMealThumb} alt={m.strMeal} className="recipe-card-img" />
                        <p className="recipe-card-title">{m.strMeal}</p>
                        <p className={getMissingCount(m) === 0 ? "recipe-status-ok" : "recipe-status-missing"}>
                            {getMissingCount(m) === 0 ? 'Ready to cook!' : `Missing: ${getMissingCount(m)}`}
                        </p>
                    </div>
                ))}
            </div>

            {selectedMeal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setSelectedMeal(null)}>&times;</button>
                        <h2 className="modal-title">{selectedMeal.strMeal}</h2>
                        <div className="modal-grid">
                            <div>
                                <img src={selectedMeal.strMealThumb} alt={selectedMeal.strMeal} className="modal-img" />
                                <h4 className="modal-subtitle">Ingredients:</h4>
                                <ul className="modal-ing-list">
                                    {getIngredientsWithStatus(selectedMeal).map((ing, idx) => (
                                        <li key={idx} className={`modal-ing-item ${ing.isMissing ? 'ing-missing' : 'ing-ok'}`}>
                                            {ing.name} - {ing.measure}
                                            {ing.isMissing && (
                                                <button
                                                    className="btn-add-to-shop"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAddToShopping(ing.name);
                                                    }}
                                                    title="Add to shopping list"
                                                >+</button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="modal-subtitle">Instructions:</h4>
                                <p className="modal-instructions">{selectedMeal.strInstructions}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
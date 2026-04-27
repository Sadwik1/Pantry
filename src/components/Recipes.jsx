import { useState, useEffect } from 'react';
import styles from './Recipes.module.css';

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

export default function Recipes({
  products,
  validIngredients = [],
  onAddToShopping,
}) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ingredientQuery, setIngredientQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [allowMissing, setAllowMissing] = useState(true);
  const [limit, setLimit] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const fetchRecipes = async (ingredient) => {
    setLoading(true);
    try {
      let detailedMeals = [];

      if (!ingredient) {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=`
        );
        const data = await response.json();
        detailedMeals = data.meals || [];
      } else {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient
            .toLowerCase()
            .trim()}`
        );
        const data = await response.json();
        const basicMeals = data.meals || [];

        const detailsPromises = basicMeals.slice(0, 40).map(async (m) => {
          const res = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`
          );
          const detailData = await res.json();
          return detailData.meals[0];
        });
        detailedMeals = await Promise.all(detailsPromises);
      }

      setMeals(detailedMeals);
    } catch {
      setMeals([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecipes('');
  }, []);

  const handleSearchClick = () => {
    setError('');
    setSuggestion('');

    const q = ingredientQuery.toLowerCase().trim();

    if (q && validIngredients.length > 0 && !validIngredients.includes(q)) {
      setError('Ingredient not recognized.');
      let closest = '';
      let minDistance = Infinity;
      for (const ing of validIngredients) {
        const distance = getLevenshteinDistance(q, ing);
        if (distance < minDistance) {
          minDistance = distance;
          closest = ing;
        }
      }
      if (closest) setSuggestion(closest);
      return;
    }

    fetchRecipes(q);
    setCurrentPage(1);
  };

  const getIngredientsWithStatus = (meal) => {
    const pantryNames = products.map((p) => p.name.toLowerCase().trim());
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ing && ing.trim() !== '') {
        const ingName = ing.toLowerCase().trim();
        const hasIngredient = pantryNames.some(
          (p) => p.includes(ingName) || ingName.includes(p)
        );
        ingredients.push({
          name: ing,
          measure: measure,
          isMissing: !hasIngredient,
        });
      }
    }
    return ingredients;
  };

  const getMissingCount = (meal) =>
    getIngredientsWithStatus(meal).filter((i) => i.isMissing).length;

  let processedMeals = [...meals];
  if (!allowMissing)
    processedMeals = processedMeals.filter((m) => getMissingCount(m) === 0);
  processedMeals.sort((a, b) => getMissingCount(a) - getMissingCount(b));

  const isUnlimited = limit === 'unlimited';
  const totalPages = isUnlimited ? 1 : Math.ceil(processedMeals.length / limit);
  const startIndex = isUnlimited ? 0 : (currentPage - 1) * limit;
  const paginatedMeals = isUnlimited
    ? processedMeals
    : processedMeals.slice(startIndex, startIndex + limit);

  return (
    <div>
      <h2>Recipe Finder</h2>
      <div className={styles.recipeToolbar}>
        <div className={styles.recipeSearchWrapper}>
          <div className={styles.recipeSearchBox}>
            <input
              type="text"
              placeholder="Search ingredients..."
              value={ingredientQuery}
              onChange={(e) => setIngredientQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
              className={styles.recipeSearchInput}
            />
            <button className={styles.btnAddInline} onClick={handleSearchClick}>
              Search
            </button>
          </div>
        </div>

        <div className={styles.recipeLimit}>
          <label className={styles.limitLabel}>
            Limit:
            <select
              value={limit}
              onChange={(e) => {
                setLimit(
                  e.target.value === 'unlimited'
                    ? 'unlimited'
                    : Number(e.target.value)
                );
                setCurrentPage(1);
              }}
              className={styles.limitSelect}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value="unlimited">All</option>
            </select>
          </label>
        </div>

        <label className={styles.checkboxLabel}>
          <span>Missing Ingredients</span>
          <input
            type="checkbox"
            checked={allowMissing}
            onChange={(e) => {
              setAllowMissing(e.target.checked);
              setCurrentPage(1);
            }}
          />
        </label>
      </div>

      {error && (
        <div style={{ color: '#cf6679', marginBottom: '1rem' }}>
          {error}
          {suggestion && (
            <div>
              Did you mean:{' '}
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#bb86fc',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                }}
                onClick={() => {
                  setIngredientQuery(suggestion);
                  setError('');
                  setSuggestion('');
                  fetchRecipes(suggestion);
                }}
              >
                {suggestion}
              </button>
              ?
            </div>
          )}
        </div>
      )}

      {loading && <p>Searching...</p>}
      {!loading && processedMeals.length === 0 && <p>No recipes found.</p>}

      <div className={styles.recipeGrid}>
        {paginatedMeals.map((m) => (
          <div
            key={m.idMeal}
            className={styles.recipeCard}
            onClick={() => setSelectedMeal(m)}
          >
            <img
              src={m.strMealThumb}
              alt={m.strMeal}
              className={styles.recipeCardImg}
            />
            <p className={styles.recipeCardTitle}>{m.strMeal}</p>
            <p
              className={
                getMissingCount(m) === 0
                  ? styles.recipeStatusOk
                  : styles.recipeStatusMissing
              }
            >
              {getMissingCount(m) === 0
                ? 'Ready to cook!'
                : `Missing: ${getMissingCount(m)}`}
            </p>
          </div>
        ))}
      </div>

      {!loading &&
        processedMeals.length > 0 &&
        !isUnlimited &&
        totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              margin: '2rem 0',
            }}
          >
            <button
              className={styles.btnAddInline}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span style={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className={styles.btnAddInline}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

      {selectedMeal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedMeal(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              onClick={() => setSelectedMeal(null)}
            >
              &times;
            </button>
            <h2 className={styles.modalTitle}>{selectedMeal.strMeal}</h2>
            <div className={styles.modalGrid}>
              <div>
                <img
                  src={selectedMeal.strMealThumb}
                  alt={selectedMeal.strMeal}
                  className={styles.modalImg}
                />
                <h4 className={styles.modalSubtitle}>Ingredients:</h4>
                <ul className={styles.modalIngList}>
                  {getIngredientsWithStatus(selectedMeal).map((ing, idx) => (
                    <li
                      key={idx}
                      className={`${styles.modalIngItem} ${
                        ing.isMissing ? styles.ingMissing : styles.ingOk
                      }`}
                    >
                      <span>
                        {ing.name} - {ing.measure}
                      </span>
                      {ing.isMissing && (
                        <button
                          className="btn-add-to-shop"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToShopping(ing.name, ing.measure);
                          }}
                          title="Add to shopping list"
                        >
                          +
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className={styles.modalSubtitle}>Instructions:</h4>
                <p className={styles.modalInstructions}>
                  {selectedMeal.strInstructions}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

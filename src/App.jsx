import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import './styles.css';
import AddProductForm from './components/AddProductForm';
import ProductList from './components/ProductList';
import Recipes from './components/Recipes';
import ShoppingList from './components/ShoppingList';

export default function App() {
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('pantryProducts');
    if (savedProducts) {
      try {
        return JSON.parse(savedProducts);
      } catch (e) {
        console.error('Blad odczytu localStorage', e);
      }
    }
    return [];
  });

  const [shoppingItems, setShoppingItems] = useState(() => {
    const saved = localStorage.getItem('shoppingList');
    return saved ? JSON.parse(saved) : [];
  });

  const [validIngredients, setValidIngredients] = useState([]);

  useEffect(() => {
    localStorage.setItem('pantryProducts', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingItems));
  }, [shoppingItems]);

  useEffect(() => {
    fetch('https://www.themealdb.com/api/json/v1/1/list.php?i=list')
      .then((res) => res.json())
      .then((data) => {
        if (data.meals) {
          setValidIngredients(
            data.meals.map((m) => m.strIngredient.toLowerCase())
          );
        }
      })
      .catch(() => setValidIngredients([]));
  }, []);

  const handleAddProduct = (newProduct) => {
    setProducts([newProduct, ...products]);
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const addToShoppingList = (name, quantity) => {
    const newItem = { id: Date.now(), name, quantity };
    setShoppingItems((prev) => [newItem, ...prev]);
  };

  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <div className="app-brand">
            <h1>SmartPantry</h1>
          </div>
          <nav className="nav-menu">
            <NavLink to="/">Inventory</NavLink>
            <NavLink to="/recipes">Recipes</NavLink>
            <NavLink to="/shopping-list">Shopping List</NavLink>
          </nav>
          <div className="header-right"></div>
        </header>

        <main>
          <Routes>
            <Route
              path="/"
              element={
                <div className="pantry-page">
                  <section className="inline-form-section">
                    <AddProductForm
                      onAdd={handleAddProduct}
                      validIngredients={validIngredients}
                    />
                  </section>
                  <section>
                    <ProductList
                      products={products}
                      onDelete={handleDeleteProduct}
                    />
                  </section>
                </div>
              }
            />
            <Route
              path="/recipes"
              element={
                <Recipes
                  products={products}
                  validIngredients={validIngredients}
                  onAddToShopping={addToShoppingList}
                />
              }
            />
            <Route
              path="/shopping-list"
              element={
                <ShoppingList
                  items={shoppingItems}
                  setItems={setShoppingItems}
                  addToPantry={handleAddProduct}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

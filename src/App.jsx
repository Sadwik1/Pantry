import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './styles.css';
import AddProductForm from './components/AddProductForm';
import ProductList from './components/ProductList';
import Recipes from './components/Recipes';

export default function App() {
    const [products, setProducts] = useState([
        { id: 1, name: 'Chicken Breast', expiryDate: '2024-05-20' },
        { id: 2, name: 'Eggs', expiryDate: '2025-12-10' },
    ]);
    
    const [validIngredients, setValidIngredients] = useState([]);

    useEffect(() => {
        fetch('https://www.themealdb.com/api/json/v1/1/list.php?i=list')
            .then(res => res.json())
            .then(data => {
                if (data.meals) {
                    setValidIngredients(data.meals.map(m => m.strIngredient.toLowerCase()));
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
                    </nav>
                    <div className="header-right"></div>
                </header>

                <main>
                    <Routes>
                        <Route path="/" element={
                            <div className="pantry-page">
                                <section className="inline-form-section">
                                    <AddProductForm onAdd={handleAddProduct} validIngredients={validIngredients} />
                                </section>
                                <section>
                                    <ProductList products={products} onDelete={handleDeleteProduct} />
                                </section>
                            </div>
                        } />
                        <Route path="/recipes" element={<Recipes products={products} validIngredients={validIngredients} />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}
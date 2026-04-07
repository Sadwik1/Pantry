import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { useState } from 'react';
import './styles.css';
import AddProductForm from './components/AddProductForm';
import ProductList from './components/ProductList';
import Recipes from './components/Recipes';

export default function App() {
    const [products, setProducts] = useState([
        {
            id: 1,
            name: 'Chicken',
            quantity: 2,
            expiryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        },
        {
            id: 2,
            name: 'Pasta',
            quantity: 5,
            expiryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        },
    ]);

    const handleAddProduct = (newProduct) => {
        setProducts([...products, newProduct]);
    };

    const handleDeleteProduct = (id) => {
        setProducts(products.filter((product) => product.id !== id));
    };

    return (
        <Router>
            <div className="app-container">
                <header className="header">
                    <h1>YourPantry</h1>

                    <nav className="nav-menu">
                        <NavLink to="/">My Pantry</NavLink>
                        <NavLink to="/add">Add Product</NavLink>
                        <NavLink to="/recipes">Recipes</NavLink>
                    </nav>
                </header>

                <main className="main-layout">
                    <Routes>
                        <Route path="/" element={<ProductList products={products} onDelete={handleDeleteProduct} />} />
                        <Route path="/add" element={<AddProductForm onAdd={handleAddProduct} />} />
                        <Route path="/recipes" element={<Recipes products={products} />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}
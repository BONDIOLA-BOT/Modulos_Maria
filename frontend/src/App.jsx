import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Register from "./pages/Register";
import Users from "./pages/Users";
import Cart from "./pages/Cart";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Users" element={<Users />} />
        <Route path="/Products" element={<Products />} />
        <Route path="/Cart" element={<Cart />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

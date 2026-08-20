import { useEffect, useState } from "react";
import { Link } from "react-router";
import ProductCard from "../components/product_card";
import { api } from "../services/api";
import { getUserFromToken } from "../services/auth";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  const user = getUserFromToken();
  const isAdmin = user?.rol === "Admin";

  const fetchProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data.data);
  };

  const addProductToCart = async (id) => {
    try {
      await api.post("/carrito/items", { product_id: id, quantity: 1 });
      setMessage("Agregado al carrito");
      fetchProducts();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error al agregar al carrito");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-300 p-8 flex flex-col items-center gap-4">
      <h1 className="text-3xl font-bold">Productos</h1>
      {isAdmin && <h2 className="text-sm text-yellow-600">SOS ADMIN</h2>}

      {message && <p className="text-sm text-blue-600">{message}</p>}

      <div className="flex gap-4">
        <Link className="bg-blue-500 text-white rounded px-4 py-2" to="/Users">
          Usuarios
        </Link>
        <Link className="bg-blue-500 text-white rounded px-4 py-2" to="/Cart">
          Carrito
        </Link>
      </div>

      <ul className="w-2xl bg-sky-200 flex flex-wrap justify-center gap-4 p-5 rounded-xl">
        {products.map((product) => (
          <ProductCard
            key={product.id_product}
            product={product}
            onAddToCart={addProductToCart}
          />
        ))}
      </ul>
    </div>
  );
}

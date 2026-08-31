import { useEffect, useState } from "react";
import { Link } from "react-router";
import ProductCard from "../components/product_card";
import { api } from "../services/api";
import { getUserFromToken } from "../services/auth";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  const user = getUserFromToken();
  const isAdmin = user?.rol === "Admin";

  const fetchProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data.data);
  };

  const handleSubmit = async () => {
    try {
      await api.post("/products", form);
      setMessage("Producto creado");
      setForm({ name: "", description: "", price: "", stock: "" });
      fetchProducts();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error al crear producto");
    }
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
        <Link
          className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 cursor-pointer"
          to="/Users"
        >
          Usuarios
        </Link>
        <Link
          className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 cursor-pointer"
          to="/Cart"
        >
          Carrito
        </Link>
      </div>

      {isAdmin && (
        <div className="mx-auto bg-blue-50 p-5 rounded-xl shadow">
          <h2 className="text-lg font-bold mb-3">Agregar producto</h2>
          <div className="flex gap-2 mb-4">
            <input
              className="border p-2 flex-1 rounded"
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="border p-2 flex-1 rounded"
              placeholder="Descripcion"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <input
              className="border p-2 w-24 rounded"
              type="number"
              placeholder="Precio"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <input
              className="border p-2 w-24 rounded"
              type="number"
              min="0"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />

            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600 cursor-pointer"
            >
              Crear
            </button>
          </div>
        </div>
      )}

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

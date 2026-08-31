import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../services/api";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get("/carrito");
      setCart(res.data.data);
    } catch (err) {
      setMessage("Error al cargar carrito");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantity = async (idDetalle, newQty) => {
    try {
      setMessage("");
      const res = await api.put(`/carrito/items/${idDetalle}`, {
        quantity: newQty,
      });
      setCart(res.data.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error al actualizar cantidad");
    }
  };

  const handleRemove = async (idDetalle) => {
    try {
      setMessage("");
      const res = await api.delete(`/carrito/items/${idDetalle}`);
      setCart(res.data.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error al eliminar item");
    }
  };

  const handleClear = async () => {
    try {
      setMessage("");
      await api.delete("/carrito");
      setCart(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error al vaciar carrito");
    }
  };

  const handleCheckout = async () => {
    try {
      setMessage("");
      const res = await api.post("/carrito/checkout");
      setMessage(
        `Compra realizada! Total: ${res.data.data.total}`,
      );
      setCart(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error al procesar compra");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-300 p-8 flex flex-col items-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-300 p-8 flex flex-col items-center gap-4">
      <h1 className="text-3xl font-bold">Carrito</h1>

      <Link
        className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 cursor-pointer"
        to="/Products"
      >
        Productos
      </Link>

      {message && <p className="text-sm text-blue-600">{message}</p>}

      {!cart || cart.items.length === 0 ? (
        <div className="bg-blue-50 p-5 rounded-xl shadow">
          <p className="text-gray-500">Tu carrito esta vacio</p>
          <Link to="/Products" className="text-blue-600 text-sm hover:text-blue-700">
            Ir a productos
          </Link>
        </div>
      ) : (
        <div className="w-2xl flex flex-col gap-4">
          <ul className="bg-sky-200 rounded-xl p-5 flex flex-col gap-3">
            {cart.items.map((item) => (
              <li
                key={item.id_detalle}
                className="bg-blue-50 p-4 rounded-xl shadow flex justify-between items-center"
              >
                <div className="flex flex-col">
                  <span className="font-bold">{item.name}</span>
                  <span className="text-sm text-gray-600">
                    ${item.price} c/u
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {item.quantity === 1 ? (
                      <button
                        onClick={() => handleRemove(item.id_detalle)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 cursor-pointer"
                      >
                        Quitar
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleQuantity(item.id_detalle, item.quantity - 1)
                        }
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 cursor-pointer"
                      >
                        -
                      </button>
                    )}

                    <span className="w-8 text-center">{item.quantity}</span>

                    <button
                      onClick={() =>
                        handleQuantity(item.id_detalle, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.stock}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-blue-500 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <span className="w-20 text-right font-bold">
                    ${item.price * item.quantity}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="bg-blue-50 p-5 rounded-xl shadow flex justify-between items-center">
            <span className="text-xl font-bold">
              Total: ${cart.pedido.total}
            </span>
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer"
              >
                Vaciar
              </button>
              <button
                onClick={handleCheckout}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
              >
                Comprar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

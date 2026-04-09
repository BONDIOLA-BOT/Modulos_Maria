import { useEffect, useState } from "react";
import { api } from "../services/api";
import Buscador from "../components/buscador";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: "", password: "" });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
        setMessage("Usuario actualizado");
      } else {
        await api.post("/users", form);
        setMessage("Usuario creado");
      }

      setForm({ username: "", password: "" });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error");
    }
  };

  const handleEdit = (user) => {
    setForm({ username: user.username, password: "" });
    setEditingId(user.id);
  };

  const handleDelete = async (id) => {
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gray-300 p-8 gap-8 flex flex-col items-center">
      <Buscador />

      <div className="max-w-xl mx-auto bg-blue-50 p-5 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>

        {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}

        <div className="flex gap-2 mb-4">
          <input
            className="border p-2 flex-1 rounded"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <input
            className="border p-2 flex-1 rounded"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 rounded"
          >
            {editingId ? "Editar" : "Crear"}
          </button>
        </div>

        <ul>
          {users.map((u) => (
            <li
              key={u.id}
              className="flex justify-between items-center border-b py-2"
            >
              <span>{u.username}</span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(u)}
                  className="text-yellow-600"
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(u.id)}
                  className="text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
6;

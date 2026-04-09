import { api } from "../services/api";
import { useState } from "react";

export default function Buscador() {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = () => {
    if (!username.trim()) return;
    setError("");

    api
      .post(`/users/searchByName`, { username })
      .then((response) => {
        setResults(response.data.data);
      })
      .catch((error) => {
        console.error(error);
        setError("Error al buscar usuario");
      });
  };

  return (
    <div className="max-w-xl mx-auto bg-blue-100 p-5 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Buscador de usuarios</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-1 rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value) && handleSearch()}
        />
        <button
          className="p-2 bg-blue-500 text-white rounded"
          onClick={handleSearch}
        >
          Buscar
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map((user) => (
            <li key={user.id} className="bg-white p-3 rounded shadow-sm">
              {user.username}
            </li>
          ))}
        </ul>
      )}

      {results.length === 0 && username && (
        <p className="text-gray-500 text-sm">Sin resultados</p>
      )}
    </div>
  );
}

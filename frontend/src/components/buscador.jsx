import { api } from "../services/api";
import { useState, useEffect } from "react";

export default function Buscador() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const isId = /^\d+$/.test(query);
    const endpoint = isId ? "/users/searchById" : "/users/searchByName";
    const body = isId ? { id: Number(query) } : { username: query };

    setLoading(true);
    setError("");

    const timeout = setTimeout(() => {
      api
        .post(endpoint, body)
        .then((response) => {
          const data = response.data.data;
          setResults(Array.isArray(data) ? data : [data]);
        })
        .catch(() => setError("Error al buscar usuario"))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="max-w-xl mx-auto bg-blue-100 p-5 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Buscador de usuarios</h1>

      <input
        className="border p-2 w-full rounded mb-4"
        placeholder="Nombre o ID..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p className="text-gray-400 text-sm mb-2">Buscando...</p>}
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {!loading && results.length > 0 && (
        <ul className="space-y-2">
          {results.map((user) => (
            <li
              key={user.id}
              className="bg-white p-3 rounded shadow-sm flex justify-between"
            >
              <span>{user.username}</span>
              <span className="text-gray-400 text-sm">#{user.id}</span>
            </li>
          ))}
        </ul>
      )}

      {!loading && results.length === 0 && query.trim() && !error && (
        <p className="text-gray-500 text-sm">Sin resultados para "{query}"</p>
      )}
    </div>
  );
}

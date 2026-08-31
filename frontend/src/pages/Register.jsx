import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../services/api";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  const inputStyle = "border-stone-900 border-2 rounded-lg p-2";
  const containerStyle =
    "flex flex-col items-center justify-center self-center bg-cyan-50 border-2 border-cyan-300 rounded-lg max-w-xl p-8 m-10";
  const titleStyle = "text-2xl p-3";
  const formStyle = "flex flex-col gap-5";
  const buttonStyle =
    "bg-blue-500 text-white p-2 m-2 rounded-lg hover:bg-blue-600";

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password.trim()) {
      setMessage("Complete todos los campos");
      return;
    }
    try {
      const response = await api.post("/users", form);
      if (response.status === 200) {
        setMessage("Usuario creado exitosamente");
        console.log(response.data);
        navigate("/"); //por que esto no funciona? es de frontend no importa mucho.
      } else if (response.status === 400 || response.status === 500) {
        setMessage("Error al crear el usuario");
        console.log(response.data);
      }
    } catch (error) {
      setMessage("Error grave al crear el usuario");
      console.log(error);
    }
  };

  return (
    <div className={containerStyle}>
      <h1 className={titleStyle}>Crear Usuario</h1>
      <form onSubmit={handleSubmit} className={formStyle}>
        <input
          type="text"
          className={inputStyle}
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          className={inputStyle}
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit" className={buttonStyle}>
          Register
        </button>
      </form>
      <Link to="/" className="text-blue-600 hover:text-blue-700">
        Tengo una cuenta
      </Link>
      {message && <p>{message}</p>}
    </div>
  );
}

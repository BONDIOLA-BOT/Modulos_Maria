import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Link, useNavigate } from "react-router";

export default function Login() {
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

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password.trim()) {
      setMessage("Complete todos los campos");
      return;
    }
    try {
      const response = await api.post("/login", form);
      if (response.status === 200) {
        setMessage("Login exitoso");
        console.log(response.data);
        // Guardar token en localStorage
        localStorage.setItem("token", response.data.token);
        navigate("/Users");
      } else {
        setMessage("Login fallido");
        console.log(response.data);
      }
    } catch (error) {
      setMessage("Error al iniciar sesión");
      console.log(error);
    }
  };

  return (
    <div className={containerStyle}>
      <h1 className={titleStyle}>Login</h1>
      <form onSubmit={handleLogin} className={formStyle}>
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
          Login
        </button>
      </form>
      <p>
        No estas registrado?
        <Link to="/register" className="text-blue-600 hover:text-blue-700">
          {" "}
          Registrarse
        </Link>
      </p>
      {message && <p>{message}</p>}
    </div>
  );
}

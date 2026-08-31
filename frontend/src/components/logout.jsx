import { Link, useNavigate } from "react-router";
import { api } from "../services/api";

export default function Logout() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      console.log("Te deslogueaste");
      const response = await api.post("/logout");

      if (response.status === 200) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } catch (err) {
      console.error("Error al logout:", err.response?.data || err.message);
    }
  };

  return (
    <Link
      onClick={logout}
      className="bg-red-600 px-2 py-1.5 rounded-lg hover:bg-red-500 cursor-pointer absolute top-1/32 left-1/32"
    >
      Logout
    </Link>
  );
}

import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // ❌ Remove token
    navigate("/login"); // 🔄 Redirect to login page
  };

  return (
    <nav className="flex justify-between p-4 bg-blue-500 text-white">
      <h1 className="text-2xl font-bold">⭐Root Auto Grade⭐</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;

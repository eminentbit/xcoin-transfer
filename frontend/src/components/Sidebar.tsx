import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Repeat,
  History,
  LogOut,
  Menu,
  X,
} from "lucide-react";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="z-50">
      {/* Mobile Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 min-h-screen w-64 bg-[#323131] text-white flex flex-col p-5 transition-transform duration-300 md:translate-x-0 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo / Brand Name */}
        <div className="text-xl font-bold mb-8 text-center">Xcoin Wallet</div>

        {/* Navigation Links */}
        <ul className="space-y-4 flex-1">
          <li>
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <Home size={20} />
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/buy-xcoin"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <ShoppingCart size={20} />
              Buy Xcoin
            </Link>
          </li>
          <li>
            <Link
              to="/convert-xcoin"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <Repeat size={20} />
              Convert Xcoin
            </Link>
          </li>
          <li>
            <Link
              to="/transaction-history"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <History size={20} />
              Transaction History
            </Link>
          </li>
        </ul>

        {/* Logout Button */}
        <img
          src="/Contact card alipay.jpg"
          alt="Contact Card Alipay"
          className="w-32 h-auto mx-auto my-4 rounded"
        />
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("transaction_reference");
            sessionStorage.removeItem("transaction_id");
            navigate("/login");
          }}
          className="flex items-center gap-3 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors duration-200"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default Sidebar;

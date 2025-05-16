import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DefaultProfile from "@/assets/profile.png";
import { ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/utils/types";

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleDropdown = (): void => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = async (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("transaction_reference");
    sessionStorage.removeItem("transaction_id");
    navigate("/login");
  };
  const user: UserProfile = JSON.parse(sessionStorage.getItem("user") || "");
  const fName = user.name.split(" ");

  return (
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-semibold text-gray-800">
        Welcome, {user != null ? user.name : ""}
      </h1>
      <div className="relative" ref={dropdownRef}>
        <div className="flex flex-row justify-center items-center hover:scale-95 cursor-pointer">
          <button
            type="button"
            onClick={() => {
              navigate("/profile");
            }}
            className="flex items-center focus:outline-none cursor-pointer"
          >
            <div className="cursor-pointer">
              <Avatar className="cursor-pointer">
                <AvatarImage src={DefaultProfile} alt="User Avatar" />
                <AvatarFallback>User</AvatarFallback>
              </Avatar>
            </div>
          </button>
          <div
            className="flex cursor-pointer"
            onClick={() => {
              navigate("/profile");
            }}
          >
            <ChevronDown onClick={toggleDropdown} className="hidden" />
            {fName.map((char, index) => {
              return (
                <span key={index}>{char.charAt(0).toUpperCase() + "."}</span>
              );
            })}
          </div>
        </div>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50 cursor-pointer">
            <a
              href="/profile"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Profile
            </a>
            <a
              href="/settings"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Settings
            </a>
            <div className="flex flex-row text-white hover:bg-red-700 bg-red-500 cursor-pointer justify-center items-center rounded-sm">
              <LogOut className="pl-1" />
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

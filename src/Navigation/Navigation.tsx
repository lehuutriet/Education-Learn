import { useEffect, useState } from "react";
import { X, Search, Menu, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/auth/authProvider";
import { useNavigate } from "react-router-dom";
import SearchInput from "../Search/SearchInput";
import SearchHistory from "../Search/SearchHistory";

const Navigation = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const { account } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const user = await account.get();
        setIsAdmin(user.labels?.includes("Admin") || false);
        setUserData({
          name: user.name || "",
          email: user.email || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    getUserData();
  }, [account]);

  const handleAdminNav = () => {
    navigate("/admin");
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const aboutMenuItems = [
    {
      column: "left",
      items: [
        { label: "Our Story", link: "#" },
        { label: "Mission", link: "#" },
        { label: "Leadership", link: "#" },
        { label: "Faculty & Staff", link: "#" },
      ],
    },
    {
      column: "right",
      items: [
        { label: "Campus & Facilities", link: "#" },
        { label: "History", link: "#" },
        { label: "Careers", link: "#" },
      ],
    },
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsAboutDropdownOpen(false);
  };

  return (
    <nav className="px-4 md:px-6 py-4 border-b bg-white relative">
      <div className="flex items-center justify-between w-full">
        {/* Logo Section */}
        <div
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            navigate("/homepage");
            closeMobileMenu();
          }}
        >
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">VGM</span>
          </div>
          <span className="ml-3 text-lg font-semibold text-gray-900">VGM</span>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center flex-1 px-8">
          <div className="flex items-center space-x-8">
            <div className="relative group">
              <a
                href="#"
                className="text-purple-600 hover:text-purple-700 border-b-2 border-purple-600 py-2"
              >
                About
              </a>
              {/* Desktop About Dropdown */}
              <div className="absolute left-0 top-full mt-1 w-[500px] bg-[#f7f4f0] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-4 flex">
                  {aboutMenuItems.map((column, columnIndex) => (
                    <div key={columnIndex} className="flex-1 px-8">
                      {column.items.map((item, itemIndex) => (
                        <a
                          key={itemIndex}
                          href={item.link}
                          className="block py-3 text-sm hover:text-purple-600 text-gray-800 font-medium transition-colors"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/education")}
              className="text-gray-700 hover:text-gray-900 py-2"
            >
              Education
            </button>
            <a href="#" className="text-gray-700 hover:text-gray-900 py-2">
              Admissions
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 py-2">
              Community
            </a>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop User Controls */}
        <div className="hidden md:flex items-center space-x-4">
          {isAdmin && (
            <button
              onClick={handleAdminNav}
              className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 transition-colors rounded"
            >
              Trang Admin
            </button>
          )}
          <button
            onClick={() => navigate("/classroomManagement")}
            className="group relative px-4 py-2 bg-white text-gray-800 border border-gray-300 hover:bg-purple-600 hover:text-white hover:border-transparent transition-all duration-300 rounded flex items-center"
          >
            Lớp học
            <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          </button>

          {/* Desktop User Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {userData.name[0] || "U"}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {userData.name || "User"}
              </span>
            </button>

            <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-4 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {userData.name}
                </p>
                <p className="text-sm text-gray-500">{userData.email}</p>
              </div>
              <div className="py-2">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Notifications
                </a>
              </div>
              <div className="border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-white z-40 md:hidden"
          style={{ top: "73px" }}
        >
          <div className="p-4 space-y-4">
            {/* Mobile About Section */}
            <div>
              <button
                onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
                className="flex items-center justify-between w-full p-2 text-gray-700"
              >
                <span>About</span>
                <ChevronDown
                  className={`w-5 h-5 transform transition-transform ${
                    isAboutDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isAboutDropdownOpen && (
                <div className="pl-4 space-y-2 mt-2">
                  {aboutMenuItems.map((column) =>
                    column.items.map((item, index) => (
                      <a
                        key={index}
                        href={item.link}
                        className="block p-2 text-gray-600 hover:text-purple-600"
                        onClick={closeMobileMenu}
                      >
                        {item.label}
                      </a>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                navigate("/education");
                closeMobileMenu();
              }}
              className="block w-full p-2 text-left text-gray-700"
            >
              Education
            </button>
            <a href="#" className="block p-2 text-gray-700">
              Admissions
            </a>
            <a href="#" className="block p-2 text-gray-700">
              Community
            </a>

            <div className="pt-4 border-t border-gray-200">
              {isAdmin && (
                <button
                  onClick={handleAdminNav}
                  className="block w-full p-2 mb-2 text-white bg-purple-600 rounded"
                >
                  Trang Admin
                </button>
              )}
              <button
                onClick={() => {
                  navigate("/classroomManagement");
                  closeMobileMenu();
                }}
                className="block w-full p-2 text-gray-800 border border-gray-300 rounded mb-4"
              >
                Lớp học
              </button>
            </div>

            {/* Mobile User Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="p-2">
                <p className="font-medium text-gray-900">{userData.name}</p>
                <p className="text-sm text-gray-500">{userData.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="block w-full p-2 text-left text-red-600"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-[#f7f4f0] z-50">
          <div className="max-w-4xl mx-auto px-6 pt-24">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-8 right-8 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <SearchInput />
            <SearchHistory />
          </div>
          <div className="fixed bottom-0 left-0 right-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 120"
              className="w-full"
            >
              <path
                fill="#ffffff"
                fillOpacity="1"
                d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,53.3C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              ></path>
            </svg>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;

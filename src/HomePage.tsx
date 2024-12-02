import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useAuth } from "./contexts/auth/authProvider";
import { useNavigate } from "react-router-dom";
import SearchInput from "./Search/SearchInput";
const HomePage = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { account } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{ name: string; email: string }>({
    name: "",
    email: "",
  });
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

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const user = await account.get();
        setIsAdmin(user.labels?.includes("Admin") || false);
      } catch (error) {
        console.error("Error checking admin role:", error);
      }
    };
    checkAdminRole();
  }, [account]);

  const handleAdminNav = () => {
    navigate("/admin");
  };
  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  const popularSearches = [
    { label: "Classroom Portals", link: "#" },
    { label: "Campus", link: "#" },
    { label: "Application Process", link: "#" },
    { label: "Tuition and Assistance", link: "#" },
    { label: "FAQs", link: "#" },
    { label: "Careers", link: "#" },
    { label: "Giving", link: "#" },
    { label: "School Store", link: "#" },
  ];
  const aboutMenuItems = [
    // Left Column
    {
      column: "left",
      items: [
        { label: "Our Story", link: "#" },
        { label: "Mission", link: "#" },
        { label: "Leadership", link: "#" },
        { label: "Faculty & Staff", link: "#" },
      ],
    },
    // Right Column
    {
      column: "right",
      items: [
        { label: "Campus & Facilities", link: "#" },
        { label: "History", link: "#" },
        { label: "Careers", link: "#" },
      ],
    },
  ];
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">VGM</span>
            </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">
              VGM School
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {/* About Dropdown */}
            <div className="relative group">
              <a
                href="#"
                className="text-purple-600 hover:text-purple-700 border-b-2 border-purple-600 py-2"
              >
                About
              </a>
              {/* Dropdown Menu */}
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

            <a href="#" className="text-gray-700 hover:text-gray-900 py-2">
              Education
            </a>
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

            {/* Search Modal */}
            {/* Search Modal */}
            {isSearchOpen && (
              <div className="fixed inset-0 bg-[#f7f4f0] z-50">
                <div className="max-w-4xl mx-auto px-6 pt-24">
                  {/* Close button */}
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute top-8 right-8 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* Search input - Replace the old input with the new SearchInput component */}
                  <SearchInput />

                  {/* Popular Searches */}
                  <div className="mt-16">
                    <h3 className="text-lg font-serif text-gray-900 mb-8">
                      Popular Searches
                    </h3>
                    <div className="grid grid-cols-4 gap-x-8 gap-y-4">
                      {popularSearches.map((item, index) => (
                        <a
                          key={index}
                          href={item.link}
                          className="text-[15px] text-gray-700 hover:text-purple-600 transition-colors duration-200 font-normal"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Wave decoration at bottom */}
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
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAdmin && (
              <button
                onClick={handleAdminNav}
                className="px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 transition-colors rounded"
              >
                Admin Panel
              </button>
            )}
            <button className="group relative px-4 py-2 bg-white text-gray-800 border border-gray-300 hover:bg-purple-600 hover:text-white hover:border-transparent transition-all duration-300 rounded flex items-center">
              CLASSROOM PORTALS
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </button>

            {/* User Account Dropdown */}
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

              {/* Dropdown Menu */}
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
      </nav>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Social Media Link */}
        <div className="mb-12">
          <a href="#" className="inline-block">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-800">IG</span>
            </div>
          </a>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 text-gray-900">
            The Washington Market School
          </h1>
          <p className="text-xl text-gray-600">
            An independent preschool in Tribeca serving the community and its
            children since 1976
          </p>
        </div>

        {/* Illustration Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Learning Materials */}
          <div className="border p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-pink-50 p-2 rounded">
                <div className="flex flex-wrap gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-blue-400" />
                  ))}
                </div>
              </div>
              <div className="bg-pink-50 p-2 rounded">
                <div className="border-2 border-gray-400 rounded-full w-12 h-12" />
              </div>
              <div className="bg-pink-50 p-2 rounded">
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-full bg-red-400" />
                  <div className="w-4 h-4 rounded-full bg-red-400" />
                </div>
              </div>
              <div className="bg-pink-50 p-2 rounded">
                <div className="transform rotate-45 w-8 h-8 bg-brown-400" />
              </div>
              <div className="col-span-2 bg-pink-50 p-2 rounded">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-4 bg-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Educational Tools */}
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-800" />
            <div className="w-16 h-4 bg-gray-400" />
            <div className="w-8 h-8 rounded-full border-2 border-blue-400" />
          </div>

          {/* Musical Instruments */}
          <div className="space-y-4">
            <div className="w-32 h-16 bg-green-200 rounded" />
            <div className="w-full h-12 flex items-center justify-center">
              <div className="w-48 h-8 bg-brown-400 flex items-center justify-between px-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1 h-full bg-black" />
                ))}
              </div>
            </div>
          </div>

          {/* Learning Tools */}
          <div className="space-y-8">
            <div className="w-16 h-24 bg-blue-200 rounded" />
            <div className="flex flex-wrap gap-2">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-red-400" />
              ))}
            </div>
            <div className="w-8 h-32 bg-coral-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

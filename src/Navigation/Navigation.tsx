import { useEffect, useState } from "react";
import { X, Menu } from "lucide-react";
import { useAuth } from "../contexts/auth/authProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import UserProfileModal from "./UserProfileModal";
import NotificationComponent from "./Notification";
import { motion } from "framer-motion";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);
  const { account } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    avatarUrl: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const FETCH_COOLDOWN = 60000; // 1 minute cooldown
  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update getCachedUserData to include session check
  const getCachedUserData = () => {
    const currentSession = localStorage.getItem("currentSession");
    const cached = localStorage.getItem("userData");
    if (cached && currentSession) {
      const data = JSON.parse(cached);
      if (data.sessionId === currentSession) {
        return data;
      }
    }
    return null;
  };

  // Update getUserData to include session ID
  const getUserData = async () => {
    const now = Date.now();
    if (now - lastFetch < FETCH_COOLDOWN) {
      const cached = getCachedUserData();
      if (cached) {
        setIsAdmin(cached.isAdmin || false);
        setUserData(cached);
        return;
      }
    }

    try {
      const session = await account.getSession("current");
      const user = await account.get();
      const userData = {
        name: user.name || "",
        email: user.email || "",
        avatarUrl: user.prefs?.avatarUrl || "",
        isAdmin: user.labels?.includes("Admin") || false,
        sessionId: session.$id, // Add session ID to userData
      };

      localStorage.setItem("currentSession", session.$id);
      localStorage.setItem("userData", JSON.stringify(userData));

      setIsAdmin(userData.isAdmin);
      setUserData(userData);
      setLastFetch(now);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Sửa lại useEffect
  useEffect(() => {
    // Kiểm tra cache trước
    const cached = getCachedUserData();
    if (cached) {
      setIsAdmin(cached.isAdmin || false);
      setUserData(cached);
    } else {
      getUserData();
    }

    const handleUserUpdate = () => {
      localStorage.removeItem("userData"); // Xóa cache khi có update
      setLastFetch(0);
      getUserData();
    };
    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, [account]);
  const handleNavigation = (path: string) => {
    window.scrollTo(0, 0); // Scroll lên đầu trang
    navigate(path);
  };

  const handleAdminNav = () => {
    navigate("/admin");
    setIsMobileMenuOpen(false);
  };

  // Update handleLogout to clear user data
  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      // Clear user data
      localStorage.removeItem("userData");
      localStorage.removeItem("currentSession");
      setUserData({
        name: "",
        email: "",
        avatarUrl: "",
      });
      setIsAdmin(false);

      toast.success("Đăng xuất thành công!", {
        icon: "👋",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      navigate("/");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng xuất");
      console.error("Error during logout:", error);
    }
  };

  // Check if a link is active
  const isActiveLink = (path: string) => {
    if (path === "#") return false; // Ignore anchor links
    return location.pathname.startsWith(path);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { text: "Trang chủ", path: "/homepage" },
    { text: "Bài học", path: "/lessonGrid" },
    { text: "Câu chuyện", path: "/story" },
    { text: "Đề kiểm tra", path: "/exam" },
    { text: "Ngôn ngữ kí hiệu", path: "/sign-language" },
    { text: "Từ điển", path: "/Dictionary" },
    { text: "Thảo luận", path: "/discussion" },
    { text: "Góp ý", path: "/feedback" },
  ];

  return (
    <div className={`relative ${isScrolled ? "pt-[80px]" : ""}`}>
      <nav
        className={`
          w-full
          ${
            isScrolled
              ? "fixed top-0 left-0 right-0 bg-white shadow-lg animate-slideDown"
              : "relative bg-white/50 backdrop-blur-sm"
          } 
          px-6 py-3
          transition-all duration-300 ease-in-out
          z-50
        `}
      >
        <div className="max-w-[1540px] mx-auto flex items-center justify-between gap-4">
          {/* Modern Logo Section */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => {
              navigate("/homepage");
              closeMobileMenu();
            }}
          >
            <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
              <span className="text-white font-bold text-xl">VGM</span>
            </div>
            <div className="ml-3 relative overflow-hidden">
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform inline-block">
                VGM Education
              </span>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          </div>

          {/* Modern Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 space-x-1 flex-nowrap">
            {menuItems.map((item, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation(item.path)}
                className={`
                    whitespace-nowrap relative px-4 py-2 rounded-lg text-sm font-medium
                    ${
                      isActiveLink(item.path)
                        ? "text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                    transition-all duration-200
                `}
              >
                {item.text}
              </motion.button>
            ))}
          </div>

          {/* Modern Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Classroom Management Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/classroomManagement")}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              <span className="flex items-center space-x-2">
                <i className="ri-school-line"></i>
                <span>Lớp học</span>
              </span>
            </motion.button>

            {/* Online Classroom Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/online-classroom")}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              <span className="flex items-center space-x-2">
                <i className="ri-video-line"></i>
                <span>Phòng học online</span>
              </span>
            </motion.button>

            {/* Modern Notification Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            ></motion.div>

            {/* Modern User Profile Section */}
            <div className="relative group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md">
                  {userData.avatarUrl ? (
                    <img
                      src={userData.avatarUrl}
                      alt={userData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-medium">
                      {userData.name[0] || "U"}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {userData.name || "User"}
                </span>
              </motion.button>
              {isProfileModalOpen && (
                <UserProfileModal
                  isOpen={isProfileModalOpen}
                  onClose={() => setIsProfileModalOpen(false)}
                />
              )}
              {/* Modern Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                <div className="p-4 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                    {userData.name}
                  </p>
                  <p className="text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                    {userData.email}
                  </p>
                </div>
                <div className="py-2">
                  {/* Thêm mục thiết lập thông tin người dùng */}
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 
                    rounded-lg transition-colors group/item"
                  >
                    <i className="ri-user-settings-line text-lg text-gray-400 group-hover/item:text-purple-600 mr-3"></i>
                    <span className="text-sm font-medium">
                      Thông tin cá nhân
                    </span>
                  </button>
                </div>

                {/* Admin Section */}
                {isAdmin && (
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={handleAdminNav}
                      className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 
                      rounded-lg transition-colors group/item"
                    >
                      <i className="ri-admin-line text-lg text-gray-400 group-hover/item:text-purple-600 mr-3"></i>
                      <span className="text-sm font-medium">
                        Trang Quản trị viên
                      </span>
                    </button>
                  </div>
                )}
                {/* Favorites Section */}
                <div className="py-2 border-t border-gray-100">
                  <button
                    onClick={() => navigate("/favorite-words")}
                    className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 
    rounded-lg transition-colors group/item"
                  >
                    <i className="ri-heart-line text-lg text-gray-400 group-hover/item:text-purple-600 mr-3"></i>
                    <span className="text-sm font-medium">Từ yêu thích</span>
                  </button>
                </div>
                {/* Logout Section */}
                <div className="p-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 
                    rounded-lg transition-colors group/item"
                  >
                    <i className="ri-logout-box-line text-lg group-hover/item:text-red-600 mr-3"></i>
                    <span className="text-sm font-medium">Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-600 hover:bg-violet-50 transition-colors"
          >
            <NotificationComponent />
          </motion.button>
          {/* Modern Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors md:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>
        </div>

        {/* Modern Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: isMobileMenuOpen ? 1 : 0,
            y: isMobileMenuOpen ? 0 : -20,
          }}
          className={`
    fixed inset-0 bg-white z-40 md:hidden overflow-hidden overflow-y-auto 
    ${isMobileMenuOpen ? "block" : "hidden"}
  `}
          style={{
            top: "80px",
            height: "calc(100vh - 80px)", // Chiều cao = 100vh - chiều cao của header
            scrollbarWidth: "none", // Ẩn thanh scroll trên Firefox
            msOverflowStyle: "none", // Ẩn thanh scroll trên IE/Edge
          }}
        >
          <div className="p-4 space-y-4">
            {/* Mobile About Section */}

            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  navigate(item.path);
                  closeMobileMenu();
                }}
                className={`block w-full p-2 text-left transition-colors ${
                  isActiveLink(item.path) ? "text-purple-600" : "text-gray-700"
                }`}
              >
                {item.text}
              </button>
            ))}

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  navigate("/classroomManagement");
                  closeMobileMenu();
                }}
                className={`block w-full p-2 text-gray-800 border border-gray-300 rounded mb-4 hover:bg-purple-600 hover:text-white hover:border-transparent transition-colors ${
                  isActiveLink("/classroomManagement")
                    ? "bg-purple-600 text-white border-transparent"
                    : ""
                }`}
              >
                Lớp học
              </button>
            </div>

            {/* Mobile User Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="p-2">
                <p className="font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                  {userData.name}
                </p>
                <p className="text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                  {userData.email}
                </p>
              </div>
              {/* Thêm mục thiết lập thông tin người dùng cho mobile */}
              <button className="block w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Thông tin người dùng
              </button>
              {isAdmin && (
                <button
                  onClick={handleAdminNav}
                  className="block w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Trang Quản trị viên
                </button>
              )}
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </motion.div>
      </nav>
    </div>
  );
};

export default Navigation;

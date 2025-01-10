import { useEffect, useState } from "react";
import { X, Menu, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/auth/authProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import UserProfileModal from "./UserProfileModal";
import NotificationComponent from "./Notification";
const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
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
  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const user = await account.get();
        setIsAdmin(user.labels?.includes("Admin") || false);
        setUserData({
          name: user.name || "",
          email: user.email || "",
          avatarUrl: user.prefs?.avatarUrl || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    getUserData();

    // Lắng nghe sự kiện cập nhật
    const handleUserUpdate = () => {
      getUserData();
    };
    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, [account]);
  const handleAdminNav = () => {
    navigate("/admin");
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
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
    setIsAboutDropdownOpen(false);
  };

  return (
    <div className={`relative ${isScrolled ? "pt-[73px]" : ""}`}>
      <nav
        className={`
          w-full
          ${
            isScrolled
              ? "fixed top-0 left-0 right-0 backdrop-blur-md bg-white/80 shadow-lg animate-slideDown"
              : "relative bg-transparent"
          } 
          px-6 py-4
          transition-all duration-300 ease-in-out
          z-50
        `}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Section - Left aligned */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => {
              navigate("/homepage");
              closeMobileMenu();
            }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-all duration-300">
              <span className="text-white font-bold text-xl">VGM</span>
            </div>
            <span className="ml-3 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              VGM Education
            </span>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex  items-center justify-center">
            <div className="flex items-center space-x-8">
              {[
                { text: "Trang chủ", path: "/homepage" },
                { text: "Câu chuyện", path: "/story" },
                { text: "Bài học", path: "/lessonGrid" },
                { text: "Đề kiểm tra", path: "/exam" },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className={`relative px-3 py-2 text-base font-medium transition-colors
                  ${
                    isActiveLink(item.path)
                      ? "text-purple-600"
                      : "text-gray-700 hover:text-purple-600"
                  }
                  before:content-['']
                  before:absolute 
                  before:bottom-0
                  before:left-0
                  before:w-full
                  before:h-0.5
                  before:bg-gradient-to-r
                  before:from-purple-600
                  before:to-indigo-600
                  before:transform
                  before:scale-x-0
                  before:transition-transform
                  before:duration-300
                  hover:before:scale-x-100
                `}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
          {/* Desktop User Controls - Right aligned */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate("/feedback")}
              className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-2"
            >
              <i className="ri-feedback-line text-lg"></i>
              Hỗ Trợ
            </button>
            <button
              onClick={() => navigate("/classroomManagement")}
              className={`
                relative overflow-hidden px-6 py-2.5
                bg-gradient-to-r from-purple-600 to-indigo-600
                text-white rounded-lg
                transform hover:scale-105
                transition-all duration-300
                before:content-['']
                before:absolute
                before:top-0
                before:left-0
                before:w-full
                before:h-full
                before:bg-gradient-to-r
                before:from-purple-700
                before:to-indigo-700
                before:opacity-0
                before:transition-opacity
                before:duration-300
                hover:before:opacity-100
                shadow-md
              `}
            >
              <span className="relative z-10 flex items-center">
                Lớp học
                <svg
                  className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </button>

            {/* User Dropdown - Updated Style */}
            <div className="relative group">
              <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
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
              </button>
              {isProfileModalOpen && (
                <UserProfileModal
                  isOpen={isProfileModalOpen}
                  onClose={() => setIsProfileModalOpen(false)}
                />
              )}
              {/* Dropdown Menu - Updated Style */}

              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                <div className="p-4 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {userData.name}
                  </p>
                  <p className="text-sm text-gray-500">{userData.email}</p>
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

                  <button
                    className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 
                  rounded-lg transition-colors group/item"
                  >
                    <i className="ri-notification-3-line text-lg text-gray-400 group-hover/item:text-purple-600 mr-3"></i>
                    <span className="text-sm font-medium">Thông báo</span>{" "}
                    <NotificationComponent />
                    {/* <span className="ml-auto bg-purple-100 text-purple-600 text-xs font-medium px-2 py-1 rounded-full"></span> */}
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

          {/* Mobile Menu Button - Updated Style */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors md:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
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
                  <span>Trang chủ</span>
                  <ChevronDown
                    className={`w-5 h-5 transform transition-transform ${
                      isAboutDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={() => {
                  navigate("/story");
                  closeMobileMenu();
                }}
                className={`block w-full p-2 text-left transition-colors ${
                  isActiveLink("story") ? "text-purple-600" : "text-gray-700"
                }`}
              >
                Câu chuyện
              </button>
              <button
                onClick={() => {
                  navigate("/LessonGrid");
                  closeMobileMenu();
                }}
                className={`block w-full p-2 text-left transition-colors ${
                  isActiveLink("story") ? "text-purple-600" : "text-gray-700"
                }`}
              >
                Bài học
              </button>
              <button
                onClick={() => {
                  navigate("/exam");
                  closeMobileMenu();
                }}
                className={`block w-full p-2 text-left transition-colors ${
                  isActiveLink("story") ? "text-purple-600" : "text-gray-700"
                }`}
              >
                Đề kiểm tra
              </button>

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
                  <p className="font-medium text-gray-900">{userData.name}</p>
                  <p className="text-sm text-gray-500">{userData.email}</p>
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
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navigation;

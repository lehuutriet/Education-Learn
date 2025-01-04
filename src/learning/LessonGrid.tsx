import { useState } from "react";
import Navigation from "../Navigation/Navigation";
import {
  Bell,
  ShoppingBag,
  User,
  Book,
  Home,
  BookOpenText,
  Menu,
  X,
} from "lucide-react";

import PronunciationLesson from "./PronunciationLesson";
import LearningContent from "./LearningContent";
import LessonDetail from "./LessonList";
import EducationalFooter from "../EducationalFooter/EducationalFooter";

interface SidebarMenuItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  icon,
  label,
  active = false,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`
     flex items-center gap-4 px-6 py-4 rounded-xl cursor-pointer
     transition-all duration-300 ease-in-out group
     hover:scale-105 relative
     ${
       active
         ? "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-600 shadow-sm"
         : "hover:bg-gray-50 text-gray-700 hover:text-purple-600"
     }
   `}
  >
    <div
      className={`
       w-12 h-12 rounded-xl flex items-center justify-center
       transition-all duration-300
       transform group-hover:rotate-6
       ${
         active
           ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg"
           : "bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600"
       }
     `}
    >
      {icon}
    </div>
    <span className="font-medium text-lg tracking-wide">{label}</span>

    {/* Hover effect line */}
    <div
      className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-purple-600 
                   transition-all duration-300 group-hover:w-full group-hover:left-0"
    />
  </div>
);

const LessonGrid = () => {
  const [activeTab, setActiveTab] = useState("learning");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "pronunciation":
        return <PronunciationLesson />;
      case "learning":
        return <LearningContent />;
      case "lessonViewer":
        return <LessonDetail />;
      default:
        return <div className="text-center p-8">Tính năng đang phát triển</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Navigation />

      <div className="flex">
        {/* Mobile Menu Button */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-[73px] left-4 z-50 md:hidden bg-white p-2 
                    rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 
                    hover:bg-purple-50 hover:text-purple-600"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        )}

        {/* Sidebar */}
        <div
          className={`
           fixed bg-white w-[300px] h-screen
           border-r border-gray-100 shadow-lg
           px-4 py-6 
           transition-all duration-300 ease-in-out
           ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
           md:translate-x-0 md:relative
           flex flex-col gap-3
           z-40
         `}
        >
          {/* Logo area */}

          <div className="flex-1 space-y-2">
            <SidebarMenuItem
              icon={<Home className="w-6 h-6" />}
              label="HỌC"
              active={activeTab === "learning"}
              onClick={() => {
                setActiveTab("learning");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarMenuItem
              icon={<Book className="w-6 h-6" />}
              label="PHÁT ÂM"
              active={activeTab === "pronunciation"}
              onClick={() => {
                setActiveTab("pronunciation");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarMenuItem
              icon={<BookOpenText className="w-6 h-6" />}
              label="BÀI GIẢNG"
              active={activeTab === "lessonViewer"}
              onClick={() => {
                setActiveTab("lessonViewer");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarMenuItem
              icon={<Bell className="w-6 h-6" />}
              label="NHIỆM VỤ"
              active={activeTab === "tasks"}
              onClick={() => {
                setActiveTab("tasks");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarMenuItem
              icon={<ShoppingBag className="w-6 h-6" />}
              label="CỬA HÀNG"
              active={activeTab === "store"}
              onClick={() => {
                setActiveTab("store");
                setIsSidebarOpen(false);
              }}
            />
            <SidebarMenuItem
              icon={<User className="w-6 h-6" />}
              label="HỒ SƠ"
              active={activeTab === "profile"}
              onClick={() => {
                setActiveTab("profile");
                setIsSidebarOpen(false);
              }}
            />
          </div>

          {/* Mobile Close Button */}
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden mx-auto p-3 rounded-xl bg-gray-100 
                      hover:bg-purple-100 hover:text-purple-600
                      transition-all duration-300"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="w-full">{renderContent()}</div>
        </div>

        {/* Overlay for mobile */}
        {(isSidebarOpen || isProgressOpen) && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => {
              setIsSidebarOpen(false);
              setIsProgressOpen(false);
            }}
          />
        )}
      </div>

      <EducationalFooter />
    </div>
  );
};

export default LessonGrid;

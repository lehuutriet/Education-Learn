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

import SidebarMenuItem from "./SidebarMenuItem";
import PronunciationLesson from "./PronunciationLesson";
import LearningContent from "./LearningContent";
import LessonDetail from "./LessonList";

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
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-20 left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-lg"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      <div className="flex flex-col md:flex-row">
        {/* Left Sidebar - Mobile Optimized */}
        <div
          className={`fixed top-[73px] left-0 w-64 bg-white border-r h-screen p-4 transition-transform duration-300 z-40 
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            md:translate-x-0 md:static`}
        >
          <SidebarMenuItem
            icon={<Home className="text-[#58CC02] w-6 h-6" />}
            label="HỌC"
            active={activeTab === "learning"}
            onClick={() => {
              setActiveTab("learning");
              setIsSidebarOpen(false);
            }}
          />
          <SidebarMenuItem
            icon={<Book className="w-5 h-5" />}
            label="PHÁT ÂM"
            active={activeTab === "pronunciation"}
            onClick={() => {
              setActiveTab("pronunciation");
              setIsSidebarOpen(false);
            }}
          />
          <SidebarMenuItem
            icon={<BookOpenText className="text-[#F7C701] w-6 h-6" />}
            label="BÀI GIẢNG"
            active={activeTab === "lessonViewer"}
            onClick={() => {
              setActiveTab("lessonViewer");
              setIsSidebarOpen(false);
            }}
          />
          <SidebarMenuItem
            icon={<Bell className="text-[#CE82FF] w-6 h-6" />}
            label="NHIỆM VỤ"
            active={activeTab === "tasks"}
            onClick={() => {
              setActiveTab("tasks");
              setIsSidebarOpen(false);
            }}
          />
          <SidebarMenuItem
            icon={<ShoppingBag className="text-[#FF9600] w-6 h-6" />}
            label="CỬA HÀNG"
            active={activeTab === "store"}
            onClick={() => {
              setActiveTab("store");
              setIsSidebarOpen(false);
            }}
          />
          <SidebarMenuItem
            icon={<User className="text-[#FF4B4B] w-6 h-6" />}
            label="HỒ SƠ"
            active={activeTab === "profile"}
            onClick={() => {
              setActiveTab("profile");
              setIsSidebarOpen(false);
            }}
          />
        </div>

        {/* Main Content - Mobile Optimized */}
        <div className="flex-1 md:ml-64 md:mr-80 mt-16 md:mt-0 px-4 md:px-0">
          {renderContent()}
        </div>

        {/* Overlay for mobile when sidebar/progress is open */}
        {(isSidebarOpen || isProgressOpen) && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => {
              setIsSidebarOpen(false);
              setIsProgressOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LessonGrid;

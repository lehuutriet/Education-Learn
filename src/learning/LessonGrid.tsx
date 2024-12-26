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
import EducationalFooter from "../EducationalFooter/EducationalFooter";

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
      <div className="flex flex-col md:flex-row w-full">
        {/* Mobile Menu Button - Only show when sidebar is closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-[73px] left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* Left Sidebar - Mobile Optimized */}
        <div
          className={`
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          fixed top-[73px] bg-white border-r h-[calc(100vh-73px)] w-[250px] px-4 overflow-y-auto
          transition-transform duration-300 z-40
          md:translate-x-0 md:sticky md:h-[calc(100vh-73px)] flex flex-col
        `}
        >
          <div className="flex-1">
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

          {/* Close button at bottom center - Only show on mobile when sidebar is open */}
          {isSidebarOpen && (
            <div className="md:hidden flex justify-center pb-4">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="bg-white p-2 rounded-lg shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        {/* Main Content - Mobile Optimized */}
        <div className="flex-grow: 1 w-full md:px-0">
          <div className="w-full">{renderContent()}</div>
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
      <EducationalFooter />
    </div>
  );
};

export default LessonGrid;

import { useState } from "react";
import Navigation from "../Navigation/Navigation";
import { Trophy, Bell, ShoppingBag, User, Book, Home } from "lucide-react";

import SidebarMenuItem from "./SidebarMenuItem";
import PronunciationLesson from "./PronunciationLesson";
import LearningContent from "./LearningContent";

const LessonGrid = () => {
  const [activeTab, setActiveTab] = useState("learning");

  const renderContent = () => {
    switch (activeTab) {
      case "pronunciation":
        return <PronunciationLesson />;
      case "learning":
        return <LearningContent />;
      default:
        return <div className="text-center p-8">Tính năng đang phát triển</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="flex">
        {/* Left Sidebar */}
        <div className="fixed top-[73px] left-0 w-64 bg-white border-r h-screen p-4">
          <SidebarMenuItem
            icon={<Home className="text-[#58CC02] w-6 h-6" />}
            label="HỌC"
            active={activeTab === "learning"}
            onClick={() => setActiveTab("learning")}
          />
          <SidebarMenuItem
            icon={<Book className="w-5 h-5" />}
            label="PHÁT ÂM"
            active={activeTab === "pronunciation"}
            onClick={() => setActiveTab("pronunciation")}
          />
          <SidebarMenuItem
            icon={<Trophy className="text-[#F7C701] w-6 h-6" />}
            label="BẢNG XẾP HẠNG"
            active={activeTab === "ranking"}
            onClick={() => setActiveTab("ranking")}
          />
          <SidebarMenuItem
            icon={<Bell className="text-[#CE82FF] w-6 h-6" />}
            label="NHIỆM VỤ"
            active={activeTab === "tasks"}
            onClick={() => setActiveTab("tasks")}
          />
          <SidebarMenuItem
            icon={<ShoppingBag className="text-[#FF9600] w-6 h-6" />}
            label="CỬA HÀNG"
            active={activeTab === "store"}
            onClick={() => setActiveTab("store")}
          />
          <SidebarMenuItem
            icon={<User className="text-[#FF4B4B] w-6 h-6" />}
            label="HỒ SƠ"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 mr-80">{renderContent()}</div>

        {/* Right Progress Sidebar */}
        <div className="fixed right-0 top-[73px] w-80 bg-white border-l h-screen p-6">
          <h2 className="text-2xl font-bold mb-6">Tiến độ học tập</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Hoàn thành</span>
                <span className="font-medium">2/6 bài học</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full">
                <div className="w-1/3 h-full bg-[#58CC02] rounded-full"></div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-medium text-blue-900 mb-2">
                Mục tiêu hôm nay
              </h3>
              <div className="flex justify-between text-sm text-blue-700">
                <span>Hoàn thành 2 bài học</span>
                <span>1/2</span>
              </div>
            </div>

            <button className="w-full py-3 bg-[#58CC02] text-white rounded-xl font-bold hover:bg-[#46a001] transition-colors">
              Tiếp tục học
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonGrid;

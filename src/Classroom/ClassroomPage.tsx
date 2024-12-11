import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/auth/authProvider";
import Navigation from "../Navigation/Navigation";
import ClassroomChat from "./ClassroomChat";
import {
  BookOpen,
  Calendar,
  FileText,
  Clock,
  Download,
  Plus,
  Loader,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface Classroom {
  id: string;
  className: string;
  academicYear: string;
  teacher: string;
  status: "active" | "inactive";
  studentCount: number;
  participants: string[];
  createdAt: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  attachments: string[];
  status: "draft" | "published" | "closed";
}

interface Material {
  id: string;
  title: string;
  description: string;
  type: "document" | "video" | "image" | "link";
  fileId: string;
  uploadedAt: string;
}

interface ScheduleItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
  room: string;
}

type TabType = "overview" | "assignments" | "materials" | "schedule" | "chat";

const ClassroomPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const { databases, account } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setCurrentUserId] = useState("");
  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const CLASSROOM_COLLECTION_ID = "675019710029634eb602";
  const ASSIGNMENTS_COLLECTION_ID = "67566466003b28582c75";
  const MATERIALS_COLLECTION_ID = "6756696f002b58afb01c";
  const SCHEDULE_COLLECTION_ID = "675668e500195f7e0e72";

  useEffect(() => {
    if (classroomId) {
      fetchClassroomData();
    }
  }, [classroomId]);
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await account.get();
        setCurrentUserId(user.$id);
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };
    getCurrentUser();
  }, [account]);
  const fetchClassroomData = async () => {
    if (!classroomId) return;

    try {
      setLoading(true);

      // Fetch classroom details
      const classroomData = await databases.getDocument(
        DATABASE_ID,
        CLASSROOM_COLLECTION_ID,
        classroomId
      );
      setClassroom(classroomData as unknown as Classroom);

      // Fetch assignments
      const assignmentsResponse = await databases.listDocuments(
        DATABASE_ID,
        ASSIGNMENTS_COLLECTION_ID
      );
      setAssignments(assignmentsResponse.documents as unknown as Assignment[]);

      // Fetch materials
      const materialsResponse = await databases.listDocuments(
        DATABASE_ID,
        MATERIALS_COLLECTION_ID
      );
      setMaterials(materialsResponse.documents as unknown as Material[]);

      // Fetch schedule
      const scheduleResponse = await databases.listDocuments(
        DATABASE_ID,
        SCHEDULE_COLLECTION_ID
      );
      setSchedule(scheduleResponse.documents as unknown as ScheduleItem[]);
    } catch (error) {
      console.error("Error fetching classroom data:", error);
      setError("Không thể tải thông tin lớp học");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-center text-gray-700">
            {error || "Không tìm thấy lớp học"}
          </p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Bài tập mới nhất
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignments.slice(0, 3).map((assignment) => (
                  <div key={assignment.id} className="mb-4">
                    <h3 className="font-medium">{assignment.title}</h3>
                    <p className="text-sm text-gray-500">
                      Hạn nộp:{" "}
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  Tài liệu mới
                </CardTitle>
              </CardHeader>
              <CardContent>
                {materials.slice(0, 3).map((material) => (
                  <div key={material.id} className="mb-4">
                    <h3 className="font-medium">{material.title}</h3>
                    <p className="text-sm text-gray-500">{material.type}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Lịch học hôm nay
                </CardTitle>
              </CardHeader>
              <CardContent>
                {schedule.slice(0, 3).map((item) => (
                  <div key={item.id} className="mb-4">
                    <h3 className="font-medium">{item.subject}</h3>
                    <p className="text-sm text-gray-500">
                      {item.startTime} - {item.endTime}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case "assignments":
        return (
          <div className="space-y-6">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{assignment.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Hạn nộp:{" "}
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assignment.status === "published"
                          ? "bg-green-100 text-green-800"
                          : assignment.status === "closed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {assignment.status === "published"
                        ? "Đang mở"
                        : assignment.status === "closed"
                        ? "Đã đóng"
                        : "Nháp"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{assignment.description}</p>
                  {assignment.attachments &&
                    assignment.attachments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Tệp đính kèm
                        </h4>
                        <div className="space-y-2">
                          {assignment.attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              <span>{attachment}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  <div className="mt-6">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Nộp bài
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "materials":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Tài liệu học tập</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Thêm tài liệu
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material) => (
                <Card key={material.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText
                          className={`w-5 h-5 ${
                            material.type === "document"
                              ? "text-blue-500"
                              : material.type === "video"
                              ? "text-red-500"
                              : material.type === "image"
                              ? "text-green-500"
                              : "text-purple-500"
                          }`}
                        />
                        {material.title}
                      </CardTitle>
                      <Download className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {material.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Đăng tải:{" "}
                      {new Date(material.uploadedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "schedule":
        return (
          <div className="grid grid-cols-7 gap-4">
            {[
              "Thứ 2",
              "Thứ 3",
              "Thứ 4",
              "Thứ 5",
              "Thứ 6",
              "Thứ 7",
              "Chủ nhật",
            ].map((day, index) => (
              <div key={index}>
                <h3 className="text-center font-medium text-gray-900 mb-4">
                  {day}
                </h3>
                <div className="space-y-4">
                  {schedule
                    .filter((item) => item.dayOfWeek === index)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((item) => (
                      <Card
                        key={item.id}
                        className="border-l-4 border-l-blue-500"
                      >
                        <CardContent className="py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {item.startTime} - {item.endTime}
                            </span>
                          </div>
                          <h4 className="font-medium">{item.subject}</h4>
                          <p className="text-sm text-gray-500">
                            Phòng: {item.room}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        );

      // Trong phần render chat tab của ClassroomPage.tsx
      case "chat":
        if (!classroomId) {
          return (
            <div className="p-4 text-center text-gray-600">
              Không tìm thấy thông tin lớp học
            </div>
          );
        }
        return <ClassroomChat classroomId={classroomId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {classroom.className}
          </h1>
          <p className="mt-2 text-gray-600">
            Năm học: {classroom.academicYear}
          </p>
          <div className="mt-2 flex items-center text-gray-600">
            <UserCheck className="w-5 h-5 mr-2" />
            <span>GVCN: {classroom.teacher}</span>
          </div>
        </div>

        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "assignments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Bài tập
            </button>
            <button
              onClick={() => setActiveTab("materials")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "materials"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tài liệu
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "schedule"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Thời khóa biểu
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "chat"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Thảo luận
            </button>
          </nav>
        </div>

        <div className="space-y-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default ClassroomPage;

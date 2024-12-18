import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth/authProvider";
import Navigation from "../Navigation/Navigation";
import ClassroomChat from "./ClassroomChat";
import { useDataCache } from "../contexts/auth/DataCacheProvider";
import TimeSchedule from "./TimeSchedule";
import { ScheduleItem } from "../type/type";
import {
  BookOpen,
  Calendar,
  Loader,
  UserCheck,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Models } from "appwrite";
import TodaySchedule from "./TodaySchedule";
import Assignments from "./Assignments";
import { format } from "date-fns";
import SubmissionHistory from "./SubmissionHistory";
interface Classroom extends Models.Document {
  className: string;
  academicYear: string;
  teacher: string;
  status: "active" | "inactive";
  studentCount: number;
  participants: string[];
  createdAt: string;
}

interface Assignment extends Models.Document {
  title: string;
  description: string;
  dueDate: string;
  attachments: string[];
  status: "draft" | "published" | "closed";
  classroomId: string;
}

type TabType = "overview" | "exam" | "schedule" | "chat" | "history";

const ClassroomPage: React.FC = () => {
  const { databases, account } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const { classroomId = "" } = useParams<{ classroomId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setCurrentUserId] = useState("");
  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const CLASSROOM_COLLECTION_ID = "675019710029634eb602";
  const ASSIGNMENTS_COLLECTION_ID = "67566466003b28582c75";

  const SCHEDULE_COLLECTION_ID = "675668e500195f7e0e72";
  const { getCachedData, setCachedData, isDataCached } = useDataCache();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const navigate = useNavigate();
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

    // Check cache first
    const CLASSROOM_CACHE_KEY = `classroom-${classroomId}`;
    const ASSIGNMENTS_CACHE_KEY = `assignments-${classroomId}`;
    const SCHEDULE_CACHE_KEY = `schedule-${classroomId}`;

    try {
      setLoading(true);

      // Fetch classroom details
      if (isDataCached(CLASSROOM_CACHE_KEY)) {
        setClassroom(getCachedData(CLASSROOM_CACHE_KEY));
      } else {
        const classroomData = await databases.getDocument(
          DATABASE_ID,
          CLASSROOM_COLLECTION_ID,
          classroomId
        );
        setCachedData(CLASSROOM_CACHE_KEY, classroomData, CACHE_DURATION);
        setClassroom(classroomData as Classroom);
      }

      // Fetch assignments
      if (isDataCached(ASSIGNMENTS_CACHE_KEY)) {
        setAssignments(getCachedData(ASSIGNMENTS_CACHE_KEY));
      } else {
        const assignmentsResponse = await databases.listDocuments(
          DATABASE_ID,
          ASSIGNMENTS_COLLECTION_ID
        );
        setCachedData(
          ASSIGNMENTS_CACHE_KEY,
          assignmentsResponse.documents,
          CACHE_DURATION
        );
        setAssignments(assignmentsResponse.documents as Assignment[]);
      }

      // Fetch schedule
      if (isDataCached(SCHEDULE_CACHE_KEY)) {
        setSchedule(getCachedData(SCHEDULE_CACHE_KEY));
      } else {
        const scheduleResponse = await databases.listDocuments(
          DATABASE_ID,
          SCHEDULE_COLLECTION_ID
        );
        setCachedData(
          SCHEDULE_CACHE_KEY,
          scheduleResponse.documents,
          CACHE_DURATION
        );
        setSchedule(scheduleResponse.documents as ScheduleItem[]);
      }
    } catch (error) {
      console.error("Error fetching classroom data:", error);
      setError("Failed to load classroom data");
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
                {assignments
                  .filter(
                    (assignment) => assignment.classroomId === classroomId
                  )
                  .slice(0, 3)
                  .map((assignment) => (
                    <div key={assignment.$id} className="mb-4">
                      <h3 className="font-medium">{assignment.title}</h3>
                      <p className="text-sm text-gray-500">
                        Hạn nộp:{" "}
                        {format(
                          new Date(assignment.dueDate),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </p>
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
                <TodaySchedule
                  schedule={schedule as ScheduleItem[]}
                  classroomId={classroomId}
                />
              </CardContent>
            </Card>
          </div>
        );

      case "exam":
        return <Assignments classroomId={classroomId} />;

      case "schedule":
        if (!classroomId) {
          return (
            <div className="p-4 text-center text-gray-600">
              Không tìm thấy thông tin lớp học
            </div>
          );
        }
        return <TimeSchedule classroomId={classroomId} />;

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
      case "history":
        if (!classroomId) {
          return (
            <div className="p-4 text-center text-gray-600">
              Không tìm thấy thông tin lớp học
            </div>
          );
        }
        return <SubmissionHistory classroomId={classroomId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate("/classroomManagement")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại danh sách lớp học
          </button>

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
              onClick={() => setActiveTab("exam")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "exam"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Bài tập
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
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Lịch sử nộp bài
            </button>
          </nav>
        </div>

        <div className="space-y-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default ClassroomPage;
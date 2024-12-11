import {
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  BookCheck,
  TestTube,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import Navigation from "../Navigation/Navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

const ClassroomPortal = () => {
  const portalFeatures = [
    {
      title: "Giao bài tập",
      description: "Tạo và quản lý bài tập cho học sinh",
      icon: BookOpen,
      link: "/assignments",
    },
    {
      title: "Kế hoạch dạy học",
      description: "Lập và theo dõi kế hoạch giảng dạy",
      icon: ClipboardList,
      link: "/teaching-plans",
    },
    {
      title: "Báo cáo & Đánh giá",
      description: "Theo dõi tiến độ và đánh giá học sinh",
      icon: FileText,
      link: "/reports",
    },
    {
      title: "Thời khóa biểu",
      description: "Xem và quản lý lịch học",
      icon: Calendar,
      link: "/schedule",
    },
    {
      title: "Kho học liệu",
      description: "Quản lý tài liệu và học liệu",
      icon: BookCheck,
      link: "/resources",
    },
    {
      title: "Tạo đề thi",
      description: "Tạo và quản lý ngân hàng đề thi",
      icon: TestTube,
      link: "/exams",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Lớp 12A1</h1>
          <p className="mt-2 text-gray-600">Năm học 2023-2024</p>
        </div>

        {/* Active Class Card */}
        <Card className="mb-8">
          <CardHeader className="flex flex-col items-center text-center pb-2">
            <GraduationCap className="h-12 w-12 text-blue-500 mb-4" />
            <div>
              <p className="text-gray-500">Sĩ số:</p>
              <p className="font-medium">35 học sinh</p>
            </div>
            <div className="mt-4">
              <p className="text-gray-500">Giáo viên chủ nhiệm:</p>
              <p className="font-medium">Nguyễn Văn A</p>
            </div>
          </CardHeader>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portalFeatures.map((feature, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader className="flex flex-col items-center text-center space-y-4 pb-2">
                <feature.icon className="h-12 w-12 text-blue-500" />
                <div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center">
                <button className="mt-4 text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium">
                  Truy cập
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activities */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Các hoạt động mới nhất trong lớp học
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Đã giao bài tập mới",
                  subject: "Toán học",
                  time: "2 giờ trước",
                },
                {
                  action: "Cập nhật kế hoạch dạy học",
                  subject: "Tuần 15",
                  time: "Hôm qua",
                },
                {
                  action: "Tạo đề kiểm tra",
                  subject: "Ngữ văn",
                  time: "2 ngày trước",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500">{activity.subject}</p>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClassroomPortal;

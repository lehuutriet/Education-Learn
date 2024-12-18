import { useEffect, useState } from "react";
import { useAuth } from "./contexts/auth/authProvider";
import Navigation from "../src/Navigation/Navigation";
import imageEdu from "../src/image/imageEdu.jpg";
import { Book, Video, Users, Award, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EducationalFooter from "../src/EducationalFooter/EducationalFooter";
const HomePage = () => {
  const { account } = useAuth();
  const [, setUserData] = useState({ name: "", email: "" });
  const [, setIsAdmin] = useState(false);
  const navigate = useNavigate();
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

  const features = [
    {
      icon: Book,
      title: "Tài liệu học tập",
      description: "Kho tài liệu phong phú từ các chuyên gia giáo dục hàng đầu",
    },
    {
      icon: Video,
      title: "Học tập trực tuyến",
      description: "Lớp học trực tuyến tương tác với công nghệ hiện đại",
    },
    {
      icon: Users,
      title: "Học cùng bạn bè",
      description: "Môi trường học tập cộng đồng, chia sẻ kiến thức",
    },
    {
      icon: Award,
      title: "Chứng chỉ số",
      description: "Chứng nhận kỹ năng và thành tích học tập",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image Section - Now on Left */}
            <div className="relative order-2 md:order-1">
              <div className="bg-white p-8 rounded-2xl shadow-xl transform hover:scale-110 transition-transform duration-300">
                <img
                  src={imageEdu}
                  alt="Online Learning"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>

            {/* Content Section - Now on Right */}
            <div className="space-y-8 order-1 md:order-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Nền tảng học tập <br />
                <span className="text-purple-600">thông minh</span> cho <br />
                tương lai
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                Khám phá hành trình học tập với công nghệ hiện đại, giáo viên
                chất lượng và cộng đồng học tập năng động. Mở ra cánh cửa tri
                thức cho tương lai của bạn.
              </p>
              <div className="flex gap-4">
                <button
                  className="bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
                  onClick={() => navigate("/lessonGrid")}
                >
                  Bắt đầu học tập
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tại sao chọn chúng tôi?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cung cấp môi trường học tập toàn diện với công nghệ hiện
            đại, đội ngũ giảng viên chất lượng và cộng đồng học tập năng động.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}

      <EducationalFooter />
    </div>
  );
};

export default HomePage;

import { useEffect, useState } from "react";

import { useAuth } from "./contexts/auth/authProvider";

import Navigation from "../src/Navigation/Navigation";
const HomePage = () => {
  const { account } = useAuth();

  const [, setUserData] = useState<{ name: string; email: string }>({
    name: "",
    email: "",
  });
  const [, setIsAdmin] = useState(false);
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

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const user = await account.get();
        setIsAdmin(user.labels?.includes("Admin") || false);
      } catch (error) {
        console.error("Error checking admin role:", error);
      }
    };
    checkAdminRole();
  }, [account]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation></Navigation>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Social Media Link */}
        <div className="mb-12">
          <a href="#" className="inline-block">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-800">IG</span>
            </div>
          </a>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 text-gray-900">
            The Washington Market School
          </h1>
          <p className="text-xl text-gray-600">
            An independent preschool in Tribeca serving the community and its
            children since 1976
          </p>
        </div>

        {/* Illustration Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Learning Materials */}
          <div className="border p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-pink-50 p-2 rounded">
                <div className="flex flex-wrap gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-blue-400" />
                  ))}
                </div>
              </div>
              <div className="bg-pink-50 p-2 rounded">
                <div className="border-2 border-gray-400 rounded-full w-12 h-12" />
              </div>
              <div className="bg-pink-50 p-2 rounded">
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-full bg-red-400" />
                  <div className="w-4 h-4 rounded-full bg-red-400" />
                </div>
              </div>
              <div className="bg-pink-50 p-2 rounded">
                <div className="transform rotate-45 w-8 h-8 bg-brown-400" />
              </div>
              <div className="col-span-2 bg-pink-50 p-2 rounded">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-4 bg-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Educational Tools */}
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-800" />
            <div className="w-16 h-4 bg-gray-400" />
            <div className="w-8 h-8 rounded-full border-2 border-blue-400" />
          </div>

          {/* Musical Instruments */}
          <div className="space-y-4">
            <div className="w-32 h-16 bg-green-200 rounded" />
            <div className="w-full h-12 flex items-center justify-center">
              <div className="w-48 h-8 bg-brown-400 flex items-center justify-between px-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1 h-full bg-black" />
                ))}
              </div>
            </div>
          </div>

          {/* Learning Tools */}
          <div className="space-y-8">
            <div className="w-16 h-24 bg-blue-200 rounded" />
            <div className="flex flex-wrap gap-2">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-red-400" />
              ))}
            </div>
            <div className="w-8 h-32 bg-coral-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

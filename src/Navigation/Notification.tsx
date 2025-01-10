import { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth/authProvider";
import { Query } from "appwrite";
import { Bell, X } from "lucide-react";

interface Notification {
  $id: string;
  userId: string;
  feedbackId: string;
  type: "feedback_response" | "new_feedback";
  isRead: boolean;
  createdAt: string;
  title: string;
  message: string;
}

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const { databases, account } = useAuth();

  const DATABASE_ID = "674e5e7a0008e19d0ef0";
  const NOTIFICATION_COLLECTION = "6780e316003b3a0ade3c"; // Thay bằng ID thật

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const user = await account.get();
      const response = await databases.listDocuments(
        DATABASE_ID,
        NOTIFICATION_COLLECTION,
        [Query.equal("userId", user.$id)]
      );

      const sortedNotifications = response.documents.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(sortedNotifications as unknown as Notification[]);
      setUnreadCount(sortedNotifications.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        NOTIFICATION_COLLECTION,
        notificationId,
        { isRead: true }
      );
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        NOTIFICATION_COLLECTION,
        notificationId
      );
      await fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Thông báo</h3>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.$id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors relative ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <button
                    onClick={() => deleteNotification(notification.$id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div
                    onClick={() => markAsRead(notification.$id)}
                    className="cursor-pointer"
                  >
                    <h4 className="font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-500 mt-2 block">
                      {new Date(notification.createdAt).toLocaleDateString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                Không có thông báo nào
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;

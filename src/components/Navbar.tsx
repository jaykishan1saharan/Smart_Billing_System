import React, { useState, useEffect } from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import beepSound from '../assets/beep.mp3';
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchLowStockNotifications();
    audioRef.current = new Audio(beepSound);
    audioRef.current.loop = true;
  }, []);

  const fetchLowStockNotifications = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/dashboard/low-stock-products"
      );
      const data = await res.json();
      setNotifications(data);

      // 🔊 Play sound if low stock exists
      if (data.length > 0 && audioRef.current) {
        audioRef.current.play().catch(() => { });
      }

      setUnreadCount(data.length);

    } catch (error) {
      console.error("Notification Error:", error);
    }
  };

  const handleNotificationClick = (productName: string) => {

    // Close modal
    setShowNotifications(false);

    // Navigate to products page
    navigate("/products", {
      state: { highlightProduct: productName }
    });

  };

  return (
    <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-200">
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 w-96 transition-colors duration-200">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search anything..."
          className="bg-transparent border-none outline-none ml-3 w-full text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400"
        />
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          onClick={() => {

            // Open modal
            setShowNotifications(true);

            // 🔔 Reset unread count
            setUnreadCount(0);

            // 🔇 Stop sound immediately
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }

          }}
          className="relative p-2 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowNotifications(false)}
          >

            <div
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  Notifications
                </h2>
                <button
                  onClick={() => {

                    // ✅ Close modal
                    setShowNotifications(false);

                    // 🔇 Stop sound
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current.currentTime = 0;
                    }

                  }}
                  className="text-slate-400 hover:text-red-500 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Notification List */}

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((item: any, index) => (
                    <div
                      key={index}
                      onClick={() =>
                        handleNotificationClick(item.product_name)
                      }
                      className="p-4 border-b hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <div className="text-sm font-medium text-slate-800 dark:text-white">
                        ⚠️ Low Stock — {item.product_name}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Only {item.quantity} left
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

        )}

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shadow-sm">
            {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{currentUser?.displayName || 'Admin User'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
          </div>
        </div>
      </div>
    </header>


  );
};

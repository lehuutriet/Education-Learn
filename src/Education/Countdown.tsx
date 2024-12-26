import React, { useEffect, useState } from "react";

interface CountdownProps {
  startTime: string;
  endTime: string;
  duration: number;
}

export const Countdown: React.FC<CountdownProps> = ({ startTime, endTime }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [status, setStatus] = useState<"not_started" | "in_progress" | "ended">(
    "not_started"
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();

      if (now < start) {
        setStatus("not_started");
        const distance = start - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`Bắt đầu sau: ${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (now > end) {
        setStatus("ended");
        setTimeLeft("Đã kết thúc");
      } else {
        setStatus("in_progress");
        const distance = end - now;
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`Còn lại: ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime]);

  return (
    <div
      className={`
      px-3 py-2 rounded-lg text-sm font-medium
      ${
        status === "in_progress"
          ? "bg-green-100 text-green-800"
          : status === "ended"
          ? "bg-red-100 text-red-800"
          : "bg-yellow-100 text-yellow-800"
      }
    `}
    >
      {timeLeft}
    </div>
  );
};

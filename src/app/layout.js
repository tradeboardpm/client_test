import { Toast, ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata = {
  title: "Tradeboard - Trade Better With Discipline",
  description:
    "Tradeboard.in helps you maintain discipline in trading by adding notes, rules, and tracking your trades. Create a personalized trading journal to reflect on your strategies and decisions. Our platform allows you to set clear trading rules, log your trades, and review your performance over time. Stay focused on your trading strategy, minimize emotional decisions, and achieve consistent results. Join us today to elevate your trading journey!",
};

const ComingSoonOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black bg-clip-padding backdrop-filter backdrop-blur-2xl bg-opacity-20 flex items-center justify-center z-[99999]">
      <div className="text-center p-8 max-w-2xl bg-card rounded-lg shadow-2xl rotate-3">
        
        <div className="mb-8">
          <span className="inline-block px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full">
            Launching Soon
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold  mb-6">
          Coming Soon
        </h1>
        <p className="text-gray-600 text-lg md:text-xl mb-8 leading-relaxed">
          We're building something amazing to revolutionize your trading journey. 
          Tradeboard will help you maintain discipline, track performance, and achieve 
          consistent results through data-driven decisions.
        </p>
      </div>
    </div>
  );
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body className="antialiased ">
        <ToastProvider>
          <ComingSoonOverlay />
          {children}
          <Toast />
        </ToastProvider>
      </body>
    </html>
  );
}
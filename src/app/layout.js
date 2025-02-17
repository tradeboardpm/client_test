import { Toast, ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata = {
  title: "Tradeboard - Trade Better With Discipline",
  description:
    "Tradeboard.in helps you maintain discipline in trading by adding notes, rules, and tracking your trades. Create a personalized trading journal to reflect on your strategies and decisions. Our platform allows you to set clear trading rules, log your trades, and review your performance over time. Stay focused on your trading strategy, minimize emotional decisions, and achieve consistent results. Join us today to elevate your trading journey!",
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body className="antialiased ">
        <ToastProvider>
          {children}
          <Toast />
        </ToastProvider>
      </body>
    </html>
  );
}
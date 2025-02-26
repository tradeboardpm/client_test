import React, { useState, useEffect, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  AlertTriangle,
  Bell,
  Clock,
  Wrench,
  Sparkles,
  FileText,
} from "lucide-react";

// Updated announcement type configuration
const ANNOUNCEMENT_TYPES = {
  downtime: {
    icon: AlertTriangle,
    color: "bg-red-500",
    textColor: "text-white",
    label: "System Downtime",
  },
  notification: {
    icon: Bell,
    color: "bg-blue-500",
    textColor: "text-white",
    label: "Notification",
  },
  upcoming: {
    icon: Clock,
    color: "bg-yellow-500",
    textColor: "text-black",
    label: "Coming Soon",
  },
  changelog: {
    icon: FileText,
    color: "bg-purple-500",
    textColor: "text-white",
    label: "Changelog",
  },
  feature: {
    icon: Sparkles,
    color: "bg-green-500",
    textColor: "text-white",
    label: "New Feature",
  },
  maintenance: {
    icon: Wrench,
    color: "bg-orange-500",
    textColor: "text-white",
    label: "Maintenance",
  },
};

const AnnouncementManager = ({ announcements, onClose, onAddNotification }) => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [viewedAnnouncements, setViewedAnnouncements] = useState(new Set());

  const sortedAnnouncements = useMemo(() => {
    return announcements
      .filter((announcement) => {
        const now = new Date();
        const validFrom = new Date(announcement.validFrom);
        const validUntil = new Date(announcement.validUntil);
        const isTimeValid = now >= validFrom && now <= validUntil;
        const shouldShow =
          announcement.visibility !== "once" ||
          (announcement.visibility === "once" &&
            !viewedAnnouncements.has(announcement._id));

        return isTimeValid && announcement.isActive && shouldShow;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [announcements, viewedAnnouncements]);

  useEffect(() => {
    if (sortedAnnouncements.length > 0) {
      const announcement = sortedAnnouncements[0];
      setCurrentAnnouncement(announcement);

      // Add to notifications if type is notification
      if (announcement.type === "notification") {
        onAddNotification({
          title: announcement.title,
          description: announcement.content,
          time: new Date(announcement.createdAt).toLocaleString(),
          type: "system",
        });
      }
    } else {
      setCurrentAnnouncement(null);
    }
  }, [sortedAnnouncements, onAddNotification]);

  useEffect(() => {
    if (!currentAnnouncement) return;

    const timer = setInterval(() => {
      const remaining = new Date(currentAnnouncement.validUntil) - new Date();

      if (remaining <= 0) {
        clearInterval(timer);
        if (currentAnnouncement.type !== "maintenance") {
          handleCloseAnnouncement(currentAnnouncement);
        }
        return;
      }

      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentAnnouncement]);

  const handleCloseAnnouncement = (announcement) => {
    if (announcement.type === "maintenance") return; // Prevent closing maintenance announcements

    if (announcement.visibility === "once") {
      setViewedAnnouncements((prev) => new Set([...prev, announcement._id]));
    }
    onClose?.(announcement);
  };

  const formatTimeRemaining = (ms) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const renderMaintenanceOverlay = (announcement) => {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" />
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          <div className="bg-orange-500 text-white p-8 rounded-lg max-w-lg text-center">
            <Wrench className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">{announcement.title}</h2>
            <p className="text-lg mb-6">{announcement.content}</p>
            <Badge variant="secondary" className="mx-auto">
              {formatTimeRemaining(timeRemaining)}
            </Badge>
          </div>
        </div>
      </>
    );
  };

  const renderSimpleDialog = (announcement) => {
    const { icon: Icon, label } = ANNOUNCEMENT_TYPES[announcement.type];

    return (
      <AlertDialog
        open={!!announcement}
        onOpenChange={() => handleCloseAnnouncement(announcement)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center justify-center mb-4">
              {Icon && <Icon className="w-12 h-12 text-primary" />}
            </div>
            <Badge className="mb-2 mx-auto">{label}</Badge>
            <AlertDialogTitle>{announcement.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {announcement.content}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => handleCloseAnnouncement(announcement)}
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  const renderAnnouncement = (announcement) => {
    switch (announcement.type) {
      case "maintenance":
        return renderMaintenanceOverlay(announcement);
      case "changelog":
      case "feature":
      case "upcoming":
        return renderSimpleDialog(announcement);
      default:
        return null;
    }
  };

  return currentAnnouncement ? renderAnnouncement(currentAnnouncement) : null;
};

export default AnnouncementManager;

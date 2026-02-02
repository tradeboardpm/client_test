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

const AnnouncementManager = ({ announcements, onClose }) => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [viewedAnnouncements, setViewedAnnouncements] = useState(new Set());

  const sortedAnnouncements = useMemo(() => {
    return (announcements || [])
      .filter((announcement) => {
        const now = new Date();
        const validFrom = new Date(announcement.validFrom);
        const validUntil = new Date(announcement.validUntil);
        const isTimeValid = now >= validFrom && now <= validUntil;

        // Visibility check handled by backend usually, but we double check here
        const notViewedLocally = !viewedAnnouncements.has(announcement._id);

        return isTimeValid && announcement.isActive && notViewedLocally;
      })
      .sort((a, b) => {
        // High priority types first
        const priority = { downtime: 100, maintenance: 90, notification: 80, feature: 70 };
        const aPrio = priority[a.type] || 0;
        const bPrio = priority[b.type] || 0;
        if (aPrio !== bPrio) return bPrio - aPrio;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [announcements, viewedAnnouncements]);

  useEffect(() => {
    if (sortedAnnouncements.length > 0) {
      setCurrentAnnouncement(sortedAnnouncements[0]);
    } else {
      setCurrentAnnouncement(null);
    }
  }, [sortedAnnouncements]);

  useEffect(() => {
    if (!currentAnnouncement) return;

    const timer = setInterval(() => {
      const remaining = new Date(currentAnnouncement.validUntil) - new Date();

      if (remaining <= 0) {
        clearInterval(timer);
        if (currentAnnouncement.type !== "maintenance" && currentAnnouncement.type !== "downtime") {
          handleCloseAnnouncement(currentAnnouncement);
        }
        return;
      }

      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentAnnouncement]);

  const handleCloseAnnouncement = async (announcement) => {
    // Record view in local state immediately for UI snappiness
    setViewedAnnouncements((prev) => new Set([...prev, announcement._id]));

    // Call backend to record view
    try {
      const token = Cookies.get("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/announcements/${announcement._id}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Error marking announcement as viewed:", error);
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
    const isDowntime = announcement.type === "downtime";
    return (
      <>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9998]" />
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          <div className={`${isDowntime ? 'bg-destructive' : 'bg-orange-600'} text-primary-foreground p-10 rounded-2xl max-w-xl text-center shadow-2xl border-4 border-white/20 animate-in fade-in zoom-in duration-300`}>
            <div className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              {isDowntime ? (
                <AlertTriangle className="w-12 h-12 text-white" />
              ) : (
                <Wrench className="w-12 h-12 text-white" />
              )}
            </div>
            <h2 className="text-3xl font-extrabold mb-4 uppercase tracking-tighter">{announcement.title}</h2>
            <p className="text-xl mb-8 font-medium opacity-90 leading-relaxed">{announcement.content}</p>
            <div className="inline-flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/20">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm font-bold">
                {formatTimeRemaining(timeRemaining)}
              </span>
            </div>
            {!isDowntime && announcement.isActive && (
              <div className="mt-8">
                <Button variant="secondary" onClick={() => handleCloseAnnouncement(announcement)}>
                  Refresh Later
                </Button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderNotificationDialog = (announcement) => {
    const typeConfig = ANNOUNCEMENT_TYPES[announcement.type] || ANNOUNCEMENT_TYPES.notification;
    const Icon = typeConfig.icon;

    return (
      <AlertDialog
        open={!!announcement}
        onOpenChange={() => handleCloseAnnouncement(announcement)}
      >
        <AlertDialogContent className="sm:max-w-[450px] overflow-hidden border-2">
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${typeConfig.color}`} />
          <AlertDialogHeader className="pt-4">
            <div className={`w-14 h-14 rounded-xl ${typeConfig.color} ${typeConfig.textColor} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <Icon className="w-8 h-8" />
            </div>
            <div className="space-y-2 text-center">
              <Badge variant="outline" className={`mx-auto ${typeConfig.textColor} border-current opacity-70`}>
                {typeConfig.label}
              </Badge>
              <AlertDialogTitle className="text-2xl font-bold tracking-tight">
                {announcement.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base leading-relaxed pt-2">
                {announcement.content}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-6">
            <AlertDialogAction
              className={`${typeConfig.color} ${typeConfig.textColor} hover:opacity-90 w-full sm:w-32 py-6 text-lg font-bold rounded-xl`}
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
    if (announcement.type === "maintenance" || announcement.type === "downtime") {
      return renderMaintenanceOverlay(announcement);
    }
    return renderNotificationDialog(announcement);
  };

  return currentAnnouncement ? renderAnnouncement(currentAnnouncement) : null;
};

export default AnnouncementManager;

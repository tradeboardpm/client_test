"use client";
import { useState, Suspense, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JournalCard from "@/components/cards/JournalCard";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import JournalCardSkeleton from "@/components/cards/JournalCardSkeleton";

// Resource creator for journal data
const createJournalResource = (date) => {
  let status = "pending";
  let result;

  const token = Cookies.get("token");
  const promise = axios
    .get(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/journals/monthly?year=${date.getFullYear()}&month=${
        date.getMonth() + 1
      }`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      status = "success";
      result = response.data;
    })
    .catch((error) => {
      status = "error";
      result = error;
    });

  return {
    read() {
      if (status === "pending") throw promise;
      if (status === "error") throw result;
      return result;
    },
  };
};

// JournalContent component
const JournalContent = ({
  currentDate,
  onDelete,
  onCardClick,
  refreshResource,
}) => {
  const journalData = refreshResource.read();

  if (Object.keys(journalData).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[55vh]">
        <img
          src="/images/no_box.png"
          alt="No Data"
          className="w-36 h-36 mb-4"
        />
        <p className="text-foreground/40 text-lg text-center">
          <span className="font-extrabold text-xl text-foreground">
            No Data
          </span>
          <br />
          Please start journaling daily to see your monthly journals here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Object.entries(journalData).map(([date, journal]) => (
        <div key={date} onClick={() => onCardClick(date)}>
          <JournalCard
            id={date}
            date={date}
            note={journal.note}
            mistake={journal.mistake}
            lesson={journal.lesson}
            rulesFollowedPercentage={journal.rulesFollowedPercentage}
            winRate={journal.winRate}
            profit={journal.profit}
            tradesTaken={journal.tradesTaken}
            onDelete={onDelete} // <-- pass the handler
            showDeleteButton={true}
          />
        </div>
      ))}
    </div>
  );
};

// Main Client Component
export default function ClientJournalPage({ initialDate }) {
  const router = useRouter();
  const { toast } = useToast();

  // Ensure initialDate is valid before using it
  const [currentDate, setCurrentDate] = useState(() => {
    const date = new Date(initialDate);
    return !isNaN(date.getTime()) ? date : new Date();
  });
  const [resource, setResource] = useState(null);

  // Initialize resource after validating currentDate
  useEffect(() => {
    setResource(createJournalResource(currentDate));
  }, [currentDate]);

  const updateUrlAndCookies = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    router.push(`/my-journal?year=${year}&month=${month}`);
    Cookies.set("journalDate", JSON.stringify(date.toISOString()), {
      expires: 1 / 48, // 30 minutes
    });
  };

  const changeMonth = (direction) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + direction);

      const today = new Date();
      if (newDate > today) {
        return prevDate;
      }

      updateUrlAndCookies(newDate);
      return newDate;
    });
  };

  const handleDeleteJournal = async (id) => {
    try {
      const token = Cookies.get("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/journals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setResource(createJournalResource(currentDate));
    } catch (error) {
      console.error("Error deleting journal:", error);
      toast({
        title: "Error",
        description: "Failed to delete journal entry",
        variant: "destructive",
      });
      setResource(createJournalResource(currentDate));
    }
  };

  const handleCardClick = (date) => {
    router.push(`/my-journal/${date}`);
  };

  const isCurrentMonth =
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  return (
    <div className="bg-card">
      <div className="py-8 px-4 sm:px-6 lg:px-8 bg-background rounded-t-xl">
        <div className="flex justify-between items-center mb-6 primary_gradient p-3 rounded-2xl">
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center justify-between w-80">
              <button
                onClick={() => changeMonth(-1)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors flex-shrink-0"
              >
                <ChevronsLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-medium text-white px-4 py-2 rounded-lg bg-[#ffffff]/30 w-52 text-center">
                {currentDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button
                onClick={() => changeMonth(1)}
                className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                  isCurrentMonth ? "opacity-40" : "text-white hover:bg-white/20"
                }`}
                disabled={isCurrentMonth}
              >
                <ChevronsRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {resource ? (
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array(8)
                  .fill(null)
                  .map((_, index) => (
                    <JournalCardSkeleton key={`skeleton-${index}`} />
                  ))}
              </div>
            }
          >
            <JournalContent
              currentDate={currentDate}
              onDelete={handleDeleteJournal}
              onCardClick={handleCardClick}
              refreshResource={resource}
            />
          </Suspense>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8)
              .fill(null)
              .map((_, index) => (
                <JournalCardSkeleton key={`skeleton-${index}`} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

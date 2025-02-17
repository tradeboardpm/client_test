"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, ImagePlus, Info, Loader2, ChevronDown, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import axios from "axios";
import Cookies from "js-cookie";
import debounce from "lodash/debounce";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { motion, AnimatePresence } from "framer-motion";

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>Delete Image</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this image? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ImageDialog = ({ isOpen, onClose, imageUrl, onDelete, isDeleting }) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    React.useState(false);

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteConfirmation(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh] p-2">
          <div className="relative h-full w-full overflow-auto p-2">
            <img
              src={imageUrl}
              alt="Selected image"
              className="w-fit h-fit rounded-lg shadow-sm border object-contain"
            />
            <div className="fixed bottom-4 right-4 flex gap-2">
              <div className="group relative">
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="relative rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Trash2 className="h-6 w-6" />
                  )}
                </Button>
                <span className="absolute -top-10 left-[50%] -translate-x-[50%] z-20 origin-left scale-0 px-3 rounded-lg border bg-popover py-2 text-sm font-bold shadow-md transition-all duration-300 ease-in-out group-hover:scale-100">
                  {isDeleting ? "Deleting..." : "Delete"}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export function JournalSection({ selectedDate }) {
  const [journal, setJournal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [localJournal, setLocalJournal] = useState({
    note: "",
    mistake: "",
    lesson: "",
  });
  const [files, setFiles] = useState([]);
  const [deletingFileKey, setDeletingFileKey] = useState(null);

  // Check subscription status from cookies
  useEffect(() => {
    const subscriptionStatus = Cookies.get('subscription') === 'true';
    setHasSubscription(subscriptionStatus);
  }, []);

  // Utility function to get UTC date
  const getUTCDate = (date) => {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
  };

  // Fetch journal data
  const fetchJournalData = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      const utcDate = getUTCDate(selectedDate);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/journals`,
        {
          params: { date: utcDate.toISOString() },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setJournal(response.data);
    } catch (error) {
      console.error("Error fetching journal data:", error);
      setJournal(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Save journal function
  const saveJournal = async (journalData) => {
    if (!journalData || !hasSubscription) return;

    setIsSaving(true);
    try {
      const token = Cookies.get("token");
      const utcDate = getUTCDate(selectedDate);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/journals`,
        {
          ...journalData,
          date: utcDate.toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setJournal(response.data);
    } catch (error) {
      console.error("Error saving journal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced save function
  const debouncedSaveJournal = useCallback(debounce(saveJournal, 5000), [
    selectedDate,
  ]);

  // Update journal entries
  const handleChange = (e) => {
    if (!hasSubscription) return;
    
    const { name, value } = e.target;
    const updatedJournal = {
      ...localJournal,
      [name]: value || " ",
    };

    setLocalJournal(updatedJournal);
    debouncedSaveJournal(updatedJournal);
  };

  // Handle blur event
  const handleBlur = () => {
    if (!hasSubscription) return;
    
    debouncedSaveJournal.cancel();
    saveJournal(localJournal);
  };

  // File upload handler
  const handleFileUpload = async (e) => {
    if (!hasSubscription) return;

    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    if (!originalFile.type.includes("image/")) {
      alert("Please upload only image files");
      return;
    }

    if (files.length >= 3) {
      alert("Maximum 3 files allowed");
      return;
    }

    setIsFileUploading(true);

    const cleanedFileName = originalFile.name.replace(/[^a-zA-Z0-9.]/g, "");
    const file = new File([originalFile], cleanedFileName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });

    const formData = new FormData();
    formData.append("attachedFiles", file);
    const utcDate = getUTCDate(selectedDate);
    formData.append("date", utcDate.toISOString());

    try {
      const token = Cookies.get("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/journals`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setJournal(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsFileUploading(false);
    }
  };

  // File deletion handler
  const handleFileDelete = async (fileKey) => {
    if (!hasSubscription) return;

    setDeletingFileKey(fileKey);
    setIsDeletingFile(true);

    try {
      const token = Cookies.get("token");
      const filename = fileKey.split("/").pop();

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/journals/${journal?._id}/file/${filename}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchJournalData();
      setSelectedImage(null);
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setIsDeletingFile(false);
      setDeletingFileKey(null);
    }
  };

  useEffect(() => {
    fetchJournalData();
  }, [selectedDate]);

  useEffect(() => {
    if (journal) {
      setLocalJournal({
        note: journal.note || "",
        mistake: journal.mistake || "",
        lesson: journal.lesson || "",
      });
      setFiles(journal.attachedFiles || []);
    }
  }, [journal]);

  useEffect(() => {
    return () => {
      debouncedSaveJournal.cancel();
    };
  }, [debouncedSaveJournal]);

  if (isLoading) {
    return <div>Loading journal...</div>;
  }

  return (
    <>
      <Card className="flex-1 w-full h-full flex justify-between flex-col pb-4 shadow-[0px_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0px_8px_20px_rgba(0,0,0,0.32)]">
        <CardHeader className="p-4">
          <CardTitle className="flex font-medium text-xl items-center gap-2">
            Today's Journal
            {isSaving && hasSubscription && (
              <span className="text-sm font-normal text-muted-foreground">
                (Saving...)
              </span>
            )}
            {!hasSubscription && (
              <span className="text-sm font-normal text-destructive">
                (Subscribe to unlock)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 h-full flex flex-col px-4">
          <div className="space-y-2 flex flex-col flex-1">
            <label className="text-xs font-medium">Notes</label>
            <Textarea
              name="note"
              placeholder={hasSubscription ? "Type your notes here..." : "Subscribe to unlock journaling"}
              value={localJournal.note}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={!hasSubscription}
              className="resize-none h-full flex-1 bg-background shadow-[0px_2px_8px_rgba(0,0,0,0.02)] border-t-0 text-[0.8rem]"
            />
          </div>

          <div className="space-y-2 flex flex-col flex-1">
            <label className="text-xs font-medium">Mistakes</label>
            <Textarea
              name="mistake"
              placeholder={hasSubscription ? "Type your mistakes here..." : "Subscribe to unlock journaling"}
              value={localJournal.mistake}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={!hasSubscription}
              className="resize-none h-full flex-1 bg-background shadow-[0px_2px_8px_rgba(0,0,0,0.02)] border-t-0 text-[0.8rem]"
            />
          </div>

          <div className="space-y-2 flex flex-col flex-1">
            <label className="text-xs font-medium">Lessons</label>
            <Textarea
              name="lesson"
              placeholder={hasSubscription ? "Type your lessons here..." : "Subscribe to unlock journaling"}
              value={localJournal.lesson}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={!hasSubscription}
              className="resize-none h-full flex-1 bg-background shadow-[0px_2px_8px_rgba(0,0,0,0.02)] border-t-0 text-[0.8rem]"
            />
          </div>
        </CardContent>
        <CardFooter className="h-fit p-0 px-6 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {files.map((fileKey, index) => (
              <motion.div
                key={index}
                className="relative group rounded-lg overflow-hidden w-20 h-8 shadow border cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => hasSubscription && setSelectedImage(fileKey)}
              >
                <img
                  src={fileKey}
                  alt={`Uploaded file ${index + 1}`}
                  className={cn("w-full h-full object-cover", !hasSubscription && "opacity-50")}
                />
              </motion.div>
            ))}
          </div>

          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileUpload}
            disabled={!hasSubscription}
          />

          <div className="flex items-center gap-2">
            <HoverCard>
              <HoverCardTrigger>
                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">
                    You can add maximum 3 documents Formats: JPEG, JPG, PDF,
                    PNG, HEIF File Size: Maximum 5MB
                    {!hasSubscription && <br />}
                    {!hasSubscription && "(Subscribe to unlock this feature)"}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>

            <Button
              variant="outline"
              className={cn(
                "w-fit flex items-center h-fit px-2 py-1.5 text-xs",
                ((files.length >= 3 || isFileUploading || !hasSubscription) &&
                  "opacity-50 cursor-not-allowed")
              )}
              onClick={() => hasSubscription && document.getElementById("file-upload")?.click()}
              disabled={files.length >= 3 || isFileUploading || !hasSubscription}
            >
              {isFileUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="mr-2 h-4 w-4" />
              )}
              {isFileUploading ? "Uploading..." : "Attach"}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ImageDialog
        isOpen={!!selectedImage && hasSubscription}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage}
        onDelete={() => handleFileDelete(selectedImage)}
        isDeleting={isDeletingFile && deletingFileKey === selectedImage}
      />
    </>
  );
}
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Physicalization, Work } from "@/app/api/mock/data";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Check, Circle } from "lucide-react";

type ProgressTimelineItem = {
  name: string;
  date: string;
  status: "complete" | "current" | "upcoming";
};

type PhysicalizationWithProgress = Physicalization & {
  timeline: ProgressTimelineItem[];
};

interface PhysicalizationProgressModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  physicalizationId: string | null;
  work: Work | null; // Pass work for displaying media
}

const fetchPhysicalizationProgress = async (id: string): Promise<PhysicalizationWithProgress> => {
  const res = await fetch(`/api/physicalization/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch physicalization progress");
  }
  return res.json();
};

export function PhysicalizationProgressModal({
  isOpen,
  onOpenChange,
  physicalizationId,
  work,
}: PhysicalizationProgressModalProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["physicalizationProgress", physicalizationId],
    queryFn: () => fetchPhysicalizationProgress(physicalizationId!),
    enabled: !!physicalizationId && isOpen,
  });

  const renderContent = () => {
    if (isLoading) return <p>Loading progress...</p>;
    if (isError || !data) return <p>Could not load progress details.</p>;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Image
            src={work?.media[0].url || ""}
            alt={work?.title || "Artwork"}
            width={80}
            height={100}
            className="rounded-md object-cover aspect-[4/5]"
          />
          <div>
            <DialogTitle>{work?.title}</DialogTitle>
            <DialogDescription>Physicalization Progress</DialogDescription>
             <Badge className="mt-2">{data.status}</Badge>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3">Timeline</h4>
          <ol className="relative border-s border-gray-200 dark:border-gray-700">
            {data.timeline.map((item, index) => (
              <li key={index} className="mb-6 ms-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                  <Check className="w-4 h-4 text-blue-800 dark:text-blue-300" />
                </span>
                <h3 className="flex items-center mb-1 text-base font-semibold text-gray-900 dark:text-white">
                  {item.name}
                </h3>
                <time className="block mb-2 text-xs font-normal leading-none text-gray-400 dark:text-gray-500">
                  {new Date(item.date).toLocaleString()}
                </time>
              </li>
            ))}
          </ol>
        </div>

        {data.shippingInfo && (
          <div>
            <h4 className="font-semibold mb-2">Shipping Details</h4>
            <div className="text-sm p-3 border rounded-md bg-muted/50">
                <p><strong>Carrier:</strong> {data.shippingInfo.carrier}</p>
                <p><strong>Tracking:</strong> {data.shippingInfo.trackingNumber}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
            {/* Title/Description are rendered inside renderContent to have access to data */}
        </DialogHeader>
        
        {renderContent()}

        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

// Combined status from both Order and Physicalization
export type TimelineStatus = "pending" | "paid" | "delivered" | "requested" | "in_progress" | "shipped" | "completed" | "failed" | "locked";

type TimelineStep = {
  name: string;
  status: "complete" | "current" | "upcoming";
};

const getTimelineSteps = (currentStatus: TimelineStatus): TimelineStep[] => {
  const stepsInOrder: { name: string, statuses: TimelineStatus[] }[] = [
    { name: "Ordered", statuses: ["pending"] },
    { name: "Paid", statuses: ["paid", "delivered"] },
    { name: "Requested", statuses: ["requested"] },
    { name: "In Progress", statuses: ["in_progress"] },
    { name: "Shipped", statuses: ["shipped"] },
    { name: "Completed", statuses: ["completed", "locked"] },
  ];

  let currentStepIndex = -1;
  stepsInOrder.forEach((step, index) => {
    if (step.statuses.includes(currentStatus)) {
      currentStepIndex = index;
    }
  });

  if (currentStatus === 'failed') {
      // Mark all as upcoming if failed
      currentStepIndex = -2;
  }

  return stepsInOrder.map((step, index) => ({
    name: step.name,
    status: index < currentStepIndex ? "complete" : index === currentStepIndex ? "current" : "upcoming",
  }));
};

export function OrderTimeline({ status }: { status: TimelineStatus }) {
  const steps = getTimelineSteps(status);

  return (
    <div className="p-4">
      <ol className="flex items-center w-full">
        {steps.map((step, i) => (
          <li
            key={step.name}
            className={cn("flex w-full items-center", {
              "text-primary after:border-primary": step.status === "complete",
              "after:border-gray-200 dark:after:border-gray-700": step.status !== "complete",
              "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block": i < steps.length - 1,
            })}
          >
            <span
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 relative",
                {
                  "bg-primary text-primary-foreground": step.status === "complete",
                  "border-2 border-primary bg-background text-primary": step.status === "current",
                  "bg-gray-100 dark:bg-gray-700": step.status === "upcoming",
                }
              )}
            >
              {step.status === "complete" ? (
                <Check className="w-5 h-5" />
              ) : step.status === 'current' ? (
                <span className="w-3 h-3 rounded-full bg-primary" />
              ) : (
                <span className="text-muted-foreground">{i + 1}</span>
              )}
                 <p className={cn("absolute top-14 w-28 text-center text-xs", {
                     "font-bold text-primary": step.status === 'current',
                     "text-muted-foreground": step.status !== 'current'
                 })}>
                     {step.name}
                 </p>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

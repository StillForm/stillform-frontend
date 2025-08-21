"use client";

import { useCreateWorkStore } from "@/store/create-work-store";
import { WorkForm } from "./work-form";
import { MediaUploadForm } from "./media-upload-form";
import { EditionsForm } from "./editions-form";
import { TypeSelectionForm } from "./type-selection-form";
import { BlindBoxStylesForm } from "./blind-box-styles-form";

export function CreateWorkWizard() {
  const { step, workType } = useCreateWorkStore();

  if (!workType) {
    return <TypeSelectionForm />;
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <TypeSelectionForm />;
      case 2:
        return <WorkForm />;
      case 3:
        return <MediaUploadForm />;
      case 4:
        if (workType === 'standard') {
          return <EditionsForm />;
        }
        return <BlindBoxStylesForm />;
      case 5:
        if (workType === 'blindbox') {
          return <EditionsForm />;
        }
        // Fallback for standard flow if something goes wrong
        return <div>Review and Publish (Standard)</div>;
      default:
        return <div>Invalid Step</div>;
    }
  };

  const totalSteps = workType === 'standard' ? 4 : 5;

  return (
    <div>
      <div className="mb-8">
        <ol className="flex items-center w-full">
          {[...Array(totalSteps)].map((_, i) => {
            const stepNum = i + 1;
            const isCompleted = step > stepNum;
            const isCurrent = step === stepNum;
            
            return (
               <li key={stepNum} className={`flex w-full items-center ${isCurrent || isCompleted ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500'} ${stepNum < totalSteps ? `after:content-[''] after:w-full after:h-1 after:border-b ${isCompleted ? 'after:border-blue-600' : 'after:border-gray-200'} after:border-4 after:inline-block` : ''}`}>
                <span className={`flex items-center justify-center w-10 h-10 ${isCurrent ? 'bg-blue-100' : 'bg-gray-100'} rounded-full lg:h-12 lg:w-12 dark:bg-gray-700 shrink-0`}>
                  {stepNum}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
      
      <div className="mt-8">
        {renderStepContent()}
      </div>
    </div>
  );
}

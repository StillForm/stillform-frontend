"use client";

import { useEffect } from 'react';
import { CreateWorkWizard } from "@/components/create-work-wizard";
import { useCreateWorkStore } from '@/store/create-work-store';

export default function NewWorkPage() {
  const reset = useCreateWorkStore((state) => state.reset);

  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">Create New Work</h1>
        <p className="mt-2 text-muted-foreground">
          Follow the steps to publish your art as a unique NFT.
        </p>
        <div className="mt-8">
          <CreateWorkWizard />
        </div>
      </div>
    </div>
  );
}

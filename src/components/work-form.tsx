"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { standardWorkSchema, blindboxWorkSchema, WorkFormData } from "@/lib/validators/work";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateWorkStore } from "@/store/create-work-store";

export function WorkForm() {
  const { formData, setFormData, setStep, workType } = useCreateWorkStore();

  const baseSchema = workType === 'blindbox' ? blindboxWorkSchema : standardWorkSchema;
  const currentSchema = baseSchema.pick({ title: true, description: true });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkFormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: formData,
  });

  const onSubmit = (data: WorkFormData) => {
    setFormData(data);
    setStep(3); // Proceed to the next step
  };

  const handleBack = () => {
    setStep(1); // Go back to type selection
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          {...register("description")}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button type="submit">Next Step</Button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getWorkSchema, WorkFormData } from "@/lib/validators/work";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateWorkStore } from "@/store/create-work-store";

export function EditionsForm() {
  const { formData, setFormData, setStep, reset, workType } = useCreateWorkStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const currentSchema = getWorkSchema(workType);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<WorkFormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      ...formData,
      workType: workType, // Pass workType to the resolver
      editions: formData.editions || [{ price: 0.1, supply: 10 }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "editions",
  });

  const onSubmit = async (data: WorkFormData) => {
    setIsLoading(true);
    // Merge final step data with existing form data
    const finalData = { ...formData, ...data };
    setFormData(finalData);

    try {
      const response = await fetch('/api/works/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        throw new Error('Failed to create work');
      }

      const newWork = await response.json();
      console.log("Work created:", newWork);
      alert("Work created successfully!");
      reset();
      router.push('/creator/studio');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating the work.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    // Dynamically go back based on the work type
    setStep(workType === 'standard' ? 3 : 4);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {fields.map((field, index) => (
        <div key={field.id} className="p-4 border rounded-md space-y-4">
          <h3 className="font-semibold">Edition {index + 1}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`editions.${index}.price`}>Price (ETH)</Label>
              <Input
                type="number"
                step="0.01"
                id={`editions.${index}.price`}
                {...register(`editions.${index}.price`, { valueAsNumber: true })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`editions.${index}.supply`}>Supply</Label>
              <Input
                type="number"
                id={`editions.${index}.supply`}
                {...register(`editions.${index}.supply`, { valueAsNumber: true })}
                disabled={isLoading}
              />
            </div>
          </div>
          {fields.length > 1 && (
            <Button variant="destructive" size="sm" onClick={() => remove(index)} disabled={isLoading}>
              Remove Edition
            </Button>
          )}
        </div>
      ))}
      
      <Button variant="outline" type="button" onClick={() => append({ price: 0.1, supply: 1 })} disabled={isLoading}>
        Add Another Edition
      </Button>

      <div className="flex justify-between">
        <Button variant="outline" type="button" onClick={handleBack} disabled={isLoading}>
          Back
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Publishing..." : "Publish Work"}
        </Button>
      </div>
    </form>
  );
}

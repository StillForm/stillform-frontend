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
  const { formData, setFormData, setStep, workType } = useCreateWorkStore();

  // We only need the 'editions' part of the schema for this form step
  const currentSchema = getWorkSchema(workType).pick({ editions: true });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<WorkFormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      ...formData,
      editions: formData.editions || [{ price: 0.1, supply: 10 }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "editions",
  });

  const onSubmit = (data: WorkFormData) => {
    console.log("EditionsForm onSubmit data:", JSON.stringify(data, null, 2));
    // Sanitize data before setting it to the global store
    const sanitizedEditions = data.editions?.map(e => ({
      ...e,
      price: isNaN(e.price) ? 0 : e.price,
      supply: isNaN(e.supply) ? 0 : e.supply,
    }));

    setFormData({ ...data, editions: sanitizedEditions });
    // Proceed to the final review step
    setStep(workType === 'standard' ? 5 : 6);
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`editions.${index}.supply`}>Supply</Label>
              <Input
                type="number"
                id={`editions.${index}.supply`}
                {...register(`editions.${index}.supply`, { valueAsNumber: true })}
              />
            </div>
          </div>
          {fields.length > 1 && (
            <Button variant="destructive" size="sm" onClick={() => remove(index)}>
              Remove Edition
            </Button>
          )}
        </div>
      ))}
      
      {/* For simplicity, this example only supports a single edition as per the contract structure.
          The UI for multiple editions is left here for potential future expansion. */}
      { fields.length < 1 &&
        <Button variant="outline" type="button" onClick={() => append({ price: 0.1, supply: 1 })}>
          Add Edition
        </Button>
      }

      <div className="flex justify-between">
        <Button variant="outline" type="button" onClick={handleBack}>
          Back
        </Button>
        <Button type="submit">
          Next Step
        </Button>
      </div>
    </form>
  );
}

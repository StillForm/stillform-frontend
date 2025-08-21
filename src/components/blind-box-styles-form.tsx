"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getWorkSchema, WorkFormData } from "@/lib/validators/work";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateWorkStore } from "@/store/create-work-store";
import { Progress } from "@/components/ui/progress";

export function BlindBoxStylesForm() {
  const { formData, setFormData, setStep, workType } = useCreateWorkStore();

  const currentSchema = getWorkSchema(workType);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<WorkFormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      ...formData,
      workType: 'blindbox', // Important for discriminated union
      blindboxStyles: formData.blindboxStyles || [
        { name: '', probability: 50 },
        { name: '', probability: 50 },
      ],
    },
    mode: 'onChange', // Validate on change to update total probability
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "blindboxStyles",
  });

  const watchedStyles = useWatch({ control, name: "blindboxStyles" });
  const totalProbability = watchedStyles.reduce((sum, style) => sum + (style.probability || 0), 0);

  const onSubmit = (data: WorkFormData) => {
    setFormData(data);
    setStep(5); // Proceed to the next step
  };

  const handleBack = () => {
    setStep(3); // Go back to media upload
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Set Blind Box Styles</h2>
        <p className="text-muted-foreground">
          Define the items and their reveal probabilities. Total must be 100%.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Total Probability</Label>
          <span className={`font-bold ${totalProbability === 100 ? 'text-green-500' : 'text-red-500'}`}>
            {totalProbability.toFixed(2)}%
          </span>
        </div>
        <Progress value={totalProbability} />
        {errors.blindboxStyles?.root && (
           <p className="text-sm text-destructive">{errors.blindboxStyles.root.message}</p>
        )}
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`blindboxStyles.${index}.name`}>Style Name</Label>
                <Input {...register(`blindboxStyles.${index}.name`)} />
              </div>
               <div className="space-y-2">
                <Label htmlFor={`blindboxStyles.${index}.probability`}>Probability (%)</Label>
                <Input type="number" step="0.01" {...register(`blindboxStyles.${index}.probability`, { valueAsNumber: true })} />
              </div>
           </div>
           {fields.length > 2 && (
             <Button className="absolute top-2 right-2" variant="destructive" size="sm" onClick={() => remove(index)}>
              Remove
            </Button>
           )}
        </div>
      ))}

      <Button variant="outline" type="button" onClick={() => append({ name: '', probability: 0 })}>
        Add Another Style
      </Button>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button type="submit" disabled={!isValid}>
          Next Step
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import {useState, useEffect} from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { stylesFormSchema, WorkFormData, StylesFormData } from "@/lib/validators/work";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateWorkStore } from "@/store/create-work-store";
import { Progress } from "@/components/ui/progress";

export function BlindBoxStylesForm() {
  const { formData, setFormData, setStep, workType } = useCreateWorkStore();


  const [previews, setPreviews] = useState<(string | null)[]>([]);

  useEffect(() => {
    // Cleanup object URLs on component unmount
    return () => {
      previews.forEach(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors, isValid },
  } = useForm<StylesFormData>({
    resolver: zodResolver(stylesFormSchema),
    defaultValues: {
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

  const onSubmit = (data: StylesFormData) => {
    setFormData({
      ...formData,
      blindboxStyles: data.blindboxStyles,
    });
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
                 {errors.blindboxStyles?.[index]?.name && (
                  <p className="text-sm text-destructive">{errors.blindboxStyles[index]?.name?.message}</p>
                )}
              </div>
               <div className="space-y-2">
                <Label htmlFor={`blindboxStyles.${index}.probability`}>Probability (%)</Label>
                <Input type="number" step="0.01" {...register(`blindboxStyles.${index}.probability`, { valueAsNumber: true })} />
                 {errors.blindboxStyles?.[index]?.probability && (
                  <p className="text-sm text-destructive">{errors.blindboxStyles[index]?.probability?.message}</p>
                )}
              </div>
           </div>
            <div className="space-y-2">
              <Label>Style Media</Label>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor={`blindboxStyles.${index}.media`}
                  className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Choose File
                </Label>
                <Input
                  id={`blindboxStyles.${index}.media`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const file = e.target.files[0];
                      const currentStyles = getValues("blindboxStyles");
                      const newStyles = currentStyles.map((style, i) => 
                        i === index ? { ...style, rawFile: file } : style
                      );
                      setValue("blindboxStyles", newStyles, { shouldValidate: true, shouldDirty: true });

                      // Update preview
                      const newPreviews = [...previews];
                      if (newPreviews[index]) {
                        URL.revokeObjectURL(newPreviews[index]!);
                      }
                      newPreviews[index] = URL.createObjectURL(file);
                      setPreviews(newPreviews);
                    }
                  }}
                />
                <span className="text-sm text-muted-foreground">
                  {watchedStyles[index]?.rawFile ? (watchedStyles[index].rawFile as File).name : 'No file chosen'}
                </span>
              </div>
              {previews[index] && (
                <div className="mt-2 relative w-24 h-24">
                  <Image
                    src={previews[index]!}
                    alt="Style preview"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )}
               <p className="text-xs text-muted-foreground">
                Upload the image for this specific style.
              </p>
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

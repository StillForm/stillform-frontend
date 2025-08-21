"use client";

import { useCreateWorkStore } from "@/store/create-work-store";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Work } from "@/app/api/mock/data";

export function TypeSelectionForm() {
  const { workType, setWorkType, setStep } = useCreateWorkStore();

  const handleNext = () => {
    setStep(2); // Move to the next step
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Choose Work Type</h2>
        <p className="text-muted-foreground">
          Select what kind of asset you want to create.
        </p>
      </div>
      
      <RadioGroup
        value={workType}
        onValueChange={(value: Work['type']) => setWorkType(value)}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="standard" id="standard" />
          <Label htmlFor="standard">Standard Artwork</Label>
        </div>
        <p className="text-sm text-muted-foreground ml-6">
          A regular piece of art with defined editions.
        </p>
        
        <div className="flex items-center space-x-2 mt-4">
          <RadioGroupItem value="blindbox" id="blindbox" />
          <Label htmlFor="blindbox">Blind Box</Label>
        </div>
         <p className="text-sm text-muted-foreground ml-6">
          A collection of items with varying rarities, revealed upon purchase.
        </p>
      </RadioGroup>

      <div className="flex justify-end">
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
}

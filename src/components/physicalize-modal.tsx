"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Work, CollectionItem } from "@/app/api/mock/data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const physicalizeSchema = z.object({
  recipient: z.string().min(2, "Recipient name is required"),
  phone: z.string().min(5, "A valid phone number is required"),
  addressLine1: z.string().min(5, "Address is required"),
  postalCode: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  lockAcknowledge: z.preprocess(
    (val) => !!val,
    z.boolean().refine((val) => val === true, {
      message: "You must acknowledge the NFT will be locked.",
    })
  ),
});

type PhysicalizeFormData = z.infer<typeof physicalizeSchema>;

interface PhysicalizeModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  work: Work;
  onPhysicalizeComplete: () => void;
}

export function PhysicalizeModal({ isOpen, onOpenChange, work, onPhysicalizeComplete }: PhysicalizeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PhysicalizeFormData>({
    resolver: zodResolver(physicalizeSchema),
  });

  const onSubmit = async (data: PhysicalizeFormData) => {
    if (!work) return;
    setIsLoading(true);
    try {
      const shippingInfo = {
        recipient: data.recipient,
        phone: data.phone,
        address: data.addressLine1,
        postalCode: data.postalCode,
        country: data.country,
      };

      const response = await fetch('/api/physicalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              workId: work.id,
              shippingInfo: shippingInfo,
          })
      });

      if (!response.ok) {
          throw new Error('Failed to submit physicalization request');
      }
      
      onPhysicalizeComplete();
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Failed to physicalize:", error);
      // Here you would show an error message
    } finally {
      setIsLoading(false);
    }
  };

  if (!work) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) reset();
    }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Request Physical Version</DialogTitle>
          <DialogDescription>
            Enter your shipping details to receive a physical version of "{work.title}".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input id="recipient" {...register("recipient")} />
              {errors.recipient && <p className="text-xs text-destructive">{errors.recipient.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="addressLine1">Address</Label>
              <Input id="addressLine1" {...register("addressLine1")} />
              {errors.addressLine1 && <p className="text-xs text-destructive">{errors.addressLine1.message}</p>}
            </div>
           <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code (Optional)</Label>
              <Input id="postalCode" {...register("postalCode")} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register("country")} />
              {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-4">
            <Checkbox id="lockAcknowledge" {...register("lockAcknowledge")} />
            <Label htmlFor="lockAcknowledge" className="text-sm font-normal text-muted-foreground">
              I understand that requesting a physical version will permanently lock the NFT from being sold or transferred.
            </Label>
          </div>
           {errors.lockAcknowledge && <p className="text-xs text-destructive">{errors.lockAcknowledge.message}</p>}

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Confirm Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

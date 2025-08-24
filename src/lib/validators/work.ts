import { z } from 'zod';

export const blindboxStyleSchema = z.object({
  name: z.string().min(1, 'Style name is required.'),
  probability: z.number().min(0.01).max(100),
  // media placeholder
});

export const standardWorkSchema = z.object({
  workType: z.literal('standard'),
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  editions: z.array(z.object({
    price: z.number().positive(),
    supply: z.number().positive().int(),
  })).min(1, "At least one edition is required."),
});

export const blindboxWorkSchema = z.object({
  workType: z.literal('blindbox'),
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  blindboxStyles: z.array(blindboxStyleSchema).min(2, "At least two styles are required for a blind box."),
  editions: z.array(z.object({ // Blind boxes also have editions
    price: z.number().positive(),
    supply: z.number().positive().int(),
  })).min(1, "At least one edition is required."),
});

const refinedBlindboxWorkSchema = blindboxWorkSchema.refine(data => {
  const totalProbability = data.blindboxStyles.reduce((sum, style) => sum + style.probability, 0);
  // Use a small epsilon for float comparison
  return Math.abs(totalProbability - 100) < 0.001;
}, {
  message: "Total probability of all styles must be exactly 100%",
  path: ["blindboxStyles"],
});

export const stylesFormSchema = z.object({
  blindboxStyles: z.array(blindboxStyleSchema).min(2, "At least two styles are required for a blind box."),
}).refine(data => {
  const totalProbability = data.blindboxStyles.reduce((sum, style) => sum + style.probability, 0);
  return Math.abs(totalProbability - 100) < 0.001;
}, {
  message: "Total probability of all styles must be exactly 100%",
  path: ["blindboxStyles"],
});

export const getWorkSchema = (workType: 'standard' | 'blindbox' | null | undefined) => {
  if (workType === 'blindbox') {
    return refinedBlindboxWorkSchema;
  }
  // Default to standard schema, even if workType is not yet defined
  return standardWorkSchema;
};

// We can still export a general type for form data
export type WorkFormData = z.infer<typeof standardWorkSchema> | z.infer<typeof blindboxWorkSchema>;

export type StylesFormData = z.infer<typeof stylesFormSchema>;



import { z } from 'zod';

export const dossierSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1),
  questionnaireVersionId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createDossierSchema = z.object({
  name: z.string().trim().min(1).max(200),
});

export const updateDossierSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
  })
  .refine((v) => v.name !== undefined, { message: 'At least one field must be provided.' });

export type Dossier = z.infer<typeof dossierSchema>;
export type CreateDossierInput = z.infer<typeof createDossierSchema>;
export type UpdateDossierInput = z.infer<typeof updateDossierSchema>;

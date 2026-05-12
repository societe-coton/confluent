import { z } from 'zod';

export const dossierSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1),
  questionnaireVersionId: z.string().uuid(),
  sector: z.string().nullable(),
  maturityStage: z.string().nullable(),
  submittedAt: z.string().datetime().nullable(),
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

export const adminDossierListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  sector: z.string().nullable(),
  maturityStage: z.string().nullable(),
  ownerEmail: z.string().email(),
  createdAt: z.string().datetime(),
  activeShareLinksCount: z.number().int().nonnegative(),
});

export const adminDossierListSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  items: z.array(adminDossierListItemSchema),
});

export type Dossier = z.infer<typeof dossierSchema>;
export type CreateDossierInput = z.infer<typeof createDossierSchema>;
export type UpdateDossierInput = z.infer<typeof updateDossierSchema>;
export type AdminDossierListItem = z.infer<typeof adminDossierListItemSchema>;
export type AdminDossierList = z.infer<typeof adminDossierListSchema>;

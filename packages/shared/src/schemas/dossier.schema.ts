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

export type Dossier = z.infer<typeof dossierSchema>;

import type { MockDossier } from './mock-dossiers'

export interface MockDossierDetail extends MockDossier {
  readonly answers: Readonly<Record<string, string>>
}

export const MOCK_DOSSIER_DETAIL: MockDossierDetail = {
  slug: 'biosensio',
  name: 'Biosensio',
  sector: 'DeepTech',
  maturity: 'Pre-seed',
  activeShareLinksCount: 2,
  createdAt: '2026-04-18T09:00:00.000Z',
  answers: {
    'nom-projet': 'Biosensio',
    secteur: 'Biotechnologie — diagnostic rapide',
    maturite: 'Prototype validé, premiers clients pilotes signés.',
    'description-courte':
      'Nous développons des biocapteurs portables pour détecter en 15 minutes les agents pathogènes dans les élevages agricoles.',
    probleme:
      'Les éleveurs détectent aujourd’hui les maladies trop tard : les analyses en laboratoire prennent 48 à 72 heures et les pertes animales s’accumulent pendant ce délai.',
    solution:
      'Un boîtier portable qui analyse un échantillon (sang, salive, fèces) sur site et renvoie un diagnostic fiable en 15 minutes, directement dans l’application mobile de l’éleveur.',
    'marche-cible':
      'Exploitations bovines et porcines de plus de 200 têtes en France et en Europe de l’Ouest. Cible secondaire : vétérinaires ruraux indépendants.',
    differenciateur:
      'Temps de réponse 200× plus rapide que le laboratoire, coût par test divisé par trois, pas de chaîne du froid requise. Breveté depuis mars 2025.',
    montant: '850 000 €',
    'usage-fonds':
      'Industrialisation du boîtier (45 %), certification vétérinaire européenne (30 %), équipe commerciale (25 %).',
    'taille-equipe':
      'Nous sommes quatre cofondateurs à temps plein : deux docteurs en biologie, un ingénieur hardware, un commercial grands-comptes.',
    'profil-fondateur':
      'Vétérinaire de formation, dix ans chez Ceva Santé Animale sur les tests diagnostics, puis chercheuse à l’INRAE sur les biocapteurs. Je cherche à réduire l’écart entre la recherche et le terrain.',
  },
}

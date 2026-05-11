export const PLANS = {
  basic: {
    name: 'Basic',
    price: '€9,90',
    description: 'Per professionisti individuali',
    features: [
      'Fino a 50 scadenze',
      'Tutte le categorie (Mobilità, Certificazioni, Immobili, Welfare)',
      'Alert via email',
      'Esportazione PDF',
    ],
  },
  pro: {
    name: 'Pro',
    price: '€19,90',
    description: 'Per studi e PMI',
    features: [
      'Scadenze illimitate',
      'Gestione multi-persona',
      'Alert via email e SMS',
      'Esportazione PDF e Excel',
      'Supporto prioritario',
      'Report mensile automatico',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS

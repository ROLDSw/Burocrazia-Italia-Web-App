export type PersonaType =
  | 'avvocato' | 'commercialista' | 'architetto' | 'medico'
  | 'piccola_impresa' | 'libero_professionista' | 'privato'

export interface Persona {
  id: string
  name: string
  profession: PersonaType
  company?: string
  city: string
  num_scadenze_attive: number
  urgenti: number
  account_type?: 'b2b' | 'b2c'
}

export const mockPersona: Persona = {
  id: 'usr-1',
  name: 'Roland',
  profession: 'avvocato',
  company: 'Studio Legale Rossi',
  city: 'Milano',
  num_scadenze_attive: 23,
  urgenti: 3,
  account_type: 'b2b'
}

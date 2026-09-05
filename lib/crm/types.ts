export type CrmWonLead = {
  id: string;
  entreprise: string;
  prenom: string | null;
  nom: string | null;
  email: string;
  deal_amount: number;
  notes: string | null;
  slug: string | null;
  created_at: string;
  rdv_date: string | null;
};

export type CrmWonLeadsResponse = {
  leads: CrmWonLead[];
};

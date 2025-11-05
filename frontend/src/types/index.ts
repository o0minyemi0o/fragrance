export interface Ingredient {
  id: number;
  name: string;
  inci_name: string;
  cas_number?: string;
  note_family?: string;
  max_usage?: number;
}

export interface Accord {
  id: number;
  name: string;
  description?: string;
  total_concentration?: number;
}

export interface Recommendation {
  id: number;
  user_id?: string;
  preference_input: string;
  recommended_accord_id?: number;
  confidence_score?: number;
  created_at: string;
}

export interface DBTestResponse<T> {
  status: string;
  count: number;
  data: T[];
}


import { supabase } from '@/api/supabaseClient';

function parseSort(sortField) {
  if (!sortField) return { column: 'created_date', ascending: false };
  const descending = sortField.startsWith('-');
  const column = descending ? sortField.slice(1) : sortField;
  return { column, ascending: !descending };
}

const defaultUser = {
  full_name: "Administrador",
  email: "admin@pro-saude.com",
  department: "administracao",
  position: "Administrador do Sistema",
  role: "admin",
  avatar_url: null
};

export const User = {
  async me() {
    return defaultUser;
  },

  async list(sortField, limit) {
    const { column, ascending } = parseSort(sortField);
    let query = supabase
      .from('profiles')
      .select('*')
      .order(column, { ascending });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) return [defaultUser];
    return data.length > 0 ? data : [defaultUser];
  },

  async logout() {
    // No-op: sistema de acesso livre
  },
};

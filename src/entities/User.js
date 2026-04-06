import { supabase } from '@/api/supabaseClient';

function parseSort(sortField) {
  if (!sortField) return { column: 'created_date', ascending: false };
  const descending = sortField.startsWith('-');
  const column = descending ? sortField.slice(1) : sortField;
  return { column, ascending: !descending };
}

export const User = {
  async me() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw authError || new Error('Not authenticated');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return profile;
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
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};

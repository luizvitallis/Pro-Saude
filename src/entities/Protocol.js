import { supabase } from '@/api/supabaseClient';

function parseSort(sortField) {
  if (!sortField) return { column: 'created_date', ascending: false };
  const descending = sortField.startsWith('-');
  const column = descending ? sortField.slice(1) : sortField;
  return { column, ascending: !descending };
}

export const Protocol = {
  async list(sortField, limit) {
    const { column, ascending } = parseSort(sortField);
    let query = supabase
      .from('protocols')
      .select('*')
      .order(column, { ascending });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from('protocols')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(record) {
    const payload = { ...record };

    const { data, error } = await supabase
      .from('protocols')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('protocols')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('protocols')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

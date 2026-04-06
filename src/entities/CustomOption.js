import { supabase } from '@/api/supabaseClient';

function toDb(obj) {
  const mapped = {};
  if (obj.listName !== undefined) mapped.list_name = obj.listName;
  if (obj.displayName !== undefined) mapped.display_name = obj.displayName;
  if (obj.options !== undefined) mapped.options = obj.options;
  return mapped;
}

function fromDb(row) {
  if (!row) return row;
  return {
    id: row.id,
    listName: row.list_name,
    displayName: row.display_name,
    options: row.options || [],
    created_date: row.created_date,
    updated_date: row.updated_date,
  };
}

export const CustomOption = {
  async filter(criteria) {
    let query = supabase.from('custom_options').select('*');

    if (criteria.listName) {
      query = query.eq('list_name', criteria.listName);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(fromDb);
  },

  async create(record) {
    const payload = toDb(record);
    const { data, error } = await supabase
      .from('custom_options')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return fromDb(data);
  },

  async update(id, updates) {
    const payload = toDb(updates);
    const { data, error } = await supabase
      .from('custom_options')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return fromDb(data);
  },
};

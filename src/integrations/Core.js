import { supabase } from '@/api/supabaseClient';

export async function UploadFile({ file }) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error } = await supabase.storage
    .from('protocol-files')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('protocol-files')
    .getPublicUrl(filePath);

  return { file_url: publicUrl };
}

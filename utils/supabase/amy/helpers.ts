import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserId(supabaseClient: SupabaseClient) {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  return user?.id || null;
}

export async function getUserDisplayName(supabaseClient: SupabaseClient) {
  const userId = await getUserId(supabaseClient);

  let displayName : string|null = null;
  if (userId) {
    const { data, error } = await supabaseClient
    .from('user_info')
    .select()
    .eq('id', userId);

    if (data && data.length > 0) {
      displayName = data[0].display_name;
    }
  }
  return displayName;
}

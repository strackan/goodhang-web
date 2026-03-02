/**
 * Wispr Dictionary Context
 *
 * Fetches entity names from HumanOS for Wispr Flow's dictionary parameter.
 * This improves recognition of domain-specific terms like company names,
 * people names, and product names.
 */

export async function buildWisprDictionary(
  supabaseUrl: string,
  supabaseKey: string
): Promise<string[]> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/entities?select=name&limit=200`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Accept-Profile': 'human_os',
        },
      }
    );

    if (!res.ok) {
      console.warn('Failed to fetch entity names for Wispr dictionary:', res.status);
      return [];
    }

    const entities: Array<{ name: string }> = await res.json();
    return entities.map((e) => e.name).filter(Boolean);
  } catch (error) {
    console.warn('Error building Wispr dictionary:', error);
    return [];
  }
}

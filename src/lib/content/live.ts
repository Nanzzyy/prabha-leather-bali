import { fetchSupabaseRows } from '@/lib/supabase-rest';
import type { ContentSection } from './defaults';

export async function fetchLiveSiteContent(lang: string): Promise<Partial<Record<ContentSection, object>>> {
  const rows = await fetchSupabaseRows<{ section: string; content: object }>('site_content', {
    select: 'section,content',
    locale: `eq.${lang}`,
  });
  return rows.reduce<Partial<Record<ContentSection, object>>>((result, row) => {
    result[row.section as ContentSection] = row.content;
    return result;
  }, {});
}

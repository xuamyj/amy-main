import { getThisMonthYYYYMM } from '@/utils/supabase/amy/helpers';
import { redirect } from 'next/navigation';

export default async function LebreCalendarPageRedirect() {
  const yearMonth = getThisMonthYYYYMM();

  redirect(`/lebre/calendar/${yearMonth}`); 
}

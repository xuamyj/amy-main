import { getTodayYYYYMMDD } from '@/utils/supabase/amy/helpers';
import { redirect } from 'next/navigation';

export default async function LebreCalendarPageRedirect() {
  const yearMonthDay = getTodayYYYYMMDD();
  const yearMonth = Math.floor(yearMonthDay/100);

  redirect(`/lebre/calendar/${yearMonth}`); 
}

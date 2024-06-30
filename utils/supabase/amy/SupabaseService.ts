import { createClient } from "@/utils/supabase/server";
import { SupabaseClient, User } from '@supabase/supabase-js'

class AmySupabaseService {
  private static instance: AmySupabaseService
  private supabase: SupabaseClient
  private user: User | null | 'uninitialized' = 'uninitialized'

  private constructor() {
    this.supabase = createClient();
  }

  static getInstance(): AmySupabaseService {
    if (!AmySupabaseService.instance) {
      AmySupabaseService.instance = new AmySupabaseService();
    }
    return AmySupabaseService.instance;
  }

  //--------

  getSupabase(): SupabaseClient {
    return createClient();
  }

  //--------

  private async initializeUser(): Promise<User | null> {
    if (this.user !== 'uninitialized') {
      return this.user;
    }
    const { data: { user } } = await this.supabase.auth.getUser()
    this.user = user;
    return this.user;
  }

  async getUserId(): Promise<string | null> {
    const user = await this.initializeUser(); 
    return user?.id || null;
  }

  // Add other methods as needed
}

export const AmySupabaseServiceInstance = AmySupabaseService.getInstance();

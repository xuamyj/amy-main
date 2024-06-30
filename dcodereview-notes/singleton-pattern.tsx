/*  { } (y); user.id just once? (incl submitDisplayName inner one); display_name not copy; anything else very un-javascript-y */ 

class Animal {
  def __init__(self, nameParam, soundParam):
    this.name = nameParam;
    this.sound = soundParam;

  def makeSound() {
    print(this.sound);
  }

  static def makeDog() { // <-- D: people do this, to make it easier to make instances. 
    return new Animal('Dog', 'bark!');
  }
}

dog = new Animal('Dog', 'bark!')
dog // <-- an instance of the class Animal

private static instance: AmySupabaseService // store it in the class, but not "inside itself (instance)". we can do this bc we're planning to only have 1

private field // i can't say field++ or field = __ from outside the class
// i have to use the class's function usually setField();
// 

// --------

import { createClient } from "@/utils/supabase/server";
import { SupabaseClient, User } from '@supabase/supabase-js'

export let instanceAmySupabaseService: AmySupabaseService | null = null;

class AmySupabaseService {
  // private static instance: AmySupabaseService
  private supabase: SupabaseClient
  private user: User | null | 'uninitialized' = 'uninitialized'

  private constructor() {
    this.supabase = createClient();
  }

  static getInstance(): AmySupabaseService {
    if (!instanceAmySupabaseService) {
      instanceAmySupabaseService = new AmySupabaseService()
    }
    return instanceAmySupabaseService
  }

  getSupabase(): SupabaseClient {
    return this.supabase
  }

  private async initializeUser(): Promise<User | null> {
    if (this.user !== 'uninitialized') {
      return this.user
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

instanceAmySupabaseService = AmySupabaseService.getInstance();

// ^^ This is what is happening basically, except people are attaching the single instance onto the class (static)

// --------

// OHHHH D: "you could also just export the entire class and always call `getInstance()`"
// so this is just a shortcut to copy paste a tiny bit less (eg. not getInstance())

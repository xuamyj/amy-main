const obj = {'a': 1, 'b': 2, 'innerObj': {
  'innerValue': 'hello'
} };

const { a, b } = obj; // has to be `a` and `b` bc it's 'a' and 'b'
const { a: aNewName, b: bNewName } = obj; // do the same, but rename them
// and `a` and `b` are not used / undisturbed
// so we have const aNewName, and const bNewName

const newValue = obj.innerObj.innerValue; // D highly recommends to do this, but you might see.....

// const { innerObj } = obj; // this is fine (you don't have to grab everything else for it to work)
const { innerObj: { innerValue : newInnerValueName } } = obj; 
// const newInnerValueName and nothing else? 

const {
  data: { user },
} = await supabase.auth.getUser();
// is the same as ... 
const user = result['data']['user']; // where result is the result of await supabase.auth.getUser();

if (result && result['data'] && result['data']['user']); // secretly hidden in ^? 
// D: NO

import thing from 'whatever'; // with default
import { thing } from 'whatever'; // without default, D says to always use this. D says not to export things as default, except for main page.tsx which have to do it

    // Convert FormData to a JavaScript object
    const formObject: { [key: string]: any } = {};

// TRUE: if you have a variable and then a : (colon), the thing afterward is ALWAYS a type
// oh right except in JSON object (see everything before this)

// NOT map of `[key: string]` to `any`
// `[key: string]` means the type of the key is ANY string, NOT specific strings like MenuEnum
`[key: bool]` // NOT SEEN very often
`[key: 'hake' | 'salmon' | 'bisque']` // this is if it's specific


/*  { } (y); user.id just once? (incl submitDisplayName inner one); display_name not copy; anything else very un-javascript-y */ 
// ^ done!

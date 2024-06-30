export const starterEnum = { // make a Record (Typescript name for dictionary/map) of string:string (key:value)
  "hake_and_prawn_crepes": "Hake and prawn crepes with mushroom and cava sauce",
  "mix_leaves_salad": "Mix leaves salad, artichokes, anchovies, Payoyo cheese, cherry tomato, grapefruit",
  "dill_marinated_salmon": "Dill marinated salmon with asparagus pudding, soy mayonnaise and yuzu",
  "seafood_bisque": "Seafood bisque with crunchy lobster",
} as const; // instead of some string:some string, store as "hake..":"Hake.." in the type

export const mainEnum = {
  "grilled_sea_bass": "Grilled sea bass, celeriac purée, carrots, herb oil",
  "duck_confit": "Duck confit with gratin potato, sautéed mushrooms, dried apricots in orange wine",
  "iberian_cheeks": "Iberian cheeks al oloroso with red garlic and sesame seeds",
  "grilled_salmon": "Grilled salmon, sweet potato, fennel, dill sauce",
} as const;

export const dessertEnum = {
  "san_marcos_cake": "San Marcos cake Alfonso XIII style",
  "chocolate_cake": "Chocolate cake",
  "bread_toast_confit": "Bread toast confit with Sevillian orange with cinnamon ice cream, toffee",
} as const;

export type StarterEnum = keyof typeof starterEnum;
// read right to left
// typeof: takes in variable, returns the Typescript type
// keyof: takes a Typescript type, returns a new Typescript type that is basically List of the keys
// StarterEnum is a type, just like starterEnum is an obj

export type MainEnum = keyof typeof mainEnum;
export type DessertEnum = keyof typeof dessertEnum;
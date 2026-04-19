// ─── GROCERY DATA ─────────────────────────────────────────────────────────────
// Departments define the sort order at shopping time.
// Every item carries a dept key — invisible during entry, used for grouping.
// Common items (showInGrid: true) appear in the quick-add grid.
// All items are searchable by name and any aliases.

const GROCERY_DEPARTMENTS = [
  { key: 'produce',   label: 'Produce',    emoji: '🥦' },
  { key: 'meat',      label: 'Meat',       emoji: '🥩' },
  { key: 'seafood',   label: 'Seafood',    emoji: '🐟' },
  { key: 'dairy',     label: 'Dairy',      emoji: '🥛' },
  { key: 'deli',      label: 'Deli',       emoji: '🧀' },
  { key: 'bakery',    label: 'Bakery',     emoji: '🍞' },
  { key: 'frozen',    label: 'Frozen',     emoji: '🧊' },
  { key: 'dry',       label: 'Dry Goods',  emoji: '🌾' },
  { key: 'canned',    label: 'Canned',     emoji: '🥫' },
  { key: 'snacks',    label: 'Snacks',     emoji: '🍿' },
  { key: 'beverages', label: 'Beverages',  emoji: '🧃' },
  { key: 'alcohol',   label: 'Alcohol',    emoji: '🍺' },
  { key: 'health',    label: 'Health',     emoji: '💊' },
  { key: 'household', label: 'Household',  emoji: '🧹' },
  { key: 'personal',  label: 'Personal',   emoji: '🧴' },
  { key: 'baby',      label: 'Baby',       emoji: '🍼' },
  { key: 'pet',       label: 'Pet',        emoji: '🐾' },
  { key: 'misc',      label: 'Misc',       emoji: '🛒' },
];

// ─── ITEMS ────────────────────────────────────────────────────────────────────
// Fields:
//   name        — display name, title case
//   dept        — key from GROCERY_DEPARTMENTS
//   defaultUnit — 'count' | 'weight' | 'volume'
//   defaultQty  — sensible starting quantity
//   showInGrid  — true = appears in quick-add grid
//   aliases     — alternate search terms (lowercase)

const GROCERY_ITEMS = [

  // ── PRODUCE ──────────────────────────────────────────────────────────────
  { name: 'Bananas',            dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['banana'] },
  { name: 'Apples',             dept: 'produce',   defaultUnit: 'count',  defaultQty: 4,   showInGrid: true,  aliases: ['apple'] },
  { name: 'Avocados',           dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: true,  aliases: ['avocado', 'avo'] },
  { name: 'Lemons',             dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: ['lemon'] },
  { name: 'Limes',              dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: ['lime'] },
  { name: 'Oranges',            dept: 'produce',   defaultUnit: 'count',  defaultQty: 4,   showInGrid: false, aliases: ['orange'] },
  { name: 'Strawberries',       dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['strawberry', 'berries'] },
  { name: 'Blueberries',        dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['blueberry', 'berries'] },
  { name: 'Grapes',             dept: 'produce',   defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['grape'] },
  { name: 'Watermelon',         dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Broccoli',           dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: [] },
  { name: 'Spinach',            dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['baby spinach'] },
  { name: 'Romaine Lettuce',    dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['lettuce', 'romaine'] },
  { name: 'Iceberg Lettuce',    dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['lettuce', 'iceberg'] },
  { name: 'Kale',               dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Carrots',            dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['carrot', 'baby carrots'] },
  { name: 'Celery',             dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Cucumber',           dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['cucumbers'] },
  { name: 'Zucchini',           dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: ['courgette'] },
  { name: 'Bell Peppers',       dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: ['pepper', 'peppers'] },
  { name: 'Jalapeños',          dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: ['jalapeno', 'hot pepper'] },
  { name: 'Tomatoes',           dept: 'produce',   defaultUnit: 'count',  defaultQty: 3,   showInGrid: true,  aliases: ['tomato'] },
  { name: 'Cherry Tomatoes',    dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['grape tomatoes'] },
  { name: 'Corn',               dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: ['corn on the cob'] },
  { name: 'Asparagus',          dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Brussels Sprouts',   dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Mushrooms',          dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['mushroom'] },
  { name: 'Onion',              dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['onions', 'yellow onion'] },
  { name: 'Red Onion',          dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['onion'] },
  { name: 'Green Onions',       dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['scallions', 'spring onions'] },
  { name: 'Garlic',             dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['garlic bulb', 'garlic cloves'] },
  { name: 'Ginger',             dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['fresh ginger'] },
  { name: 'Potatoes',           dept: 'produce',   defaultUnit: 'weight', defaultQty: 2,   showInGrid: true,  aliases: ['potato', 'russet', 'yukon'] },
  { name: 'Sweet Potatoes',     dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: ['yam', 'yams'] },
  { name: 'Cauliflower',        dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Green Beans',        dept: 'produce',   defaultUnit: 'weight', defaultQty: 0.5, showInGrid: false, aliases: ['string beans'] },
  { name: 'Fresh Herbs',        dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['cilantro', 'parsley', 'basil', 'thyme', 'rosemary'] },
  { name: 'Cilantro',           dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['fresh cilantro'] },
  { name: 'Basil',              dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['fresh basil'] },
  { name: 'Parsley',            dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['fresh parsley'] },

  // ── MEAT ─────────────────────────────────────────────────────────────────
  { name: 'Chicken Breasts',          dept: 'meat', defaultUnit: 'weight', defaultQty: 2,   showInGrid: true,  aliases: ['chicken breast', 'boneless skinless chicken'] },
  { name: 'Chicken Thighs',           dept: 'meat', defaultUnit: 'weight', defaultQty: 2,   showInGrid: false, aliases: ['chicken thigh', 'bone-in chicken'] },
  { name: 'Chicken Legs',             dept: 'meat', defaultUnit: 'weight', defaultQty: 2,   showInGrid: false, aliases: ['drumsticks', 'skin-on chicken legs'] },
  { name: 'Chicken Wings',            dept: 'meat', defaultUnit: 'weight', defaultQty: 2,   showInGrid: false, aliases: ['wings'] },
  { name: 'Whole Chicken',            dept: 'meat', defaultUnit: 'weight', defaultQty: 4,   showInGrid: false, aliases: ['rotisserie', 'whole bird'] },
  { name: 'Ground Beef',              dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: true,  aliases: ['hamburger meat', 'beef mince'] },
  { name: 'Ground Turkey',            dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['turkey mince'] },
  { name: 'Ground Chicken',           dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Beef Steak',               dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['steak', 'ribeye', 'sirloin', 'NY strip', 'filet'] },
  { name: 'Pork Chops',               dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['pork chop'] },
  { name: 'Pork Tenderloin',          dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['pork loin'] },
  { name: 'Bacon',                    dept: 'meat', defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['pork bacon', 'strips'] },
  { name: 'Italian Sausage',          dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['sausage links', 'bratwurst'] },
  { name: 'Hot Dogs',                 dept: 'meat', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['frankfurters', 'wieners'] },
  { name: 'Lamb Chops',               dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['lamb'] },
  { name: 'Beef Roast',               dept: 'meat', defaultUnit: 'weight', defaultQty: 3,   showInGrid: false, aliases: ['chuck roast', 'pot roast'] },
  { name: 'Ribs',                     dept: 'meat', defaultUnit: 'weight', defaultQty: 3,   showInGrid: false, aliases: ['baby back ribs', 'spare ribs', 'pork ribs'] },
  { name: 'Turkey Breast',            dept: 'meat', defaultUnit: 'weight', defaultQty: 3,   showInGrid: false, aliases: ['turkey'] },

  // ── SEAFOOD ───────────────────────────────────────────────────────────────
  { name: 'Salmon',             dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: true,  aliases: ['salmon fillet', 'atlantic salmon'] },
  { name: 'Tilapia',            dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['tilapia fillet'] },
  { name: 'Cod',                dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['cod fillet'] },
  { name: 'Shrimp',             dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: true,  aliases: ['prawns'] },
  { name: 'Tuna Steak',         dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['ahi tuna'] },
  { name: 'Scallops',           dept: 'seafood', defaultUnit: 'weight', defaultQty: 0.5, showInGrid: false, aliases: ['sea scallops'] },
  { name: 'Crab',               dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['crab legs', 'dungeness'] },
  { name: 'Lobster',            dept: 'seafood', defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: [] },
  { name: 'Mussels',            dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Clams',              dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: [] },

  // ── DAIRY ─────────────────────────────────────────────────────────────────
  { name: 'Milk',               dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['whole milk', '2% milk', 'skim milk', 'gallon'] },
  { name: 'Oat Milk',           dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['oatly'] },
  { name: 'Almond Milk',        dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Eggs',               dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['egg', 'dozen eggs'] },
  { name: 'Butter',             dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['salted butter', 'unsalted butter'] },
  { name: 'Cream Cheese',       dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Sour Cream',         dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Heavy Cream',        dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['heavy whipping cream', 'whipping cream'] },
  { name: 'Half & Half',        dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['half and half'] },
  { name: 'Greek Yogurt',       dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['yogurt', 'chobani', 'fage'] },
  { name: 'Yogurt',             dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Cheddar Cheese',     dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['cheese', 'sharp cheddar'] },
  { name: 'Mozzarella',         dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['fresh mozzarella', 'shredded mozzarella'] },
  { name: 'Parmesan',           dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['parm', 'grated parmesan'] },
  { name: 'Shredded Cheese',    dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['mexican blend', 'taco cheese'] },
  { name: 'Cottage Cheese',     dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Ricotta',            dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['ricotta cheese'] },
  { name: 'Orange Juice',       dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['OJ', 'juice'] },

  // ── DELI ──────────────────────────────────────────────────────────────────
  { name: 'Deli Turkey',        dept: 'deli', defaultUnit: 'weight', defaultQty: 0.5, showInGrid: true,  aliases: ['turkey slices', 'lunch meat turkey'] },
  { name: 'Deli Ham',           dept: 'deli', defaultUnit: 'weight', defaultQty: 0.5, showInGrid: false, aliases: ['ham slices', 'lunch meat ham'] },
  { name: 'Salami',             dept: 'deli', defaultUnit: 'weight', defaultQty: 0.25,showInGrid: false, aliases: ['hard salami', 'genoa salami'] },
  { name: 'Pepperoni',          dept: 'deli', defaultUnit: 'weight', defaultQty: 0.25,showInGrid: false, aliases: [] },
  { name: 'Provolone',          dept: 'deli', defaultUnit: 'weight', defaultQty: 0.25,showInGrid: false, aliases: ['provolone cheese'] },
  { name: 'Swiss Cheese',       dept: 'deli', defaultUnit: 'weight', defaultQty: 0.25,showInGrid: false, aliases: ['swiss'] },
  { name: 'Hummus',             dept: 'deli', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },

  // ── BAKERY ────────────────────────────────────────────────────────────────
  { name: 'Bread',              dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['sandwich bread', 'white bread', 'wheat bread', 'loaf'] },
  { name: 'Sourdough',          dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['sourdough bread', 'sourdough loaf'] },
  { name: 'Bagels',             dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['bagel'] },
  { name: 'English Muffins',    dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['english muffin'] },
  { name: 'Tortillas',          dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['flour tortillas', 'wraps'] },
  { name: 'Corn Tortillas',     dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['taco shells'] },
  { name: 'Hamburger Buns',     dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['buns', 'hot dog buns'] },
  { name: 'Pita Bread',         dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['pita'] },
  { name: 'Croissants',         dept: 'bakery', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['croissant'] },
  { name: 'Muffins',            dept: 'bakery', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['muffin'] },
  { name: 'Donuts',             dept: 'bakery', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['doughnut', 'donut'] },
  { name: 'Cake',               dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },

  // ── FROZEN ────────────────────────────────────────────────────────────────
  { name: 'Frozen Pizza',       dept: 'frozen', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['pizza'] },
  { name: 'Frozen Vegetables',  dept: 'frozen', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['frozen peas', 'frozen corn', 'frozen broccoli'] },
  { name: 'Frozen Fries',       dept: 'frozen', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['french fries', 'tater tots'] },
  { name: 'Ice Cream',          dept: 'frozen', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['ice cream pint', 'ice cream tub'] },
  { name: 'Frozen Meals',       dept: 'frozen', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['lean cuisine', 'tv dinner', 'microwave meal'] },
  { name: 'Frozen Waffles',     dept: 'frozen', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['eggo', 'toaster waffles'] },
  { name: 'Frozen Burritos',    dept: 'frozen', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['burrito'] },
  { name: 'Edamame',            dept: 'frozen', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },

  // ── DRY GOODS ─────────────────────────────────────────────────────────────
  { name: 'Pasta',              dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['spaghetti', 'penne', 'linguine', 'fettuccine', 'noodles'] },
  { name: 'Rice',               dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['white rice', 'brown rice', 'jasmine rice', 'basmati'] },
  { name: 'Quinoa',             dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Oats',               dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['oatmeal', 'rolled oats', 'instant oats'] },
  { name: 'Cereal',             dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['breakfast cereal'] },
  { name: 'Granola',            dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Flour',              dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['all purpose flour', 'bread flour'] },
  { name: 'Sugar',              dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['white sugar', 'granulated sugar'] },
  { name: 'Brown Sugar',        dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Olive Oil',          dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['EVOO', 'extra virgin olive oil'] },
  { name: 'Vegetable Oil',      dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['canola oil', 'cooking oil'] },
  { name: 'Coconut Oil',        dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Vinegar',            dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['white vinegar', 'apple cider vinegar', 'balsamic'] },
  { name: 'Soy Sauce',          dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['tamari'] },
  { name: 'Hot Sauce',          dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['tabasco', 'sriracha', 'franks'] },
  { name: 'Ketchup',            dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Mustard',            dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['yellow mustard', 'dijon'] },
  { name: 'Mayonnaise',         dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['mayo', 'hellmans'] },
  { name: 'Ranch Dressing',     dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['ranch', 'dressing'] },
  { name: 'Salad Dressing',     dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['italian dressing', 'caesar dressing', 'vinaigrette'] },
  { name: 'Peanut Butter',      dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['PB', 'almond butter', 'nut butter'] },
  { name: 'Jelly',              dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['jam', 'preserves', 'grape jelly', 'strawberry jam'] },
  { name: 'Honey',              dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Maple Syrup',        dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['syrup', 'pancake syrup'] },
  { name: 'Bread Crumbs',       dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['panko', 'italian bread crumbs'] },
  { name: 'Chicken Broth',      dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['chicken stock', 'broth'] },
  { name: 'Beef Broth',         dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['beef stock'] },
  { name: 'Coconut Milk',       dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Spices',             dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['salt', 'pepper', 'cumin', 'paprika', 'garlic powder', 'onion powder', 'chili powder', 'oregano', 'basil', 'cinnamon'] },
  { name: 'Baking Soda',        dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['bicarb'] },
  { name: 'Baking Powder',      dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Vanilla Extract',    dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['vanilla'] },
  { name: 'Protein Powder',     dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['whey protein', 'protein shake'] },

  // ── CANNED ────────────────────────────────────────────────────────────────
  { name: 'Canned Tomatoes',    dept: 'canned', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['diced tomatoes', 'crushed tomatoes', 'tomato sauce', 'tomato paste'] },
  { name: 'Canned Beans',       dept: 'canned', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['black beans', 'kidney beans', 'chickpeas', 'garbanzo', 'pinto beans'] },
  { name: 'Canned Tuna',        dept: 'canned', defaultUnit: 'count', defaultQty: 2, showInGrid: true,  aliases: ['tuna fish', 'starkist'] },
  { name: 'Canned Chicken',     dept: 'canned', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: [] },
  { name: 'Canned Soup',        dept: 'canned', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['campbell soup', 'tomato soup', 'chicken noodle soup'] },
  { name: 'Canned Corn',        dept: 'canned', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Canned Peas',        dept: 'canned', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Coconut Water',      dept: 'canned', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },

  // ── SNACKS ────────────────────────────────────────────────────────────────
  { name: 'Chips',              dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['potato chips', 'tortilla chips', 'doritos', 'lays'] },
  { name: 'Crackers',           dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['wheat thins', 'ritz', 'triscuits'] },
  { name: 'Popcorn',            dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['microwave popcorn'] },
  { name: 'Pretzels',           dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['pretzel'] },
  { name: 'Nuts',               dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['almonds', 'cashews', 'peanuts', 'walnuts', 'mixed nuts'] },
  { name: 'Trail Mix',          dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Granola Bars',       dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['protein bars', 'kind bars', 'larabar', 'clif bar'] },
  { name: 'Cookies',            dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['oreos', 'chocolate chip cookies'] },
  { name: 'Candy',              dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['chocolate', 'gummies', 'skittles', 'm&ms'] },
  { name: 'Fruit Snacks',       dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['gushers', 'fruit roll ups'] },
  { name: 'Rice Cakes',         dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Applesauce',         dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['apple sauce pouches'] },

  // ── BEVERAGES ─────────────────────────────────────────────────────────────
  { name: 'Water',              dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['bottled water', 'sparkling water', 'water bottles'] },
  { name: 'Coffee',             dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['ground coffee', 'coffee beans', 'k-cups', 'instant coffee'] },
  { name: 'Tea',                dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['tea bags', 'green tea', 'herbal tea'] },
  { name: 'Soda',               dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['pop', 'coke', 'pepsi', 'sprite', 'diet coke', 'dr pepper'] },
  { name: 'Sparkling Water',    dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['la croix', 'bubly', 'topo chico', 'seltzer'] },
  { name: 'Sports Drinks',      dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['gatorade', 'powerade', 'body armor'] },
  { name: 'Energy Drinks',      dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['red bull', 'monster', 'celsius'] },
  { name: 'Juice',              dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['apple juice', 'grape juice', 'cranberry juice'] },
  { name: 'Lemonade',           dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },

  // ── ALCOHOL ───────────────────────────────────────────────────────────────
  { name: 'Beer',               dept: 'alcohol', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['six pack', 'case of beer', 'lager', 'ipa'] },
  { name: 'Wine',               dept: 'alcohol', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['red wine', 'white wine', 'rosé', 'bottle of wine'] },
  { name: 'Spirits',            dept: 'alcohol', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['vodka', 'whiskey', 'bourbon', 'tequila', 'rum', 'gin'] },
  { name: 'Hard Seltzer',       dept: 'alcohol', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['white claw', 'truly', 'high noon'] },

  // ── HEALTH ────────────────────────────────────────────────────────────────
  { name: 'Vitamins',           dept: 'health', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['multivitamin', 'vitamin c', 'vitamin d'] },
  { name: 'Pain Reliever',      dept: 'health', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['advil', 'tylenol', 'ibuprofen', 'aspirin'] },
  { name: 'Allergy Medicine',   dept: 'health', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['claritin', 'zyrtec', 'benadryl'] },
  { name: 'Cold Medicine',      dept: 'health', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['nyquil', 'dayquil', 'theraflu'] },
  { name: 'Bandages',           dept: 'health', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['band-aids', 'first aid'] },

  // ── HOUSEHOLD ─────────────────────────────────────────────────────────────
  { name: 'Paper Towels',       dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['bounty', 'paper towel rolls'] },
  { name: 'Toilet Paper',       dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['TP', 'bathroom tissue', 'charmin'] },
  { name: 'Dish Soap',          dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['dawn', 'palmolive'] },
  { name: 'Laundry Detergent',  dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['tide', 'laundry soap', 'pods'] },
  { name: 'Dishwasher Pods',    dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['cascade', 'finish', 'dishwasher detergent'] },
  { name: 'Trash Bags',         dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['garbage bags'] },
  { name: 'Ziploc Bags',        dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['sandwich bags', 'freezer bags', 'storage bags'] },
  { name: 'Aluminum Foil',      dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['tin foil'] },
  { name: 'Plastic Wrap',       dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['saran wrap', 'cling wrap'] },
  { name: 'Parchment Paper',    dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['baking paper'] },
  { name: 'Cleaning Spray',     dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['lysol', 'windex', '409', 'all purpose cleaner'] },
  { name: 'Bleach',             dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['clorox'] },
  { name: 'Sponges',            dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['scrub sponge'] },
  { name: 'Light Bulbs',        dept: 'household', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['bulbs', 'LED bulbs'] },
  { name: 'Batteries',          dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['AA batteries', 'AAA batteries'] },

  // ── PERSONAL CARE ─────────────────────────────────────────────────────────
  { name: 'Shampoo',            dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Conditioner',        dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Body Wash',          dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['soap', 'shower gel'] },
  { name: 'Deodorant',          dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['antiperspirant'] },
  { name: 'Toothpaste',         dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Toothbrush',         dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Floss',              dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['dental floss'] },
  { name: 'Razors',             dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['shaving razor', 'gillette'] },
  { name: 'Shaving Cream',      dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['shave gel'] },
  { name: 'Lotion',             dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['moisturizer', 'body lotion'] },
  { name: 'Sunscreen',          dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['SPF', 'sunblock'] },
  { name: 'Feminine Products',  dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['tampons', 'pads', 'liners'] },
  { name: 'Tissues',            dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['kleenex', 'facial tissue'] },
  { name: 'Cotton Balls',       dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['cotton swabs', 'q-tips'] },

  // ── BABY ──────────────────────────────────────────────────────────────────
  { name: 'Diapers',            dept: 'baby', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['pampers', 'huggies', 'pull-ups'] },
  { name: 'Baby Wipes',         dept: 'baby', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['wipes'] },
  { name: 'Baby Formula',       dept: 'baby', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['formula', 'enfamil', 'similac'] },
  { name: 'Baby Food',          dept: 'baby', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['gerber', 'puree', 'baby puree'] },

  // ── PET ───────────────────────────────────────────────────────────────────
  { name: 'Dog Food',           dept: 'pet', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['kibble', 'dry dog food', 'wet dog food'] },
  { name: 'Cat Food',           dept: 'pet', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['cat kibble', 'wet cat food'] },
  { name: 'Pet Treats',         dept: 'pet', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['dog treats', 'cat treats'] },
  { name: 'Cat Litter',         dept: 'pet', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['litter', 'clumping litter'] },

];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Returns items flagged showInGrid — for the quick-add grid
function getGridItems() {
  return GROCERY_ITEMS.filter(i => i.showInGrid);
}

// Search: returns items whose name or aliases match the query string
// Returns up to maxResults items, sorted by relevance (name match first)
function searchGroceryItems(query, maxResults = 20) {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();
  const nameMatches = [];
  const aliasMatches = [];
  for (const item of GROCERY_ITEMS) {
    if (item.name.toLowerCase().includes(q)) {
      nameMatches.push(item);
    } else if (item.aliases.some(a => a.includes(q))) {
      aliasMatches.push(item);
    }
  }
  return [...nameMatches, ...aliasMatches].slice(0, maxResults);
}

// Get department label + emoji by key
function getDept(key) {
  return GROCERY_DEPARTMENTS.find(d => d.key === key) || { key: 'misc', label: 'Misc', emoji: '🛒' };
}

// Group a list of grocery list items by department, in department sort order
// Input: array of { name, dept, qty, unit, checked, ... }
// Output: array of { dept, label, emoji, items[] }
function groupByDept(listItems) {
  const groups = {};
  for (const item of listItems) {
    const deptKey = item.dept || 'misc';
    if (!groups[deptKey]) groups[deptKey] = [];
    groups[deptKey].push(item);
  }
  // Return in department sort order
  return GROCERY_DEPARTMENTS
    .filter(d => groups[d.key])
    .map(d => ({ ...d, items: groups[d.key] }));
}

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
//   emoji       — per-item emoji for grid and list display
//   dept        — key from GROCERY_DEPARTMENTS
//   defaultUnit — 'count' | 'weight' | 'volume'
//   defaultQty  — sensible starting quantity
//   showInGrid  — true = appears in quick-add grid
//   aliases     — alternate search terms (lowercase)

const GROCERY_ITEMS = [

  // ── PRODUCE ──────────────────────────────────────────────────────────────
  { name: 'Bananas',            emoji: '🍌', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['banana'] },
  { name: 'Apples',             emoji: '🍎', dept: 'produce',   defaultUnit: 'count',  defaultQty: 4,   showInGrid: true,  aliases: ['apple'] },
  { name: 'Avocados',           emoji: '🥑', dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: true,  aliases: ['avocado', 'avo'] },
  { name: 'Lemons',             emoji: '🍋', dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: ['lemon'] },
  { name: 'Limes',              emoji: '🍋', dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: ['lime'] },
  { name: 'Oranges',            emoji: '🍊', dept: 'produce',   defaultUnit: 'count',  defaultQty: 4,   showInGrid: false, aliases: ['orange'] },
  { name: 'Strawberries',       emoji: '🍓', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['strawberry', 'berries'] },
  { name: 'Blueberries',        emoji: '🫐', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['blueberry', 'berries'] },
  { name: 'Grapes',             emoji: '🍇', dept: 'produce',   defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['grape'] },
  { name: 'Watermelon',         emoji: '🍉', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Broccoli',           emoji: '🥦', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: [] },
  { name: 'Spinach',            emoji: '🥬', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['baby spinach'] },
  { name: 'Romaine Lettuce',    emoji: '🥬', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['lettuce', 'romaine'] },
  { name: 'Iceberg Lettuce',    emoji: '🥬', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['lettuce', 'iceberg'] },
  { name: 'Kale',               emoji: '🥬', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Carrots',            emoji: '🥕', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['carrot', 'baby carrots'] },
  { name: 'Celery',             emoji: '🥬', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Cucumber',           emoji: '🥒', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['cucumbers'] },
  { name: 'Zucchini',           emoji: '🥒', dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: ['courgette'] },
  { name: 'Bell Peppers',       emoji: '🫑', dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: ['pepper', 'peppers'] },
  { name: 'Jalapeños',          emoji: '🌶️', dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: ['jalapeno', 'hot pepper'] },
  { name: 'Tomatoes',           emoji: '🍅', dept: 'produce',   defaultUnit: 'count',  defaultQty: 3,   showInGrid: true,  aliases: ['tomato'] },
  { name: 'Cherry Tomatoes',    emoji: '🍅', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['grape tomatoes'] },
  { name: 'Corn',               emoji: '🌽', dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: ['corn on the cob'] },
  { name: 'Asparagus',          emoji: '🌿', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Brussels Sprouts',   emoji: '🥦', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Mushrooms',          emoji: '🍄', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['mushroom'] },
  { name: 'Onion',              emoji: '🧅', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['onions', 'yellow onion'] },
  { name: 'Red Onion',          emoji: '🧅', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['onion'] },
  { name: 'Green Onions',       emoji: '🌿', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['scallions', 'spring onions'] },
  { name: 'Garlic',             emoji: '🧄', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['garlic bulb', 'garlic cloves'] },
  { name: 'Ginger',             emoji: '🫚', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['fresh ginger'] },
  { name: 'Potatoes',           emoji: '🥔', dept: 'produce',   defaultUnit: 'weight', defaultQty: 2,   showInGrid: true,  aliases: ['potato', 'russet', 'yukon'] },
  { name: 'Sweet Potatoes',     emoji: '🍠', dept: 'produce',   defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: ['yam', 'yams'] },
  { name: 'Cauliflower',        emoji: '🥦', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Green Beans',        emoji: '🌿', dept: 'produce',   defaultUnit: 'weight', defaultQty: 0.5, showInGrid: false, aliases: ['string beans'] },
  { name: 'Cilantro',           emoji: '🌿', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['fresh cilantro'] },
  { name: 'Basil',              emoji: '🌿', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['fresh basil'] },
  { name: 'Parsley',            emoji: '🌿', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['fresh parsley'] },
  { name: 'Fresh Herbs',        emoji: '🌿', dept: 'produce',   defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['cilantro', 'parsley', 'basil', 'thyme', 'rosemary'] },

  // ── MEAT ─────────────────────────────────────────────────────────────────
  { name: 'Chicken Breasts',    emoji: '🍗', dept: 'meat', defaultUnit: 'weight', defaultQty: 2,   showInGrid: true,  aliases: ['chicken breast', 'boneless skinless chicken'] },
  { name: 'Chicken Thighs',     emoji: '🍗', dept: 'meat', defaultUnit: 'weight', defaultQty: 2,   showInGrid: false, aliases: ['chicken thigh', 'bone-in chicken'] },
  { name: 'Chicken Legs',       emoji: '🍗', dept: 'meat', defaultUnit: 'weight', defaultQty: 2,   showInGrid: false, aliases: ['drumsticks', 'skin-on chicken legs'] },
  { name: 'Chicken Wings',      emoji: '🍗', dept: 'meat', defaultUnit: 'weight', defaultQty: 2,   showInGrid: false, aliases: ['wings'] },
  { name: 'Whole Chicken',      emoji: '🍗', dept: 'meat', defaultUnit: 'weight', defaultQty: 4,   showInGrid: false, aliases: ['rotisserie', 'whole bird'] },
  { name: 'Ground Beef',        emoji: '🥩', dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: true,  aliases: ['hamburger meat', 'beef mince'] },
  { name: 'Ground Turkey',      emoji: '🦃', dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['turkey mince'] },
  { name: 'Ground Chicken',     emoji: '🍗', dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Beef Steak',         emoji: '🥩', dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['steak', 'ribeye', 'sirloin', 'NY strip', 'filet'] },
  { name: 'Pork Chops',         emoji: '🥩', dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['pork chop'] },
  { name: 'Pork Tenderloin',    emoji: '🥩', dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['pork loin'] },
  { name: 'Bacon',              emoji: '🥓', dept: 'meat', defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['pork bacon', 'strips'] },
  { name: 'Italian Sausage',    emoji: '🌭', dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['sausage links', 'bratwurst'] },
  { name: 'Hot Dogs',           emoji: '🌭', dept: 'meat', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['frankfurters', 'wieners'] },
  { name: 'Lamb Chops',         emoji: '🥩', dept: 'meat', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['lamb'] },
  { name: 'Beef Roast',         emoji: '🥩', dept: 'meat', defaultUnit: 'weight', defaultQty: 3,   showInGrid: false, aliases: ['chuck roast', 'pot roast'] },
  { name: 'Ribs',               emoji: '🥩', dept: 'meat', defaultUnit: 'weight', defaultQty: 3,   showInGrid: false, aliases: ['baby back ribs', 'spare ribs', 'pork ribs'] },
  { name: 'Turkey Breast',      emoji: '🦃', dept: 'meat', defaultUnit: 'weight', defaultQty: 3,   showInGrid: false, aliases: ['turkey'] },

  // ── SEAFOOD ───────────────────────────────────────────────────────────────
  { name: 'Salmon',             emoji: '🐟', dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: true,  aliases: ['salmon fillet', 'atlantic salmon'] },
  { name: 'Tilapia',            emoji: '🐟', dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['tilapia fillet'] },
  { name: 'Cod',                emoji: '🐟', dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['cod fillet'] },
  { name: 'Shrimp',             emoji: '🦐', dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: true,  aliases: ['prawns'] },
  { name: 'Tuna Steak',         emoji: '🐟', dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['ahi tuna'] },
  { name: 'Scallops',           emoji: '🐚', dept: 'seafood', defaultUnit: 'weight', defaultQty: 0.5, showInGrid: false, aliases: ['sea scallops'] },
  { name: 'Crab',               emoji: '🦀', dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: ['crab legs', 'dungeness'] },
  { name: 'Lobster',            emoji: '🦞', dept: 'seafood', defaultUnit: 'count',  defaultQty: 2,   showInGrid: false, aliases: [] },
  { name: 'Mussels',            emoji: '🦪', dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Clams',              emoji: '🦪', dept: 'seafood', defaultUnit: 'weight', defaultQty: 1,   showInGrid: false, aliases: [] },

  // ── DAIRY ─────────────────────────────────────────────────────────────────
  { name: 'Milk',               emoji: '🥛', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['whole milk', '2% milk', 'skim milk', 'gallon'] },
  { name: 'Oat Milk',           emoji: '🥛', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['oatly'] },
  { name: 'Almond Milk',        emoji: '🥛', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Eggs',               emoji: '🥚', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['egg', 'dozen eggs'] },
  { name: 'Butter',             emoji: '🧈', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['salted butter', 'unsalted butter'] },
  { name: 'Cream Cheese',       emoji: '🧀', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Sour Cream',         emoji: '🫙', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Heavy Cream',        emoji: '🥛', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['heavy whipping cream', 'whipping cream'] },
  { name: 'Half & Half',        emoji: '🥛', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['half and half'] },
  { name: 'Greek Yogurt',       emoji: '🫙', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['yogurt', 'chobani', 'fage'] },
  { name: 'Yogurt',             emoji: '🫙', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Cheddar Cheese',     emoji: '🧀', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['cheese', 'sharp cheddar'] },
  { name: 'Mozzarella',         emoji: '🧀', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['fresh mozzarella', 'shredded mozzarella'] },
  { name: 'Parmesan',           emoji: '🧀', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['parm', 'grated parmesan'] },
  { name: 'Shredded Cheese',    emoji: '🧀', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['mexican blend', 'taco cheese'] },
  { name: 'Cottage Cheese',     emoji: '🫙', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: [] },
  { name: 'Ricotta',            emoji: '🫙', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: false, aliases: ['ricotta cheese'] },
  { name: 'Orange Juice',       emoji: '🍊', dept: 'dairy', defaultUnit: 'count',  defaultQty: 1,   showInGrid: true,  aliases: ['OJ', 'juice'] },

  // ── DELI ──────────────────────────────────────────────────────────────────
  { name: 'Deli Turkey',        emoji: '🦃', dept: 'deli', defaultUnit: 'weight', defaultQty: 0.5,  showInGrid: true,  aliases: ['turkey slices', 'lunch meat turkey'] },
  { name: 'Deli Ham',           emoji: '🥩', dept: 'deli', defaultUnit: 'weight', defaultQty: 0.5,  showInGrid: false, aliases: ['ham slices', 'lunch meat ham'] },
  { name: 'Salami',             emoji: '🍖', dept: 'deli', defaultUnit: 'weight', defaultQty: 0.25, showInGrid: false, aliases: ['hard salami', 'genoa salami'] },
  { name: 'Pepperoni',          emoji: '🍖', dept: 'deli', defaultUnit: 'weight', defaultQty: 0.25, showInGrid: false, aliases: [] },
  { name: 'Provolone',          emoji: '🧀', dept: 'deli', defaultUnit: 'weight', defaultQty: 0.25, showInGrid: false, aliases: ['provolone cheese'] },
  { name: 'Swiss Cheese',       emoji: '🧀', dept: 'deli', defaultUnit: 'weight', defaultQty: 0.25, showInGrid: false, aliases: ['swiss'] },
  { name: 'Hummus',             emoji: '🫙', dept: 'deli', defaultUnit: 'count',  defaultQty: 1,    showInGrid: false, aliases: [] },

  // ── BAKERY ────────────────────────────────────────────────────────────────
  { name: 'Bread',              emoji: '🍞', dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['sandwich bread', 'white bread', 'wheat bread', 'loaf'] },
  { name: 'Sourdough',          emoji: '🍞', dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['sourdough bread', 'sourdough loaf'] },
  { name: 'Bagels',             emoji: '🥯', dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['bagel'] },
  { name: 'English Muffins',    emoji: '🥐', dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['english muffin'] },
  { name: 'Tortillas',          emoji: '🫓', dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['flour tortillas', 'wraps'] },
  { name: 'Corn Tortillas',     emoji: '🫓', dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['taco shells'] },
  { name: 'Hamburger Buns',     emoji: '🍔', dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['buns', 'hot dog buns'] },
  { name: 'Pita Bread',         emoji: '🫓', dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['pita'] },
  { name: 'Croissants',         emoji: '🥐', dept: 'bakery', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['croissant'] },
  { name: 'Muffins',            emoji: '🧁', dept: 'bakery', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['muffin'] },
  { name: 'Donuts',             emoji: '🍩', dept: 'bakery', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['doughnut', 'donut'] },
  { name: 'Cake',               emoji: '🎂', dept: 'bakery', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },

  // ── FROZEN ────────────────────────────────────────────────────────────────
  { name: 'Frozen Pizza',       emoji: '🍕', dept: 'frozen', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['pizza'] },
  { name: 'Frozen Vegetables',  emoji: '🥦', dept: 'frozen', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['frozen peas', 'frozen corn', 'frozen broccoli'] },
  { name: 'Frozen Fries',       emoji: '🍟', dept: 'frozen', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['french fries', 'tater tots'] },
  { name: 'Ice Cream',          emoji: '🍦', dept: 'frozen', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['ice cream pint', 'ice cream tub'] },
  { name: 'Frozen Meals',       emoji: '🍱', dept: 'frozen', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['lean cuisine', 'tv dinner', 'microwave meal'] },
  { name: 'Frozen Waffles',     emoji: '🧇', dept: 'frozen', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['eggo', 'toaster waffles'] },
  { name: 'Frozen Burritos',    emoji: '🌯', dept: 'frozen', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['burrito'] },
  { name: 'Edamame',            emoji: '🫘', dept: 'frozen', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },

  // ── DRY GOODS ─────────────────────────────────────────────────────────────
  { name: 'Pasta',              emoji: '🍝', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['spaghetti', 'penne', 'linguine', 'fettuccine', 'noodles'] },
  { name: 'Rice',               emoji: '🍚', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['white rice', 'brown rice', 'jasmine rice', 'basmati'] },
  { name: 'Quinoa',             emoji: '🌾', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Oats',               emoji: '🌾', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['oatmeal', 'rolled oats', 'instant oats'] },
  { name: 'Cereal',             emoji: '🥣', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['breakfast cereal'] },
  { name: 'Granola',            emoji: '🥣', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Flour',              emoji: '🌾', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['all purpose flour', 'bread flour'] },
  { name: 'Sugar',              emoji: '🍬', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['white sugar', 'granulated sugar'] },
  { name: 'Brown Sugar',        emoji: '🍬', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Olive Oil',          emoji: '🫙', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['EVOO', 'extra virgin olive oil'] },
  { name: 'Vegetable Oil',      emoji: '🫙', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['canola oil', 'cooking oil'] },
  { name: 'Coconut Oil',        emoji: '🥥', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Vinegar',            emoji: '🫙', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['white vinegar', 'apple cider vinegar', 'balsamic'] },
  { name: 'Soy Sauce',          emoji: '🫙', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['tamari'] },
  { name: 'Hot Sauce',          emoji: '🌶️', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['tabasco', 'sriracha', 'franks'] },
  { name: 'Ketchup',            emoji: '🍅', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Mustard',            emoji: '🌭', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['yellow mustard', 'dijon'] },
  { name: 'Mayonnaise',         emoji: '🫙', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['mayo', 'hellmans'] },
  { name: 'Ranch Dressing',     emoji: '🫙', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['ranch', 'dressing'] },
  { name: 'Salad Dressing',     emoji: '🫙', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['italian dressing', 'caesar dressing', 'vinaigrette'] },
  { name: 'Peanut Butter',      emoji: '🥜', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['PB', 'almond butter', 'nut butter'] },
  { name: 'Jelly',              emoji: '🍓', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['jam', 'preserves', 'grape jelly', 'strawberry jam'] },
  { name: 'Honey',              emoji: '🍯', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Maple Syrup',        emoji: '🍁', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['syrup', 'pancake syrup'] },
  { name: 'Bread Crumbs',       emoji: '🍞', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['panko', 'italian bread crumbs'] },
  { name: 'Chicken Broth',      emoji: '🍲', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['chicken stock', 'broth'] },
  { name: 'Beef Broth',         emoji: '🍲', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['beef stock'] },
  { name: 'Coconut Milk',       emoji: '🥥', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Spices',             emoji: '🧂', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['salt', 'pepper', 'cumin', 'paprika', 'garlic powder', 'onion powder', 'chili powder', 'oregano', 'basil', 'cinnamon'] },
  { name: 'Baking Soda',        emoji: '🥄', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['bicarb'] },
  { name: 'Baking Powder',      emoji: '🥄', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Vanilla Extract',    emoji: '🫙', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['vanilla'] },
  { name: 'Protein Powder',     emoji: '💪', dept: 'dry', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['whey protein', 'protein shake'] },

  // ── CANNED ────────────────────────────────────────────────────────────────
  { name: 'Canned Tomatoes',    emoji: '🥫', dept: 'canned', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['diced tomatoes', 'crushed tomatoes', 'tomato sauce', 'tomato paste'] },
  { name: 'Canned Beans',       emoji: '🫘', dept: 'canned', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['black beans', 'kidney beans', 'chickpeas', 'garbanzo', 'pinto beans'] },
  { name: 'Canned Tuna',        emoji: '🐟', dept: 'canned', defaultUnit: 'count', defaultQty: 2, showInGrid: true,  aliases: ['tuna fish', 'starkist'] },
  { name: 'Canned Chicken',     emoji: '🍗', dept: 'canned', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: [] },
  { name: 'Canned Soup',        emoji: '🍲', dept: 'canned', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['campbell soup', 'tomato soup', 'chicken noodle soup'] },
  { name: 'Canned Corn',        emoji: '🌽', dept: 'canned', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Canned Peas',        emoji: '🫘', dept: 'canned', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Coconut Water',      emoji: '🥥', dept: 'canned', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },

  // ── SNACKS ────────────────────────────────────────────────────────────────
  { name: 'Chips',              emoji: '🥨', dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['potato chips', 'tortilla chips', 'doritos', 'lays'] },
  { name: 'Crackers',           emoji: '🍘', dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['wheat thins', 'ritz', 'triscuits'] },
  { name: 'Popcorn',            emoji: '🍿', dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['microwave popcorn'] },
  { name: 'Pretzels',           emoji: '🥨', dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['pretzel'] },
  { name: 'Nuts',               emoji: '🥜', dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['almonds', 'cashews', 'peanuts', 'walnuts', 'mixed nuts'] },
  { name: 'Trail Mix',          emoji: '🥜', dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Granola Bars',       emoji: '🍫', dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['protein bars', 'kind bars', 'larabar', 'clif bar'] },
  { name: 'Cookies',            emoji: '🍪', dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['oreos', 'chocolate chip cookies'] },
  { name: 'Candy',              emoji: '🍬', dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['chocolate', 'gummies', 'skittles', 'm&ms'] },
  { name: 'Fruit Snacks',       emoji: '🍬', dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['gushers', 'fruit roll ups'] },
  { name: 'Rice Cakes',         emoji: '🍘', dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Applesauce',         emoji: '🍎', dept: 'snacks', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['apple sauce pouches'] },

  // ── BEVERAGES ─────────────────────────────────────────────────────────────
  { name: 'Water',              emoji: '💧', dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['bottled water', 'sparkling water', 'water bottles'] },
  { name: 'Coffee',             emoji: '☕', dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['ground coffee', 'coffee beans', 'k-cups', 'instant coffee'] },
  { name: 'Tea',                emoji: '🍵', dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['tea bags', 'green tea', 'herbal tea'] },
  { name: 'Soda',               emoji: '🥤', dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['pop', 'coke', 'pepsi', 'sprite', 'diet coke', 'dr pepper'] },
  { name: 'Sparkling Water',    emoji: '💧', dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['la croix', 'bubly', 'topo chico', 'seltzer'] },
  { name: 'Sports Drinks',      emoji: '🥤', dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['gatorade', 'powerade', 'body armor'] },
  { name: 'Energy Drinks',      emoji: '🥤', dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['red bull', 'monster', 'celsius'] },
  { name: 'Juice',              emoji: '🧃', dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['apple juice', 'grape juice', 'cranberry juice'] },
  { name: 'Lemonade',           emoji: '🍋', dept: 'beverages', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },

  // ── ALCOHOL ───────────────────────────────────────────────────────────────
  { name: 'Beer',               emoji: '🍺', dept: 'alcohol', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['six pack', 'case of beer', 'lager', 'ipa'] },
  { name: 'Wine',               emoji: '🍷', dept: 'alcohol', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['red wine', 'white wine', 'rosé', 'bottle of wine'] },
  { name: 'Spirits',            emoji: '🥃', dept: 'alcohol', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['vodka', 'whiskey', 'bourbon', 'tequila', 'rum', 'gin'] },
  { name: 'Hard Seltzer',       emoji: '🍋', dept: 'alcohol', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['white claw', 'truly', 'high noon'] },

  // ── HEALTH ────────────────────────────────────────────────────────────────
  { name: 'Vitamins',           emoji: '💊', dept: 'health', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['multivitamin', 'vitamin c', 'vitamin d'] },
  { name: 'Pain Reliever',      emoji: '💊', dept: 'health', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['advil', 'tylenol', 'ibuprofen', 'aspirin'] },
  { name: 'Allergy Medicine',   emoji: '💊', dept: 'health', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['claritin', 'zyrtec', 'benadryl'] },
  { name: 'Cold Medicine',      emoji: '🤧', dept: 'health', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['nyquil', 'dayquil', 'theraflu'] },
  { name: 'Bandages',           emoji: '🩹', dept: 'health', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['band-aids', 'first aid'] },

  // ── HOUSEHOLD ─────────────────────────────────────────────────────────────
  { name: 'Paper Towels',       emoji: '🧻', dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['bounty', 'paper towel rolls'] },
  { name: 'Toilet Paper',       emoji: '🧻', dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: true,  aliases: ['TP', 'bathroom tissue', 'charmin'] },
  { name: 'Dish Soap',          emoji: '🧴', dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['dawn', 'palmolive'] },
  { name: 'Laundry Detergent',  emoji: '🧺', dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['tide', 'laundry soap', 'pods'] },
  { name: 'Dishwasher Pods',    emoji: '🧼', dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['cascade', 'finish', 'dishwasher detergent'] },
  { name: 'Trash Bags',         emoji: '🗑️', dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['garbage bags'] },
  { name: 'Ziploc Bags',        emoji: '🛍️', dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['sandwich bags', 'freezer bags', 'storage bags'] },
  { name: 'Aluminum Foil',      emoji: '✨', dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['tin foil'] },
  { name: 'Plastic Wrap',       emoji: '✨', dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['saran wrap', 'cling wrap'] },
  { name: 'Parchment Paper',    emoji: '📄', dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['baking paper'] },
  { name: 'Cleaning Spray',     emoji: '🧹', dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['lysol', 'windex', '409', 'all purpose cleaner'] },
  { name: 'Bleach',             emoji: '🧴', dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['clorox'] },
  { name: 'Sponges',            emoji: '🧽', dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['scrub sponge'] },
  { name: 'Light Bulbs',        emoji: '💡', dept: 'household', defaultUnit: 'count', defaultQty: 2, showInGrid: false, aliases: ['bulbs', 'LED bulbs'] },
  { name: 'Batteries',          emoji: '🔋', dept: 'household', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['AA batteries', 'AAA batteries'] },

  // ── PERSONAL CARE ─────────────────────────────────────────────────────────
  { name: 'Shampoo',            emoji: '🧴', dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Conditioner',        emoji: '🧴', dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Body Wash',          emoji: '🧴', dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['soap', 'shower gel'] },
  { name: 'Deodorant',          emoji: '🧴', dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['antiperspirant'] },
  { name: 'Toothpaste',         emoji: '🦷', dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Toothbrush',         emoji: '🪥', dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: [] },
  { name: 'Floss',              emoji: '🦷', dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['dental floss'] },
  { name: 'Razors',             emoji: '🪒', dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['shaving razor', 'gillette'] },
  { name: 'Shaving Cream',      emoji: '🧴', dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['shave gel'] },
  { name: 'Lotion',             emoji: '🧴', dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['moisturizer', 'body lotion'] },
  { name: 'Sunscreen',          emoji: '🌞', dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['SPF', 'sunblock'] },
  { name: 'Feminine Products',  emoji: '🌸', dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['tampons', 'pads', 'liners'] },
  { name: 'Tissues',            emoji: '🤧', dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['kleenex', 'facial tissue'] },
  { name: 'Cotton Balls',       emoji: '🌸', dept: 'personal', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['cotton swabs', 'q-tips'] },

  // ── BABY ──────────────────────────────────────────────────────────────────
  { name: 'Diapers',            emoji: '🍼', dept: 'baby', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['pampers', 'huggies', 'pull-ups'] },
  { name: 'Baby Wipes',         emoji: '🧻', dept: 'baby', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['wipes'] },
  { name: 'Baby Formula',       emoji: '🍼', dept: 'baby', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['formula', 'enfamil', 'similac'] },
  { name: 'Baby Food',          emoji: '🥣', dept: 'baby', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['gerber', 'puree', 'baby puree'] },

  // ── PET ───────────────────────────────────────────────────────────────────
  { name: 'Dog Food',           emoji: '🐶', dept: 'pet', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['kibble', 'dry dog food', 'wet dog food'] },
  { name: 'Cat Food',           emoji: '🐱', dept: 'pet', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['cat kibble', 'wet cat food'] },
  { name: 'Pet Treats',         emoji: '🦴', dept: 'pet', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['dog treats', 'cat treats'] },
  { name: 'Cat Litter',         emoji: '🐱', dept: 'pet', defaultUnit: 'count', defaultQty: 1, showInGrid: false, aliases: ['litter', 'clumping litter'] },

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
  return GROCERY_DEPARTMENTS
    .filter(d => groups[d.key])
    .map(d => ({ ...d, items: groups[d.key] }));
}

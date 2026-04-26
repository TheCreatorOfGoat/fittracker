/**
 * Base de données alimentaire — valeurs nutritionnelles pour 100g
 * Sources : ANSES (Ciqual), USDA FoodData Central
 * Format : { name, calories, protein, carbs, fat, unit, defaultQty }
 */
export const FOOD_DATABASE = [
  // ── Viandes ─────────────────────────────────────────────────
  { name: 'Poulet (blanc, cuit)',      emoji: '🍗', category: 'Viandes',    calories: 165, protein: 31,   carbs: 0,    fat: 3.6,  unit: 'g',   defaultQty: 150 },
  { name: 'Poulet (cuisse, cuit)',     emoji: '🍗', category: 'Viandes',    calories: 209, protein: 26,   carbs: 0,    fat: 11,   unit: 'g',   defaultQty: 150 },
  { name: 'Bœuf haché 5%',            emoji: '🥩', category: 'Viandes',    calories: 137, protein: 21,   carbs: 0,    fat: 5,    unit: 'g',   defaultQty: 150 },
  { name: 'Bœuf haché 15%',           emoji: '🥩', category: 'Viandes',    calories: 215, protein: 18,   carbs: 0,    fat: 15,   unit: 'g',   defaultQty: 150 },
  { name: 'Steak de bœuf',            emoji: '🥩', category: 'Viandes',    calories: 185, protein: 28,   carbs: 0,    fat: 7,    unit: 'g',   defaultQty: 180 },
  { name: 'Dinde (blanc, cuit)',       emoji: '🦃', category: 'Viandes',    calories: 157, protein: 30,   carbs: 0,    fat: 3,    unit: 'g',   defaultQty: 150 },
  { name: 'Porc (filet, cuit)',        emoji: '🥩', category: 'Viandes',    calories: 189, protein: 29,   carbs: 0,    fat: 7,    unit: 'g',   defaultQty: 150 },
  { name: 'Jambon blanc',             emoji: '🥩', category: 'Viandes',    calories: 107, protein: 17,   carbs: 1,    fat: 3.5,  unit: 'g',   defaultQty: 60  },
  { name: 'Bacon',                    emoji: '🥓', category: 'Viandes',    calories: 417, protein: 12,   carbs: 0,    fat: 42,   unit: 'g',   defaultQty: 30  },
  { name: 'Saucisse de poulet',       emoji: '🌭', category: 'Viandes',    calories: 185, protein: 13,   carbs: 3,    fat: 14,   unit: 'g',   defaultQty: 80  },

  // ── Poissons & fruits de mer ─────────────────────────────────
  { name: 'Saumon (cuit)',            emoji: '🐟', category: 'Poissons',   calories: 208, protein: 28,   carbs: 0,    fat: 10,   unit: 'g',   defaultQty: 150 },
  { name: 'Thon en boîte (au naturel)',emoji:'🐟', category: 'Poissons',   calories: 116, protein: 26,   carbs: 0,    fat: 1,    unit: 'g',   defaultQty: 100 },
  { name: 'Cabillaud (cuit)',         emoji: '🐟', category: 'Poissons',   calories: 105, protein: 23,   carbs: 0,    fat: 1,    unit: 'g',   defaultQty: 150 },
  { name: 'Crevettes cuites',         emoji: '🦐', category: 'Poissons',   calories: 99,  protein: 21,   carbs: 0,    fat: 1,    unit: 'g',   defaultQty: 100 },
  { name: 'Sardines à l\'huile',      emoji: '🐟', category: 'Poissons',   calories: 208, protein: 25,   carbs: 0,    fat: 11,   unit: 'g',   defaultQty: 85  },
  { name: 'Maquereau (cuit)',         emoji: '🐟', category: 'Poissons',   calories: 262, protein: 24,   carbs: 0,    fat: 18,   unit: 'g',   defaultQty: 150 },

  // ── Œufs & produits laitiers ─────────────────────────────────
  { name: 'Œuf entier',              emoji: '🥚', category: 'Œufs & laitiers', calories: 155, protein: 13, carbs: 1.1, fat: 11,  unit: 'g',   defaultQty: 60  },
  { name: 'Blanc d\'œuf',            emoji: '🥚', category: 'Œufs & laitiers', calories: 52,  protein: 11, carbs: 0.7, fat: 0.2, unit: 'g',   defaultQty: 30  },
  { name: 'Lait entier',             emoji: '🥛', category: 'Œufs & laitiers', calories: 61,  protein: 3.2,carbs: 4.8, fat: 3.3, unit: 'ml',  defaultQty: 200 },
  { name: 'Lait demi-écrémé',        emoji: '🥛', category: 'Œufs & laitiers', calories: 46,  protein: 3.2,carbs: 4.8, fat: 1.5, unit: 'ml',  defaultQty: 200 },
  { name: 'Yaourt nature (0%)',       emoji: '🥛', category: 'Œufs & laitiers', calories: 56,  protein: 5.7,carbs: 7.7, fat: 0.1, unit: 'g',   defaultQty: 125 },
  { name: 'Yaourt grec',             emoji: '🥛', category: 'Œufs & laitiers', calories: 97,  protein: 9,  carbs: 3.6, fat: 5,   unit: 'g',   defaultQty: 150 },
  { name: 'Fromage blanc 0%',        emoji: '🥛', category: 'Œufs & laitiers', calories: 45,  protein: 8,  carbs: 4,   fat: 0.2, unit: 'g',   defaultQty: 150 },
  { name: 'Fromage blanc 3%',        emoji: '🥛', category: 'Œufs & laitiers', calories: 70,  protein: 7,  carbs: 4,   fat: 3,   unit: 'g',   defaultQty: 150 },
  { name: 'Parmesan',                emoji: '🧀', category: 'Œufs & laitiers', calories: 431, protein: 38, carbs: 4,   fat: 29,  unit: 'g',   defaultQty: 20  },
  { name: 'Emmental',                emoji: '🧀', category: 'Œufs & laitiers', calories: 382, protein: 28, carbs: 0,   fat: 29,  unit: 'g',   defaultQty: 30  },
  { name: 'Mozzarella',              emoji: '🧀', category: 'Œufs & laitiers', calories: 280, protein: 18, carbs: 3,   fat: 22,  unit: 'g',   defaultQty: 50  },
  { name: 'Beurre',                  emoji: '🧈', category: 'Œufs & laitiers', calories: 717, protein: 0.9,carbs: 0.1, fat: 81,  unit: 'g',   defaultQty: 10  },
  { name: 'Cottage cheese',          emoji: '🥛', category: 'Œufs & laitiers', calories: 98,  protein: 11, carbs: 3.4, fat: 4.3, unit: 'g',   defaultQty: 150 },

  // ── Céréales & féculents ─────────────────────────────────────
  { name: 'Riz blanc cuit',          emoji: '🍚', category: 'Féculents',   calories: 130, protein: 2.7, carbs: 28,  fat: 0.3,  unit: 'g',   defaultQty: 200 },
  { name: 'Riz complet cuit',        emoji: '🍚', category: 'Féculents',   calories: 112, protein: 2.6, carbs: 24,  fat: 0.9,  unit: 'g',   defaultQty: 200 },
  { name: 'Pâtes cuites',            emoji: '🍝', category: 'Féculents',   calories: 158, protein: 5.8, carbs: 31,  fat: 0.9,  unit: 'g',   defaultQty: 200 },
  { name: 'Pâtes complètes cuites',  emoji: '🍝', category: 'Féculents',   calories: 149, protein: 5.5, carbs: 29,  fat: 1,    unit: 'g',   defaultQty: 200 },
  { name: 'Pomme de terre cuite',    emoji: '🥔', category: 'Féculents',   calories: 87,  protein: 1.9, carbs: 20,  fat: 0.1,  unit: 'g',   defaultQty: 200 },
  { name: 'Patate douce cuite',      emoji: '🍠', category: 'Féculents',   calories: 90,  protein: 2,   carbs: 21,  fat: 0.1,  unit: 'g',   defaultQty: 200 },
  { name: 'Flocons d\'avoine',       emoji: '🌾', category: 'Féculents',   calories: 389, protein: 17,  carbs: 66,  fat: 7,    unit: 'g',   defaultQty: 60  },
  { name: 'Pain blanc',              emoji: '🍞', category: 'Féculents',   calories: 265, protein: 9,   carbs: 49,  fat: 3.2,  unit: 'g',   defaultQty: 60  },
  { name: 'Pain complet',            emoji: '🍞', category: 'Féculents',   calories: 247, protein: 13,  carbs: 41,  fat: 4,    unit: 'g',   defaultQty: 60  },
  { name: 'Quinoa cuit',             emoji: '🌾', category: 'Féculents',   calories: 120, protein: 4.4, carbs: 22,  fat: 1.9,  unit: 'g',   defaultQty: 150 },
  { name: 'Lentilles cuites',        emoji: '🫘', category: 'Féculents',   calories: 116, protein: 9,   carbs: 20,  fat: 0.4,  unit: 'g',   defaultQty: 150 },
  { name: 'Pois chiches cuits',      emoji: '🫘', category: 'Féculents',   calories: 164, protein: 8.9, carbs: 27,  fat: 2.6,  unit: 'g',   defaultQty: 150 },
  { name: 'Haricots rouges cuits',   emoji: '🫘', category: 'Féculents',   calories: 127, protein: 8.7, carbs: 23,  fat: 0.5,  unit: 'g',   defaultQty: 150 },
  { name: 'Granola',                 emoji: '🌾', category: 'Féculents',   calories: 471, protein: 10,  carbs: 64,  fat: 20,   unit: 'g',   defaultQty: 50  },

  // ── Légumes ──────────────────────────────────────────────────
  { name: 'Épinards crus',           emoji: '🥬', category: 'Légumes',     calories: 23,  protein: 2.9, carbs: 3.6, fat: 0.4,  unit: 'g',   defaultQty: 100 },
  { name: 'Brocoli cuit',            emoji: '🥦', category: 'Légumes',     calories: 35,  protein: 2.4, carbs: 7,   fat: 0.4,  unit: 'g',   defaultQty: 150 },
  { name: 'Tomate',                  emoji: '🍅', category: 'Légumes',     calories: 18,  protein: 0.9, carbs: 3.9, fat: 0.2,  unit: 'g',   defaultQty: 150 },
  { name: 'Concombre',               emoji: '🥒', category: 'Légumes',     calories: 16,  protein: 0.7, carbs: 3.6, fat: 0.1,  unit: 'g',   defaultQty: 100 },
  { name: 'Courgette cuite',         emoji: '🥒', category: 'Légumes',     calories: 17,  protein: 1.2, carbs: 3.5, fat: 0.3,  unit: 'g',   defaultQty: 150 },
  { name: 'Poivron',                 emoji: '🫑', category: 'Légumes',     calories: 31,  protein: 1,   carbs: 6,   fat: 0.3,  unit: 'g',   defaultQty: 100 },
  { name: 'Carottes',                emoji: '🥕', category: 'Légumes',     calories: 41,  protein: 0.9, carbs: 10,  fat: 0.2,  unit: 'g',   defaultQty: 100 },
  { name: 'Haricots verts cuits',    emoji: '🫛', category: 'Légumes',     calories: 31,  protein: 1.8, carbs: 7,   fat: 0.1,  unit: 'g',   defaultQty: 150 },
  { name: 'Champignons',             emoji: '🍄', category: 'Légumes',     calories: 22,  protein: 3.1, carbs: 3.3, fat: 0.3,  unit: 'g',   defaultQty: 100 },
  { name: 'Avocat',                  emoji: '🥑', category: 'Légumes',     calories: 160, protein: 2,   carbs: 9,   fat: 15,   unit: 'g',   defaultQty: 80  },
  { name: 'Salade verte',            emoji: '🥗', category: 'Légumes',     calories: 15,  protein: 1.4, carbs: 2.9, fat: 0.2,  unit: 'g',   defaultQty: 60  },
  { name: 'Oignon',                  emoji: '🧅', category: 'Légumes',     calories: 40,  protein: 1.1, carbs: 9,   fat: 0.1,  unit: 'g',   defaultQty: 50  },
  { name: 'Ail',                     emoji: '🧄', category: 'Légumes',     calories: 149, protein: 6.4, carbs: 33,  fat: 0.5,  unit: 'g',   defaultQty: 5   },

  // ── Fruits ───────────────────────────────────────────────────
  { name: 'Banane',                  emoji: '🍌', category: 'Fruits',      calories: 89,  protein: 1.1, carbs: 23,  fat: 0.3,  unit: 'g',   defaultQty: 120 },
  { name: 'Pomme',                   emoji: '🍎', category: 'Fruits',      calories: 52,  protein: 0.3, carbs: 14,  fat: 0.2,  unit: 'g',   defaultQty: 150 },
  { name: 'Orange',                  emoji: '🍊', category: 'Fruits',      calories: 47,  protein: 0.9, carbs: 12,  fat: 0.1,  unit: 'g',   defaultQty: 150 },
  { name: 'Fraises',                 emoji: '🍓', category: 'Fruits',      calories: 32,  protein: 0.7, carbs: 7.7, fat: 0.3,  unit: 'g',   defaultQty: 150 },
  { name: 'Myrtilles',               emoji: '🫐', category: 'Fruits',      calories: 57,  protein: 0.7, carbs: 14,  fat: 0.3,  unit: 'g',   defaultQty: 100 },
  { name: 'Mangue',                  emoji: '🥭', category: 'Fruits',      calories: 60,  protein: 0.8, carbs: 15,  fat: 0.4,  unit: 'g',   defaultQty: 150 },
  { name: 'Raisin',                  emoji: '🍇', category: 'Fruits',      calories: 69,  protein: 0.7, carbs: 18,  fat: 0.2,  unit: 'g',   defaultQty: 100 },
  { name: 'Pastèque',                emoji: '🍉', category: 'Fruits',      calories: 30,  protein: 0.6, carbs: 7.6, fat: 0.2,  unit: 'g',   defaultQty: 200 },
  { name: 'Ananas',                  emoji: '🍍', category: 'Fruits',      calories: 50,  protein: 0.5, carbs: 13,  fat: 0.1,  unit: 'g',   defaultQty: 150 },
  { name: 'Kiwi',                    emoji: '🥝', category: 'Fruits',      calories: 61,  protein: 1.1, carbs: 15,  fat: 0.5,  unit: 'g',   defaultQty: 80  },

  // ── Noix & graines ───────────────────────────────────────────
  { name: 'Amandes',                 emoji: '🌰', category: 'Noix',        calories: 579, protein: 21,  carbs: 22,  fat: 50,   unit: 'g',   defaultQty: 30  },
  { name: 'Noix de cajou',           emoji: '🌰', category: 'Noix',        calories: 553, protein: 18,  carbs: 30,  fat: 44,   unit: 'g',   defaultQty: 30  },
  { name: 'Noix',                    emoji: '🌰', category: 'Noix',        calories: 654, protein: 15,  carbs: 14,  fat: 65,   unit: 'g',   defaultQty: 30  },
  { name: 'Beurre de cacahuète',     emoji: '🥜', category: 'Noix',        calories: 588, protein: 25,  carbs: 20,  fat: 50,   unit: 'g',   defaultQty: 30  },
  { name: 'Graines de chia',         emoji: '🌱', category: 'Noix',        calories: 486, protein: 17,  carbs: 42,  fat: 31,   unit: 'g',   defaultQty: 20  },
  { name: 'Graines de lin',          emoji: '🌱', category: 'Noix',        calories: 534, protein: 18,  carbs: 29,  fat: 42,   unit: 'g',   defaultQty: 15  },

  // ── Huiles & matières grasses ────────────────────────────────
  { name: 'Huile d\'olive',          emoji: '🫒', category: 'Matières grasses', calories: 884, protein: 0, carbs: 0, fat: 100,  unit: 'ml',  defaultQty: 10  },
  { name: 'Huile de coco',           emoji: '🥥', category: 'Matières grasses', calories: 862, protein: 0, carbs: 0, fat: 100,  unit: 'ml',  defaultQty: 10  },

  // ── Protéines en poudre ──────────────────────────────────────
  { name: 'Whey protéine',           emoji: '💪', category: 'Compléments', calories: 380, protein: 75,  carbs: 8,   fat: 4,    unit: 'g',   defaultQty: 30  },
  { name: 'Caséine',                 emoji: '💪', category: 'Compléments', calories: 360, protein: 76,  carbs: 5,   fat: 2,    unit: 'g',   defaultQty: 30  },
  { name: 'Créatine',                emoji: '💪', category: 'Compléments', calories: 0,   protein: 0,   carbs: 0,   fat: 0,    unit: 'g',   defaultQty: 5   },

  // ── Boissons ─────────────────────────────────────────────────
  { name: 'Eau',                     emoji: '💧', category: 'Boissons',    calories: 0,   protein: 0,   carbs: 0,   fat: 0,    unit: 'ml',  defaultQty: 250 },
  { name: 'Jus d\'orange',           emoji: '🍊', category: 'Boissons',    calories: 45,  protein: 0.7, carbs: 10,  fat: 0.2,  unit: 'ml',  defaultQty: 200 },
  { name: 'Café noir',               emoji: '☕', category: 'Boissons',    calories: 2,   protein: 0.3, carbs: 0,   fat: 0,    unit: 'ml',  defaultQty: 250 },
  { name: 'Lait d\'amande',          emoji: '🥛', category: 'Boissons',    calories: 13,  protein: 0.4, carbs: 0.3, fat: 1.1,  unit: 'ml',  defaultQty: 250 },

  // ── Divers / préparations ────────────────────────────────────
  { name: 'Œufs brouillés',          emoji: '🍳', category: 'Préparations', calories: 148, protein: 10, carbs: 1.3, fat: 11,   unit: 'g',   defaultQty: 120 },
  { name: 'Omelette nature',         emoji: '🍳', category: 'Préparations', calories: 154, protein: 11, carbs: 0.5, fat: 12,   unit: 'g',   defaultQty: 120 },
  { name: 'Pizza margherita',        emoji: '🍕', category: 'Préparations', calories: 266, protein: 11, carbs: 33,  fat: 10,   unit: 'g',   defaultQty: 250 },
  { name: 'Burger maison',           emoji: '🍔', category: 'Préparations', calories: 295, protein: 17, carbs: 24,  fat: 14,   unit: 'g',   defaultQty: 250 },
  { name: 'Salade César',            emoji: '🥗', category: 'Préparations', calories: 190, protein: 8,  carbs: 10,  fat: 14,   unit: 'g',   defaultQty: 200 },
  { name: 'Soupe de légumes',        emoji: '🍲', category: 'Préparations', calories: 72,  protein: 3,  carbs: 12,  fat: 1.5,  unit: 'g',   defaultQty: 300 },
  { name: 'Chocolat noir 70%',       emoji: '🍫', category: 'Divers',      calories: 598, protein: 8,  carbs: 46,  fat: 43,   unit: 'g',   defaultQty: 20  },
  { name: 'Miel',                    emoji: '🍯', category: 'Divers',      calories: 304, protein: 0.3,carbs: 82,  fat: 0,    unit: 'g',   defaultQty: 15  },
];

// Catégories disponibles
export const FOOD_CATEGORIES = [...new Set(FOOD_DATABASE.map(f => f.category))];

// Recherche dans la base
export function searchFoods(query) {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return FOOD_DATABASE.filter(f => {
    const name = f.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return name.includes(q);
  }).slice(0, 8);
}

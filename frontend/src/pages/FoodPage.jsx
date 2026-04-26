import { useEffect, useState, useRef } from 'react';
import { Plus, UtensilsCrossed, ChevronLeft, ChevronRight, Search, X, Star, Zap, Camera, Loader } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { searchFoods, FOOD_DATABASE, FOOD_CATEGORIES } from '../utils/foodDatabase';
import { getRecommendedMacros } from '../utils/fitnessUtils';

const MEALS = [
  { key: 'breakfast', label: 'Petit-déjeuner', emoji: '🌅' },
  { key: 'lunch',     label: 'Déjeuner',       emoji: '☀️' },
  { key: 'dinner',    label: 'Dîner',           emoji: '🌙' },
  { key: 'snack',     label: 'Snack',           emoji: '🍎' },
];

const FAVORITES_KEY = 'ft_food_favorites';
function loadFavorites() { try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); } catch { return []; } }
function saveFavorites(f) { localStorage.setItem(FAVORITES_KEY, JSON.stringify(f)); }

export default function FoodPage() {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [showForm, setShowForm] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [activeTab, setActiveTab] = useState('search');
  const [favorites, setFavorites] = useState(loadFavorites);
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');

  const targetCalories = user?.dailyCalories || 2000;
  const recommendedMacros = getRecommendedMacros(targetCalories, user?.profile?.goal);

  async function load() {
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data } = await api.get(`/food?date=${dateStr}`);
      // Les données viennent de MongoDB — elles ne s'effacent jamais automatiquement
      setLogs(data.logs || []);
      setTotals(data.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [selectedDate]);

  useEffect(() => {
    if (searchQuery.length >= 1) setSearchResults(searchFoods(searchQuery));
    else setSearchResults([]);
  }, [searchQuery]);

  // Scanner code-barres via Open Food Facts API
  async function scanBarcode() {
    if (!barcode.trim()) return;
    setScanLoading(true);
    setScanError('');
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode.trim()}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const nutriments = p.nutriments || {};
        const food = {
          name: p.product_name || p.product_name_fr || 'Produit scanné',
          emoji: '📦',
          category: 'Scanné',
          calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
          protein:  Math.round((nutriments.proteins_100g || 0) * 10) / 10,
          carbs:    Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10,
          fat:      Math.round((nutriments.fat_100g || 0) * 10) / 10,
          unit: 'g',
          defaultQty: 100,
          qty: 100,
        };
        addFoodToSelection(food);
        setBarcode('');
        setScanning(false);
      } else {
        setScanError('Produit non trouvé. Vérifie le code-barres.');
      }
    } catch {
      setScanError('Erreur de connexion. Réessaie.');
    } finally {
      setScanLoading(false);
    }
  }

  const categoryFoods = activeCategory === 'Tous' ? FOOD_DATABASE.slice(0, 20) : FOOD_DATABASE.filter(f => f.category === activeCategory);

  function addFoodToSelection(food) {
    if (selectedItems.find(i => i.name === food.name)) return;
    setSelectedItems(prev => [...prev, { ...food, qty: food.defaultQty || 100 }]);
    setSearchQuery(''); setSearchResults([]);
  }

  function updateQty(name, qty) { setSelectedItems(prev => prev.map(i => i.name === name ? { ...i, qty: Number(qty) } : i)); }
  function removeItem(name)      { setSelectedItems(prev => prev.filter(i => i.name !== name)); }

  function calcMacros(food) {
    const ratio = food.qty / 100;
    return {
      calories: Math.round((food.calories || 0) * ratio),
      protein:  Math.round((food.protein  || 0) * ratio * 10) / 10,
      carbs:    Math.round((food.carbs    || 0) * ratio * 10) / 10,
      fat:      Math.round((food.fat      || 0) * ratio * 10) / 10,
    };
  }

  function toggleFavorite(food) {
    const exists = favorites.find(f => f.name === food.name);
    const updated = exists ? favorites.filter(f => f.name !== food.name) : [...favorites, food];
    setFavorites(updated); saveFavorites(updated);
  }

  function isFavorite(food) { return favorites.some(f => f.name === food.name); }

  const selectionTotals = selectedItems.reduce((acc, item) => {
    const m = calcMacros(item);
    return { calories: acc.calories + m.calories, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  async function saveLog() {
    if (selectedItems.length === 0) return;
    const items = selectedItems.map(item => {
      const m = calcMacros(item);
      return {
        name: `${item.emoji} ${item.name}`,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        quantity: 1,
        unit: 'portion',
      };
    });
    // Sauvegarde dans MongoDB — persistant même après déconnexion
    await api.post('/food', { meal: selectedMeal, items, date: format(selectedDate, 'yyyy-MM-dd') });
    setSelectedItems([]);
    setShowForm(false);
    load();
  }

  async function deleteLog(id) {
    await api.delete(`/food/${id}`);
    load();
  }

  const caloriePercent = Math.min(Math.round((totals.calories / targetCalories) * 100), 100);
  const byMeal = MEALS.reduce((acc, m) => { acc[m.key] = logs.filter(l => l.meal === m.key); return acc; }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Journal alimentaire</h1>
        <button onClick={() => { setShowForm(!showForm); setSelectedItems([]); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Navigation date */}
      <div className="flex items-center gap-4">
        <button onClick={() => setSelectedDate(d => subDays(d, 1))} className="btn-ghost p-2"><ChevronLeft size={18} /></button>
        <div className="flex-1 text-center">
          <p className="font-medium text-gray-900 dark:text-white capitalize">{format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}</p>
        </div>
        <button onClick={() => setSelectedDate(d => addDays(d, 1))} className="btn-ghost p-2"><ChevronRight size={18} /></button>
      </div>

      {/* Résumé macros */}
      <div className="card p-5">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400">Calories consommées</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-display font-bold text-gray-900 dark:text-white">{Math.round(totals.calories)}</span>
              <span className="text-gray-400 text-sm">/ {targetCalories} kcal</span>
            </div>
          </div>
          <span className={`text-sm font-medium ${caloriePercent >= 100 ? 'text-red-500' : 'text-green-500'}`}>{caloriePercent}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
          <div className={`h-full rounded-full transition-all duration-500 ${caloriePercent >= 100 ? 'bg-red-400' : 'bg-orange-400'}`} style={{ width: `${caloriePercent}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Protéines', current: Math.round(totals.protein), rec: recommendedMacros?.protein?.grams, color: 'text-blue-500', bar: 'bg-blue-500' },
            { label: 'Glucides',  current: Math.round(totals.carbs),   rec: recommendedMacros?.carbs?.grams,   color: 'text-yellow-500', bar: 'bg-yellow-500' },
            { label: 'Lipides',   current: Math.round(totals.fat),     rec: recommendedMacros?.fat?.grams,     color: 'text-pink-500', bar: 'bg-pink-500' },
          ].map(m => (
            <div key={m.label} className="text-center">
              <p className={`text-lg font-bold ${m.color}`}>{m.current}<span className="text-xs text-gray-400">g</span></p>
              {m.rec && <p className="text-xs text-gray-400">/ {m.rec}g</p>}
              <p className="text-xs text-gray-400">{m.label}</p>
              {m.rec && <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full mt-1 overflow-hidden"><div className={`h-full ${m.bar} rounded-full`} style={{ width: `${Math.min((m.current/m.rec)*100,100)}%` }} /></div>}
            </div>
          ))}
        </div>
        {recommendedMacros && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1 text-xs text-gray-400">
            <Zap size={11} className="text-green-400" />
            <span>Recommandé : P {recommendedMacros.protein.grams}g · G {recommendedMacros.carbs.grams}g · L {recommendedMacros.fat.grams}g</span>
          </div>
        )}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card p-6 animate-slide-up space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Ajouter un repas</h2>

          {/* Choix repas */}
          <div className="flex gap-2 flex-wrap">
            {MEALS.map(m => (
              <button key={m.key} onClick={() => setSelectedMeal(m.key)}
                className={`px-4 py-2 rounded-xl border text-sm transition-all ${selectedMeal === m.key ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                {m.emoji} {m.label}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {[{ key: 'search', label: '🔍 Recherche' }, { key: 'favorites', label: '⭐ Favoris' }, { key: 'scan', label: '📷 Scanner' }].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={'flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ' + (activeTab === t.key ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500')}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Recherche */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9" placeholder="Rechercher un aliment..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoComplete="off" />
                {searchResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                    {searchResults.map(food => (
                      <div key={food.name} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <button onClick={() => addFoodToSelection(food)} className="flex items-center gap-3 flex-1 text-left">
                          <span className="text-xl">{food.emoji}</span>
                          <div><p className="text-sm font-medium text-gray-900 dark:text-white">{food.name}</p><p className="text-xs text-gray-400">{food.category}</p></div>
                        </button>
                        <div className="flex items-center gap-2">
                          <div className="text-right"><p className="text-sm font-bold text-orange-500">{food.calories} kcal</p><p className="text-xs text-gray-400">/ 100{food.unit}</p></div>
                          <button onClick={() => toggleFavorite(food)} className={isFavorite(food) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}>
                            <Star size={14} fill={isFavorite(food) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="flex gap-2 flex-wrap mb-3">
                  {['Tous', ...FOOD_CATEGORIES].map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === cat ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {categoryFoods.map(food => (
                    <button key={food.name} onClick={() => addFoodToSelection(food)}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-700 transition-all text-left bg-gray-50 dark:bg-gray-800/50">
                      <span className="text-xl flex-shrink-0">{food.emoji}</span>
                      <div className="min-w-0"><p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{food.name}</p><p className="text-xs text-orange-500 font-bold">{food.calories} kcal/100{food.unit}</p></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Favoris */}
          {activeTab === 'favorites' && (
            <div>
              {favorites.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <Star className="mx-auto mb-2 opacity-30" size={28} />
                  Aucun favori. Clique ⭐ dans la recherche pour en ajouter.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {favorites.map(food => (
                    <button key={food.name} onClick={() => addFoodToSelection(food)}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-yellow-100 dark:border-yellow-900/30 hover:border-yellow-300 transition-all text-left bg-yellow-50/50 dark:bg-yellow-900/10">
                      <span className="text-xl flex-shrink-0">{food.emoji}</span>
                      <div className="min-w-0"><p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{food.name}</p><p className="text-xs text-orange-500 font-bold">{food.calories} kcal/100{food.unit}</p></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Scanner code-barres */}
          {activeTab === 'scan' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">📷 Scanner un code-barres</p>
                <p className="text-xs text-blue-500">Tape le code-barres du produit pour récupérer automatiquement ses infos nutritionnelles depuis Open Food Facts.</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Ex: 3017620422003 (Nutella)"
                  value={barcode}
                  onChange={e => { setBarcode(e.target.value); setScanError(''); }}
                  onKeyDown={e => e.key === 'Enter' && scanBarcode()}
                />
                <button onClick={scanBarcode} disabled={!barcode.trim() || scanLoading} className="btn-primary px-4 flex items-center gap-2 disabled:opacity-60">
                  {scanLoading ? <Loader size={16} className="animate-spin" /> : <Camera size={16} />}
                  {scanLoading ? '' : 'Chercher'}
                </button>
              </div>
              {scanError && <p className="text-sm text-red-500">{scanError}</p>}
              <div className="text-xs text-gray-400 space-y-1">
                <p>Exemples de codes à tester :</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Nutella', code: '3017620422003' },
                    { label: 'Coca-Cola', code: '5449000000996' },
                    { label: 'Danone Activia', code: '3033490004743' },
                  ].map(ex => (
                    <button key={ex.code} onClick={() => setBarcode(ex.code)}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sélection */}
          {selectedItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="section-title">Sélection</p>
                <div className="flex gap-2 text-xs font-bold">
                  <span className="text-orange-500">{Math.round(selectionTotals.calories)} kcal</span>
                  <span className="text-blue-500">P:{Math.round(selectionTotals.protein)}g</span>
                  <span className="text-yellow-500">G:{Math.round(selectionTotals.carbs)}g</span>
                  <span className="text-pink-500">L:{Math.round(selectionTotals.fat)}g</span>
                </div>
              </div>
              {selectedItems.map(item => {
                const m = calcMacros(item);
                return (
                  <div key={item.name} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{item.emoji}</span>
                      <p className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                      <button onClick={() => toggleFavorite(item)} className={isFavorite(item) ? 'text-yellow-400' : 'text-gray-300'}><Star size={13} fill={isFavorite(item) ? 'currentColor' : 'none'} /></button>
                      <button onClick={() => removeItem(item.name)} className="text-gray-300 hover:text-red-400"><X size={14} /></button>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <input type="number" value={item.qty} onChange={e => updateQty(item.name, e.target.value)} className="input text-center py-1 px-2 text-sm" style={{ width: '72px' }} min="1" />
                        <span className="text-xs text-gray-400">{item.unit || 'g'}</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="badge bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">{m.calories} kcal</span>
                        <span className="badge bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">P {m.protein}g</span>
                        <span className="badge bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">G {m.carbs}g</span>
                        <span className="badge bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400">L {m.fat}g</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button onClick={() => { setShowForm(false); setSelectedItems([]); }} className="btn-secondary">Annuler</button>
            <button onClick={saveLog} disabled={selectedItems.length === 0} className="btn-primary disabled:opacity-60">
              Enregistrer {selectedItems.length > 0 && `(${selectedItems.length})`}
            </button>
          </div>
        </div>
      )}

      {/* Repas du jour */}
      {loading ? <Spinner /> : (
        <div className="space-y-4">
          {MEALS.map(meal => {
            const mealLogs = byMeal[meal.key] || [];
            if (mealLogs.length === 0) return null;
            const mealCals = mealLogs.reduce((sum, l) => sum + l.items.reduce((s, i) => s + (i.calories || 0) * i.quantity, 0), 0);
            return (
              <div key={meal.key} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">{meal.emoji} {meal.label}</h3>
                  <span className="text-sm font-bold text-orange-500">{Math.round(mealCals)} kcal</span>
                </div>
                <div className="space-y-1.5">
                  {mealLogs.map(log => (
                    <div key={log._id}>
                      {log.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 text-sm border-b border-gray-50 dark:border-gray-800 last:border-0">
                          <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                          <div className="flex items-center gap-2 text-xs">
                            {item.protein > 0 && <span className="text-blue-400">P:{item.protein}g</span>}
                            {item.carbs > 0 && <span className="text-yellow-400">G:{item.carbs}g</span>}
                            {item.fat > 0 && <span className="text-pink-400">L:{item.fat}g</span>}
                            <span className="font-bold text-orange-500">{item.calories} kcal</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end mt-1">
                        <button onClick={() => deleteLog(log._id)} className="text-xs text-gray-300 hover:text-red-400 transition-colors">Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {logs.length === 0 && (
            <div className="card p-12 flex flex-col items-center text-center gap-3">
              <UtensilsCrossed size={40} className="text-gray-200 dark:text-gray-700" />
              <p className="font-medium text-gray-600 dark:text-gray-400">Aucun repas enregistré</p>
              <p className="text-sm text-gray-400">Clique sur "Ajouter" pour tracker ton alimentation !</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Spinner() { return <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>; }

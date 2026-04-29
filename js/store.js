// Despeses App - Data Layer

const APP_DATA_VERSION = 'v5_microdespeses';

const DEFAULT_CATEGORIES = [
    { id: 'cafes_snacks', name: 'Cafès i snacks', limit: 60, icon: 'local_cafe', color: 'bg-secondary-fixed', textColor: 'text-on-secondary-fixed-variant' },
    { id: 'menjar_rapid', name: 'Menjar ràpid', limit: 80, icon: 'lunch_dining', color: 'bg-orange-200', textColor: 'text-on-secondary-fixed-variant' },
    { id: 'oci', name: 'Oci', limit: 100, icon: 'movie', color: 'bg-purple-200', textColor: 'text-on-primary-fixed-variant' },
    { id: 'compres_petites', name: 'Compres petites', limit: 75, icon: 'shopping_bag', color: 'bg-pink-200', textColor: 'text-on-primary-fixed-variant' },
    { id: 'transport_puntual', name: 'Transport puntual', limit: 50, icon: 'directions_bus', color: 'bg-tertiary-fixed-dim', textColor: 'text-on-tertiary-fixed-variant' },
    { id: 'altres', name: 'Altres', limit: 40, icon: 'more_horiz', color: 'bg-primary-fixed', textColor: 'text-on-primary-fixed-variant' }
];

const SAMPLE_EXPENSES = [
    { id: 'demo_001', amount: 2.20, date: '2026-04-02', category: 'cafes_snacks', concept: 'Cafè matí', type: 'expense', method: 'cash' },
    { id: 'demo_002', amount: 4.80, date: '2026-04-03', category: 'cafes_snacks', concept: 'Cafè i pasta', type: 'expense', method: 'card' },
    { id: 'demo_003', amount: 12.50, date: '2026-04-05', category: 'menjar_rapid', concept: 'Entrepà i beguda', type: 'expense', method: 'card' },
    { id: 'demo_004', amount: 9.90, date: '2026-04-07', category: 'oci', concept: 'Cinema', type: 'expense', method: 'card' },
    { id: 'demo_005', amount: 3.40, date: '2026-04-09', category: 'transport_puntual', concept: 'Bitllet bus', type: 'expense', method: 'card' },
    { id: 'demo_006', amount: 6.75, date: '2026-04-11', category: 'compres_petites', concept: 'Llibreta', type: 'expense', method: 'cash' },
    { id: 'demo_007', amount: 2.10, date: '2026-04-12', category: 'cafes_snacks', concept: 'Cafè tarda', type: 'expense', method: 'cash' },
    { id: 'demo_008', amount: 18.30, date: '2026-04-14', category: 'menjar_rapid', concept: 'Menú ràpid', type: 'expense', method: 'card' },
    { id: 'demo_009', amount: 5.95, date: '2026-04-16', category: 'altres', concept: 'Diari i xiclets', type: 'expense', method: 'cash' },
    { id: 'demo_010', amount: 14.00, date: '2026-04-20', category: 'oci', concept: 'Vermut', type: 'expense', method: 'card' },
    { id: 'demo_011', amount: 7.25, date: '2026-04-22', category: 'compres_petites', concept: 'Petit regal', type: 'expense', method: 'card' },
    { id: 'demo_012', amount: 2.35, date: '2026-04-25', category: 'cafes_snacks', concept: 'Cafè per emportar', type: 'expense', method: 'cash' }
];

const Store = {
    getData() {
        const data = localStorage.getItem('despeses_app_data');

        if (data) {
            const parsed = JSON.parse(data);

            // Migració suau cap a la versió de microdespeses:
            // actualitza categories, però conserva les despeses existents si n'hi ha.
            if (parsed.version !== APP_DATA_VERSION) {
                parsed.version = APP_DATA_VERSION;
                parsed.categories = DEFAULT_CATEGORIES;

                if (!parsed.expenses || parsed.expenses.length === 0) {
                    parsed.expenses = SAMPLE_EXPENSES;
                }

                if (!parsed.preferences) {
                    parsed.preferences = { darkMode: false };
                }

                this.saveData(parsed);
            }

            return parsed;
        }

        // Initialize default data
        const initialData = {
            version: APP_DATA_VERSION,
            expenses: SAMPLE_EXPENSES,
            categories: DEFAULT_CATEGORIES,
            preferences: { darkMode: false }
        };

        this.saveData(initialData);
        return initialData;
    },

    saveData(data) {
        localStorage.setItem('despeses_app_data', JSON.stringify(data));
    },

    loadSampleData() {
        const data = this.getData();
        data.categories = DEFAULT_CATEGORIES;
        data.expenses = SAMPLE_EXPENSES;
        data.version = APP_DATA_VERSION;
        this.saveData(data);
    },

    // --- Expenses ---
    getExpenses() {
        return this.getData().expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    addExpense(expense) {
        const data = this.getData();
        expense.id = Date.now().toString();
        data.expenses.push(expense);
        this.saveData(data);
        return expense;
    },

    deleteExpense(id) {
        const data = this.getData();
        data.expenses = data.expenses.filter(e => e.id !== id);
        this.saveData(data);
    },

    updateExpense(exp) {
        const data = this.getData();
        const index = data.expenses.findIndex(e => e.id === exp.id);
        if (index !== -1) {
            data.expenses[index] = { ...data.expenses[index], ...exp };
            this.saveData(data);
        }
    },

    // --- Categories ---
    getCategories() {
        return this.getData().categories;
    },

    addCategory(cat) {
        const data = this.getData();
        cat.id = 'cat_' + Date.now();
        if (!cat.color) cat.color = 'bg-primary-fixed';
        if (!cat.textColor) cat.textColor = 'text-on-primary-fixed-variant';
        data.categories.push(cat);
        this.saveData(data);
    },

    updateCategory(cat) {
        const data = this.getData();
        const index = data.categories.findIndex(c => c.id === cat.id);
        if (index !== -1) {
            data.categories[index] = { ...data.categories[index], ...cat };
            this.saveData(data);
        }
    },

    deleteCategory(id) {
        const data = this.getData();
        data.categories = data.categories.filter(c => c.id !== id);
        this.saveData(data);
    },

    // --- Preferences ---
    getPreferences() {
        return this.getData().preferences;
    },

    toggleDarkMode() {
        const data = this.getData();
        data.preferences.darkMode = !data.preferences.darkMode;
        this.saveData(data);
        return data.preferences.darkMode;
    },

    clearAllData() {
        localStorage.removeItem('despeses_app_data');
    }
};

window.Store = Store;

// Despeses App - Data Layer

const DEFAULT_CATEGORIES = [
    { id: 'housing', name: 'Habitatge', limit: 1200, icon: 'home', color: 'bg-primary-fixed', textColor: 'text-on-primary-fixed-variant' },
    { id: 'food', name: 'Alimentació', limit: 450, icon: 'shopping_cart', color: 'bg-secondary-fixed', textColor: 'text-on-secondary-fixed-variant' },
    { id: 'transport', name: 'Transport', limit: 150, icon: 'directions_car', color: 'bg-tertiary-fixed', textColor: 'text-on-tertiary-fixed-variant' },
    { id: 'leisure', name: 'Oci i Restaurants', limit: 200, icon: 'restaurant', color: 'bg-secondary-container', textColor: 'text-on-secondary-container' },
    { id: 'health', name: 'Salut', limit: 100, icon: 'fitness_center', color: 'bg-error-container', textColor: 'text-error' }
];

const Store = {
    getData() {
        const data = localStorage.getItem('despeses_app_data');
        if (data) {
            return JSON.parse(data);
        }
        // Initialize default data
        const initialData = {
            expenses: [],
            categories: DEFAULT_CATEGORIES,
            preferences: { darkMode: false }
        };
        this.saveData(initialData);
        return initialData;
    },

    saveData(data) {
        localStorage.setItem('despeses_app_data', JSON.stringify(data));
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

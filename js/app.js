// Despeses App - App Logic

const COLOR_HEX_MAP = {
    'bg-primary-fixed': '#d5e5ef',
    'bg-secondary-fixed': '#ffdea5',
    'bg-error-container': '#ffdad6',
    'bg-tertiary-fixed-dim': '#b9c9d2',
    'bg-secondary-container': '#fed488',
    'bg-blue-200': '#bfdbfe',
    'bg-green-200': '#bbf7d0',
    'bg-purple-200': '#e9d5ff',
    'bg-pink-200': '#fbcfe8',
    'bg-orange-200': '#fed7aa',
};

const app = {
    currentView: 'dashboard',
    selectedMonthDate: new Date(),
    selectedAnnualYear: new Date().getFullYear(),
    
    init() {
        // Apply theme
        const prefs = Store.getPreferences();
        if (prefs.darkMode) {
            document.documentElement.classList.add('dark');
        }

        // Setup Event Listeners
        this.setupEventListeners();
        
        // Initial Render
        this.navigate('dashboard');
    },

    setupEventListeners() {
        // Dark mode toggle
        const btnToggleDark = document.getElementById('btn-toggle-dark');
        if (btnToggleDark) {
            btnToggleDark.addEventListener('click', () => {
                const isDark = Store.toggleDarkMode();
                if (isDark) {
                    document.documentElement.classList.add('dark');
                    btnToggleDark.querySelector('span').classList.add('translate-x-6');
                } else {
                    document.documentElement.classList.remove('dark');
                    btnToggleDark.querySelector('span').classList.remove('translate-x-6');
                }
            });
            // Init switch position
            const prefs = Store.getPreferences();
            if (prefs.darkMode) {
                btnToggleDark.querySelector('span').classList.add('translate-x-6');
            }
        }

        // Clear data
        const btnClear = document.getElementById('btn-clear-data');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                if(confirm("Segur que vols esborrar totes les dades? Això no es pot desfer.")) {
                    Store.clearAllData();
                    location.reload();
                }
            });
        }

        // Form handlers        
        const formAddExp = document.getElementById('form-add-expense');
        if (formAddExp) {
            formAddExp.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = document.getElementById('exp-id').value;
                const amountVal = parseFloat(document.getElementById('exp-amount').value);
                const amount = Math.abs(amountVal);
                const date = document.getElementById('exp-date').value;
                const concept = document.getElementById('exp-concept').value;
                
                const typeEl = document.querySelector('input[name="exp-type"]:checked');
                const type = typeEl ? typeEl.value : 'expense';
                
                const methodEl = document.querySelector('input[name="exp-method"]:checked');
                const method = methodEl ? methodEl.value : 'cash';
                
                const category = type === 'income' ? 'income_virtual' : document.getElementById('exp-category').value;

                if (id) {
                    Store.updateExpense({ id, amount, date, category, concept, type, method });
                } else {
                    Store.addExpense({ amount, date, category, concept, type, method });
                }
                
                app.resetExpenseForm();
                this.navigate('dashboard');
            });
        }

        const formAddCategory = document.getElementById('form-add-category');
        if (formAddCategory) {
            formAddCategory.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('cat-name').value;
                const limitVal = document.getElementById('cat-limit').value;
                const limit = limitVal ? parseFloat(limitVal) : 0;
                const icon = document.getElementById('cat-icon').value;
                const color = document.getElementById('cat-color').value;
                const textColor = document.getElementById('cat-text-color').value;
                const id = document.getElementById('cat-id').value;

                if (id) {
                    Store.updateCategory({ id, name, limit, icon, color, textColor });
                } else {
                    Store.addCategory({ name, limit, icon, color, textColor });
                }
                
                app.resetCategoryForm();
                this.renderSettings();
            });
        }

        // Color selector logic
        const colorBtns = document.querySelectorAll('.color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Reset all
                colorBtns.forEach(b => {
                    b.classList.remove('ring-2', 'ring-offset-2', 'ring-primary');
                    b.classList.add('opacity-60');
                });
                // Set active
                const target = e.currentTarget;
                target.classList.remove('opacity-60');
                target.classList.add('ring-2', 'ring-offset-2', 'ring-primary');
                
                document.getElementById('cat-color').value = target.dataset.color;
                document.getElementById('cat-text-color').value = target.dataset.text;
            });
        });

        // Icon selector logic
        const iconBtns = document.querySelectorAll('.icon-btn');
        iconBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Reset all
                iconBtns.forEach(b => {
                    b.classList.remove('ring-2', 'ring-offset-2', 'ring-primary', 'bg-surface-container-high', 'text-primary');
                    b.classList.add('bg-surface-container-lowest', 'border', 'border-outline-variant/20', 'text-on-surface-variant');
                });
                // Set active
                const target = e.currentTarget;
                target.classList.remove('bg-surface-container-lowest', 'border', 'border-outline-variant/20', 'text-on-surface-variant');
                target.classList.add('ring-2', 'ring-offset-2', 'ring-primary', 'bg-surface-container-high', 'text-primary');
                
                document.getElementById('cat-icon').value = target.dataset.icon;
            });
        });

        const btnCancelEdit = document.getElementById('btn-cancel-edit');
        if (btnCancelEdit) {
            btnCancelEdit.addEventListener('click', () => {
                app.resetCategoryForm();
            });
        }

        const btnCancelExpenseEdit = document.getElementById('btn-cancel-expense-edit');
        if (btnCancelExpenseEdit) {
            btnCancelExpenseEdit.addEventListener('click', () => {
                app.resetExpenseForm();
            });
        }

        const historySearch = document.getElementById('history-search');
        if (historySearch) {
            historySearch.addEventListener('input', (e) => {
                app.renderHistory(e.target.value.toLowerCase());
            });
        }
    },

    navigate(viewId) {
        this.currentView = viewId;
        
        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => {
            el.classList.remove('active');
            el.classList.add('hidden');
        });

        // Show target view
        const target = document.getElementById(`view-${viewId}`);
        if(target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }

        this.updateNavigationUI(viewId);
        
        // Render specific view data
        window.scrollTo(0,0);
        switch(viewId) {
            case 'dashboard': this.renderDashboard(); break;
            case 'history': this.renderHistory(); break;
            case 'annual': this.renderAnnual(); break;
            case 'settings': this.renderSettings(); break;
            case 'add-expense': this.renderAddExpenseForm(); break;
        }
    },

    updateNavigationUI(viewId) {
        // Update header
        const headerTitle = document.querySelector('#main-header h1');
        const headerIcon = document.getElementById('header-icon');
        const headerAddBtn = document.getElementById('header-add-btn');

        if (viewId === 'add-expense') {
            headerTitle.textContent = "DESPESES";
            headerIcon.textContent = "arrow_back";
            headerIcon.parentElement.onclick = () => this.navigate('dashboard');
            headerAddBtn.style.display = 'none';
        } else {
            headerTitle.textContent = "DESPESES";
            headerAddBtn.style.display = 'flex';
            headerIcon.parentElement.onclick = null; // reset
            
            // Set header icon based on view
            const icons = { 'dashboard': 'dashboard', 'history': 'receipt_long', 'annual': 'calendar_month', 'settings': 'settings' };
            headerIcon.textContent = icons[viewId] || 'dashboard';
        }

        // Update bottom nav
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.remove('bg-slate-900', 'text-white', 'dark:bg-amber-200', 'dark:text-slate-900', 'rounded-full');
            el.classList.add('opacity-60', 'text-slate-500');
        });

        // Add active state if it's one of the 4 main tabs
        const activeNav = document.getElementById(`nav-${viewId}`);
        if (activeNav) {
            activeNav.classList.remove('opacity-60', 'text-slate-500');
            activeNav.classList.add('bg-slate-900', 'text-white', 'dark:bg-amber-200', 'dark:text-slate-900', 'rounded-full');
        }
    },

    changeMonth(delta) {
        this.selectedMonthDate.setMonth(this.selectedMonthDate.getMonth() + delta);
        this.renderDashboard();
    },

    changeYear(delta) {
        this.selectedAnnualYear += delta;
        this.renderAnnual();
    },

    toggleTransactionType() {
        const typeInput = document.querySelector('input[name="exp-type"]:checked');
        if (!typeInput) return;
        const type = typeInput.value;
        const slider = document.getElementById('type-slider');
        const catGroup = document.getElementById('category-container');
        const title = document.getElementById('add-expense-title');
        const btnText = document.getElementById('submit-btn-text');
        
        if (type === 'income') {
            if (slider) slider.style.transform = 'translateX(100%)';
            if (catGroup) catGroup.style.display = 'none';
            if (btnText) btnText.textContent = "Guardar Ingrés";
        } else {
            if (slider) slider.style.transform = 'translateX(0)';
            if (catGroup) catGroup.style.display = 'block';
            if (btnText) btnText.textContent = "Guardar Despesa";
        }
    },

    // --- Renderers ---

    renderDashboard() {
        const expenses = Store.getExpenses();
        const categories = Store.getCategories();
        
        // Calculate Global Balances
        let cashBalance = 0;
        let bankBalance = 0;
        
        expenses.forEach(e => {
            const t = e.type || 'expense';
            const m = e.method || 'cash';
            const sign = t === 'income' ? 1 : -1;
            if (m === 'cash') cashBalance += e.amount * sign;
            else bankBalance += e.amount * sign;
        });
        
        const balanceCashE = document.getElementById('balance-cash');
        if (balanceCashE) balanceCashE.textContent = this.formatCurrency(cashBalance) + '€';
        const balanceBankE = document.getElementById('balance-bank');
        if (balanceBankE) balanceBankE.textContent = this.formatCurrency(bankBalance) + '€';
        
        // Filter this month ALL (Incomes + Expenses)
        const now = this.selectedMonthDate;
        const currentMonthAll = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        
        // Filter this month ONLY EXPENSES for charts
        const currentMonthExpenses = currentMonthAll.filter(e => (e.type || 'expense') === 'expense');

        const monthNames = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'];
        const monthText = document.getElementById('dashboard-month');
        if (monthText) {
            monthText.textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
        }

        const totalThisMonth = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        const globalBalance = cashBalance + bankBalance;
        const totalEl = document.getElementById('dashboard-total');
        if (totalEl) totalEl.textContent = this.formatCurrency(globalBalance);

        // Donut Chart logic
        const donutSvg = document.getElementById('donut-svg');
        const legendContainer = document.getElementById('donut-legend');
        
        donutSvg.innerHTML = `<circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#e1e3e4" stroke-width="3"></circle>`;
        legendContainer.innerHTML = '';

        if (totalThisMonth > 0) {
            let currentOffset = 0;
            
            categories.forEach(cat => {
                const catSpent = currentMonthExpenses.filter(e => e.category === cat.id).reduce((sum, e) => sum + e.amount, 0);
                if (catSpent > 0) {
                    const percent = (catSpent / totalThisMonth) * 100;
                    const dasharray = `${percent} ${100 - percent}`;
                    const hexColor = COLOR_HEX_MAP[cat.color] || '#192830';
                    
                    donutSvg.innerHTML += `<circle cx="18" cy="18" fill="transparent" r="15.915" stroke="${hexColor}" stroke-width="4" stroke-dasharray="${dasharray}" stroke-dashoffset="${-currentOffset}" class="transition-all duration-1000 ease-out"></circle>`;
                    
                    currentOffset += percent;
                    
                    // Add legend
                    legendContainer.innerHTML += `
                        <div class="flex items-center justify-between text-sm">
                            <div class="flex items-center gap-2">
                                <span class="w-3 h-3 rounded-full ${cat.color || 'bg-primary'} shadow-sm"></span>
                                <span class="text-on-surface-variant font-medium">${cat.name}</span>
                            </div>
                            <span class="font-bold text-primary">${Math.round(percent)}%</span>
                        </div>
                    `;
                }
            });
            document.getElementById('donut-center-text').textContent = `${this.formatCurrency(totalThisMonth)}`;
            document.getElementById('donut-center-text').nextElementSibling.textContent = "TOTAL (€)";
            document.getElementById('donut-center-text').classList.remove('text-2xl');
            document.getElementById('donut-center-text').classList.add('text-lg'); // Smaller to fit currency
        } else {
            document.getElementById('donut-center-text').textContent = `0€`;
            document.getElementById('donut-center-text').nextElementSibling.textContent = "SENSE DESPESES";
        }

        // Daily Bar Chart
        const barChartContainer = document.getElementById('daily-bar-chart');
        if (barChartContainer) {
            barChartContainer.innerHTML = '';
            
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            let dailyTotals = new Array(daysInMonth).fill(0);
            let dailyCategoryTotals = Array.from({ length: daysInMonth }, () => ({}));
            
            currentMonthExpenses.forEach(e => {
                const d = new Date(e.date);
                const dayIndex = d.getDate() - 1;
                dailyTotals[dayIndex] += e.amount;
                if (!dailyCategoryTotals[dayIndex][e.category]) dailyCategoryTotals[dayIndex][e.category] = 0;
                dailyCategoryTotals[dayIndex][e.category] += e.amount;
            });
            
            const maxDaily = Math.max(...dailyTotals, 1);
            
            const realNow = new Date();
            
            for (let i = 0; i < daysInMonth; i++) {
                const amount = dailyTotals[i];
                const heightPercent = amount > 0 ? Math.max((amount / maxDaily) * 100, 5) : 1; 
                const isToday = (i + 1 === realNow.getDate() && now.getMonth() === realNow.getMonth() && now.getFullYear() === realNow.getFullYear());
                
                let segmentsHtml = '';
                if (amount > 0) {
                    categories.forEach(cat => {
                        const catAmount = dailyCategoryTotals[i][cat.id] || 0;
                        if (catAmount > 0) {
                            const catPercent = (catAmount / amount) * 100;
                            // Add a thin border-top for a segmented look
                            segmentsHtml += `<div class="w-full ${cat.color} transition-all duration-300 border-t border-surface-container-lowest/20 first:border-0" style="height: ${catPercent}%"></div>`;
                        }
                    });
                } else {
                    segmentsHtml = `<div class="w-full bg-surface-container-highest transition-all duration-300 h-full"></div>`;
                }

                barChartContainer.innerHTML += `
                    <div class="flex flex-col justify-end w-full group relative h-full">
                        <!-- Tooltip placed outside overflow-hidden element -->
                        <div class="absolute left-1/2 -translate-x-1/2 mb-2 w-max bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-bold z-10 shadow-lg" style="bottom: ${heightPercent}%">
                            Dia ${i+1}: ${this.formatCurrency(amount)}€
                        </div>
                        <div class="w-full flex flex-col-reverse rounded-t-sm overflow-hidden transition-all duration-300 relative cursor-pointer ${isToday ? 'opacity-100 ring-2 ring-primary ring-offset-1' : 'opacity-80 hover:opacity-100'}" style="height: ${heightPercent}%">
                            ${segmentsHtml}
                        </div>
                    </div>
                `;
            }
        }

        // Budgets Progress
        const budgetContainer = document.getElementById('budget-progress-list');
        budgetContainer.innerHTML = '';
        
        categories.forEach(cat => {
            const catSpent = currentMonthExpenses.filter(e => e.category === cat.id).reduce((sum, e) => sum + e.amount, 0);
            const percent = cat.limit > 0 ? Math.min((catSpent / cat.limit) * 100, 100) : 0;
            const isOver = catSpent > cat.limit;

            budgetContainer.innerHTML += `
                <div class="bg-surface-container-lowest p-6 rounded-xl space-y-4">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg ${cat.color || 'bg-surface-container-high'} flex items-center justify-center transition-colors">
                                <span class="material-symbols-outlined ${cat.textColor || 'text-primary'}">${cat.icon}</span>
                            </div>
                            <div>
                                <p class="font-bold text-primary">${cat.name}</p>
                                <p class="text-xs text-on-surface-variant">Límit: ${this.formatCurrency(cat.limit)} €</p>
                            </div>
                        </div>
                        <p class="text-sm font-bold ${isOver ? 'text-error' : 'text-primary'}">${this.formatCurrency(catSpent)} €</p>
                    </div>
                    <div class="relative w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div class="absolute top-0 left-0 h-full ${isOver ? 'bg-error' : cat.color || 'bg-secondary'} rounded-full transition-all duration-500" style="width: ${percent}%"></div>
                    </div>
                </div>
            `;
        });

                const recentContainer = document.getElementById('recent-activity-list');
        if (recentContainer) {
            recentContainer.innerHTML = '';
            const recent = currentMonthAll.slice(0, 4); // Show all types
            
            if (recent.length === 0) {
                recentContainer.innerHTML = `
                    <div class="p-8 text-center text-on-surface-variant/50">
                        <span class="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                        <p class="font-medium">Encara no hi ha activitat</p>
                    </div>`;
            } else {
                recent.forEach(exp => {
                    const isIncome = exp.type === 'income';
                    let cat;
                    if (isIncome) {
                        cat = { icon: 'arrow_downward', name: 'Ingrés', color: 'bg-green-100', textColor: 'text-green-800' };
                    } else {
                        cat = categories.find(c => c.id === exp.category) || categories[0];
                    }
                    const methodIcon = exp.method === 'bank' ? 'credit_card' : 'payments';
                    
                    recentContainer.innerHTML += `
                        <div class="flex items-center justify-between p-5 hover:bg-surface-container-high transition-colors cursor-pointer relative overflow-hidden group/item border-b border-outline-variant/10 last:border-b-0">
                            ${isIncome ? '<div class="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>' : ''}
                            <div class="flex items-center gap-4 pl-1 flex-1 min-w-0">
                                <div class="w-12 h-12 rounded-full ${cat.color || 'bg-surface-container-lowest'} flex items-center justify-center transition-colors shadow-sm shrink-0">
                                    <span class="material-symbols-outlined ${cat.textColor || 'text-primary'}">${cat.icon}</span>
                                </div>
                                <div class="min-w-0">
                                    <div class="flex items-center gap-1">
                                        <p class="font-bold text-primary truncate">${exp.concept}</p>
                                        <span class="material-symbols-outlined text-[14px] text-on-surface-variant opacity-60 shrink-0" title="${exp.method === 'bank' ? 'Banc' : 'Efectiu'}">${methodIcon}</span>
                                    </div>
                                    <p class="text-xs text-on-surface-variant truncate">${this.formatDate(exp.date)} • ${cat.name}</p>
                                </div>
                            </div>
                            <div class="text-right shrink-0 ml-3">
                                <p class="font-bold text-sm whitespace-nowrap border px-2 py-0.5 rounded-md ${isIncome ? 'border-green-200 text-green-700 bg-green-50' : 'border-outline-variant/30 text-primary'}">${isIncome ? '+' : '-'}${this.formatCurrency(exp.amount)} €</p>
                            </div>
                        </div>
                    `;
                });
            }
        }
    },

    renderHistory(searchQuery = '') {
        let expenses = Store.getExpenses();
        const categories = Store.getCategories();
        const container = document.getElementById('history-list');

        if (searchQuery) {
            expenses = expenses.filter(exp => {
                const cat = categories.find(c => c.id === exp.category) || {};
                const catName = cat.name || '';
                return exp.concept.toLowerCase().includes(searchQuery) || catName.toLowerCase().includes(searchQuery);
            });
        }
        
        if (expenses.length === 0) {
            container.innerHTML = `<p class="text-center text-on-surface-variant mt-10">${searchQuery ? 'Cap resultat trobat.' : 'Sense historial. Totes les teves despeses apareixeran aquí.'}</p>`;
            return;
        }

        // Group by date
        const grouped = expenses.reduce((acc, exp) => {
            if (!acc[exp.date]) acc[exp.date] = [];
            acc[exp.date].push(exp);
            return acc;
        }, {});

        container.innerHTML = '';
        Object.keys(grouped).forEach(dateStr => {
            let itemsHtml = grouped[dateStr].map(exp => {
                const isIncome = exp.type === 'income';
                let cat;
                if (isIncome) {
                    cat = { icon: 'arrow_downward', name: 'Ingrés', color: 'bg-green-100', textColor: 'text-green-800' };
                } else {
                    cat = categories.find(c => c.id === exp.category) || categories[0];
                }
                const methodIcon = exp.method === 'bank' ? 'credit_card' : 'payments';

                return `
                    <div class="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between group hover:shadow-lg hover:shadow-black/5 transition-all cursor-pointer mb-3 border border-transparent hover:border-outline-variant/10 relative overflow-hidden">
                        ${isIncome ? '<div class="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500"></div>' : ''}
                        <div class="flex items-center gap-4 pl-1 flex-1 min-w-0">
                            <div class="w-12 h-12 rounded-lg ${cat.color || 'bg-surface-container'} flex items-center justify-center ${cat.textColor || 'text-primary'} group-hover:scale-105 transition-all shadow-sm shrink-0">
                                <span class="material-symbols-outlined">${cat.icon}</span>
                            </div>
                            <div class="min-w-0">
                                <div class="flex items-center gap-1">
                                    <p class="font-bold text-primary truncate">${exp.concept}</p>
                                    <span class="material-symbols-outlined text-[14px] text-on-surface-variant opacity-60 shrink-0" title="${exp.method === 'bank' ? 'Banc' : 'Efectiu'}">${methodIcon}</span>
                                </div>
                                <p class="text-xs text-on-surface-variant truncate">${cat.name}</p>
                            </div>
                        </div>
                        <div class="text-right flex flex-col items-end shrink-0 ml-3">
                            <p class="font-bold text-sm whitespace-nowrap ${isIncome ? 'text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200' : 'text-primary border border-outline-variant/30 px-2 py-0.5 rounded-md'}">${isIncome ? '+' : '-'}${this.formatCurrency(exp.amount)} €</p>
                            <div class="flex gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onclick="app.editExpense('${exp.id}')" class="text-[10px] text-on-surface-variant hover:text-primary uppercase tracking-tighter font-semibold">EDITAR</button>
                                <button onclick="app.deleteExpense('${exp.id}')" class="text-[10px] text-on-surface-variant hover:text-error uppercase tracking-tighter font-semibold">ESBORRAR</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML += `
                <section>
                    <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-outline mb-6 ml-1">${this.formatDate(dateStr)}</h3>
                    <div class="space-y-3">
                        ${itemsHtml}
                    </div>
                </section>
            `;
        });
    },

    renderAnnual() {
        const expenses = Store.getExpenses();
        const year = this.selectedAnnualYear;
        
        const yearText = document.getElementById('annual-year-text');
        if (yearText) yearText.textContent = year;
        
        const yearExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === year && e.type !== 'income';
        });
        
        const total = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        // Very basic simple calculation for demo
        const activeMonths = new Set(yearExpenses.map(e => e.date.substring(0,7))).size;
        const avg = activeMonths > 0 ? (total / activeMonths) : 0;
        
        document.getElementById('annual-total').textContent = this.formatCurrency(total);
        document.getElementById('annual-average').textContent = this.formatCurrency(avg);

        // Chart
        const chartContainer = document.getElementById('annual-chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = '';
            
            let monthlyTotals = new Array(12).fill(0);
            let monthlyCategoryTotals = Array.from({ length: 12 }, () => ({}));
            
            yearExpenses.forEach(e => {
                const m = new Date(e.date).getMonth();
                monthlyTotals[m] += e.amount;
                if (!monthlyCategoryTotals[m][e.category]) monthlyCategoryTotals[m][e.category] = 0;
                monthlyCategoryTotals[m][e.category] += e.amount;
            });
            
            const maxMonth = Math.max(...monthlyTotals, 1);
            const monthInitials = ['G', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
            const monthNames = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'];
            
            const realNow = new Date();
            const categories = Store.getCategories();
            
            for (let i = 0; i < 12; i++) {
                const amount = monthlyTotals[i];
                const heightPercent = amount > 0 ? Math.max((amount / maxMonth) * 100, 5) : 1; 
                const isCurrentMonth = (i === realNow.getMonth() && year === realNow.getFullYear());
                
                let segmentsHtml = '';
                if (amount > 0) {
                    categories.forEach(cat => {
                        const catAmount = monthlyCategoryTotals[i][cat.id] || 0;
                        if (catAmount > 0) {
                            const catPercent = (catAmount / amount) * 100;
                            // Add a thin border-top for a segmented look
                            segmentsHtml += `<div class="w-full ${cat.color} transition-all duration-300 border-t border-surface-container-lowest/20 first:border-0" style="height: ${catPercent}%"></div>`;
                        }
                    });
                } else {
                    segmentsHtml = `<div class="w-full bg-surface-container-highest transition-all duration-300 h-full"></div>`;
                }
                
                chartContainer.innerHTML += `
                    <div class="flex flex-col justify-end items-center w-full group relative h-full">
                        <!-- Tooltip placed outside overflow-hidden element -->
                        <div class="absolute left-1/2 -translate-x-1/2 mb-2 w-max bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-bold z-10 shadow-lg" style="bottom: ${heightPercent}%">
                            ${monthNames[i]}: ${this.formatCurrency(amount)}€
                        </div>
                        <div class="w-full max-w-[32px] md:max-w-[48px] flex flex-col-reverse rounded-t-sm overflow-hidden transition-all duration-300 relative cursor-pointer opacity-90 hover:opacity-100 hover:ring-2 ring-primary ring-offset-2" style="height: ${heightPercent}%">
                            ${segmentsHtml}
                        </div>
                        <span class="text-[10px] font-bold text-on-surface-variant mt-2 ${isCurrentMonth ? 'text-primary' : ''}">${monthInitials[i]}</span>
                    </div>
                `;
            }
        }
    },

    renderSettings() {
        const categories = Store.getCategories();
        const container = document.getElementById('settings-categories-list');
        container.innerHTML = '';
        
        categories.forEach(cat => {
            container.innerHTML += `
                <div class="bg-surface-container-lowest rounded-xl p-5 flex items-center justify-between group hover:shadow-md transition-shadow">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full ${cat.color || 'bg-primary-fixed'} flex items-center justify-center ${cat.textColor || 'text-on-primary-fixed-variant'}">
                            <span class="material-symbols-outlined">${cat.icon}</span>
                        </div>
                        <div>
                            <h3 class="font-bold text-primary">${cat.name}</h3>
                            <p class="text-sm text-on-surface-variant">Límit: <span class="font-semibold text-primary">${this.formatCurrency(cat.limit)}€</span></p>
                        </div>
                    </div>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="app.editCategory('${cat.id}')" class="p-2 text-on-surface-variant hover:text-primary transition-colors">
                            <span class="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onclick="app.deleteCategory('${cat.id}')" class="p-2 text-on-surface-variant hover:text-error transition-colors">
                            <span class="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    </div>
                </div>
            `;
        });
    },

    renderAddExpenseForm() {
        const select = document.getElementById('exp-category');
        select.innerHTML = '';
        Store.getCategories().forEach(cat => {
            select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
        
        // Auto-set today's date
        document.getElementById('exp-date').valueAsDate = new Date();
    },

    deleteExpense(id) {
        if(confirm("Segur que vols esborrar aquesta despesa?")) {
            Store.deleteExpense(id);
            this.renderHistory();
        }
    },
    
    editExpense(id) {
        const exp = Store.getExpenses().find(e => e.id === id);
        if (!exp) return;
        
        this.navigate('add-expense');
        
        document.getElementById('exp-id').value = exp.id;
        document.getElementById('exp-amount').value = exp.amount;
        document.getElementById('exp-date').value = exp.date.substring(0, 10);
        document.getElementById('exp-concept').value = exp.concept;
        
        const type = exp.type || 'expense';
        const method = exp.method || 'cash';
        
        const typeInput = document.querySelector(`input[name="exp-type"][value="${type}"]`);
        if (typeInput) typeInput.checked = true;
        
        const methodInput = document.querySelector(`input[name="exp-method"][value="${method}"]`);
        if (methodInput) methodInput.checked = true;
        
        if (type !== 'income') {
            document.getElementById('exp-category').value = exp.category;
        }
        
        this.toggleTransactionType();
        
        document.getElementById('submit-btn-text').textContent = "Actualitzar";
        document.getElementById('btn-cancel-expense-edit').classList.remove('hidden');
        
        window.scrollTo(0, 0);
    },

    resetExpenseForm() {
        const form = document.getElementById('form-add-expense');
        if (form) form.reset();
        document.getElementById('exp-id').value = '';
        
        const typeInput = document.querySelector('input[name="exp-type"][value="expense"]');
        if (typeInput) typeInput.checked = true;
        
        const methodInput = document.querySelector('input[name="exp-method"][value="cash"]');
        if (methodInput) methodInput.checked = true;
        
        this.toggleTransactionType();
        document.getElementById('exp-date').valueAsDate = new Date();
        
        document.getElementById('submit-btn-text').textContent = "Guardar Despesa";
        
        const cancelBtn = document.getElementById('btn-cancel-expense-edit');
        if (cancelBtn) cancelBtn.classList.add('hidden');
    },
    
    deleteCategory(id) {
        if(confirm("Segur que vols esborrar aquesta categoria?")) {
            Store.deleteCategory(id);
            this.renderSettings();
        }
    },

    editCategory(id) {
        const cat = Store.getCategories().find(c => c.id === id);
        if (!cat) return;
        
        document.getElementById('cat-id').value = cat.id;
        document.getElementById('cat-name').value = cat.name;
        document.getElementById('cat-limit').value = cat.limit > 0 ? cat.limit : '';
        document.getElementById('cat-icon').value = cat.icon;
        document.getElementById('cat-color').value = cat.color;
        document.getElementById('cat-text-color').value = cat.textColor;
        
        // Update UI
        document.getElementById('form-category-title').textContent = "Editar Categoria";
        document.getElementById('btn-cancel-edit').classList.remove('hidden');
        
        // Update color picker selection
        const colorBtns = document.querySelectorAll('.color-btn');
        colorBtns.forEach(b => {
            b.classList.remove('ring-2', 'ring-offset-2', 'ring-primary');
            b.classList.add('opacity-60');
            if (b.dataset.color === cat.color) {
                b.classList.remove('opacity-60');
                b.classList.add('ring-2', 'ring-offset-2', 'ring-primary');
            }
        });

        // Update icon picker selection
        const iconBtns = document.querySelectorAll('.icon-btn');
        iconBtns.forEach(b => {
            b.classList.remove('ring-2', 'ring-offset-2', 'ring-primary', 'bg-surface-container-high', 'text-primary');
            b.classList.add('bg-surface-container-lowest', 'border', 'border-outline-variant/20', 'text-on-surface-variant');
            if (b.dataset.icon === cat.icon) {
                b.classList.remove('bg-surface-container-lowest', 'border', 'border-outline-variant/20', 'text-on-surface-variant');
                b.classList.add('ring-2', 'ring-offset-2', 'ring-primary', 'bg-surface-container-high', 'text-primary');
            }
        });
        
        // Scroll to form
        document.getElementById('form-add-category').scrollIntoView({ behavior: 'smooth' });
    },

    resetCategoryForm() {
        document.getElementById('form-add-category').reset();
        document.getElementById('cat-id').value = '';
        document.getElementById('form-category-title').textContent = "Nova Categoria";
        document.getElementById('btn-cancel-edit').classList.add('hidden');
        
        // Reset color picker active state to first color
        const colorBtns = document.querySelectorAll('.color-btn');
        if (colorBtns.length > 0) {
            colorBtns.forEach(b => {
                b.classList.remove('ring-2', 'ring-offset-2', 'ring-primary');
                b.classList.add('opacity-60');
            });
            colorBtns[0].classList.remove('opacity-60');
            colorBtns[0].classList.add('ring-2', 'ring-offset-2', 'ring-primary');
            document.getElementById('cat-color').value = colorBtns[0].dataset.color;
            document.getElementById('cat-text-color').value = colorBtns[0].dataset.text;
        }

        // Reset icon picker active state to first icon
        const iconBtns = document.querySelectorAll('.icon-btn');
        if (iconBtns.length > 0) {
            iconBtns.forEach(b => {
                b.classList.remove('ring-2', 'ring-offset-2', 'ring-primary', 'bg-surface-container-high', 'text-primary');
                b.classList.add('bg-surface-container-lowest', 'border', 'border-outline-variant/20', 'text-on-surface-variant');
            });
            iconBtns[0].classList.remove('bg-surface-container-lowest', 'border', 'border-outline-variant/20', 'text-on-surface-variant');
            iconBtns[0].classList.add('ring-2', 'ring-offset-2', 'ring-primary', 'bg-surface-container-high', 'text-primary');
            document.getElementById('cat-icon').value = iconBtns[0].dataset.icon;
        }
    },

    // --- Utils ---
    formatCurrency(amount) {
        return amount.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    
    formatDate(dateStr) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('ca-ES', options);
    }
};

window.app = app;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Initialize or load JSON data
let data = JSON.parse(localStorage.getItem('financeData')) || {
    monthlyBudget: 50000,
    accounts: { UBI: 0, HDFC: 0, Axis: 0 },
    transactions: []
};

// UI Navigation
function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(id === 'dashboard') updateDashboard();
    if(id === 'analytics') renderAnalytics();
}

// Handle Form Submission
document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const trans = {
        id: Date.now(),
        type: document.getElementById('type').value,
        amount: parseFloat(document.getElementById('amount').value),
        account: document.getElementById('account').value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };

    // Update account balances
    if (trans.type === 'expense') {
        data.accounts[trans.account] -= trans.amount;
    } else {
        data.accounts[trans.account] += trans.amount;
    }

    data.transactions.push(trans);
    localStorage.setItem('financeData', JSON.stringify(data));
    
    alert('Transaction saved!');
    this.reset();
});

// Calculate and Update Dashboard
function updateDashboard() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Calculate Yesterday's Spend
    const yesterdaySpend = data.transactions
        .filter(t => t.date === yesterdayStr && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    // Calculate Remaining Budget (Current Month)
    const currentMonthStr = today.toISOString().slice(0, 7); // YYYY-MM
    const currentMonthSpend = data.transactions
        .filter(t => t.date.startsWith(currentMonthStr) && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const remainingBudget = data.monthlyBudget - currentMonthSpend;

    // Update UI
    document.getElementById('yesterday-spend').innerText = `₹${yesterdaySpend}`;
    document.getElementById('remaining-budget').innerText = `₹${remainingBudget}`;
    document.getElementById('bal-ubi').innerText = `₹${data.accounts.UBI}`;
    document.getElementById('bal-hdfc').innerText = `₹${data.accounts.HDFC}`;
    document.getElementById('bal-axis').innerText = `₹${data.accounts.Axis}`;
}

// Render Analytics Chart
let chartInstance = null;
function renderAnalytics() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    // Group expenses by category
    const categoryTotals = {};
    data.transactions.filter(t => t.type === 'expense').forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    if (chartInstance) chartInstance.destroy(); // Clear previous chart

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                label: 'Total Spend by Category (₹)',
                data: Object.values(categoryTotals),
                backgroundColor: '#007bff'
            }]
        },
        options: { responsive: true }
    });
}

// Initial Load
updateDashboard();
// Set date input to today by default
document.getElementById('date').value = new Date().toISOString().split('T')[0];
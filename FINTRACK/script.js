// Initialize Gemini API (Replace with your API key)
require('dotenv').config();
const API_KEY = process.env.API_KEY;
console.log(API_KEY);
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// User Management Class
class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;
        this.initializeDates();
    }

    initializeDates() {
        const today = new Date().toISOString().split('T')[0];
        if (document.getElementById('incomeDate')) {
            document.getElementById('incomeDate').value = today;
        }
        if (document.getElementById('expenseDate')) {
            document.getElementById('expenseDate').value = today;
        }
    }

    signup(email, password, confirmPassword) {
        if (!email || !password || !confirmPassword) {
            throw new Error('All fields are required');
        }
        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        if (this.users.find(user => user.email === email)) {
            throw new Error('Email already registered');
        }

        const newUser = {
            id: Date.now().toString(),
            email,
            password: this.hashPassword(password),
            transactions: [],
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();
        return newUser;
    }

    login(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const user = this.users.find(u => u.email === email);
        if (!user || user.password !== this.hashPassword(password)) {
            throw new Error('Invalid email or password');
        }

        this.currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }

    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
    }

    hashPassword(password) {
        return btoa(password);
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    addTransaction(transaction) {
        if (!this.currentUser) return false;

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex].transactions.push(transaction);
            this.currentUser = this.users[userIndex];
            this.saveUsers();
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return true;
        }
        return false;
    }
}

// Chart Manager Class
// Chart Manager Class with simplified expense visualization
class ChartManager {
    static updateExpenseChart(transactions) {
        const ctx = document.getElementById('expenseChart').getContext('2d');

        // Get only expense transactions
        const expenses = transactions.filter(t => t.type === 'expense');

        // Calculate total spending by category
        const categoryTotals = expenses.reduce((acc, transaction) => {
            acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
            return acc;
        }, {});

        // Prepare data for chart
        const categories = Object.keys(categoryTotals);
        const amounts = Object.values(categoryTotals);
        const backgroundColors = [
            'rgba(255, 99, 132, 0.7)',   // Red
            'rgba(54, 162, 235, 0.7)',   // Blue
            'rgba(255, 206, 86, 0.7)',   // Yellow
            'rgba(75, 192, 192, 0.7)',   // Teal
            'rgba(153, 102, 255, 0.7)',  // Purple
            'rgba(255, 159, 64, 0.7)',   // Orange
            'rgba(201, 203, 207, 0.7)'   // Grey
        ];

        // Destroy existing chart if it exists
        if (window.expenseChart) {
            window.expenseChart.destroy();
        }

        // Create new chart
        window.expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: backgroundColors.slice(0, categories.length),
                    borderWidth: 1,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Expense Distribution by Category',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const value = context.raw;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Add total expenses text below the chart
        const totalExpenses = amounts.reduce((a, b) => a + b, 0);
        const chartContainer = document.getElementById('expenseChart').parentElement;
        
        // Remove existing total if present
        const existingTotal = chartContainer.querySelector('.total-expenses');
        if (existingTotal) {
            existingTotal.remove();
        }

        // Add new total
        const totalElement = document.createElement('div');
        totalElement.className = 'total-expenses';
        totalElement.style.textAlign = 'center';
        totalElement.style.marginTop = '20px';
        totalElement.style.fontSize = '16px';
        totalElement.style.fontWeight = 'bold';
        totalElement.innerHTML = `Total Expenses: $${totalExpenses.toFixed(2)}`;
        chartContainer.appendChild(totalElement);
    }
}

// Update the loadDashboard function to only use the expense chart
function loadDashboard() {
    if (!userManager.currentUser) return;

    updateSummary();
    updateTransactionsList();
    ChartManager.updateExpenseChart(userManager.currentUser.transactions);
}
// Financial Advisor Class for AI Integration
class FinancialAdvisor {
    static async getAdvice(transactions) {
        // Calculate financial metrics
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expensesByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        // Prepare the prompt for Gemini
        const prompt = `
            Based on the following financial data, provide personalized financial advice:
            - Total Income: $${totalIncome.toFixed(2)}
            - Total Expenses: $${totalExpenses.toFixed(2)}
            - Savings Rate: ${((totalIncome - totalExpenses) / totalIncome * 100).toFixed(2)}%
            - Expense Breakdown by Category:
            ${Object.entries(expensesByCategory)
                .map(([category, amount]) => 
                    `  * ${category}: $${amount.toFixed(2)} (${(amount/totalExpenses*100).toFixed(2)}%)`)
                .join('\n')}

            Please provide specific advice on:
            1. Spending patterns and areas for potential savings
            2. Budget allocation recommendations
            3. Financial goals and strategies
            Keep the response concise and actionable.
        `;

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get AI advice');
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error getting AI advice:', error);
            return 'Unable to generate advice at this moment. Please try again later.';
        }
    }
}

// Helper Functions
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function showLogin() {
    loginPage.style.display = 'flex';
    dashboardPage.style.display = 'none';
}

function showDashboard() {
    loginPage.style.display = 'none';
    dashboardPage.style.display = 'block';
    document.getElementById('userEmail').textContent = userManager.currentUser.email;
}

function handleLogout() {
    userManager.logout();
    showLogin();
    loginForm.reset();
    authError.textContent = '';
}

function updateSummary() {
    const transactions = userManager.currentUser.transactions;
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;

    document.getElementById('totalBalance').textContent = `$${balance.toFixed(2)}`;
    document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
}

function updateTransactionsList() {
    const listElement = document.getElementById('transactionsList');
    const transactions = [...userManager.currentUser.transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    listElement.innerHTML = transactions.map(transaction => `
        <div class="transaction-item ${transaction.type}">
            <div class="transaction-info">
                <span class="transaction-date">
                    ${new Date(transaction.date).toLocaleDateString()}
                </span>
                <span class="transaction-description">
                    ${transaction.description} (${transaction.category})
                </span>
            </div>
            <span class="transaction-amount">
                ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </span>
        </div>
    `).join('');
}

function loadDashboard() {
    if (!userManager.currentUser) return;

    updateSummary();
    updateTransactionsList();
    ChartManager.updateBalanceChart(userManager.currentUser.transactions);
    ChartManager.updateExpenseChart(userManager.currentUser.transactions);
}

// Initialize User Manager
const userManager = new UserManager();

// DOM Elements
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const signupModal = document.getElementById('signupModal');
const signupForm = document.getElementById('signupForm');
const signupLink = document.getElementById('signupLink');
const closeSignupBtn = document.getElementById('closeSignup');
const logoutBtn = document.getElementById('logoutBtn');
const incomeForm = document.getElementById('incomeForm');
const expenseForm = document.getElementById('expenseForm');
const authError = document.getElementById('authError');
const signupError = document.getElementById('signupError');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    if (userManager.currentUser) {
        showDashboard();
        loadDashboard();
    } else {
        showLogin();
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        await userManager.login(email, password);
        showDashboard();
        loadDashboard();
        authError.textContent = '';
    } catch (error) {
        authError.textContent = error.message;
    }
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        await userManager.signup(email, password, confirmPassword);
        signupModal.style.display = 'none';
        signupForm.reset();
        signupError.textContent = '';
        alert('Account created successfully! Please login.');
    } catch (error) {
        signupError.textContent = error.message;
    }
});

async function handleIncome(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const transaction = {
        type: 'income',
        amount: amount,
        category: document.getElementById('incomeCategory').value,
        description: document.getElementById('incomeDescription').value,
        date: document.getElementById('incomeDate').value,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
    };
    if (userManager.addTransaction(transaction)) {
        e.target.reset();
        userManager.initializeDates();
        loadDashboard();
    }
}

async function handleExpense(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const transaction = {
        type: 'expense',
        amount: amount,
        category: document.getElementById('expenseCategory').value,
        description: document.getElementById('expenseDescription').value,
        date: document.getElementById('expenseDate').value,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
    };

    if (userManager.addTransaction(transaction)) {
        e.target.reset();
        userManager.initializeDates();
        loadDashboard();
    }
}

// Additional Event Listeners
incomeForm.addEventListener('submit', handleIncome);
expenseForm.addEventListener('submit', handleExpense);
logoutBtn.addEventListener('click', handleLogout);

signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupModal.style.display = 'flex';
});

closeSignupBtn.addEventListener('click', () => {
    signupModal.style.display = 'none';
    signupForm.reset();
    signupError.textContent = '';
});

// AI Advice Button Event Listener
document.getElementById('getAdviceBtn').addEventListener('click', async () => {
    const adviceResponse = document.getElementById('aiResponse');
    const loadingText = 'Analyzing your financial data...';
    adviceResponse.textContent = loadingText;
    
    try {
        const advice = await FinancialAdvisor.getAdvice(userManager.currentUser.transactions);
        adviceResponse.textContent = advice;
    } catch (error) {
        console.error('AI Advice Error:', error);
        adviceResponse.textContent = 'Unable to generate financial advice at this moment. Please try again later.';
    }
});

// Click outside modal to close
window.onclick = (e) => {
    if (e.target === signupModal) {
        signupModal.style.display = 'none';
        signupForm.reset();
        signupError.textContent = '';
    }
};

// Function to clear all data (for testing purposes)
function clearAllData() {
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
}

// Chart.js Configuration
Chart.defaults.font.family = "'Segoe UI', system-ui, -apple-system, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 4;
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
Chart.defaults.plugins.legend.position = 'top';
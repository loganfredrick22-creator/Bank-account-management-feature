/**
 * APEX GLOBAL BANK - APPLICATION LOGIC
 * Runs entirely in the browser using HTML5 localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // MODULE 1: CONSTANTS & STATE MANAGEMENT
  // ==========================================================================
  const STORAGE_KEY_ACCOUNTS = 'apex_bank_accounts';
  const STORAGE_KEY_TRANSACTIONS = 'apex_bank_transactions';

  const DEFAULT_ACCOUNTS = {
    checking: { id: 'checking', name: 'Checking Account', number: '4821', balance: 2500.00 },
    savings: { id: 'savings', name: 'High-Yield Savings', number: '9033', balance: 10000.00 }
  };

  const DEFAULT_TRANSACTIONS = [
    { id: 'TX1002', date: new Date(Date.now() - 86400000).toISOString(), account: 'savings', type: 'DEPOSIT', amount: 10000.00, description: 'Initial Savings Deposit' },
    { id: 'TX1001', date: new Date(Date.now() - 172800000).toISOString(), account: 'checking', type: 'DEPOSIT', amount: 2500.00, description: 'Initial Checking Balance' }
  ];

  let APP_STATE = {
    accounts: {},
    transactions: []
  };

  let alertTimeout = null;

  function loadStateFromLocalStorage() {
    try {
      const accountsData = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
      const transactionsData = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);

      if (accountsData && transactionsData) {
        APP_STATE.accounts = JSON.parse(accountsData);
        APP_STATE.transactions = JSON.parse(transactionsData);
      } else {
        initializeDefaultState();
      }
    } catch (error) {
      console.warn('Storage read error, loading default state:', error);
      initializeDefaultState();
    }
  }

  function initializeDefaultState() {
    APP_STATE.accounts = JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS));
    APP_STATE.transactions = JSON.parse(JSON.stringify(DEFAULT_TRANSACTIONS));
    saveStateToLocalStorage();
  }

  function saveStateToLocalStorage() {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(APP_STATE.accounts));
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(APP_STATE.transactions));
  }

  // ==========================================================================
  // MODULE 2: UI UTILITIES & ALERTS
  // ==========================================================================
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('alertContainer');
    if (!alertBox) return;

    alertBox.textContent = message;
    alertBox.className = `alert-container alert-${type}`;

    if (alertTimeout) clearTimeout(alertTimeout);

    alertTimeout = setTimeout(() => {
      alertBox.classList.add('hidden');
    }, 4000);
  }

  function generateTransactionId() {
    return 'TX' + Math.floor(100000 + Math.random() * 900000);
  }

  // ==========================================================================
  // MODULE 3: UI RENDER FUNCTIONS
  // ==========================================================================
  function renderAllUI() {
    renderDashboardMetrics();
    renderAccountBalances();
    renderTransactionLedger();
  }

  function renderDashboardMetrics() {
    const checkingBal = APP_STATE.accounts.checking?.balance || 0;
    const savingsBal = APP_STATE.accounts.savings?.balance || 0;
    const totalBalance = checkingBal + savingsBal;

    let totalInflow = 0;
    let totalOutflow = 0;

    APP_STATE.transactions.forEach(tx => {
      if (tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN') {
        totalInflow += tx.amount;
      } else if (tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER_OUT') {
        totalOutflow += tx.amount;
      }
    });

    document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);
    document.getElementById('activeAccountsCount').textContent = Object.keys(APP_STATE.accounts).length;
    document.getElementById('totalInflow').textContent = formatCurrency(totalInflow);
    document.getElementById('totalOutflow').textContent = formatCurrency(totalOutflow);
  }

  function renderAccountBalances() {
    document.getElementById('checkingBalance').textContent = formatCurrency(APP_STATE.accounts.checking.balance);
    document.getElementById('savingsBalance').textContent = formatCurrency(APP_STATE.accounts.savings.balance);
  }

  function renderTransactionLedger() {
    const filterValue = document.getElementById('ledgerFilter').value;
    const tableBody = document.getElementById('ledgerTableBody');
    const emptyMessage = document.getElementById('emptyLedgerMessage');

    tableBody.innerHTML = '';

    const filteredTransactions = APP_STATE.transactions.filter(tx => {
      if (filterValue === 'all') return true;
      return tx.account === filterValue;
    });

    if (filteredTransactions.length === 0) {
      emptyMessage.classList.remove('hidden');
      return;
    } else {
      emptyMessage.classList.add('hidden');
    }

    filteredTransactions.forEach(tx => {
      const isNegative = tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER_OUT';
      const amountClass = isNegative ? 'text-danger' : 'text-success';
      const amountPrefix = isNegative ? '-' : '+';
      const accountName = APP_STATE.accounts[tx.account]?.name || tx.account;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formatDate(tx.date)}</td>
        <td><code>${tx.id}</code></td>
        <td>${escapeHTML(accountName)}</td>
        <td><strong class="${amountClass}">${tx.type}</strong></td>
        <td>${escapeHTML(tx.description)}</td>
        <td class="text-right ${amountClass}"><strong>${amountPrefix}${formatCurrency(tx.amount)}</strong></td>
      `;
      tableBody.appendChild(row);
    });
  }

  // ==========================================================================
  // MODULE 4: TRANSACTION HANDLERS & VALIDATION
  // ==========================================================================
  function handleDepositSubmission(e) {
    e.preventDefault();
    const accountType = document.getElementById('depositAccount').value;
    const amountInput = document.getElementById('depositAmount');
    const descInput = document.getElementById('depositDescription');

    const amount = parseFloat(amountInput.value);
    const description = descInput.value.trim() || 'Direct Deposit';

    if (isNaN(amount) || amount <= 0) {
      showAlert('Please enter a valid deposit amount greater than $0.00', 'error');
      return;
    }

    // Process State Update
    APP_STATE.accounts[accountType].balance += amount;

    const newTx = {
      id: generateTransactionId(),
      date: new Date().toISOString(),
      account: accountType,
      type: 'DEPOSIT',
      amount: amount,
      description: description
    };

    APP_STATE.transactions.unshift(newTx);
    saveStateToLocalStorage();
    renderAllUI();

    showAlert(`Successfully deposited ${formatCurrency(amount)} into ${APP_STATE.accounts[accountType].name}.`, 'success');
    e.target.reset();
  }

  function handleWithdrawalSubmission(e) {
    e.preventDefault();
    const accountType = document.getElementById('withdrawAccount').value;
    const amountInput = document.getElementById('withdrawAmount');
    const descInput = document.getElementById('withdrawDescription');

    const amount = parseFloat(amountInput.value);
    const description = descInput.value.trim() || 'Withdrawal';

    if (isNaN(amount) || amount <= 0) {
      showAlert('Please enter a valid withdrawal amount greater than $0.00', 'error');
      return;
    }

    const currentBalance = APP_STATE.accounts[accountType].balance;
    if (amount > currentBalance) {
      showAlert(`Transaction declined! Insufficient funds in ${APP_STATE.accounts[accountType].name} (${formatCurrency(currentBalance)} available).`, 'error');
      return;
    }

    // Process State Update
    APP_STATE.accounts[accountType].balance -= amount;

    const newTx = {
      id: generateTransactionId(),
      date: new Date().toISOString(),
      account: accountType,
      type: 'WITHDRAWAL',
      amount: amount,
      description: description
    };

    APP_STATE.transactions.unshift(newTx);
    saveStateToLocalStorage();
    renderAllUI();

    showAlert(`Successfully withdrew ${formatCurrency(amount)} from ${APP_STATE.accounts[accountType].name}.`, 'success');
    e.target.reset();
  }

  function handleTransferSubmission(e) {
    e.preventDefault();
    const fromAccount = document.getElementById('transferFrom').value;
    const toAccount = document.getElementById('transferTo').value;
    const amountInput = document.getElementById('transferAmount');
    const descInput = document.getElementById('transferDescription');

    const amount = parseFloat(amountInput.value);
    const memo = descInput.value.trim();

    if (fromAccount === toAccount) {
      showAlert('Transfer source and destination accounts must be different.', 'error');
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      showAlert('Please enter a valid transfer amount greater than $0.00', 'error');
      return;
    }

    const sourceBalance = APP_STATE.accounts[fromAccount].balance;
    if (amount > sourceBalance) {
      showAlert(`Transfer declined! Insufficient funds in ${APP_STATE.accounts[fromAccount].name}.`, 'error');
      return;
    }

    // Process State Updates
    APP_STATE.accounts[fromAccount].balance -= amount;
    APP_STATE.accounts[toAccount].balance += amount;

    const baseTxId = generateTransactionId();
    const memoSuffix = memo ? ` - ${memo}` : '';

    const transferOutTx = {
      id: baseTxId + 'A',
      date: new Date().toISOString(),
      account: fromAccount,
      type: 'TRANSFER_OUT',
      amount: amount,
      description: `Transfer to ${APP_STATE.accounts[toAccount].name}${memoSuffix}`
    };

    const transferInTx = {
      id: baseTxId + 'B',
      date: new Date().toISOString(),
      account: toAccount,
      type: 'TRANSFER_IN',
      amount: amount,
      description: `Transfer from ${APP_STATE.accounts[fromAccount].name}${memoSuffix}`
    };

    APP_STATE.transactions.unshift(transferOutTx, transferInTx);
    saveStateToLocalStorage();
    renderAllUI();

    showAlert(`Successfully transferred ${formatCurrency(amount)} from ${APP_STATE.accounts[fromAccount].name} to ${APP_STATE.accounts[toAccount].name}.`, 'success');
    e.target.reset();
  }

  // ==========================================================================
  // MODULE 5: EVENT LISTENERS & SETUP
  // ==========================================================================
  function setupEventListeners() {
    // 1. Navigation Tab Switching (Sidebar & Smooth Scroll)
    const sidebarLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });

    // 2. Transact Action Tab Switching
    const tabButtons = document.querySelectorAll('#actionTabs .tab-btn');
    const forms = document.querySelectorAll('.transaction-form');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const targetFormId = button.getAttribute('data-tab');
        forms.forEach(form => {
          if (form.id === targetFormId) {
            form.classList.remove('hidden-form');
            form.classList.add('active-form');
          } else {
            form.classList.remove('active-form');
            form.classList.add('hidden-form');
          }
        });
      });
    });

    // 3. Form Submissions
    document.getElementById('depositForm').addEventListener('submit', handleDepositSubmission);
    document.getElementById('withdrawForm').addEventListener('submit', handleWithdrawalSubmission);
    document.getElementById('transferForm').addEventListener('submit', handleTransferSubmission);

    // 4. Ledger Filter
    document.getElementById('ledgerFilter').addEventListener('change', renderTransactionLedger);

    // 5. Reset Data Button
    document.getElementById('resetDataBtn').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all accounts and transaction history back to defaults?')) {
        localStorage.clear();
        initializeDefaultState();
        renderAllUI();
        showAlert('Application state has been reset to defaults.', 'success');
      }
    });
  }

  // ==========================================================================
  // INITIALIZATION ENTRY POINT
  // ==========================================================================
  loadStateFromLocalStorage();
  setupEventListeners();
  renderAllUI();
});
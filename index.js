// MODULE 1: STATE MANAGEMENT & LOCAL STORAGE PERSISTENCE
const STORAGE_KEY_ACCOUNTS = "apex_bank_accounts";
const STORAGE_KEY_TRANSACTIONS = "apex_bank_transactions";

const defaultAccount={
    checking: { id: "checking", name: "Checking Account", number: "4821", balance: 2500.00 },
    savings: { id: "savings", name: "High-Yield Savings", number: "9033", balance: 10000.00 }
}
//Default transaction data

const defaultTransactions = [
    {
   id : crypto.randomUUID(),
   date : new Date().toISOString(),
   accountID: checking.id,
   type:"deposit",
   amount:1000,
   description: "Initial deposit"
    },

    {
   id:crypto.randomUUID(),
   date : new Date().toISOString(),
   accountID: savings.id,
   type:"Deposit",
   amount:500,
   description: "Initial savings"
    }


];
//Local storage logic

function loadData(storageKey, defaultData){
 try{
   const savedData = localStorage.getItem(storageKey);
   if(savedData === null){
       return structuredClone(defaultData);
   }
   return JSON.parse(savedData);
 } catch{
  console.error(`Failed to load ${storageKey}:`, error);

        return structuredClone(defaultData);
    }
}

// 5. INITIALIZE APPLICATION STATE
const accounts = loadData(
    STORAGE_KEY_ACCOUNTS,
    defaultAccount
);

const transactions = loadData(
    STORAGE_KEY_TRANSACTIONS,
    defaultTransactions
);


// 6. SAVE DATA TO LOCAL STORAGE
function storeData(storageKey, data){
  try{
  localStorage.setItem(storageKey,JSON.stringify(data));
  return true;
  }catch{
    console.error("Failed to save${storageKey}:", error);
    return false;
  }

}

if(localStorage.getItem(STORAGE_KEY_ACCOUNTS)=== null){
  saveData(STORAGE_KEY_ACCOUNTS,accounts);
}

if(localStorage.getItem(STORAGE_KEY_TRANSACTIONS) === null){
    saveData(STORAGE_KEY_TRANSACTIONS, transactions);
}

function initializeEventListeners(){
  const tabButtons = document.querySelector('#actionTabs .tab-btn');
 tabButtons.forEach(element => {
    element.addEventListener('click',()=>{
      tabButtons.forEach(button =>{
        button.classList.remove('active');
      }
      
       )
    });
     element.classList.add('active');
      const  targetFormId=tabButton.getAttribute('data-tab');
      const forms = document.querySelectorAll('.tab-content form');
      forms.forEach(form => {
        form.style.display ='none';

        if(targetFormId){
        forms.style.display ='block';
     }
     });
     
 });

}

//FORM SUBMISSION LISTENERS
// 1. SELECT THE FORMS

const depositForm = document.getElementById('depositForm');
const withdrawForm = document.getElementById('withdrawForm');
const transferForm = document.getElementById('transferForm');


// 2. DEPOSIT FORM SUBMISSION

depositForm.addEventListener('submit', function(event) {
    event.preventDefault();

    handleDepositSubmission();
});


// 3. WITHDRAWAL FORM SUBMISSION

withdrawForm.addEventListener('submit', function(event) {
    event.preventDefault();

    handleWithdrawalSubmission();
});


// 4. TRANSFER FORM SUBMISSION

transferForm.addEventListener('submit', function(event) {
    event.preventDefault();

    handleTransferSubmission();
});
//FILTER & RESET LISTENERS

const ledgerFilterSelect = document.querySelector('#ledger-filter');

ledgerFilterSelect.addEventListener('change', () => {
    const selectedFilter = ledgerFilterSelect.value;

    renderLedger(selectedFilter);
});

if(confirm("Reset all data back to original state?")){
        localStorage.removeItem(STORAGE_KEY_ACCOUNTS);
        localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);

        initializeDefaultState();
        renderAllUI();

        showAlert('Data reset successfully', 'success');
}


// MODULE 3: VALIDATION & TRANSACTION PROCESSING LOGIC

function handleDepositSubmission(){
    const accountType = document.querySelector('#depositAccount').value;
    const amountType = parseFloat(accountType);
    const description = document.querySelector('#depositAccount').value||"Direct Deposit";

   if(document.getElementById("depositAmount").value.trim() === "" || !Number.isFinite(amount) || amount <= 0){
    showAlert("Please enter a valid deposit amount greater than $0.00", "error")
      return;
   }


    if(!account[accountType]){
        showAlert('Please select a valid account');
    }

    account[accountType].balance += amount;

    const newTransaction ={
        id:crypto.randomUUID(),
        date:new Date().toISOString(),      
        accountID:account[accountType].id,
        type:"deposit",
       amount:amount,
       description:description
    }
    transactions.unshift(newTransaction);

    const accountSaved =( STORAGE_KEY_ACCOUNTS,
    defaultAccount);
    const transactionSaved =(STORAGE_KEY_TRANSACTIONS,
    defaultTransactions);

    renderAllUI();
    if(accountSaved && transactionSaved){
        showAlert("Transasction was succesful")
    }else{
        console.error("TRANSACTION FAAILED, TRY AGAIN !");
    }

    }

    //WITHDRAWAL LOGIC 
    function andleWithdrawalSubmission(){
        const accountType = document.getElementById('#withdrawAccount');
        const amountyType = document.getElementById('#withdrawAmount').value;
        const description = document.getElementById('#withdrawAmount').value || "Withdrawal";

        if(document.getElementById('#withdrawAmount').value.trim() === "" || !Number.isFinite(amount) || amount <= 0){
        
            showAlert("Please enter a valid withdrawal amount", "error");
            return;
        };

        const currentBalance = accounts[accountType].balance;
        if(amount >currentBalance ){
            showAlert("Insuffficient funds");
        }

        accounts[accountType].balance-= amount;
        
        const newTransaction = {
            id: crypto.randomUUID(),
            accountID:accounts[accountType],
            amount:amount,
            description:description,
            typoe:"withdwraw",
            date:new Date().toISOString()
        }
        transaction.unshift(newTransaction);

        renderAllUI()
            const accountSaved =( STORAGE_KEY_ACCOUNTS,
    defaultAccount);
    const transactionSaved =(STORAGE_KEY_TRANSACTIONS,
    defaultTransactions);
  
    if (accountSaved && transactionSaved) {
     showAlert(`Successfully withdrew $${amount.toFixed(2)} from ${accounts[accountType].name}`, "success")
    
    }else{
       console.error("Insufficient funds")
    }
    }
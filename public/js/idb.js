// creating a variable to make database connection
let db;

// establish connection to IndexedDB database with name of 'budget_tracker' and establish version number of 1
const request = indexedDB.open("budget_tracker", 1);

// emits if db version changes
request.onupgradeneeded = function (event) {
  // save database reference
  const db = event.target.result;
  // creation of object store called 'new_transaction', set it to autoincrement
  db.createObjectStore("new_transaction", { autoIncrement: true });
};

// on successful request
request.onsuccess = function (event) {
  // when database is created with object store successfully
  db = event.target.result;

  // verify whether app is online
  if (navigator.onLine) {
    // if yes, run uploadTransaction function to send all local db data to api
    uploadTransaction();
  }
};

request.onerror = function (event) {
  // error is logged here
  console.log(event.target.errorCode);
};

// function that actually runs if new transaction is attempted with no internet or data connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions
  const transaction = db.transaction(['new_transaction'], 'readwrite');

  // access the object store for `new_transaction`
  const transactionObjectStore = transaction.objectStore("new_transaction");

  // add record to your store with add method
  transactionObjectStore.add(record);
}

function uploadTransaction() {
  // open a db transaction
  const transaction = db.transaction(['new_transaction'], 'readwrite');

  // access object store
  const transactionObjectStore = transaction.objectStore('new_transaction');

  // get records from object store and set to a variable
  const getAll = transactionObjectStore.getAll();

  // on .getAll() execution, run the below
  getAll.onsuccess = function () {
    // verify whether data is in IndexedDB store, send to api accordingly
    if (getAll.result.length > 0) {
      fetch('api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(serverResponse => {
        if (serverResponse.message) {
          throw new Error(serverResponse);
        }
        // open another db transaction
        const transaction = db.transaction(['new_transaction'], 'readwrite');
        // access new_transaction object store
        const transactionObjectStore = transaction.objectStore('new_transaction');
        // clear items in object store to prevent duplicating transactions on future reconnections
        transactionObjectStore.clear();

        alert('All saved transactions have been submitted!');
      })
      .catch(err => {
        console.log(err)
      });
    }
  }
}
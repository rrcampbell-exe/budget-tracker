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
    // uploadTransaction();
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

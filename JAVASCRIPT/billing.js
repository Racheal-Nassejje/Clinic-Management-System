// GET BILLS FROM LOCALSTORAGE 
function getBills() {
  return JSON.parse(localStorage.getItem('clinicms_bills')) || [];
}

// SAVE BILLS TO LOCALSTORAGE 
function saveBills(bills) {
  localStorage.setItem('clinicms_bills', JSON.stringify(bills));
}

//  FORMAT CURRENCY 
function formatCurrency(amount) {
  return 'UGX ' + Number(amount).toLocaleString();
}

// GET PAYMENT STATUS BADGE 
function getPaymentStatusBadge(status) {
  switch (status) {
    case 'Paid':
      return '<span class="status-badge status-badge--green">Paid</span>';
    case 'Pending':
      return '<span class="status-badge status-badge--orange">Pending</span>';
    case 'Waived':
      return '<span class="status-badge status-badge--gray">Waived</span>';
    default:
      return '<span class="status-badge status-badge--gray">' + status + '</span>';
  }
}

// UPDATE BILLING STATS
function updateBillingStats() {
  const bills = getBills();

  // Total income (paid income bills)
  const totalIncome = bills
    .filter(b => b.type === 'Income' && b.status === 'Paid')
    .reduce((sum, b) => sum + Number(b.amount), 0);

  // Total expenses
  const totalExpenses = bills
    .filter(b => b.type === 'Expense')
    .reduce((sum, b) => sum + Number(b.amount), 0);

  // Paid bills count
  const totalPaid = bills.filter(b => b.status === 'Paid').length;

  // Pending bills count
  const totalPending = bills.filter(b => b.status === 'Pending').length;

  const incomeEl   = document.getElementById('totalIncome');
  const paidEl     = document.getElementById('totalPaid');
  const pendingEl  = document.getElementById('totalPending');
  const expenseEl  = document.getElementById('totalExpenses');

  if (incomeEl)  incomeEl.textContent  = formatCurrency(totalIncome);
  if (paidEl)    paidEl.textContent    = totalPaid;
  if (pendingEl) pendingEl.textContent = totalPending;
  if (expenseEl) expenseEl.textContent = formatCurrency(totalExpenses);
}

//  RENDER BILLING TABLE 
function renderBillingTable(filter = '') {
  const bills = getBills();
  const tbody = document.getElementById('billingTableBody');
  if (!tbody) return;

  const filtered = bills.filter(b =>
    b.patientName.toLowerCase().includes(filter.toLowerCase()) ||
    b.service.toLowerCase().includes(filter.toLowerCase()) ||
    b.status.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr class="table-empty-row">
        <td colspan="10">No bills recorded yet.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((b, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${b.patientName}</td>
      <td>${b.phone || '-'}</td>
      <td>${b.service}</td>
      <td>${formatCurrency(b.amount)}</td>
      <td>
        <span class="status-badge ${b.type === 'Income' ?
          'status-badge--blue' : 'status-badge--red'}">
          ${b.type}
        </span>
      </td>
      <td>${b.paymentMethod}</td>
      <td>${b.date}</td>
      <td>${getPaymentStatusBadge(b.status)}</td>
      <td>
        ${b.status === 'Pending' ? `
          <button
            class="action-btn action-btn--blue"
            onclick="markAsPaid(${b.id})">
            ✓ Mark Paid
          </button>` : ''}
        <button
          class="action-btn action-btn--red"
          onclick="removeBill(${b.id})">
          ✕ Remove
        </button>
      </td>
    </tr>
  `).join('');
}

//  MARK AS PAID 
function markAsPaid(id) {
  if (!confirm('Mark this bill as paid?')) return;

  let bills = getBills();
  bills = bills.map(b => {
    if (b.id === id) b.status = 'Paid';
    return b;
  });

  saveBills(bills);
  renderBillingTable();
  updateBillingStats();

  alert('Bill marked as paid successfully!');
}

//  REMOVE BILL 
function removeBill(id) {
  if (!confirm('Remove this bill?')) return;

  let bills = getBills();
  bills = bills.filter(b => b.id !== id);
  saveBills(bills);
  renderBillingTable();
  updateBillingStats();
}

//  BILLING FORM SUBMIT 
function initBillingForm() {
  const form = document.getElementById('billingForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const bill = {
      id:            Date.now(),
      patientName:   document.getElementById('billPatientName').value.trim(),
      phone:         document.getElementById('billPhone').value.trim(),
      date:          document.getElementById('billDate').value,
      service:       document.getElementById('billService').value,
      amount:        document.getElementById('billAmount').value,
      paymentMethod: document.getElementById('billPaymentMethod').value,
      type:          document.getElementById('billType').value,
      status:        document.getElementById('billStatus').value,
      notes:         document.getElementById('billNotes').value.trim(),
      createdAt:     new Date().toLocaleDateString()
    };

    // Validate
    if (!bill.patientName || !bill.service ||
        !bill.amount      || !bill.date) {
      alert('Please fill in Patient Name, Service, Amount and Date.');
      return;
    }

    if (bill.amount <= 0) {
      alert('Amount must be greater than 0.');
      return;
    }

    // Save
    const bills = getBills();
    bills.push(bill);
    saveBills(bills);

    // Reset and refresh
    form.reset();
    renderBillingTable();
    updateBillingStats();

    alert(`Bill for ${bill.patientName} saved successfully!`);
  });
}

//  SEARCH BILLS 
function initBillingSearch() {
  const searchInput = document.getElementById('searchBill');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    renderBillingTable(this.value);
  });
}

// RUN ON PAGE LOAD 
document.addEventListener('DOMContentLoaded', function () {
  initBillingForm();
  initBillingSearch();
  renderBillingTable();
  updateBillingStats();
});
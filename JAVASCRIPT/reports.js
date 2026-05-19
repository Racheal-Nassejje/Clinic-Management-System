// GET DATA FROM LOCALSTORAGE 
function getPatients() {
  return JSON.parse(localStorage.getItem('clinicms_patients')) || [];
}

function getAppointments() {
  return JSON.parse(localStorage.getItem('clinicms_appointments')) || [];
}

function getBills() {
  return JSON.parse(localStorage.getItem('clinicms_bills')) || [];
}

function getDiagnoses() {
  return JSON.parse(localStorage.getItem('clinicms_diagnoses')) || [];
}

// MONTHS LABELS 
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// COUNT BY MONTH 
function countByMonth(data, dateField) {
  const counts = new Array(12).fill(0);
  data.forEach(item => {
    if (item[dateField]) {
      const date = new Date(item[dateField]);
      if (!isNaN(date)) {
        counts[date.getMonth()]++;
      }
    }
  });
  return counts;
}

// UPDATE SUMMARY STATS
function updateReportStats() {
  const patients     = getPatients();
  const appointments = getAppointments();
  const bills        = getBills();
  const diagnoses    = getDiagnoses();

  const totalIncome = bills
    .filter(b => b.type === 'Income' && b.status === 'Paid')
    .reduce((sum, b) => sum + Number(b.amount), 0);

  const totalExpenses = bills
    .filter(b => b.type === 'Expense')
    .reduce((sum, b) => sum + Number(b.amount), 0);

  // Update stat cards
  const els = {
    totalPatients:  document.querySelector('.stat-card--blue .stat-number'),
    totalAppts:     document.querySelector('.stat-card--green .stat-number'),
    totalAdmissions:document.querySelector('.stat-card--orange .stat-number'),
    totalTriage:    document.querySelector('.stat-card--red .stat-number'),
  };

  if (els.totalPatients)   els.totalPatients.textContent   = patients.length;
  if (els.totalAppts)      els.totalAppts.textContent      = appointments.length;
  if (els.totalAdmissions) els.totalAdmissions.textContent = bills.length;
  if (els.totalTriage)     els.totalTriage.textContent     = diagnoses.length;
}

// CHART 1: MONTHLY PATIENTS BAR CHART 
function renderMonthlyPatientsChart() {
  const ctx = document.getElementById('monthlyPatientsChart');
  if (!ctx) return;

  const patients = getPatients();
  const counts = countByMonth(patients, 'registeredAt');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MONTHS,
      datasets: [{
        label: 'Patients Registered',
        data: counts,
        backgroundColor: 'rgba(46, 134, 222, 0.7)',
        borderColor: '#2e86de',
        borderWidth: 2,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

// CHART 2: MONTHLY APPOINTMENTS LINE CHART 
function renderMonthlyAppointmentsChart() {
  const ctx = document.getElementById('monthlyAppointmentsChart');
  if (!ctx) return;

  const appointments = getAppointments();
  const counts = countByMonth(appointments, 'date');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: MONTHS,
      datasets: [{
        label: 'Appointments',
        data: counts,
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        borderColor: '#27ae60',
        borderWidth: 3,
        pointBackgroundColor: '#27ae60',
        pointRadius: 5,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

// CHART 3: INCOME VS EXPENSES 
function renderIncomeExpensesChart() {
  const ctx = document.getElementById('incomeExpensesChart');
  if (!ctx) return;

  const bills = getBills();

  const monthlyIncome = countByMonth(
    bills.filter(b => b.type === 'Income' && b.status === 'Paid'),
    'date'
  );

  const monthlyExpenses = countByMonth(
    bills.filter(b => b.type === 'Expense'),
    'date'
  );

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MONTHS,
      datasets: [
        {
          label: 'Income (UGX)',
          data: monthlyIncome,
          backgroundColor: 'rgba(39, 174, 96, 0.7)',
          borderColor: '#27ae60',
          borderWidth: 2,
          borderRadius: 4,
        },
        {
          label: 'Expenses (UGX)',
          data: monthlyExpenses,
          backgroundColor: 'rgba(231, 76, 60, 0.7)',
          borderColor: '#e74c3c',
          borderWidth: 2,
          borderRadius: 4,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Income vs Expenses by Month'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

// CHART 4: DISEASE FREQUENCY BAR CHART 
function renderDiseaseChart() {
  const ctx = document.getElementById('triagePriorityChart');
  if (!ctx) return;

  const diagnoses = getDiagnoses();

  // Count disease occurrences
  const diseaseCounts = {};
  diagnoses.forEach(d => {
    const disease = d.disease || 'Unknown';
    diseaseCounts[disease] = (diseaseCounts[disease] || 0) + 1;
  });

  // Sort by frequency
  const sorted = Object.entries(diseaseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const labels = sorted.map(d => d[0]);
  const counts = sorted.map(d => d[1]);

  const colors = [
    '#2e86de', '#27ae60', '#e74c3c', '#e67e22',
    '#8e44ad', '#16a085', '#f39c12', '#c0392b'
  ];

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length > 0 ? labels : ['No Data'],
      datasets: [{
        label: 'Cases',
        data: counts.length > 0 ? counts : [0],
        backgroundColor: colors,
        borderWidth: 2,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Most Common Diseases'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

// CHART 5: AGE DISTRIBUTION 
function renderAgeDistributionChart() {
  const ctx = document.getElementById('admissionsByWardChart');
  if (!ctx) return;

  const diagnoses = getDiagnoses();

  // Group by age range
  const ageGroups = {
    '0-10':  0,
    '11-20': 0,
    '21-30': 0,
    '31-40': 0,
    '41-50': 0,
    '51-60': 0,
    '61+':   0
  };

  diagnoses.forEach(d => {
    const age = parseInt(d.age);
    if (age <= 10)       ageGroups['0-10']++;
    else if (age <= 20)  ageGroups['11-20']++;
    else if (age <= 30)  ageGroups['21-30']++;
    else if (age <= 40)  ageGroups['31-40']++;
    else if (age <= 50)  ageGroups['41-50']++;
    else if (age <= 60)  ageGroups['51-60']++;
    else                 ageGroups['61+']++;
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(ageGroups),
      datasets: [{
        label: 'Number of Patients',
        data: Object.values(ageGroups),
        backgroundColor: [
          '#2e86de', '#27ae60', '#e67e22',
          '#8e44ad', '#e74c3c', '#16a085', '#f39c12'
        ],
        borderWidth: 2,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Patient Age Distribution from Diagnosis Records'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        },
        x: {
          title: {
            display: true,
            text: 'Age Groups'
          }
        }
      }
    }
  });
}

// RUN ON PAGE LOAD 
document.addEventListener('DOMContentLoaded', function () {
  updateReportStats();
  renderMonthlyPatientsChart();
  renderMonthlyAppointmentsChart();
  renderIncomeExpensesChart();
  renderDiseaseChart();
  renderAgeDistributionChart();
  renderReportSummary();
});

//  FULL REPORT SUMMARY 
function renderReportSummary() {
  const patients      = getPatients();
  const appointments  = getAppointments();
  const bills         = getBills();
  const diagnoses     = getDiagnoses();
  const triage        = JSON.parse(localStorage.getItem('clinicms_triage')) || [];
  const admissions    = JSON.parse(localStorage.getItem('clinicms_admissions')) || [];
  const consultations = JSON.parse(localStorage.getItem('clinicms_consultations')) || [];
  const ward          = JSON.parse(localStorage.getItem('clinicms_ward')) || [];

  // Current month
  const currentMonth = new Date().getMonth();

  // This month counts
  function thisMonth(data, dateField) {
    return data.filter(item => {
      if (!item[dateField]) return false;
      const d = new Date(item[dateField]);
      return d.getMonth() === currentMonth;
    }).length;
  }

  //  Row 1: Key Stats 
  document.getElementById('sumTotalPatients').textContent     = patients.length;
  document.getElementById('sumTotalAppointments').textContent = appointments.length;
  document.getElementById('sumTotalAdmissions').textContent   = admissions.length;
  document.getElementById('sumTotalDiagnoses').textContent    = diagnoses.length;

  document.getElementById('sumThisMonthPatients').textContent =
    `This month: ${thisMonth(patients, 'registeredAt')}`;
  document.getElementById('sumThisMonthAppointments').textContent =
    `This month: ${thisMonth(appointments, 'date')}`;
  document.getElementById('sumThisMonthAdmissions').textContent =
    `This month: ${thisMonth(admissions, 'admitDate')}`;
  document.getElementById('sumThisMonthDiagnoses').textContent =
    `This month: ${thisMonth(diagnoses, 'date')}`;

  // Row 2: Finances 
  const totalIncome = bills
    .filter(b => b.type === 'Income' && b.status === 'Paid')
    .reduce((sum, b) => sum + Number(b.amount), 0);

  const totalExpenses = bills
    .filter(b => b.type === 'Expense')
    .reduce((sum, b) => sum + Number(b.amount), 0);

  const netBalance  = totalIncome - totalExpenses;
  const pendingBills = bills.filter(b => b.status === 'Pending').length;

  document.getElementById('sumIncome').textContent   = 'UGX ' + totalIncome.toLocaleString();
  document.getElementById('sumExpenses').textContent = 'UGX ' + totalExpenses.toLocaleString();
  document.getElementById('sumPending').textContent  = pendingBills + ' bills';

  const balanceEl = document.getElementById('sumBalance');
  balanceEl.textContent = 'UGX ' + Math.abs(netBalance).toLocaleString() +
    (netBalance >= 0 ? ' (Profit)' : ' (Loss)');
  balanceEl.className = 'summary-detail-value ' +
    (netBalance >= 0 ? 'summary-detail-value--green' : 'summary-detail-value--red');

  //  Top Diseases 
  const diseaseCounts = {};
  diagnoses.forEach(d => {
    const disease = d.disease || 'Unknown';
    diseaseCounts[disease] = (diseaseCounts[disease] || 0) + 1;
  });

  const topDiseases = Object.entries(diseaseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const diseasesEl = document.getElementById('sumTopDiseases');
  if (topDiseases.length === 0) {
    diseasesEl.innerHTML = '<p class="summary-empty">No diagnosis records yet.</p>';
  } else {
    diseasesEl.innerHTML = topDiseases.map(([disease, count], i) => `
      <div class="summary-list-item">
        <span class="summary-list-rank">${i + 1}.</span>
        <span class="summary-list-name">${disease}</span>
        <span class="summary-list-count">${count} case${count > 1 ? 's' : ''}</span>
      </div>
    `).join('');
  }

  //  Age Groups 
  const ageGroups = {
    '0-10': 0, '11-20': 0, '21-30': 0,
    '31-40': 0, '41-50': 0, '51-60': 0, '61+': 0
  };

  diagnoses.forEach(d => {
    const age = parseInt(d.age);
    if (age <= 10)      ageGroups['0-10']++;
    else if (age <= 20) ageGroups['11-20']++;
    else if (age <= 30) ageGroups['21-30']++;
    else if (age <= 40) ageGroups['31-40']++;
    else if (age <= 50) ageGroups['41-50']++;
    else if (age <= 60) ageGroups['51-60']++;
    else                ageGroups['61+']++;
  });

  const topAgeGroups = Object.entries(ageGroups)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const ageEl = document.getElementById('sumAgeGroups');
  if (topAgeGroups.length === 0) {
    ageEl.innerHTML = '<p class="summary-empty">No diagnosis records yet.</p>';
  } else {
    ageEl.innerHTML = topAgeGroups.map(([group, count], i) => `
      <div class="summary-list-item">
        <span class="summary-list-rank">${i + 1}.</span>
        <span class="summary-list-name">Age ${group}</span>
        <span class="summary-list-count">${count} patient${count > 1 ? 's' : ''}</span>
      </div>
    `).join('');
  }

  //  Row 3: Triage 
  document.getElementById('sumEmergency').textContent =
    triage.filter(t => t.priority === 'Emergency').length;
  document.getElementById('sumUrgent').textContent =
    triage.filter(t => t.priority === 'Urgent').length;
  document.getElementById('sumNormal').textContent =
    triage.filter(t => t.priority === 'Normal').length;
  document.getElementById('sumConsultations').textContent = consultations.length;
  document.getElementById('sumWardPatients').textContent  = ward.length;

  //  Footer Date 
  const dateEl = document.getElementById('reportDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-UG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
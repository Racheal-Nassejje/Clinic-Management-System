// GET WARD PATIENTS FROM LOCALSTORAGE 
function getWardPatients() {
  return JSON.parse(localStorage.getItem('clinicms_ward')) || [];
}

// SAVE WARD PATIENTS TO LOCALSTORAGE 
function saveWardPatients(patients) {
  localStorage.setItem('clinicms_ward', JSON.stringify(patients));
}

// GET CONDITION BADGE 
function getConditionBadge(condition) {
  switch (condition) {
    case 'Stable':
      return '<span class="status-badge status-badge--green">Stable</span>';
    case 'Critical':
      return '<span class="status-badge status-badge--red">Critical</span>';
    case 'Pending Discharge':
      return '<span class="status-badge status-badge--orange">Pending Discharge</span>';
    case 'Under Observation':
      return '<span class="status-badge status-badge--blue">Under Observation</span>';
    default:
      return '<span class="status-badge status-badge--gray">' + condition + '</span>';
  }
}

// UPDATE WARD STATS 
function updateWardStats() {
  const patients = getWardPatients();

  const total    = patients.length;
  const stable   = patients.filter(p => p.condition === 'Stable').length;
  const critical = patients.filter(p => p.condition === 'Critical').length;
  const pending  = patients.filter(p => p.condition === 'Pending Discharge').length;

  const totalEl    = document.getElementById('totalWardPatients');
  const stableEl   = document.getElementById('stablePatients');
  const criticalEl = document.getElementById('criticalPatients');
  const pendingEl  = document.getElementById('pendingDischarge');

  if (totalEl)    totalEl.textContent    = total;
  if (stableEl)   stableEl.textContent   = stable;
  if (criticalEl) criticalEl.textContent = critical;
  if (pendingEl)  pendingEl.textContent  = pending;
}

// RENDER WARD TABLE 
function renderWardTable(filter = '', wardFilter = 'all') {
  const patients = getWardPatients();
  const tbody = document.getElementById('wardTableBody');
  if (!tbody) return;

  let filtered = patients.filter(p =>
    p.patientName.toLowerCase().includes(filter.toLowerCase()) ||
    p.ward.toLowerCase().includes(filter.toLowerCase()) ||
    p.doctor.toLowerCase().includes(filter.toLowerCase())
  );

  // Filter by ward tab
  if (wardFilter !== 'all') {
    filtered = filtered.filter(p => p.ward === wardFilter);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr class="table-empty-row">
        <td colspan="11">No ward patients found.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.patientName}</td>
      <td>${p.age || '-'}</td>
      <td>${p.gender || '-'}</td>
      <td>${p.ward}</td>
      <td>${p.bedNo}</td>
      <td>${p.doctor || '-'}</td>
      <td>${p.diagnosis || '-'}</td>
      <td>${getConditionBadge(p.condition)}</td>
      <td>${p.admitDate || '-'}</td>
      <td>
        <button
          class="action-btn action-btn--blue"
          onclick="updateWardCondition(${p.id})">
          ✎ Update
        </button>
        <button
          class="action-btn action-btn--red"
          onclick="removeWardPatient(${p.id})">
          ✕ Remove
        </button>
      </td>
    </tr>
  `).join('');
}

// UPDATE WARD CONDITION 
function updateWardCondition(id) {
  const conditions = ['Stable', 'Critical', 'Pending Discharge', 'Under Observation'];
  const newCondition = prompt(
    'Update condition:\n1. Stable\n2. Critical\n3. Pending Discharge\n4. Under Observation\n\nType the condition:'
  );

  if (!newCondition) return;

  const matched = conditions.find(c =>
    c.toLowerCase() === newCondition.toLowerCase()
  );

  if (!matched) {
    alert('Invalid condition. Please type exactly as shown.');
    return;
  }

  let patients = getWardPatients();
  patients = patients.map(p => {
    if (p.id === id) p.condition = matched;
    return p;
  });

  saveWardPatients(patients);
  renderWardTable();
  updateWardStats();

  alert(`Condition updated to ${matched}.`);
}

// REMOVE WARD PATIENT 
function removeWardPatient(id) {
  if (!confirm('Remove this patient from ward?')) return;

  let patients = getWardPatients();
  patients = patients.filter(p => p.id !== id);
  saveWardPatients(patients);
  renderWardTable();
  updateWardStats();
}

// WARD FORM SUBMIT
function initWardForm() {
  const form = document.getElementById('wardForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const patient = {
      id:          Date.now(),
      patientName: document.getElementById('wardPatientName').value.trim(),
      age:         document.getElementById('wardAge').value,
      gender:      document.getElementById('wardGender').value,
      ward:        document.getElementById('wardName').value,
      bedNo:       document.getElementById('wardBedNo').value.trim(),
      doctor:      document.getElementById('wardDoctor').value.trim(),
      diagnosis:   document.getElementById('wardDiagnosis').value.trim(),
      condition:   document.getElementById('wardCondition').value,
      admitDate:   document.getElementById('wardAdmitDate').value,
      createdAt:   new Date().toLocaleDateString()
    };

    // Validate
    if (!patient.patientName || !patient.ward || !patient.bedNo) {
      alert('Please fill in Patient Name, Ward and Bed Number.');
      return;
    }

    // Save
    const patients = getWardPatients();
    patients.push(patient);
    saveWardPatients(patients);

    // Reset and refresh
    form.reset();
    renderWardTable();
    updateWardStats();

    alert(`${patient.patientName} added to ${patient.ward} - Bed ${patient.bedNo}.`);
  });
}

// WARD TAB FILTER 
function initWardTabs() {
  const tabs = document.querySelectorAll('.ward-tab');
  if (!tabs) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      // Remove active from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Add active to clicked tab
      this.classList.add('active');

      const wardFilter = this.getAttribute('data-ward');
      const searchInput = document.getElementById('searchWard');
      const filter = searchInput ? searchInput.value : '';

      renderWardTable(filter, wardFilter);
    });
  });
}

// SEARCH WARD
function initWardSearch() {
  const searchInput = document.getElementById('searchWard');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    const activeTab = document.querySelector('.ward-tab.active');
    const wardFilter = activeTab ? activeTab.getAttribute('data-ward') : 'all';
    renderWardTable(this.value, wardFilter);
  });
}

// RUN ON PAGE LOAD 
document.addEventListener('DOMContentLoaded', function () {
  initWardForm();
  initWardTabs();
  initWardSearch();
  renderWardTable();
  updateWardStats();
});
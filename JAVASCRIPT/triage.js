// GET TRIAGE FROM LOCALSTORAGE
function getTriagePatients() {
  return JSON.parse(localStorage.getItem('clinicms_triage')) || [];
}

// SAVE TRIAGE TO LOCALSTORAGE 
function saveTriagePatients(patients) {
  localStorage.setItem('clinicms_triage', JSON.stringify(patients));
}

// GET PRIORITY BADGE 
function getPriorityBadge(priority) {
  switch (priority) {
    case 'Emergency': return '<span class="status-badge status-badge--red">🔴 Emergency</span>';
    case 'Urgent':    return '<span class="status-badge status-badge--orange">🟠 Urgent</span>';
    case 'Normal':    return '<span class="status-badge status-badge--green">🟢 Normal</span>';
    default:          return '<span class="status-badge status-badge--gray">' + priority + '</span>';
  }
}

// UPDATE STAT COUNTS 
function updateTriageStats() {
  const patients = getTriagePatients();

  const emergency = patients.filter(p => p.priority === 'Emergency').length;
  const urgent    = patients.filter(p => p.priority === 'Urgent').length;
  const normal    = patients.filter(p => p.priority === 'Normal').length;

  const emergencyEl = document.getElementById('emergencyCount');
  const urgentEl    = document.getElementById('urgentCount');
  const normalEl    = document.getElementById('normalCount');
  const totalEl     = document.getElementById('totalTriageCount');

  if (emergencyEl) emergencyEl.textContent = emergency;
  if (urgentEl)    urgentEl.textContent    = urgent;
  if (normalEl)    normalEl.textContent    = normal;
  if (totalEl)     totalEl.textContent     = patients.length;
}

// RENDER TRIAGE TABLE 
function renderTriageTable(filter = '') {
  const patients = getTriagePatients();
  const tbody = document.getElementById('triageTableBody');
  if (!tbody) return;

  const filtered = patients.filter(p =>
    p.patientName.toLowerCase().includes(filter.toLowerCase()) ||
    p.complaint.toLowerCase().includes(filter.toLowerCase()) ||
    p.priority.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr class="table-empty-row">
        <td colspan="10">No patients in triage queue yet.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.patientName}</td>
      <td>${p.age || '-'}</td>
      <td>${p.gender || '-'}</td>
      <td>${p.complaint}</td>
      <td>${p.temperature || '-'}</td>
      <td>${p.bloodPressure || '-'}</td>
      <td>${p.pulse || '-'}</td>
      <td>${getPriorityBadge(p.priority)}</td>
      <td>
        <button 
          class="action-btn action-btn--red" 
          onclick="removeTriagePatient(${p.id})">
          ✕ Remove
        </button>
      </td>
    </tr>
  `).join('');
}

// REMOVE TRIAGE PATIENT 
function removeTriagePatient(id) {
  if (!confirm('Remove this patient from triage queue?')) return;

  let patients = getTriagePatients();
  patients = patients.filter(p => p.id !== id);
  saveTriagePatients(patients);
  renderTriageTable();
  updateTriageStats();
}

// TRIAGE FORM SUBMIT 
function initTriageForm() {
  const form = document.getElementById('triageForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const patient = {
      id: Date.now(),
      patientName:   document.getElementById('triagePatientName').value.trim(),
      age:           document.getElementById('triageAge').value,
      gender:        document.getElementById('triageGender').value,
      complaint:     document.getElementById('triageComplaint').value.trim(),
      temperature:   document.getElementById('triageTemp').value,
      bloodPressure: document.getElementById('triageBP').value.trim(),
      pulse:         document.getElementById('triagePulse').value,
      priority:      document.getElementById('triagePriority').value,
      notes:         document.getElementById('triageNotes').value.trim(),
      createdAt:     new Date().toLocaleDateString()
    };

    // Validate
    if (!patient.patientName || !patient.complaint || !patient.priority) {
      alert('Please fill in Patient Name, Complaint and Priority.');
      return;
    }

    // Save
    const patients = getTriagePatients();
    patients.push(patient);
    saveTriagePatients(patients);

    // Reset and refresh
    form.reset();
    renderTriageTable();
    updateTriageStats();

    alert(`${patient.patientName} added to triage queue as ${patient.priority}.`);
  });
}

// SEARCH TRIAGE 
function initTriageSearch() {
  const searchInput = document.getElementById('searchTriage');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    renderTriageTable(this.value);
  });
}

// RUN ON PAGE LOAD 
document.addEventListener('DOMContentLoaded', function () {
  initTriageForm();
  initTriageSearch();
  renderTriageTable();
  updateTriageStats();
});
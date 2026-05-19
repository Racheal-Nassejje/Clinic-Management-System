// GET DIAGNOSES FROM LOCALSTORAGE
function getDiagnoses() {
  return JSON.parse(localStorage.getItem('clinicms_diagnoses')) || [];
}

// SAVE DIAGNOSES TO LOCALSTORAGE 
function saveDiagnoses(diagnoses) {
  localStorage.setItem('clinicms_diagnoses', JSON.stringify(diagnoses));
}

// GET SEVERITY BADGE 
function getSeverityBadge(severity) {
  switch (severity) {
    case 'Mild':
      return '<span class="status-badge status-badge--green">🟢 Mild</span>';
    case 'Moderate':
      return '<span class="status-badge status-badge--orange">🟠 Moderate</span>';
    case 'Severe':
      return '<span class="status-badge status-badge--red">🔴 Severe</span>';
    default:
      return '<span class="status-badge status-badge--gray">' + severity + '</span>';
  }
}

// UPDATE DIAGNOSIS STATS
function updateDiagnosisStats() {
  const diagnoses = getDiagnoses();

  const total    = diagnoses.length;
  const severe   = diagnoses.filter(d => d.severity === 'Severe').length;
  const moderate = diagnoses.filter(d => d.severity === 'Moderate').length;
  const mild     = diagnoses.filter(d => d.severity === 'Mild').length;

  const totalEl    = document.getElementById('totalDiagnoses');
  const severeEl   = document.getElementById('severeCases');
  const moderateEl = document.getElementById('moderateCases');
  const mildEl     = document.getElementById('mildCases');

  if (totalEl)    totalEl.textContent    = total;
  if (severeEl)   severeEl.textContent   = severe;
  if (moderateEl) moderateEl.textContent = moderate;
  if (mildEl)     mildEl.textContent     = mild;
}

// RENDER DIAGNOSIS TABLE 
function renderDiagnosisTable(filter = '') {
  const diagnoses = getDiagnoses();
  const tbody = document.getElementById('diagnosisTableBody');
  if (!tbody) return;

  const filtered = diagnoses.filter(d =>
    d.patientName.toLowerCase().includes(filter.toLowerCase()) ||
    d.disease.toLowerCase().includes(filter.toLowerCase()) ||
    d.category.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr class="table-empty-row">
        <td colspan="10">No diagnosis records yet.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((d, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${d.patientName}</td>
      <td>${d.age}</td>
      <td>${d.gender || '-'}</td>
      <td>${d.disease}</td>
      <td>${d.category || '-'}</td>
      <td>${getSeverityBadge(d.severity)}</td>
      <td>${d.doctor || '-'}</td>
      <td>${d.date}</td>
      <td>
        <button
          class="action-btn action-btn--red"
          onclick="removeDiagnosis(${d.id})">
          ✕ Remove
        </button>
      </td>
    </tr>
  `).join('');
}

//  REMOVE DIAGNOSIS 
function removeDiagnosis(id) {
  if (!confirm('Remove this diagnosis record?')) return;

  let diagnoses = getDiagnoses();
  diagnoses = diagnoses.filter(d => d.id !== id);
  saveDiagnoses(diagnoses);
  renderDiagnosisTable();
  updateDiagnosisStats();
}

// DIAGNOSIS FORM SUBMIT 
function initDiagnosisForm() {
  const form = document.getElementById('diagnosisForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const diagnosis = {
      id:          Date.now(),
      patientName: document.getElementById('diagPatientName').value.trim(),
      age:         document.getElementById('diagAge').value,
      gender:      document.getElementById('diagGender').value,
      disease:     document.getElementById('diagDisease').value.trim(),
      category:    document.getElementById('diagCategory').value,
      severity:    document.getElementById('diagSeverity').value,
      doctor:      document.getElementById('diagDoctor').value.trim(),
      date:        document.getElementById('diagDate').value,
      notes:       document.getElementById('diagNotes').value.trim(),
      createdAt:   new Date().toLocaleDateString()
    };

    // Validate
    if (!diagnosis.patientName || !diagnosis.disease ||
        !diagnosis.severity    || !diagnosis.date) {
      alert('Please fill in Patient Name, Disease, Severity and Date.');
      return;
    }

    // Save
    const diagnoses = getDiagnoses();
    diagnoses.push(diagnosis);
    saveDiagnoses(diagnoses);

    // Reset and refresh
    form.reset();
    renderDiagnosisTable();
    updateDiagnosisStats();

    alert(`Diagnosis for ${diagnosis.patientName} saved successfully!`);
  });
}

// SEARCH DIAGNOSIS 
function initDiagnosisSearch() {
  const searchInput = document.getElementById('searchDiagnosis');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    renderDiagnosisTable(this.value);
  });
}

// RUN ON PAGE LOAD 
document.addEventListener('DOMContentLoaded', function () {
  initDiagnosisForm();
  initDiagnosisSearch();
  renderDiagnosisTable();
  updateDiagnosisStats();
});
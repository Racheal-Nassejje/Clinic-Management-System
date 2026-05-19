// GET CONSULTATIONS FROM LOCALSTORAGE 
function getConsultations() {
  return JSON.parse(localStorage.getItem('clinicms_consultations')) || [];
}

// SAVE CONSULTATIONS TO LOCALSTORAGE 
function saveConsultations(consultations) {
  localStorage.setItem('clinicms_consultations', JSON.stringify(consultations));
}

// GET STATUS BADGE 
function getConsultStatusBadge(status) {
  switch (status) {
    case 'Completed': return '<span class="status-badge status-badge--green">Completed</span>';
    case 'Pending':   return '<span class="status-badge status-badge--orange">Pending</span>';
    case 'Referred':  return '<span class="status-badge status-badge--red">Referred</span>';
    case 'Follow-up': return '<span class="status-badge status-badge--blue">Follow-up</span>';
    default:          return '<span class="status-badge status-badge--gray">' + status + '</span>';
  }
}

// UPDATE STATS
function updateConsultationStats() {
  const consultations = getConsultations();

  const total     = consultations.length;
  const completed = consultations.filter(c => c.status === 'Completed').length;
  const pending   = consultations.filter(c => c.status === 'Pending').length;
  const referred  = consultations.filter(c => c.status === 'Referred').length;

  const totalEl     = document.getElementById('totalConsultations');
  const completedEl = document.getElementById('completedConsultations');
  const pendingEl   = document.getElementById('pendingConsultations');
  const referredEl  = document.getElementById('referredConsultations');

  if (totalEl)     totalEl.textContent     = total;
  if (completedEl) completedEl.textContent = completed;
  if (pendingEl)   pendingEl.textContent   = pending;
  if (referredEl)  referredEl.textContent  = referred;
}

// RENDER CONSULTATION TABLE 
function renderConsultationTable(filter = '') {
  const consultations = getConsultations();
  const tbody = document.getElementById('consultationTableBody');
  if (!tbody) return;

  const filtered = consultations.filter(c =>
    c.patientName.toLowerCase().includes(filter.toLowerCase()) ||
    c.diagnosis.toLowerCase().includes(filter.toLowerCase()) ||
    c.doctor.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr class="table-empty-row">
        <td colspan="10">No consultation records yet.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((c, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${c.patientName}</td>
      <td>${c.age || '-'}</td>
      <td>${c.gender || '-'}</td>
      <td>${c.complaint}</td>
      <td>${c.diagnosis || '-'}</td>
      <td>${c.doctor || '-'}</td>
      <td>${c.date}</td>
      <td>${getConsultStatusBadge(c.status)}</td>
      <td>
        <button
          class="action-btn action-btn--red"
          onclick="removeConsultation(${c.id})">
          ✕ Remove
        </button>
      </td>
    </tr>
  `).join('');
}

// REMOVE CONSULTATION 
function removeConsultation(id) {
  if (!confirm('Remove this consultation record?')) return;

  let consultations = getConsultations();
  consultations = consultations.filter(c => c.id !== id);
  saveConsultations(consultations);
  renderConsultationTable();
  updateConsultationStats();
}

// CONSULTATION FORM SUBMIT 
function initConsultationForm() {
  const form = document.getElementById('consultationForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const consultation = {
      id:           Date.now(),
      patientName:  document.getElementById('consultPatientName').value.trim(),
      age:          document.getElementById('consultAge').value,
      gender:       document.getElementById('consultGender').value,
      doctor:       document.getElementById('consultDoctor').value.trim(),
      complaint:    document.getElementById('consultComplaint').value.trim(),
      diagnosis:    document.getElementById('consultDiagnosis').value.trim(),
      prescription: document.getElementById('consultPrescription').value.trim(),
      date:         document.getElementById('consultDate').value,
      status:       document.getElementById('consultStatus').value,
      notes:        document.getElementById('consultNotes').value.trim(),
      createdAt:    new Date().toLocaleDateString()
    };

    // Validate
    if (!consultation.patientName || !consultation.complaint || !consultation.date) {
      alert('Please fill in Patient Name, Complaint and Date.');
      return;
    }

    // Save
    const consultations = getConsultations();
    consultations.push(consultation);
    saveConsultations(consultations);

    // Reset and refresh
    form.reset();
    renderConsultationTable();
    updateConsultationStats();

    alert(`Consultation for ${consultation.patientName} saved successfully!`);
  });
}

// SEARCH CONSULTATIONS 
function initConsultationSearch() {
  const searchInput = document.getElementById('searchConsultation');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    renderConsultationTable(this.value);
  });
}

// RUN ON PAGE LOAD 
document.addEventListener('DOMContentLoaded', function () {
  initConsultationForm();
  initConsultationSearch();
  renderConsultationTable();
  updateConsultationStats();
});
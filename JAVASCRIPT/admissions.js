//  GET ADMISSIONS FROM LOCALSTORAGE
function getAdmissions() {
  return JSON.parse(localStorage.getItem('clinicms_admissions')) || [];
}

//  SAVE ADMISSIONS TO LOCALSTORAGE 
function saveAdmissions(admissions) {
  localStorage.setItem('clinicms_admissions', JSON.stringify(admissions));
}

//  GET STATUS BADGE 
function getAdmissionStatusBadge(status) {
  switch (status) {
    case 'Admitted':   return '<span class="status-badge status-badge--blue">Admitted</span>';
    case 'Discharged': return '<span class="status-badge status-badge--green">Discharged</span>';
    case 'Pending':    return '<span class="status-badge status-badge--orange">Pending</span>';
    case 'Transferred':return '<span class="status-badge status-badge--gray">Transferred</span>';
    default:           return '<span class="status-badge status-badge--gray">' + status + '</span>';
  }
}

//  UPDATE STATS 
function updateAdmissionStats() {
  const admissions = getAdmissions();

  const total      = admissions.filter(a => a.status === 'Admitted').length;
  const pending    = admissions.filter(a => a.status === 'Pending').length;
  const discharged = admissions.filter(a => a.status === 'Discharged').length;
  const totalBeds  = 20;
  const available  = totalBeds - total;

  const totalEl      = document.getElementById('totalAdmitted');
  const availableEl  = document.getElementById('bedsAvailable');
  const pendingEl    = document.getElementById('pendingAdmissions');
  const dischargedEl = document.getElementById('dischargedToday');

  if (totalEl)      totalEl.textContent      = total;
  if (availableEl)  availableEl.textContent  = available < 0 ? 0 : available;
  if (pendingEl)    pendingEl.textContent    = pending;
  if (dischargedEl) dischargedEl.textContent = discharged;
}

//  RENDER ADMISSIONS TABLE
function renderAdmissionsTable(filter = '') {
  const admissions = getAdmissions();
  const tbody = document.getElementById('admissionsTableBody');
  if (!tbody) return;

  const filtered = admissions.filter(a =>
    a.patientName.toLowerCase().includes(filter.toLowerCase()) ||
    a.ward.toLowerCase().includes(filter.toLowerCase()) ||
    a.doctor.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr class="table-empty-row">
        <td colspan="11">No admissions recorded yet.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((a, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${a.patientName}</td>
      <td>${a.age || '-'}</td>
      <td>${a.gender || '-'}</td>
      <td>${a.ward}</td>
      <td>${a.bedNumber}</td>
      <td>${a.doctor || '-'}</td>
      <td>${a.diagnosis || '-'}</td>
      <td>${a.admitDate}</td>
      <td>${getAdmissionStatusBadge(a.status)}</td>
      <td>
        <button
          class="action-btn action-btn--blue"
          onclick="dischargePatient(${a.id})">
          ✓ Discharge
        </button>
        <button
          class="action-btn action-btn--red"
          onclick="removeAdmission(${a.id})">
          ✕ Remove
        </button>
      </td>
    </tr>
  `).join('');
}

//  DISCHARGE PATIENT 
function dischargePatient(id) {
  if (!confirm('Discharge this patient?')) return;

  let admissions = getAdmissions();
  admissions = admissions.map(a => {
    if (a.id === id) {
      a.status = 'Discharged';
    }
    return a;
  });

  saveAdmissions(admissions);
  renderAdmissionsTable();
  updateAdmissionStats();

  alert('Patient discharged successfully!');
}

//  REMOVE ADMISSION 
function removeAdmission(id) {
  if (!confirm('Remove this admission record?')) return;

  let admissions = getAdmissions();
  admissions = admissions.filter(a => a.id !== id);
  saveAdmissions(admissions);
  renderAdmissionsTable();
  updateAdmissionStats();
}

//  ADMISSION FORM SUBMIT 
function initAdmissionForm() {
  const form = document.getElementById('admissionForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const admission = {
      id:          Date.now(),
      patientName: document.getElementById('admitPatientName').value.trim(),
      age:         document.getElementById('admitAge').value,
      gender:      document.getElementById('admitGender').value,
      ward:        document.getElementById('admitWard').value,
      bedNumber:   document.getElementById('admitBedNumber').value.trim(),
      doctor:      document.getElementById('admitDoctor').value.trim(),
      admitDate:   document.getElementById('admitDate').value,
      diagnosis:   document.getElementById('admitDiagnosis').value.trim(),
      notes:       document.getElementById('admitNotes').value.trim(),
      status:      'Admitted',
      createdAt:   new Date().toLocaleDateString()
    };

    // Validate
    if (!admission.patientName || !admission.ward ||
        !admission.bedNumber   || !admission.admitDate) {
      alert('Please fill in Patient Name, Ward, Bed Number and Date.');
      return;
    }

    // Save
    const admissions = getAdmissions();
    admissions.push(admission);
    saveAdmissions(admissions);

    // Reset and refresh
    form.reset();
    renderAdmissionsTable();
    updateAdmissionStats();

    alert(`${admission.patientName} admitted to ${admission.ward} - Bed ${admission.bedNumber}.`);
  });
}

//  SEARCH ADMISSIONS 
function initAdmissionSearch() {
  const searchInput = document.getElementById('searchAdmission');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    renderAdmissionsTable(this.value);
  });
}

//  RUN ON PAGE LOAD 
document.addEventListener('DOMContentLoaded', function () {
  initAdmissionForm();
  initAdmissionSearch();
  renderAdmissionsTable();
  updateAdmissionStats();
});
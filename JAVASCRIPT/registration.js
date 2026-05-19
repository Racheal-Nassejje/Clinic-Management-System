// GET PATIENTS FROM LOCALSTORAGE
function getPatients() {
  return JSON.parse(localStorage.getItem('clinicms_patients')) || [];
}

// SAVE PATIENTS TO LOCALSTORAGE 
function savePatients(patients) {
  localStorage.setItem('clinicms_patients', JSON.stringify(patients));
}

// RENDER PATIENTS TABLE 
function renderPatientsTable(filter = '') {
  const patients = getPatients();
  const tbody = document.getElementById('patientsTableBody');
  if (!tbody) return;

  // Filter patients by search
  const filtered = patients.filter(p =>
    p.firstName.toLowerCase().includes(filter.toLowerCase()) ||
    p.lastName.toLowerCase().includes(filter.toLowerCase()) ||
    p.phone.includes(filter)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr class="table-empty-row">
        <td colspan="8">No patients found.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.title} ${p.firstName} ${p.lastName}</td>
      <td>${p.gender || '-'}</td>
      <td>${p.age || '-'}</td>
      <td>${p.phone}</td>
      <td>${p.patientType}</td>
      <td>${p.bloodGroup || '-'}</td>
      <td>${p.registeredAt || '-'}</td>
      <td>
        <span class="status-badge status-badge--green">Registered</span>
      </td>
    </tr>
  `).join('');
}

// REGISTRATION FORM SUBMIT 
function initRegistrationForm() {
  const form = document.getElementById('registrationForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Get form values
    const patient = {
      id: Date.now(),
      title: document.getElementById('title').value,
      firstName: document.getElementById('firstName').value.trim(),
      middleName: document.getElementById('middleName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      dob: document.getElementById('dob').value,
      bloodGroup: document.getElementById('bloodGroup').value,
      patientType: document.getElementById('patientType').value,
      gender: document.getElementById('gender').value,
      age: document.getElementById('age').value,
      maritalStatus: document.getElementById('maritalStatus').value,
      phone: document.getElementById('phone').value.trim(),
      altPhone: document.getElementById('altPhone').value.trim(),
      email: document.getElementById('email').value.trim(),
      address: document.getElementById('address').value.trim(),
      district: document.getElementById('district').value.trim(),
      country: document.getElementById('country').value.trim(),
      registeredAt: document.getElementById('regDate').value
    };

    // Validate required fields
    if (!patient.firstName || !patient.lastName || !patient.phone) {
      alert('Please fill in First Name, Last Name and Phone Number.');
      return;
    }

    // Save to localStorage
    const patients = getPatients();
    patients.push(patient);
    savePatients(patients);

    // Reset form
    form.reset();
    document.getElementById('country').value = 'Uganda';

    // Refresh table
    renderPatientsTable();

    alert(`Patient ${patient.firstName} ${patient.lastName} registered successfully!`);
  });
}

// SEARCH PATIENTS 
function initPatientSearch() {
  const searchInput = document.getElementById('searchPatient');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    renderPatientsTable(this.value);
  });
}

// RUN ON PAGE LOAD 
document.addEventListener('DOMContentLoaded', function () {
  initRegistrationForm();
  initPatientSearch();
  renderPatientsTable();
});
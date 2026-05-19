// GET APPOINTMENTS FROM LOCALSTORAGE 
function getAppointments() {
  return JSON.parse(localStorage.getItem('clinicms_appointments')) || [];
}

// SAVE APPOINTMENTS TO LOCALSTORAGE 
function saveAppointments(appointments) {
  localStorage.setItem('clinicms_appointments', JSON.stringify(appointments));
}

// RENDER APPOINTMENTS TABLE 
function renderAppointmentsTable(filter = '') {
  const appointments = getAppointments();
  const tbody = document.getElementById('appointmentsTableBody');
  if (!tbody) return;

  const filtered = appointments.filter(a =>
    a.patientName.toLowerCase().includes(filter.toLowerCase()) ||
    a.doctor.toLowerCase().includes(filter.toLowerCase()) ||
    a.department.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr class="table-empty-row">
        <td colspan="9">No appointments found.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((a, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${a.patientName}</td>
      <td>${a.phone || '-'}</td>
      <td>${a.date}</td>
      <td>${a.time}</td>
      <td>${a.doctor || '-'}</td>
      <td>${a.department || '-'}</td>
      <td>${a.type}</td>
      <td>
        <span class="status-badge ${getStatusClass(a.status)}">
          ${a.status}
        </span>
      </td>
    </tr>
  `).join('');
}

// GET STATUS BADGE CLASS 
function getStatusClass(status) {
  switch (status) {
    case 'Confirmed': return 'status-badge--green';
    case 'Pending':   return 'status-badge--orange';
    case 'Cancelled': return 'status-badge--red';
    default:          return 'status-badge--blue';
  }
}

// APPOINTMENT FORM SUBMIT 
function initAppointmentForm() {
  const form = document.getElementById('appointmentForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const appointment = {
      id: Date.now(),
      patientName: document.getElementById('apptPatientName').value.trim(),
      phone: document.getElementById('apptPhone').value.trim(),
      date: document.getElementById('apptDate').value,
      time: document.getElementById('apptTime').value,
      doctor: document.getElementById('apptDoctor').value.trim(),
      department: document.getElementById('apptDepartment').value,
      type: document.getElementById('apptType').value,
      notes: document.getElementById('apptNotes').value.trim(),
      status: 'Confirmed',
      createdAt: new Date().toLocaleDateString()
    };

    // Validate
    if (!appointment.patientName || !appointment.date || !appointment.time) {
      alert('Please fill in Patient Name, Date and Time.');
      return;
    }

    // Save
    const appointments = getAppointments();
    appointments.push(appointment);
    saveAppointments(appointments);

    // Reset and refresh
    form.reset();
    renderAppointmentsTable();

    alert(`Appointment booked for ${appointment.patientName} on ${appointment.date} at ${appointment.time}.`);
  });
}

// SEARCH APPOINTMENTS 
function initAppointmentSearch() {
  const searchInput = document.getElementById('searchAppointment');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    renderAppointmentsTable(this.value);
  });
}

// RUN ON PAGE LOAD 
document.addEventListener('DOMContentLoaded', function () {
  initAppointmentForm();
  initAppointmentSearch();
  renderAppointmentsTable();
});
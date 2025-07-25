// Dropdown menu toggle
document.getElementById('menu-btn').onclick = function () {
  document.getElementById('dropdown-menu').classList.toggle('hidden');
};

// Gear/settings panel toggle
document.getElementById('settings-btn').onclick = function () {
  document.getElementById('settings-panel').classList.remove('hidden');
};
document.getElementById('settings-link').onclick = function () {
  document.getElementById('settings-panel').classList.remove('hidden');
  document.getElementById('dropdown-menu').classList.add('hidden');
};

// Close settings panel
document.getElementById('close-settings').onclick = function () {
  document.getElementById('settings-panel').classList.add('hidden');
};

// Dark mode toggle
document.getElementById('toggle-dark').onclick = function () {
  document.body.classList.toggle('dark-theme');
  localStorage.setItem('darkTheme', document.body.classList.contains('dark-theme'));
  document.getElementById('dropdown-menu').classList.add('hidden');
};
// Load dark mode if previously set
if (localStorage.getItem('darkTheme') === 'true') {
  document.body.classList.add('dark-theme');
}

// Placeholder for iCal file download
document.getElementById('download-ical').onclick = function () {
  const blob = new Blob(['BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR'], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'calendar.ics';
  a.click();
  URL.revokeObjectURL(url);
};

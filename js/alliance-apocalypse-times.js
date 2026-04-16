const tableBody = document.getElementById('alliance-apocalypse-times-body');

const createCell = (text) => {
  const td = document.createElement('td');
  td.textContent = text;
  return td;
};

fetch('data/alliance-apocalypse-times.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Unable to load data (${response.status})`);
    }
    return response.json();
  })
  .then((entries) => {
    tableBody.innerHTML = '';

    entries.forEach((entry) => {
      const row = document.createElement('tr');
      row.appendChild(createCell(entry.name));
      row.appendChild(createCell(entry.level));
      row.appendChild(createCell(entry.time));
      row.appendChild(createCell(entry.day));
      tableBody.appendChild(row);
    });
  })
  .catch((error) => {
    tableBody.innerHTML = `<tr><td colspan="4">${error.message}</td></tr>`;
  });

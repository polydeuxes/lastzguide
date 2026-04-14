const tableBody = document.getElementById('hero-battlefield-levels-body');

const createCell = (text) => {
  const td = document.createElement('td');
  td.textContent = text;
  return td;
};

fetch('data/hero-battlefield-levels.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Unable to load data (${response.status})`);
    }
    return response.json();
  })
  .then((levels) => {
    tableBody.innerHTML = '';

    levels.forEach((entry) => {
      const row = document.createElement('tr');
      row.appendChild(createCell(entry.level));
      row.appendChild(createCell(entry.power));
      row.appendChild(createCell(entry.reward));
      tableBody.appendChild(row);
    });
  })
  .catch((error) => {
    tableBody.innerHTML = `<tr><td colspan="3">${error.message}</td></tr>`;
  });

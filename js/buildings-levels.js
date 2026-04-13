const tableBody = document.getElementById('buildings-levels-body');

const formatResourceLines = (resources) => {
  const order = ['wood', 'food', 'zent'];
  return order
    .filter((key) => resources[key])
    .map((key) => `${key[0].toUpperCase()}${key.slice(1)}: ${resources[key]}`)
    .join('<br>');
};

const createCell = (html) => {
  const td = document.createElement('td');
  td.innerHTML = html;
  return td;
};

fetch('data/buildings-levels.json')
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
      row.appendChild(createCell(String(entry.level)));
      row.appendChild(createCell(entry.buildingsRequired.join('<br>')));
      row.appendChild(createCell(formatResourceLines(entry.resources)));
      row.appendChild(createCell(String(entry.heroCap)));
      tableBody.appendChild(row);
    });
  })
  .catch((error) => {
    tableBody.innerHTML = `<tr><td colspan="4">${error.message}</td></tr>`;
  });

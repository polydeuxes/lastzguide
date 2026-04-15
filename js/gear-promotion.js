const tableBody = document.getElementById('gear-promotion-body');

const columns = [
  'idx',
  'hex',
  'zents',
  'cores',
  'orange',
  'totalCores',
  'totalOrange',
  'wAtk',
  'wAtkTotal',
  'wDmg',
  'wDmgTotal',
  'aDef',
  'aDefTotal',
  'aHp',
  'aHpTotal'
];

const createCell = (value) => {
  const td = document.createElement('td');
  td.textContent = String(value);
  return td;
};

fetch('data/gear-promotion.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Unable to load data (${response.status})`);
    }
    return response.json();
  })
  .then((rows) => {
    tableBody.innerHTML = '';

    rows.forEach((entry) => {
      const row = document.createElement('tr');
      columns.forEach((column) => {
        row.appendChild(createCell(entry[column]));
      });
      tableBody.appendChild(row);
    });
  })
  .catch((error) => {
    tableBody.innerHTML = `<tr><td colspan="15">${error.message}</td></tr>`;
  });

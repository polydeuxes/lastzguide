const tableBody = document.getElementById('survival-saga-body');

const createCell = (text) => {
  const td = document.createElement('td');
  td.textContent = text;
  return td;
};

fetch('data/survival-saga.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Unable to load data (${response.status})`);
    }
    return response.json();
  })
  .then((data) => {
    const {
      difficultyCount,
      levelsPerDifficulty,
      zombiesPerDifficulty,
      powerByLevel
    } = data;

    tableBody.innerHTML = '';

    for (let difficulty = 1; difficulty <= difficultyCount; difficulty += 1) {
      for (let level = 1; level <= levelsPerDifficulty; level += 1) {
        const key = `D${difficulty}L${level}`;
        const row = document.createElement('tr');

        row.appendChild(createCell(`D${difficulty}`));
        row.appendChild(createCell(`L${level}`));
        row.appendChild(createCell(String(zombiesPerDifficulty)));
        row.appendChild(createCell(powerByLevel[key] ?? ''));

        tableBody.appendChild(row);
      }
    }
  })
  .catch((error) => {
    tableBody.innerHTML = `<tr><td colspan="4">${error.message}</td></tr>`;
  });

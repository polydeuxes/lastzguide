const sectionsContainer = document.getElementById('survival-saga-sections');

const createCell = (text) => {
  const td = document.createElement('td');
  td.textContent = text;
  return td;
};

const createHeaderCell = (text) => {
  const th = document.createElement('th');
  th.textContent = text;
  return th;
};

const getPowerValue = ({ difficulty, level, powerByDifficulty }) => {
  const difficultyKey = `D${difficulty}`;
  const levelKey = `L${level}`;
  return powerByDifficulty?.[difficultyKey]?.[levelKey] ?? '';
};

const createDifficultySection = ({
  difficulty,
  levelsPerDifficulty,
  powerByDifficulty,
  openByDefault
}) => {
  const wrapper = document.createElement('details');
  wrapper.className = 'difficulty-section';
  wrapper.open = openByDefault;

  const summary = document.createElement('summary');
  summary.className = 'difficulty-summary';

  const title = document.createElement('span');
  title.className = 'difficulty-title';
  title.textContent = `Difficulty ${difficulty}`;

  let knownValues = 0;
  for (let level = 1; level <= levelsPerDifficulty; level += 1) {
    const value = getPowerValue({ difficulty, level, powerByDifficulty });
    if (value) {
      knownValues += 1;
    }
  }

  const meta = document.createElement('span');
  meta.className = 'difficulty-meta';
  meta.textContent = `${knownValues}/${levelsPerDifficulty} known`;

  summary.appendChild(title);
  summary.appendChild(meta);

  const scroll = document.createElement('div');
  scroll.className = 'table-scroll';

  const table = document.createElement('table');
  table.className = 'levels-table compact-table';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.appendChild(createHeaderCell('Level'));
  headRow.appendChild(createHeaderCell('Power'));
  thead.appendChild(headRow);

  const tbody = document.createElement('tbody');

  for (let level = 1; level <= levelsPerDifficulty; level += 1) {
    const row = document.createElement('tr');
    row.appendChild(createCell(`L${level}`));
    row.appendChild(createCell(getPowerValue({ difficulty, level, powerByDifficulty })));
    tbody.appendChild(row);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  scroll.appendChild(table);

  wrapper.appendChild(summary);
  wrapper.appendChild(scroll);

  return wrapper;
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
      powerByDifficulty
    } = data;

    sectionsContainer.innerHTML = '';

    for (let difficulty = 1; difficulty <= difficultyCount; difficulty += 1) {
      sectionsContainer.appendChild(createDifficultySection({
        difficulty,
        levelsPerDifficulty,
        powerByDifficulty,
        openByDefault: difficulty >= difficultyCount - 1
      }));
    }
  })
  .catch((error) => {
    sectionsContainer.innerHTML = `<p>${error.message}</p>`;
  });

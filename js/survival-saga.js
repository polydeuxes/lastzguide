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

  if (!powerByDifficulty || !powerByDifficulty[difficultyKey]) {
    return '';
  }

  return powerByDifficulty[difficultyKey][levelKey] || '';
};

const normalizePowerByDifficulty = (rawData = {}) => {
  if (rawData.powerByDifficulty && typeof rawData.powerByDifficulty === 'object') {
    return rawData.powerByDifficulty;
  }

  const normalized = {};
  const flatKeyPattern = /^d(\d+)l(\d+)$/i;

  Object.entries(rawData).forEach(([key, value]) => {
    const match = key.match(flatKeyPattern);
    if (!match) {
      return;
    }

    const difficultyKey = `D${Number(match[1])}`;
    const levelKey = `L${Number(match[2])}`;

    if (!normalized[difficultyKey]) {
      normalized[difficultyKey] = {};
    }

    normalized[difficultyKey][levelKey] = value;
  });

  return normalized;
};

const getDifficultyCount = ({ difficultyCount, powerByDifficulty }) => {
  if (Number.isInteger(difficultyCount) && difficultyCount > 0) {
    return difficultyCount;
  }

  const highestDifficulty = Object.keys(powerByDifficulty || {})
    .map((key) => Number(key.replace(/^D/i, '')))
    .filter((value) => Number.isFinite(value))
    .reduce((max, value) => Math.max(max, value), 0);

  return highestDifficulty || 9;
};

const getLevelsPerDifficulty = ({ levelsPerDifficulty, powerByDifficulty }) => {
  if (Number.isInteger(levelsPerDifficulty) && levelsPerDifficulty > 0) {
    return levelsPerDifficulty;
  }

  const highestLevel = Object.values(powerByDifficulty || {})
    .flatMap((levels) => Object.keys(levels || {}))
    .map((key) => Number(key.replace(/^L/i, '')))
    .filter((value) => Number.isFinite(value))
    .reduce((max, value) => Math.max(max, value), 0);

  return highestLevel || 15;
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
    const powerByDifficulty = normalizePowerByDifficulty(data);
    const difficultyCount = getDifficultyCount({ difficultyCount: data.difficultyCount, powerByDifficulty });
    const levelsPerDifficulty = getLevelsPerDifficulty({ levelsPerDifficulty: data.levelsPerDifficulty, powerByDifficulty });

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

async function fetchVacancies() {
  const res = await fetch('/.netlify/functions/getVacancies');
  if (!res.ok) return [];
  return await res.json();
}

function createVacancyCard(vacancy) {
  const div = document.createElement('div');
  div.className = 'col-md-4';
  div.innerHTML = `
    <div class="card h-100">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${vacancy.title}</h5>
        <p class="card-text">${vacancy.description.substring(0, 100)}...</p>
        <p><strong>Deadline:</strong> ${new Date(vacancy.deadline).toLocaleDateString()}</p>
        <a href="vacancy.html?id=${vacancy._id}" class="btn btn-primary mt-auto">Apply</a>
      </div>
    </div>
  `;
  return div;
}

async function init() {
  const vacancies = await fetchVacancies();
  const container = document.getElementById('vacancies-container');
  if (vacancies.length === 0) {
    container.textContent = 'No vacancies available right now.';
  } else {
    vacancies.forEach(v => container.appendChild(createVacancyCard(v)));
  }
}

init();

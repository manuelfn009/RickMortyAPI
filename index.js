let container = document.querySelector(".container");
let select = document.getElementById("select");
let selectSpecies = document.getElementById("selectSpecies");
let buttonFavorites = document.getElementById("buttonFavorites");
let favoritesSet = new Set(); // Conjunto para almacenar personajes favoritos

buttonFavorites.addEventListener("click", seeFavorites);
select.addEventListener("change", selectAll);
selectSpecies.addEventListener("change", selectAll); // Agregado evento para seleccionar por especie
selectAll();

async function selectAll() {
  container.innerHTML = "";

  let speciesFilter = selectSpecies.value ? `&species=${selectSpecies.value}` : ''; // Agregado filtro por especie

  let firstPageRes = await fetch("https://rickandmortyapi.com/api/character");
  let firstPageData = await firstPageRes.json();
  const totalPages = firstPageData.info.pages;

  for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
    let url = `https://rickandmortyapi.com/api/character/?page=${currentPage}${select.value}${speciesFilter}`;
    let res = await fetch(url);
    let data = await res.json();

    for (let i = 0; i < data.results.length; i++) {
      let card = createCharacterCard(data.results[i]);
      container.appendChild(card);
    }
  }
}

async function seeFavorites() {
  container.innerHTML = "";

  if (favoritesSet.size === 0) {
    let h2 = document.createElement("h2");
    h2.classList.add("text-center", "text-white");
    h2.textContent = "There are no favorites";
    container.appendChild(h2);
    return;
  }

  for (let characterId of favoritesSet) {
    let url = `https://rickandmortyapi.com/api/character/${characterId}`;
    let res = await fetch(url);
    let characterData = await res.json();

    let card = createCharacterCard(characterData);
    container.appendChild(card);
  }
}

function toggleFavorite(characterId) {
  let star = document.querySelector(`[data-id="${characterId}"]`);

  if (favoritesSet.has(characterId)) {
    favoritesSet.delete(characterId);
    star.style.color = "white";
  } else {
    favoritesSet.add(characterId);
    star.style.color = "#ffbb00";
  }
}

function createCharacterCard(character) {
  let card = document.createElement("div");
  card.classList.add(
    "card",
    "m-3",
    "p-3",
    "text-white",
    "rounded-3",
    "cursor-pointer"
  );


  let star = document.createElement("i");
  star.classList.add("fas", "fa-solid", "fa-star", "fs-1", "star");
  star.style.color = favoritesSet.has(character.id) ? "#ffbb00" : "white";
  star.dataset.id = character.id; 
  star.addEventListener("click", () => toggleFavorite(character.id));
  card.appendChild(star);
  
  let img = document.createElement("img");
  img.classList.add("rounded-circle");
  img.src = character.image;
  card.appendChild(img);

  let name = document.createElement("h2");
  name.textContent = character.name;
  card.appendChild(name);

  let ul = document.createElement("ul");
  card.appendChild(ul);

  let species = document.createElement("li");
  species.innerHTML = `<strong>Species: </strong> ${character.species}`;
  ul.appendChild(species);

  let status = document.createElement("li");
  status.innerHTML = `<strong>Status: </strong> ${character.status}`;
  ul.appendChild(status);

  let gender = document.createElement("li");
  gender.innerHTML = `<strong>Gender: </strong> ${character.gender}`;
  ul.appendChild(gender);

  let origin = document.createElement("li");
  origin.innerHTML = `<strong>Origin Name: </strong> ${character.origin.name}`;
  ul.appendChild(origin);

  let location = document.createElement("li");
  location.innerHTML = `<strong>Location Name: </strong> ${character.location.name}`;
  ul.appendChild(location);

  switch (character.status) {
    case "Alive":
      card.classList.add("bg-success");
      break;
    case "Dead":
      card.classList.add("bg-danger");
      break;
    case "unknown":
      card.classList.add("bg-secondary");
      break;
  }

  return card;
}

async function getSpecie() {
  selectSpecies.innerHTML =
    "<option value='' disabled selected>Select a specie</option>";

  const uniqueSpecies = new Set();

  let firstPageRes = await fetch("https://rickandmortyapi.com/api/character");
  let firstPageData = await firstPageRes.json();
  const totalPages = firstPageData.info.pages;

  for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
    let url = `https://rickandmortyapi.com/api/character/?page=${currentPage}`;
    let res = await fetch(url);
    let data = await res.json();

    for (let i = 0; i < data.results.length; i++) {
      let specie = data.results[i].species;

      if (!uniqueSpecies.has(specie)) {
        let option = document.createElement("option");
        option.value = specie;
        option.textContent = specie;
        selectSpecies.appendChild(option);

        uniqueSpecies.add(specie);
      }
    }
  }
}

getSpecie();

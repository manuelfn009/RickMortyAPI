let container = document.querySelector(".container");
let select = document.getElementById("select");
let selectSpecies = document.getElementById("selectSpecies");
let buttonFavorites = document.getElementById("buttonFavorites");
let favoritesSet = new Set(); // Conjunto para almacenar personajes favoritos
let db;

buttonFavorites.addEventListener("click", seeFavorites);
select.addEventListener("change", selectAll);
selectSpecies.addEventListener("change", selectAll); // Agregado evento para seleccionar por especie
initDB(); // Inicializar la base de datos IndexedDB
selectAll();

async function selectAll() {
  container.innerHTML = "";

  let speciesFilter = selectSpecies.value
    ? `&species=${selectSpecies.value}`
    : ""; // Agregado filtro por especie

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
  } else {
    for (let characterId of favoritesSet) {
      let url = `https://rickandmortyapi.com/api/character/${characterId}`;
      let res = await fetch(url);
      let characterData = await res.json();

      let card = createCharacterCard(characterData);
      container.appendChild(card);
    }
  }
}

function toggleFavorite(characterId, characterName) {
  let star = document.querySelector(`[data-id="${characterId}"]`);
  let card = document.querySelector(`.card[data-id="${characterId}"]`);

  if (favoritesSet.has(characterId)) {
    favoritesSet.delete(characterId);
    star.style.color = "white";

    // Eliminar el favorito de IndexedDB
    removeFromIndexedDB(characterId);
  } else {
    favoritesSet.add(characterId);
    star.style.color = "#ffbb00";

    // Añadir el favorito a IndexedDB
    addToFavoriteTable(characterId, characterName);
  }
}

function addToFavoriteTable(characterId, characterName) {
  // Abrir una transacción de escritura
  let transaction = db.transaction(["favorites"], "readwrite");

  // Acceder al almacén de objetos "favorites"
  let objectStore = transaction.objectStore("favorites");

  // Añadir el favorito al almacén de objetos con ID y nombre
  objectStore.add({ characterId: characterId, characterName: characterName });
}

function removeFromIndexedDB(characterId) {
  // Abrir una transacción de escritura
  let transaction = db.transaction(["favorites"], "readwrite");

  // Acceder al almacén de objetos "favorites"
  let objectStore = transaction.objectStore("favorites");

  // Eliminar el favorito del almacén de objetos
  objectStore.delete(characterId);
}

function createCharacterCard(character) {
  let card = document.createElement("div");
  card.classList.add(
    "card",
    "m-3",
    "p-3",
    "text-white",
    "rounded-3",
    "cursor-pointer",
    "border",
    "border-light",
    "border-3"
  );

  let containerIcon = document.createElement("div");
  containerIcon.classList = "d-flex justify-content-between";
  card.appendChild(containerIcon);

  let star = document.createElement("i");
  star.classList.add("fas", "fa-solid", "fa-star", "fs-1", "star");
  star.style.color = favoritesSet.has(character.id) ? "#ffbb00" : "white";
  star.dataset.id = character.id;
  star.addEventListener("click", () =>
    toggleFavorite(character.id, character.name)
  );
  containerIcon.appendChild(star);

  let pen = document.createElement("i");
  pen.classList = "pen fa-regular fa-pen-to-square fs-2";
  containerIcon.appendChild(pen);

  let img = document.createElement("img");
  img.classList.add(
    "rounded-circle",
    "img-fluid",
    "border",
    "border-3",
    "border-black"
  );
  img.src = character.image;
  card.appendChild(img);

  let name = document.createElement("input");
  name.classList = "name";
  name.type = "text";

  name.value = character.name;
  name.disabled = "disabled";
  card.appendChild(name);
  let ul = document.createElement("ul");
  card.appendChild(ul);

  name.addEventListener("blur", () => {
    name.disabled = true;
  });

  if (star.style.color === "white") {
    name.disabled = true;
  } else {
    pen.addEventListener("click", () => {
      name.disabled = false;
      name.focus();
    });
    name.addEventListener("keydown", async (e) => {
      if (e.keyCode === 13) {
        name.disabled = true;
            editFavorites(character.id, name.value);
          }

    });
  }

  let species = document.createElement("li");
  species.innerHTML = `<strong>Species: </strong> ${character.species}`;
  ul.appendChild(species);

  let type = document.createElement("li");
  if (character.type) {
    type.innerHTML = `<strong>Type: </strong> ${character.type}`;
  } else {
    type.innerHTML = `<strong>Type: </strong> Unknown`;
  }
  ul.appendChild(type);

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

function initDB() {
  // Abrir o crear la base de datos "RickAndMortyDB" con la versión 1
  let request = indexedDB.open("RickAndMortyDB", 1);

  // Configurar el almacén de objetos si la base de datos se abre correctamente
  request.onupgradeneeded = function (event) {
    db = event.target.result;

    // Crear un almacén de objetos llamado "favorites" con un índice "characterId"
    let objectStore = db.createObjectStore("favorites", {
      keyPath: "characterId",
    });
    objectStore.createIndex("characterId", "characterId", { unique: true });
  };

  request.onsuccess = function (event) {
    db = event.target.result;

    // Cargar favoritos desde IndexedDB al iniciar la página
    loadFavoritesFromIndexedDB();
  };

  request.onerror = function (event) {
    console.error("Error opening IndexedDB:", event.target.error);
  };
}

function loadFavoritesFromIndexedDB() {
  // Abrir una transacción de lectura
  let transaction = db.transaction(["favorites"], "readonly");

  // Acceder al almacén de objetos "favorites"
  let objectStore = transaction.objectStore("favorites");

  // Abrir un cursor para recorrer los elementos del almacén
  let cursor = objectStore.openCursor();

  // Manejar el resultado del cursor
  cursor.onsuccess = function (event) {
    let cursor = event.target.result;

    if (cursor) {
      // Añadir el favorito al conjunto de favoritos
      favoritesSet.add(cursor.value.characterId);
      cursor.continue();
    }
  };
}

async function editFavorites() {
  let res = await fetch("https://rickandmortyapi.com/api/character");
  let data = await res.json();

  for (let i = 0; i < data.results.length; i++) {
    let characterId = data.results[i].id;
    let characterName = data.results[i].name;

    let option = document.createElement("option");
    option.value = characterId;
    option.textContent = characterName;
  }

  // Abrir una transacción de escritura
  let transaction = db.transaction(["favorites"], "readwrite");

  // Acceder al almacén de objetos "favorites"
  let objectStore = transaction.objectStore("favorites");

  // Eliminar el favorito del almacén de objetos
  objectStore.delete(characterId);

  // Agregar el favorito al almacén de objetos
  objectStore.add({ characterId: characterId, characterName: characterName });

  loadFavoritesFromIndexedDB();
}

async function getSpecie() {
  selectSpecies.innerHTML = "<option value='' selected>All</option>";

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

async function editFavorites(characterId, characterName) {
  let transaction = db.transaction(["favorites"], "readwrite");

  // Acceder al almacén de objetos "favorites"
  let objectStore = transaction.objectStore("favorites");

  // Editar el favorito del almacén de objetos
  let request = objectStore.get(characterId);

  request.onsuccess = function(event) {
    let favorite = event.target.result;

    if (favorite) {
      favorite.characterName = characterName;
      objectStore.put(favorite);
    }
  };
}

getSpecie();

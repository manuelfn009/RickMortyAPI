let container = document.querySelector(".container");
let select = document.getElementById("select");

select.addEventListener("change", selectAll);
selectAll();

async function selectAll() {
container.innerHTML = "";
  let url = `https://rickandmortyapi.com/api/character${select.value}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      for (let i = 0; i < data.results.length; i++) {
        let card = document.createElement("div");
        card.classList.add(
          "card",
          "m-3",
          "p-3",
          "text-white",
          "w-25",
          "h-75",
          "rounded-3",
          "cursor-pointer"
        );
        container.appendChild(card);
        let img = document.createElement("img");
        img.classList.add("rounded-circle");
        img.src = data.results[i].image;
        card.appendChild(img);
        let name = document.createElement("h2");
        name.textContent = data.results[i].name;
        card.appendChild(name);
        let ul = document.createElement("ul");
        card.appendChild(ul);
        let species = document.createElement("li");
        species.innerHTML = `<strong>Species: </strong> ${data.results[i].species}`;
        ul.appendChild(species);
        let status = document.createElement("li");
        status.innerHTML = `<strong>Status: </strong> ${data.results[i].status}`;
        ul.appendChild(status);
        let gender = document.createElement("li");
        gender.innerHTML = `<strong>Gender: </strong> ${data.results[i].gender}`;
        ul.appendChild(gender);
        let origin = document.createElement("p");
        origin.innerHTML = `<strong>Origin Name: </strong> ${data.results[i].origin.name}`;
        ul.appendChild(origin);
        let location = document.createElement("li");
        location.innerHTML = `<strong>Location Name: </strong> ${data.results[i].location.name}`;
        ul.appendChild(location);
        switch (data.results[i].status) {
          case "Alive":
            card.classList.add("bg-success");
            break;
          case "Dead":
            card.classList.add("bg-danger");
            break;
          case "unknown":
            card.classList.add("bg-warning");
            break;
          default:
            break;
        }
      }
    });
}
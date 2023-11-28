let container = document.querySelector(".container");

let url = "https://rickandmortyapi.com/api/character";

fetch(url).then(response => response.json()).then(data => {

    for (let i = 0; i < data.results.length; i++) {

        let card = document.createElement("div");
        card.classList.add("card", "m-3", "p-3", "bg-dark", "text-white", "w-25", "h-100", "rounded-3", "text-center", "align-items-center", "justify-content-center", "cursor-pointer");
        container.appendChild(card);
        let img = document.createElement("img");
        img.src = data.results[i].image;
        card.appendChild(img);
        let name = document.createElement("h2");
        name.textContent = data.results[i].name;
        card.appendChild(name);
        let species = document.createElement("p");
        species.textContent = "Specie: " + data.results[i].species;
        card.appendChild(species);
        let status = document.createElement("p");
        status.textContent = data.results[i].status;
        card.appendChild(status);
        let gender = document.createElement("p");
        gender.textContent = data.results[i].gender;
        card.appendChild(gender);
        let origin = document.createElement("p");
        origin.textContent = data.results[i].origin.name;
        card.appendChild(origin);
        let location = document.createElement("p");
        location.textContent = data.results[i].location.name;
        card.appendChild(location);
    }
})


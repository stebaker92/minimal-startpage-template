/**
 * Interval which the clock will be updated (in milliseconds).
 */
const clockInterval = 100;

/**
 * Search engine query url
 */
const searchEngineUrl = 'https://duckduckgo.com/?q=';

const tabKeyCode = 9;
const enterKeyCode = 13;
const escapeKeyCode = 27;
const searchBarElement = document.getElementById('search-bar');
const clockElement = document.getElementById('clock');
const formElement = document.getElementById('search-form');
const linksContainerElement = document.getElementById("links-container");

/**
 * Return a string containing the formatted current date and time.
 */
function getDateTime() {
    const dateTime = new Date();
    let day = dateTime.getDate();
    let month = dateTime.getMonth() + 1;
    let hour = dateTime.getHours();
    let minutes = dateTime.getMinutes();
    let seconds = dateTime.getSeconds();

    if (hour < 0) {
        hour = 24 + hour;
    }

    let date = (day < 10 ? '0' + day : day) + '/' + (month < 10 ? '0' + month : month) + '/' + dateTime.getFullYear();
    let time = (hour < 10 ? '0' + hour : hour) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);

    return date + '\n' + time;
}

function setClock() {
    clockElement.innerText = getDateTime();
}

function search() {
    let value = searchBarElement.value;
    if (!value) {
        return;
    }

    if (value.startsWith('https://') || value.startsWith('http://')) {
        window.location = value;
    } else {
        window.location = searchEngineUrl + encodeURIComponent(value);
    }
}


setClock();

setInterval(() => {
    setClock();
}, clockInterval);

searchBarElement.focus();
searchBarElement.value = '';

formElement.addEventListener('submit', (ev) => {
    ev.preventDefault();
    search();
});

document.addEventListener('keypress', (event) => {
    if (event.keyCode == escapeKeyCode) {
        searchBarElement.blur();
        searchBarElement.value = '';
    } else if (event.keyCode != tabKeyCode && event.keyCode != enterKeyCode) {
        searchBarElement.focus();
    }
});

const addItem = async (event, url = null) => {
    const sectionElement = event.closest("section").querySelector("ul");
    const categoryTitle = event.closest("section").querySelector("h2").innerText;

    const input = url || prompt("Enter a URL");
    if (!input) return;
    let host;
    try {
        host = new URL(input).host;
    } catch (error) { }


    const name = prompt("Enter a name (optional)") || host || input;
    const index = data.findIndex(d => d.title === categoryTitle);
    data[index].items.push({ name, url: input })
    localStorage.setItem("data", JSON.stringify(data));

    const lastListItem = sectionElement.lastElementChild.previousElementSibling;
    lastListItem.insertAdjacentHTML("afterend", `<li class="link-list-item"><a class="link" href="${input}">${name}</a></li>`)
}

const addSection = () => {
    const title = prompt("Enter a section name");

    data.push({ title, items: [] })
    localStorage.setItem("data", JSON.stringify(data));

    showCategory(title, []);
}

const showCategory = (title, items = []) => {
    const html = `
    <section class="link-section" ondrop="drop(event)" ondragover="allowDrop(event)">
        <h2 class="link-section-title blue">${title}</h2>
        <hr />
        <ul class="link-list">
            ${items.map(i => `<li class="link-list-item"><a class="link" href="${i.url}">
                <img src="https://www.google.com/s2/favicons?sz=16&amp;domain=${i.url}">
                ${i.name}
            </a></li>`).join("")}
            <li class="link-list-item"><a class="link" href="#" onclick="addItem('${title}', this)">Add</a></li>
        </ul>
    </section>`;
    linksContainerElement.insertAdjacentHTML("beforeend", html);
}

let data = JSON.parse(localStorage.getItem("data"));
data?.forEach(category => showCategory(category.title, category.items));

if (!data) {
    fetch("default.json")
        .then(response => response.json())
        .then(json => json.forEach(category => showCategory(category.title, category.items), data = json));
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    const url = ev.dataTransfer.getData("text")
    addItem(ev.target, url);
}

function exportJson() {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
}
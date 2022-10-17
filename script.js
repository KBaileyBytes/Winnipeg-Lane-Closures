document.addEventListener("DOMContentLoaded", load);

// On load
function load()
{
    document.getElementById('content').style.display = "none";

    let button = document.querySelector("#search");
    let input = document.querySelector("#searchField");

    button.addEventListener("click", () => getData());
    input.addEventListener("keypress", (event) => {
        if (event.key === "Enter")
        {
            event.preventDefault();
            getData();
        }
    });
}

// Gets the data if they pressed 'Enter' on the keyboard or clicked the button
// Only fetches if the field isn't empty
function getData()
{
    let userInput = document.getElementById("searchField").value;

    let streets = {
        'ROAD': 'Rd',
        'AVENUE': 'Av',
        'STREET': 'St',
        'DRIVE': 'Dr',
        'HIGHWAY': 'Hw',
        'CRESCENT': 'Cr'
    };

    let modifiedInput = userInput;

    // Replace any literal street names with it's appropriate abbreviation
    for (let key in streets)
    {
        let replace = new RegExp(key, 'gi');
        modifiedInput = modifiedInput.replace(replace, streets[key]);
    }

    const apiURL = 'https://data.winnipeg.ca/resource/lane_closure.json?' +
                   `$where=lower(primary_street) LIKE lower('%${modifiedInput}%')` +
                   '&$order=primary_street ASC' +
                   '&$limit=100';
    const encodedURL = encodeURI(apiURL);
    
    if (userInput != null && userInput != "")
    {
        fetch(encodedURL)
            .then((result) => result.json())
            .then((data) => {
                displayData(data, userInput);
            });
    }
}

// Creates the appropriate table rows + data, if no rows are returned displays an error message
function displayData(data, userInput)
{
    let container = document.getElementById('content');
    let hint = document.getElementById('hint');
    let tbody = document.getElementById('tbody');
    tbody.innerHTML = '';
    container.style.display = "none";

    document.getElementById('contentSection').append(hint);
    hint.classList = "text-muted text-center pt-5";
    hint.innerHTML = data.length > 0 ? 
                    `The ${data.length} lane closures with a name that include '${userInput}'.` :
                    `Could not find any roads that contain '${userInput}'.`;

    if (data.length > 0)
    {
        container.style.display = "block";

        container.prepend(hint);
        hint.classList = "text-muted pt-5";

        data.forEach((rowData) => {
            let tr = document.createElement("tr");

            let keys = ["primary_street", "cross_street", "boundaries", "direction", "traffic_effect"];

            for (const key of keys) 
            {
                let td = document.createElement("td");
                td.innerHTML = rowData[key] === undefined ? "" : rowData[key];
                tr.append(td);
            }

            tbody.append(tr);
        });
    }
}
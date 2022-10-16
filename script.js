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
                clearData();
                displayData(data, userInput);
            });
    }
}

// Creates the appropriate table rows + data, if no rows are returned displays an error message
function displayData(data, userInput)
{
    let container = document.getElementById('content');
    container.style.display = "none";

    if (data.length > 0)
    {
        container.style.display = "block";
        document.getElementById('hint').style.display = "none";

        let tbody = document.getElementById('tbody');
        let h2 = document.createElement('h2');
        h2.className = "contentTitle mt-3";
        h2.id = "contentTitle";
        h2.innerHTML = `The ${data.length} lane closures with a name that include '${userInput}'.`

        container.prepend(h2);

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
    else
    {
        let bottomContainer = document.getElementById('contentSection');
        let h2 = document.createElement("h2");
        h2.className = "text-center";
        h2.id = "noData";
        h2.innerHTML = `Could not find any roads that contain '${userInput}'.`;
        
        bottomContainer.prepend(h2);
    }
}

// Clears the data when a new query is made
function clearData()
{
    let tbody = document.getElementById('tbody');
    let child = tbody.lastElementChild;

    // While the body contains a child, delete it until it is null
    while(child)
    {
        tbody.removeChild(child);
        child = tbody.lastElementChild;
    }

    let h2 = document.querySelector("#contentTitle");
    let h2Data = document.getElementById("noData");

    if (h2 !== undefined && h2 !== null)
    {
        h2.remove();
    }
    if (h2Data !== undefined && h2Data !== null)
    {
        h2Data.remove();
    }
}
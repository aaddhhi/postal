const result = document.getElementById("result");
const loading = document.getElementById("loading");
const resultCount = document.getElementById("resultCount");

let allPostOffices = [];

/* -------------------- Loading -------------------- */

function showLoading() {
    loading.classList.remove("hidden");
}

function hideLoading() {
    loading.classList.add("hidden");
}

/* -------------------- Card Template -------------------- */

function createCard(post) {
    return `
    <div class="bg-white rounded-xl shadow-lg p-5 border-l-4 border-red-600 hover:-translate-y-2 transition-all duration-300">

        <h3 class="text-xl font-bold text-red-600 mb-3">
            ${post.Name}
        </h3>

        <div class="space-y-2 text-gray-700">

            <p><strong>Branch Type:</strong> ${post.BranchType}</p>

            <p><strong>District:</strong> ${post.District}</p>

            <p><strong>State:</strong> ${post.State}</p>

            <p><strong>Pincode:</strong> ${post.Pincode}</p>

            <p><strong>Delivery:</strong> ${post.DeliveryStatus}</p>

            <p><strong>Circle:</strong> ${post.Circle}</p>

            <p><strong>Region:</strong> ${post.Region}</p>

            <p><strong>Division:</strong> ${post.Division}</p>

        </div>

    </div>
    `;
}

/* -------------------- Display Results -------------------- */

function displayResults(data) {

    allPostOffices = data;

    result.innerHTML = "";

    if (data.length === 0) {

        result.innerHTML = `
        <div class="col-span-full text-center text-red-600 text-xl font-bold">
            No Records Found
        </div>
        `;

        resultCount.textContent = "Found 0 Post Offices";
        return;
    }

    let cards = "";

    data.forEach(post => {
        cards += createCard(post);
    });

    result.innerHTML = cards;

    resultCount.textContent =
        `Found ${data.length} Post Offices`;

    updateStatistics(data);
}

/* -------------------- Statistics -------------------- */

function updateStatistics(data) {

    document.getElementById("totalOffices").textContent =
        data.length;

    const states =
        [...new Set(data.map(item => item.State))];

    document.getElementById("totalStates").textContent =
        states.length;

    const districts =
        [...new Set(data.map(item => item.District))];

    document.getElementById("totalDistricts").textContent =
        districts.length;

    const deliveryCount =
        data.filter(item =>
            item.DeliveryStatus === "Delivery"
        ).length;

    document.getElementById("deliveryCount").textContent =
        deliveryCount;
}

/* -------------------- Search By Pincode -------------------- */

async function searchPincode() {

    const pincode =
        document.getElementById("pincode").value.trim();

    if (pincode.length !== 6) {

        alert("Please enter a valid 6 digit pincode");
        return;
    }

    showLoading();

    try {

        const response =
            await fetch(
                `https://api.postalpincode.in/pincode/${pincode}`
            );

        const data = await response.json();

        hideLoading();

        if (
            data[0].Status === "Error" ||
            !data[0].PostOffice
        ) {

            displayResults([]);
            return;
        }

        

        displayResults(data[0].PostOffice);

    } catch (error) {

        hideLoading();

        result.innerHTML =
            `<p class="text-red-600">Error fetching data.</p>`;

        console.error(error);
    }
}

/* -------------------- Search By Office Name -------------------- */

async function searchPostOffice() {

    const office =
        document.getElementById("postoffice").value.trim();

    if (office === "") {

        alert("Enter a Post Office Name");
        return;
    }

    showLoading();

    try {

        const response =
            await fetch(
                `https://api.postalpincode.in/postoffice/${office}`
            );

        const data = await response.json();

        hideLoading();

        if (
            data[0].Status === "Error" ||
            !data[0].PostOffice
        ) {

            displayResults([]);
            return;
        }

        

        displayResults(data[0].PostOffice);

    } catch (error) {

        hideLoading();

        result.innerHTML =
            `<p class="text-red-600">Error fetching data.</p>`;

        console.error(error);
    }
}

/* -------------------- Search History -------------------- */



/* -------------------- Filter -------------------- */

document
.getElementById("filterDelivery")
.addEventListener("change", function () {

    const value = this.value;

    if (value === "all") {

        displayResults(allPostOffices);
        return;
    }

    const filtered =
        allPostOffices.filter(post =>
            post.DeliveryStatus === value
        );

    displayResults(filtered);
});

/* -------------------- Dark Mode -------------------- */

/* -------------------- Dark Mode -------------------- */

const darkBtn = document.getElementById("darkModeBtn");

darkBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")){
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }

});

window.addEventListener("load", () => {

    if(localStorage.getItem("darkMode") === "enabled"){
        document.body.classList.add("dark-mode");
    }

});

/* -------------------- Export PDF -------------------- */
function exportPDF() {

    if (allPostOffices.length === 0) {
        alert("No results available.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(220, 38, 38);

    doc.text("India Postal Service Results", 20, 20);

    let y = 35;

    allPostOffices.forEach((post, index) => {

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        doc.text(`${index + 1}. ${post.Name}`, 10, y);
        y += 8;

        doc.text(`Pincode: ${post.Pincode}`, 15, y);
        y += 7;

        doc.text(`District: ${post.District}`, 15, y);
        y += 7;

        doc.text(`State: ${post.State}`, 15, y);
        y += 7;

        doc.text(`Delivery: ${post.DeliveryStatus}`, 15, y);
        y += 7;

        doc.text(`Branch Type: ${post.BranchType}`, 15, y);
        y += 12;

        if (y > 270) {
            doc.addPage();
            y = 20;
        }
    });

    doc.save("PostalServiceResults.pdf");
}
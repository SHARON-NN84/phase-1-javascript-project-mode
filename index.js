/*this is where our js content is gonna start from*/
            //OuR DOM elements will go here lol//
        function addFood() {
             const JSON_SERVER_URL ="https://json-server-xzcy.onrender.com/";// Our local storage for data for daily logins 
             const foodSearchInput = document.getElementById('food-search');
             const totalCaloriesSpan = document.getElementById('total-calories');
             const totalProteinSpan = document.getElementById('total-protein');
             const totalCarbsSpan = document.getElementById('total-carbs');
             const totalFatSpan = document.getElementById('total-fat');
             const resetLogBtn = document.getElementById('reset-log-btn');
        }
        

        // track your food
        let currentFoodResults = [];
        let activeFoodSelection = null

     
    // general-purpose async function to get data from anywhere 
    async function fetchDataFromAPI(targetUrl, fetchOptions = {}) {
        try {
            const response = await fetch(targetUrl, fetchOptions);
            if (!response.ok) {
                // Something went wrong on the server side or network
                throw new Error(`HTTP issue! Status: ${response.status} from ${targetUrl}`);
            }
            return await response.json(); // If all's good, parse the JSON
        } catch (err) {
            console.error(`Oops, couldn't fetch data from ${targetUrl}:`, err);
            // Give the user a hint based on what failed
            if (targetUrl.includes(OFFT_API_URL)) {
                foodDisplayArea.innerHTML = '<p>Couldn\'t grab food items from Open Food Facts. Maybe check your internet, or try again in a bit!</p>';
            } else if (targetUrl.includes(JSON_SERVER_URL)) {
                // A gentle nudge if json-server might be offline
                if (!targetUrl.includes('/dailyLog')) {
                     console.warn('Just a heads-up: json-server might not be running for daily log tasks.');
                }
                dailyLogList.innerHTML = '<p>Having trouble loading your daily log. Make sure json-server is up and running!</p>';
                updateNutrientTotals(0, 0, 0, 0); // Clear old totals if we can't get new ones
            } else {
                foodDisplayArea.innerHTML = '<p>Ran into an unexpected snag while getting data.</p>';
            }
        return null; // Indicate failure
    }
}

  function formatOFFProduct(rawProduct) {
    // If we're missing crucial info, this item isn't useful for us
    if (!rawProduct || !rawProduct.product_name || !rawProduct.id) {
        return null;
    }

    const nutrients = rawProduct.nutriments || {};
    // Convert kJ to kcal if only kJ is available, otherwise use kcal directly
    const cals = nutrients['energy-kcal_100g'] || (nutrients['energy_100g'] / 4.184) || 0;
    const proteinVal = nutrients.proteins_100g || 0;
    const carbVal = nutrients.carbohydrates_100g || 0;
    const fatVal = nutrients.fat_100g || 0;

    return {
        id: rawProduct.id,
        name: rawProduct.product_name,
        // Fallback description if the main one isn't there
        description: rawProduct.generic_name || rawProduct.ingredients_text || 'No description provided.',
        calories: parseFloat(cals.toFixed(1)),
        protein: parseFloat(proteinVal.toFixed(1)),
        carbs: parseFloat(carbVal.toFixed(1)),
        fat: parseFloat(fatVal.toFixed(1)),
        // Use a placeholder if no image URL exists
        image: rawProduct.image_small_url || rawProduct.image_url || 'https://via.placeholder.com/100x120?text=No+Image'
    };
}

    // allows a search for food in the API
  async function searchFoods(term) {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) {
        foodDisplayArea.innerHTML = '<p>Type something in the search box to find foods you like!</p>';
        currentFoodResults = [];
        showFoodList(currentFoodResults); // Clear any old results
        return;
    }

    foodDisplayArea.innerHTML = '<p>Fetching delicious foods...</p>';
    activeFoodSelection = null; 
    detailPanel.innerHTML = '<p>Pick a food from the list to see more.</p>';
    logFoodButton.classList.add('hidden'); 

    //here we  build the Open Food Facts query URL
    const queryUrl = `${OFFT_API_URL}?action=process&search_terms=${encodeURIComponent(trimmedTerm)}&sort_by=popularity&page_size=20&json=1`;
    const apiData = await fetchDataFromAPI(queryUrl);

    if (apiData && apiData.products) {
        currentFoodResults = apiData.products
            .map(formatOFFProduct) // Standardize  prodcts
            .filter(food => food !== null); // Ditch any unparsable ones 

        if (currentFoodResults.length === 0) {
            foodDisplayArea.innerHTML = '<p>No matching foods found. Try a different search term!</p>';
        } else {
            showFoodList(currentFoodResults);
        }
    } else {

        currentFoodResults = [];
    }
}
    // Creates and adds a single food card to the list
    function createFoodCard(food) {
    const card = document.createElement('div');
    card.classList.add('food-item');
    card.dataset.id = food.id; // Handy for looking it up later
    card.innerHTML = `
        <img src="${food.image}" alt="${food.name}" onerror="this.onerror=null;this.src='data:image/jpeg;base64,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
        <p>${food.calories} kcal</p>
    `;
    // Add a click listener right here – feels more direct
    card.addEventListener('click', () => showFoodDetails(food));
    foodDisplayArea.appendChild(card);
}

    // Updates the detailed view panel with info about the food of your choice!
    function showFoodDetails(food) {
    activeFoodSelection = food;
    detailPanel.innerHTML = `
        <h3>${food.name}</h3>
        <img src="${food.image}" alt="${food.name}" onerror="this.onerror=null;this.src='data:image/jpeg;base64,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
        <p><strong>Description:</strong> ${food.description}</p>
        <p><strong>Calories:</strong> ${food.calories} kcal</p>
        <p><strong>Protein:</strong> ${food.protein} g</p>
        <p><strong>Carbs:</strong> ${food.carbs} g</p>
        <p><strong>Fat:</strong> ${food.fat} g</p>
    `;
    logFoodButton.classList.remove('hidden');//make visible
}

// list of food items based on the provided array
function showFoodList(foodsToShow) {
    foodDisplayArea.innerHTML = ''; // Clear previous list first
    if (foodsToShow.length === 0) {
         foodDisplayArea.innerHTML = '<p>No foods to display. Maybe try a different search?</p>';
         return;
    }
    // Loop through each food and create its card
    foodsToShow.forEach(food => createFoodCard(food));
}

// Adds the selected food to the daily log
async function logCurrentFood() {
    if (!activeFoodSelection) {
        alert('First, pick a food from the list!');
        return;
    }

    // Prepare the entry for our log
    const entry = {
        foodId: activeFoodSelection.id,
        name: activeFoodSelection.name,
        calories: activeFoodSelection.calories,
        protein: activeFoodSelection.protein,
        carbs: activeFoodSelection.carbs,
        fat: activeFoodSelection.fat,
        loggedAt: new Date().toISOString() 
    };

    try {
        // Send it to our json-server 
        const newEntry = await fetchDataFromAPI(`${JSON_SERVER_URL}/dailyLog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entry)
        });

        if (newEntry) {
            console.log('Food successfully logged:', newEntry);
            refreshDailyLog(); 
        }
    } catch (err) {
        console.error('Problem logging food:', err);
        alert('Couldn\'t log that food. Is json-server running for the log?');
    }
}

// Fetches and updates the daily log display and totals
async function refreshDailyLog() {
    const logEntries = await fetchDataFromAPI(`${JSON_SERVER_URL}/dailyLog`);
    dailyLogList.innerHTML = ''; // Clear the current log display

    let calsTotal = 0;
    let proteinTotalVal = 0;
    let carbsTotalVal = 0;
    let fatTotalVal = 0;

    if (!logEntries || logEntries.length === 0) {
        dailyLogList.innerHTML = '<p>Nothing logged yet! Get started by adding some foods.</p>';
    } else {
        logEntries.forEach(item => {
            const logItemDiv = document.createElement('div');
            logItemDiv.classList.add('log-item');
            logItemDiv.innerHTML = `
                <p><strong>${item.name}</strong> - ${item.calories} kcal</p>
            `;
            dailyLogList.appendChild(logItemDiv);

            // Add to our running totals
            calsTotal += item.calories;
            proteinTotalVal += item.protein;
            carbsTotalVal += item.carbs;
            fatTotalVal += item.fat;
        });
    }

    updateNutrientTotals(calsTotal, proteinTotalVal, carbsTotalVal, fatTotalVal);
}

// Updates the nutritional totals
function updateNutrientTotals(cals, protein, carbs, fat) {
    caloriesTotal.textContent = cals.toFixed(1);
    proteinTotal.textContent = protein.toFixed(1);
    carbsTotal.textContent = carbs.toFixed(1);
    fatTotal.textContent = fat.toFixed(1);
}

// Filters the currently displayed food list based on user input
function filterCurrentFoods() {
    const currentSearchTerm = searchBox.value.toLowerCase();
    // Create a new list with only the matching foods this is important to get clear info
    const filteredResults = currentFoodResults.filter(food =>
        food.name.toLowerCase().includes(currentSearchTerm) ||
        (food.description && food.description.toLowerCase().includes(currentSearchTerm))
    );
    showFoodList(filteredResults);
}

async function clearAllLogs() {
    if (!confirm('Are you absolutely sure you want to clear your entire daily log? This can\'t be undone!')) {
        return; // User changed their mind
    }

    try {
        const existingLogs = await fetchDataFromAPI(`${JSON_SERVER_URL}/dailyLog`);
        if (existingLogs) {
            // Delete each entry 
            const deletePromises = existingLogs.map(item =>
                fetch(`${JSON_SERVER_URL}/dailyLog/${item.id}`, { method: 'DELETE' })
            );
            await Promise.all(deletePromises);
            console.log('Daily log cleared.');
            refreshDailyLog(); // Update the display
        }
    } catch (err) {
        console.error('Failed to clear daily log:', err);
        alert('Problem resetting the log. Check if json-server is running.');
    }
}
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    // Save the user's preference in their browser
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

// Sets up everything when the page loads
async function initApp() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    //load up daily log
    refreshDailyLog();

    // Give the user starting instruction 
    foodDisplayArea.innerHTML = '<p>Ready to track your food? Type a food name (like "apple" or "chicken") in the search box and hit "New Search"!</p>';
logFoodButton.addEventListener('click', logCurrentFood);
}

// As you type in the search box, filter the current results
searchBox.addEventListener('input', filterCurrentFoods);

newSearchButton.addEventListener('click', () => {
    searchFoods(searchBox.value);
});

// Also trigger a new search if you hit 'Enter' in the search box
searchBox.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // if any default form submission stop
        newSearchButton.click();
    }
});

clearLogButton.addEventListener('click', clearAllLogs);

themeSwitcher.addEventListener('click', toggleTheme);

// Make sure our app starts up only after the whole page is ready
document.addEventListener('DOMContentLoaded', initApp);

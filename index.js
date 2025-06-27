/*this is where our js content is gonna start from*/
            //OuR DOM elements will go here lol//
const JSON_SERVER_URL ="https://json-server-xzcy.onrender.com/";// Our local storage for data for daily logins 
// Sample food database
const foodDatabase = [
    { name: "Apple", calories: 52, carbs: 14, protein: 0.3, fat: 0.2 },
    { name: "Banana", calories: 89, carbs: 23, protein: 1.1, fat: 0.3 },
    { name: "Chicken Breast", calories: 165, carbs: 0, protein: 31, fat: 3.6 },
    { name: "Brown Rice", calories: 111, carbs: 23, protein: 2.6, fat: 0.9 },
    { name: "Broccoli", calories: 34, carbs: 7, protein: 2.8, fat: 0.4 },
    { name: "Salmon", calories: 208, carbs: 0, protein: 22, fat: 12 },
    { name: "Eggs", calories: 155, carbs: 1.1, protein: 13, fat: 11 },
    { name: "Avocado", calories: 160, carbs: 9, protein: 2, fat: 15 },
    { name: "Oatmeal", calories: 68, carbs: 12, protein: 2.4, fat: 1.4 },
    { name: "Greek Yogurt", calories: 59, carbs: 3.6, protein: 10, fat: 0.4 },
    { name: "Sweet Potato", calories: 86, carbs: 20, protein: 1.6, fat: 0.1 },
    { name: "Spinach", calories: 23, carbs: 3.6, protein: 2.9, fat: 0.4 },
    { name: "Almonds", calories: 579, carbs: 22, protein: 21, fat: 50 },
    { name: "Quinoa", calories: 120, carbs: 22, protein: 4.4, fat: 1.9 },
    { name: "Tuna", calories: 144, carbs: 0, protein: 30, fat: 1 }
];
// Daily nutrition totals
let dailyTotals = {
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0
};
// Food log array
let foodLog = [];
// Search foods function
function searchFoods() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    const resultsDiv = document.getElementById('results');
    
    if (query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
    }
    const matches = foodDatabase.filter(food => 
        food.name.toLowerCase().includes(query)
    );
    if (matches.length === 0) {
        resultsDiv.innerHTML = '<div class="search-item">No foods found</div>';
        return;
    }
    resultsDiv.innerHTML = matches.map(food => `
        <div class="search-item" onclick="selectFood('${food.name}', ${food.calories}, ${food.carbs}, ${food.protein}, ${food.fat})">
            <strong>${food.name}</strong><br>
            <small>${food.calories} cal, ${food.carbs}g carbs, ${food.protein}g protein, ${food.fat}g fat (per 100g)</small>
        </div>
    `).join('');
}
// Select food from search
function selectFood(name, calories, carbs, protein, fat) {
    document.getElementById('itemName').value = name;
    document.getElementById('cals').value = calories;
    document.getElementById('carbohydrates').value = carbs;
    document.getElementById('proteins').value = protein;
    document.getElementById('fats').value = fat;
    document.getElementById('results').innerHTML = '';
    document.getElementById('searchBox').value = '';
}
// Add food function
function addFood() {
    const name = document.getElementById('itemName').value;
    const servingSize = parseFloat(document.getElementById('portion').value) || 100;
    const calories = parseFloat(document.getElementById('cals').value) || 0;
    const carbs = parseFloat(document.getElementById('carbohydrates').value) || 0;
    const protein = parseFloat(document.getElementById('proteins').value) || 0;
    const fat = parseFloat(document.getElementById('fats').value) || 0;
    if (!name) {
        alert('Please enter a food name');
        return;
    }
    // Calculate nutrition based on serving size
    const multiplier = servingSize / 100;
    const foodItem = {
        name: name,
        servingSize: servingSize,
        calories: Math.round(calories * multiplier),
        carbs: Math.round(carbs * multiplier * 10) / 10,
        protein: Math.round(protein * multiplier * 10) / 10,
        fat: Math.round(fat * multiplier * 10) / 10,
        id: Date.now()
    };
    // Add to food log
    foodLog.push(foodItem);
    // Update daily totals
    dailyTotals.calories += foodItem.calories;
    dailyTotals.carbs += foodItem.carbs;
    dailyTotals.protein += foodItem.protein;
    dailyTotals.fat += foodItem.fat;
    // Update display
    updateDisplay();
    clearForm();
}
// Clear form
function clearForm() {
    document.getElementById('itemName').value = '';
    document.getElementById('portion').value = '100';
    document.getElementById('cals').value = '';
    document.getElementById('carbohydrates').value = '';
    document.getElementById('proteins').value = '';
    document.getElementById('fats').value = '';
}
// Remove food item
function removeFood(id) {
    const index = foodLog.findIndex(item => item.id === id);
    if (index > -1) {
        const item = foodLog[index];
        
        // Subtract from daily totals
        dailyTotals.calories -= item.calories;
        dailyTotals.carbs -= item.carbs;
        dailyTotals.protein -= item.protein;
        dailyTotals.fat -= item.fat;
        // Remove from log
        foodLog.splice(index, 1);
        
        // Update display
        updateDisplay();
    }
}
// Clear food log
function clearFoodLog() {
    if (foodLog.length === 0) {
        alert('Food log is already empty');
        return;
    }
    if (confirm('Are you sure you want to clear all food entries?')) {
        foodLog = [];
        dailyTotals = {
            calories: 0,
            carbs: 0,
            protein: 0,
            fat: 0
        };
        updateDisplay();
    }
}
// Update display
function updateDisplay() {
    // Update totals
    document.getElementById('dailyCals').textContent = Math.round(dailyTotals.calories);
    document.getElementById('dailyCarbs').textContent = Math.round(dailyTotals.carbs * 10) / 10 + 'g';
    document.getElementById('dailyProtein').textContent = Math.round(dailyTotals.protein * 10) / 10 + 'g';
    document.getElementById('dailyFat').textContent = Math.round(dailyTotals.fat * 10) / 10 + 'g';
    // Update progress bar
    const calorieGoal = 2000;
    const progress = Math.min((dailyTotals.calories / calorieGoal) * 100, 100);
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressText').textContent = 
        `${Math.round(dailyTotals.calories)} / ${calorieGoal} calories (${Math.round(progress)}%)`;
    // Update food log
    const foodLogDiv = document.getElementById('foodHistory');
    if (foodLog.length === 0) {
        foodLogDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nothing logged yet - add some foods above!</p>';
    } else {
        foodLogDiv.innerHTML = foodLog.map(item => `
            <div class="food-item">
                <div class="food-details">
                    <div class="food-name">${item.name} (${item.servingSize}g)</div>
                    <div class="food-nutrients">
                        ${item.calories} cal • ${item.carbs}g carbs • ${item.protein}g protein • ${item.fat}g fat
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFood(${item.id})">Remove</button>
            </div>
        `).join('');
    }
}
// Initialize display
updateDisplay();        
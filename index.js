// JSON Server configuration
const API_BASE_URL = 'https://json-server-xzcy.onrender.com';

// Daily nutrition totals
let dailyTotals = {
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0
};

// Food log array
let foodLog = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadFoodLog();
});

// Load food log from server
async function loadFoodLog() {
    try {
        const response = await fetch(`${API_BASE_URL}/dailyLog`);
        if (response.ok) {
            foodLog = await response.json();
            calculateDailyTotals();
            updateDisplay();
        } else {
            console.error('Failed to load food log');
            updateDisplay();
        }
    } catch (error) {
        console.error('Error loading food log:', error);
        updateDisplay();
    }
}

// Calculate daily totals from food log
function calculateDailyTotals() {
    dailyTotals = {
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0
    };

    foodLog.forEach(item => {
        dailyTotals.calories += item.calories;
        dailyTotals.carbs += item.carbs;
        dailyTotals.protein += item.protein;
        dailyTotals.fat += item.fat;
    });
}

// Search foods function (placeholder)
function searchFoods() {
    const query = document.getElementById('foodSearch').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('searchResults');
    
    if (query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }

    // TODO: Implement actual search logic here
    // This is a placeholder implementation
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = '<div class="search-item">Search functionality to be implemented</div>';
}

// Select food from search (placeholder)
function selectFood(name, calories, carbs, protein, fat) {
    document.getElementById('foodName').value = name;
    document.getElementById('calories').value = calories;
    document.getElementById('carbs').value = carbs;
    document.getElementById('protein').value = protein;
    document.getElementById('fat').value = fat;
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('foodSearch').value = '';
}

// Add food function with API integration
async function addFood() {
    const name = document.getElementById('foodName').value.trim();
    const servingSize = parseFloat(document.getElementById('servingSize').value) || 100;
    const calories = parseFloat(document.getElementById('calories').value) || 0;
    const carbs = parseFloat(document.getElementById('carbs').value) || 0;
    const protein = parseFloat(document.getElementById('protein').value) || 0;
    const fat = parseFloat(document.getElementById('fat').value) || 0;

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
        timestamp: new Date().toISOString()
    };

    try {
        // POST to JSON server
        const response = await fetch(`${API_BASE_URL}/dailyLog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(foodItem)
        });

        if (response.ok) {
            const savedItem = await response.json();
            
            // Add to local food log
            foodLog.push(savedItem);
            
            // Update daily totals
            dailyTotals.calories += savedItem.calories;
            dailyTotals.carbs += savedItem.carbs;
            dailyTotals.protein += savedItem.protein;
            dailyTotals.fat += savedItem.fat;

            // Update display and clear form
            updateDisplay();
            clearForm();
        } else {
            alert('Failed to save food item');
        }
    } catch (error) {
        console.error('Error adding food:', error);
        alert('Error adding food item');
    }
}

// Clear form
function clearForm() {
    document.getElementById('foodName').value = '';
    document.getElementById('servingSize').value = '100';
    document.getElementById('calories').value = '';
    document.getElementById('carbs').value = '';
    document.getElementById('protein').value = '';
    document.getElementById('fat').value = '';
}

// Remove food item with API integration
async function removeFood(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/dailyLog/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Find and remove from local food log
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
        } else {
            alert('Failed to remove food item');
        }
    } catch (error) {
        console.error('Error removing food:', error);
        alert('Error removing food item');
    }
}

// Clear food log with API integration
async function clearFoodLog() {
    if (foodLog.length === 0) {
        alert('Food log is already empty');
        return;
    }

    if (!confirm('Are you sure you want to clear all food entries?')) {
        return;
    }

    try {
        // Delete all items from server
        const deletePromises = foodLog.map(item => 
            fetch(`${API_BASE_URL}/dailyLog/${item.id}`, { method: 'DELETE' })
        );

        const responses = await Promise.all(deletePromises);
        const allSuccessful = responses.every(response => response.ok);

        if (allSuccessful) {
            // Clear local data
            foodLog = [];
            dailyTotals = {
                calories: 0,
                carbs: 0,
                protein: 0,
                fat: 0
            };
            updateDisplay();
        } else {
            alert('Some items could not be deleted. Please try again.');
        }
    } catch (error) {
        console.error('Error clearing food log:', error);
        alert('Error clearing food log');
    }
}

// Update display
function updateDisplay() {
    // Update totals
    document.getElementById('totalCalories').textContent = Math.round(dailyTotals.calories);
    document.getElementById('totalCarbs').textContent = Math.round(dailyTotals.carbs * 10) / 10 + 'g';
    document.getElementById('totalProtein').textContent = Math.round(dailyTotals.protein * 10) / 10 + 'g';
    document.getElementById('totalFat').textContent = Math.round(dailyTotals.fat * 10) / 10 + 'g';

    // Update progress bar
    const calorieGoal = 2000;
    const progress = Math.min((dailyTotals.calories / calorieGoal) * 100, 100);
    document.getElementById('calorieProgress').style.width = progress + '%';
    document.getElementById('calorieText').textContent = 
        `${Math.round(dailyTotals.calories)} / ${calorieGoal} calories (${Math.round(progress)}%)`;

    // Update food log
    const foodLogDiv = document.getElementById('foodLog');
    if (foodLog.length === 0) {
        foodLogDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No foods added yet. Start tracking your nutrition!</p>';
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

// Hide search results when clicking outside
document.addEventListener('click', function(event) {
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.getElementById('foodSearch');
    
    if (!searchResults.contains(event.target) && event.target !== searchInput) {
        searchResults.style.display = 'none';
    }
});
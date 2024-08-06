const gridSize = 10;
const grid = [];
let plants = [];
let herbivores = [];
let predators = [];
let isRunning = false;
let currentWeather = 'sunny';

function initializeGrid() {
    const ecosystemGrid = document.getElementById('ecosystem-grid');
    ecosystemGrid.innerHTML = '';
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = i;
            cell.dataset.y = j;
            ecosystemGrid.appendChild(cell);
            grid[i][j] = cell;
        }
    }
}

function addEntity(type, x, y) {
    if (x === undefined) x = Math.floor(Math.random() * gridSize);
    if (y === undefined) y = Math.floor(Math.random() * gridSize);
    
    if (!grid[x][y].classList.contains('plant') && !grid[x][y].classList.contains('herbivore') && !grid[x][y].classList.contains('predator')) {
        grid[x][y].classList.add(type);
        if (type === 'plant') {
            plants.push({x, y, age: 0});
        } else if (type === 'herbivore') {
            herbivores.push({x, y, energy: 50});
        } else if (type === 'predator') {
            predators.push({x, y, energy: 75});
        }
    }
}

function removeEntity(type, x, y) {
    grid[x][y].classList.remove(type);
    if (type === 'plant') {
        plants = plants.filter(p => p.x !== x || p.y !== y);
    } else if (type === 'herbivore') {
        herbivores = herbivores.filter(h => h.x !== x || h.y !== y);
    } else if (type === 'predator') {
        predators = predators.filter(p => p.x !== x || p.y !== y);
    }
}

function updateStats() {
    document.getElementById('plant-count').textContent = plants.length;
    document.getElementById('herbivore-count').textContent = herbivores.length;
    document.getElementById('predator-count').textContent = predators.length;
}

function moveEntity(entity, entityType) {
    const newX = (entity.x + Math.floor(Math.random() * 3) - 1 + gridSize) % gridSize;
    const newY = (entity.y + Math.floor(Math.random() * 3) - 1 + gridSize) % gridSize;
    
    removeEntity(entityType, entity.x, entity.y);
    entity.x = newX;
    entity.y = newY;
    addEntity(entityType, entity.x, entity.y);
}

function changeWeather() {
    const weathers = ['sunny', 'rainy', 'snowy'];
    currentWeather = weathers[Math.floor(Math.random() * weathers.length)];
    document.getElementById('current-weather').textContent = currentWeather;
    document.getElementById('ecosystem-grid').className = currentWeather;
}

function applyWeatherEffects() {
    switch (currentWeather) {
        case 'sunny':
            plants.forEach(plant => {
                if (Math.random() < 0.3) {
                    plant.age++;
                }
            });
            break;
        case 'rainy':
            plants.forEach(plant => {
                if (Math.random() < 0.4) {
                    const newX = (plant.x + Math.floor(Math.random() * 3) - 1 + gridSize) % gridSize;
                    const newY = (plant.y + Math.floor(Math.random() * 3) - 1 + gridSize) % gridSize;
                    addEntity('plant', newX, newY);
                }
            });
            herbivores.forEach(herbivore => herbivore.energy -= 1);
            predators.forEach(predator => predator.energy -= 1);
            break;
        case 'snowy':
            plants = plants.filter(plant => {
                if (Math.random() < 0.2) {
                    removeEntity('plant', plant.x, plant.y);
                    return false;
                }
                return true;
            });
            herbivores.forEach(herbivore => herbivore.energy -= 2);
            predators.forEach(predator => predator.energy -= 2);
            break;
    }
}

function simulateEcosystem() {
    if (!isRunning) return;

    // Change weather occasionally
    if (Math.random() < 0.1) {
        changeWeather();
    }

    applyWeatherEffects();

    // Plant growth
    plants.forEach(plant => {
        plant.age++;
        if (plant.age >= 5 && Math.random() < 0.2) {
            const newX = (plant.x + Math.floor(Math.random() * 3) - 1 + gridSize) % gridSize;
            const newY = (plant.y + Math.floor(Math.random() * 3) - 1 + gridSize) % gridSize;
            addEntity('plant', newX, newY);
        }
    });

    // Herbivore movement and feeding
    herbivores.forEach(herbivore => {
        moveEntity(herbivore, 'herbivore');
        herbivore.energy--;

        if (grid[herbivore.x][herbivore.y].classList.contains('plant')) {
            removeEntity('plant', herbivore.x, herbivore.y);
            herbivore.energy += 20;
            if (herbivore.energy > 100 && Math.random() < 0.2) {
                addEntity('herbivore');
            }
        }

        if (herbivore.energy <= 0) {
            removeEntity('herbivore', herbivore.x, herbivore.y);
        }
    });

    // Predator movement and hunting
    predators.forEach(predator => {
        moveEntity(predator, 'predator');
        predator.energy--;

        if (grid[predator.x][predator.y].classList.contains('herbivore')) {
            removeEntity('herbivore', predator.x, predator.y);
            predator.energy += 30;
            if (predator.energy > 120 && Math.random() < 0.2) {
                addEntity('predator');
            }
        }

        if (predator.energy <= 0) {
            removeEntity('predator', predator.x, predator.y);
        }
    });

    updateStats();
    setTimeout(simulateEcosystem, 1000);
}

function startSimulation() {
    if (!isRunning) {
        isRunning = true;
        simulateEcosystem();
    }
}

function pauseSimulation() {
    isRunning = false;
}

function resetSimulation() {
    isRunning = false;
    plants = [];
    herbivores = [];
    predators = [];
    initializeGrid();
    for (let i = 0; i < 20; i++) {
        addEntity('plant');
    }
    for (let i = 0; i < 5; i++) {
        addEntity('herbivore');
    }
    for (let i = 0; i < 3; i++) {
        addEntity('predator');
    }
    changeWeather();
    updateStats();
}

document.getElementById('start-btn').addEventListener('click', startSimulation);
document.getElementById('pause-btn').addEventListener('click', pauseSimulation);
document.getElementById('reset-btn').addEventListener('click', resetSimulation);

initializeGrid();
resetSimulation();
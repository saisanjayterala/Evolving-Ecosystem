const gridSize = 10;
const grid = [];
let plants = [];
let herbivores = [];
let predators = [];
let isRunning = false;
let currentWeather = 'sunny';
let selectedAction = null;

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

function addEntity(type, x, y, traits = {}) {
    if (x === undefined) x = Math.floor(Math.random() * gridSize);
    if (y === undefined) y = Math.floor(Math.random() * gridSize);
    
    if (!grid[x][y].classList.contains('plant') && !grid[x][y].classList.contains('herbivore') && !grid[x][y].classList.contains('predator')) {
        grid[x][y].classList.add(type);
        let entity = { x, y, ...traits };
        
        if (type === 'plant') {
            entity.age = 0;
            entity.growthRate = traits.growthRate || 1;
            plants.push(entity);
        } else if (type === 'herbivore') {
            entity.energy = 50;
            entity.speed = traits.speed || 1;
            herbivores.push(entity);
        } else if (type === 'predator') {
            entity.energy = 75;
            entity.strength = traits.strength || 1;
            predators.push(entity);
        }
        
        if (Object.keys(traits).length > 0) {
            grid[x][y].classList.add('evolved');
        }
    }
}

function removeEntity(type, x, y) {
    grid[x][y].classList.remove(type, 'evolved');
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
    addEntity(entityType, entity.x, entity.y, entity);
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
                if (Math.random() < 0.3 * plant.growthRate) {
                    plant.age++;
                }
            });
            break;
        case 'rainy':
            plants.forEach(plant => {
                if (Math.random() < 0.4 * plant.growthRate) {
                    const newX = (plant.x + Math.floor(Math.random() * 3) - 1 + gridSize) % gridSize;
                    const newY = (plant.y + Math.floor(Math.random() * 3) - 1 + gridSize) % gridSize;
                    addEntity('plant', newX, newY, { growthRate: plant.growthRate });
                }
            });
            herbivores.forEach(herbivore => herbivore.energy -= 1);
            predators.forEach(predator => predator.energy -= 1);
            break;
        case 'snowy':
            plants = plants.filter(plant => {
                if (Math.random() < 0.2 / plant.growthRate) {
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

function evolve(entity, type) {
    const mutationChance = 0.1;
    let evolved = false;
    
    if (type === 'plant' && Math.random() < mutationChance) {
        entity.growthRate *= 1.1;
        evolved = true;
    } else if (type === 'herbivore' && Math.random() < mutationChance) {
        entity.speed *= 1.1;
        evolved = true;
    } else if (type === 'predator' && Math.random() < mutationChance) {
        entity.strength *= 1.1;
        evolved = true;
    }
    
    if (evolved) {
        grid[entity.x][entity.y].classList.add('evolved');
        updateEvolutionDisplay(type, entity);
    }
}

function updateEvolutionDisplay(type, entity) {
    const display = document.getElementById('evolution-display');
    let trait;
    if (type === 'plant') trait = `Growth Rate: ${entity.growthRate.toFixed(2)}`;
    else if (type === 'herbivore') trait = `Speed: ${entity.speed.toFixed(2)}`;
    else if (type === 'predator') trait = `Strength: ${entity.strength.toFixed(2)}`;
    
    display.innerHTML += `<p>${type} evolved! ${trait}</p>`;
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
        if (plant.age >= 5 && Math.random() < 0.2 * plant.growthRate) {
            const newX = (plant.x + Math.floor(Math.random() * 3) - 1 + gridSize) % gridSize;
            const newY = (plant.y + Math.floor(Math.random() * 3) - 1 + gridSize) % gridSize;
            addEntity('plant', newX, newY, { growthRate: plant.growthRate });
        }
    });

    // Herbivore movement and feeding
    herbivores.forEach(herbivore => {
        moveEntity(herbivore, 'herbivore');
        herbivore.energy--;

        if (grid[herbivore.x][herbivore.y].classList.contains('plant')) {
            removeEntity('plant', herbivore.x, herbivore.y);
            herbivore.energy += 20;
            if (herbivore.energy > 100 && Math.random() < 0.2 * herbivore.speed) {
                addEntity('herbivore', undefined, undefined, { speed: herbivore.speed });
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
            if (predator.energy > 120 && Math.random() < 0.2 * predator.strength) {
                addEntity('predator', undefined, undefined, { strength: predator.strength });
            }
        }

        if (predator.energy <= 0) {
            removeEntity('predator', predator.x, predator.y);
        }
    });

    // Evolution
    plants.forEach(plant => evolve(plant, 'plant'));
    herbivores.forEach(herbivore => evolve(herbivore, 'herbivore'));
    predators.forEach(predator => evolve(predator, 'predator'));

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
    document.getElementById('evolution-display').innerHTML = '';
}

function setSelectedAction(action) {
    selectedAction = action;
}

function handleCellClick(event) {
    if (!selectedAction) return;

    const x = parseInt(event.target.dataset.x);
    const y = parseInt(event.target.dataset.y);

    addEntity(selectedAction, x, y);
    updateStats();
}

document.getElementById('start-btn').addEventListener('click', startSimulation);
document.getElementById('pause-btn').addEventListener('click', pauseSimulation);
document.getElementById('reset-btn').addEventListener('click', resetSimulation);
document.getElementById('add-plant-btn').addEventListener('click', () => setSelectedAction('plant'));
document.getElementById('add-herbivore-btn').addEventListener('click', () => setSelectedAction('herbivore'));
document.getElementById('add-predator-btn').addEventListener('click', () => setSelectedAction('predator'));

document.getElementById('ecosystem-grid').addEventListener('click', handleCellClick);

initializeGrid();
resetSimulation();
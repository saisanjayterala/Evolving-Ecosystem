const gridSize = 10;
const grid = [];
let plants = [];
let herbivores = [];
let isRunning = false;

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
    
    if (!grid[x][y].classList.contains('plant') && !grid[x][y].classList.contains('herbivore')) {
        grid[x][y].classList.add(type);
        if (type === 'plant') {
            plants.push({x, y, age: 0});
        } else if (type === 'herbivore') {
            herbivores.push({x, y, energy: 50});
        }
    }
}

function removeEntity(type, x, y) {
    grid[x][y].classList.remove(type);
    if (type === 'plant') {
        plants = plants.filter(p => p.x !== x || p.y !== y);
    } else if (type === 'herbivore') {
        herbivores = herbivores.filter(h => h.x !== x || h.y !== y);
    }
}

function updateStats() {
    document.getElementById('plant-count').textContent = plants.length;
    document.getElementById('herbivore-count').textContent = herbivores.length;
}

function simulateEcosystem() {
    if (!isRunning) return;

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
        const newX = (herbivore.x + Math.floor(Math.random() * 3) - 1 + gridSize) % gridSize;
        const newY = (herbivore.y + Math.floor(Math.random() * 3) - 1 + gridSize) % gridSize;
        
        removeEntity('herbivore', herbivore.x, herbivore.y);
        herbivore.x = newX;
        herbivore.y = newY;
        addEntity('herbivore', herbivore.x, herbivore.y);

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
    initializeGrid();
    for (let i = 0; i < 20; i++) {
        addEntity('plant');
    }
    for (let i = 0; i < 5; i++) {
        addEntity('herbivore');
    }
    updateStats();
}

document.getElementById('start-btn').addEventListener('click', startSimulation);
document.getElementById('pause-btn').addEventListener('click', pauseSimulation);
document.getElementById('reset-btn').addEventListener('click', resetSimulation);

initializeGrid();
resetSimulation();
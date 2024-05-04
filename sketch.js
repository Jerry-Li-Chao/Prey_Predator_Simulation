let preys = [];
let predators = [];
let foods = [];
let startTime = new Date(); // Capture start time upon first draw call
const NUM_FOODS = 50;
const NUM_PREYS = 100;
const NUM_PREDATORS = 10;
const VOLUME = 0.2;
const FRAMERATE = 40;
let predator_info = true;
let prey_info = false;
let simulation_speed = 0.7;

// audio 1-5 is for eating a prey
var audio1 = document.getElementById("audio1");
var audio2 = document.getElementById("audio2");
var audio3 = document.getElementById("audio3");
var audio4 = document.getElementById("audio4");
var audio5 = document.getElementById("audio5");
var prey_born1 = document.getElementById("prey_born1");
var prey_born2 = document.getElementById("prey_born2");
var prey_born3 = document.getElementById("prey_born3");
var predator_dead = document.getElementById("predator_born");
// Initial Muted
audio1.muted = true;
audio2.muted = true;
audio3.muted = true;
audio4.muted = true;
audio5.muted = true;
prey_born1.muted = true;
prey_born2.muted = true;
prey_born3.muted = true;
predator_dead.muted = true;
// Volumes audio 
audio1.volume = VOLUME;
audio2.volume = VOLUME;
audio3.volume = VOLUME;
audio4.volume = VOLUME;
audio5.volume = VOLUME;
prey_born1.volume = VOLUME;
prey_born2.volume = VOLUME;
prey_born3.volume = VOLUME;
predator_dead.volume = VOLUME;


function setup() {
  // auto adjust the canvas size based on the window size
  createCanvas(windowWidth * 0.98, windowHeight * 0.88);
  frameRate(FRAMERATE);
  strokeWeight(3);

  for (let i = 0; i < NUM_FOODS; i++) {
    foods.push(new Food(random(width), random(height)));
  }
  for (let i = 0; i < NUM_PREYS; i++) {
    preys.push(new Prey(random(width), random(height)));
  }
  for (let i = 0; i < NUM_PREDATORS; i++) {
    predators.push(new Predator(random(width), random(height)));
  }
}

function restartGame() {
  // Retrieve values from HTML input fields
  const NUM_FOODS = parseInt(document.getElementById('numFoods').value);
  const NUM_PREYS = parseInt(document.getElementById('numPreys').value);
  const NUM_PREDATORS = parseInt(document.getElementById('numPredators').value);

  // Clear existing arrays
  foods = [];
  preys = [];
  predators = [];

  // Repopulate arrays with new objects
  for (let i = 0; i < NUM_FOODS; i++) {
      foods.push(new Food(random(width), random(height)));
  }
  for (let i = 0; i < NUM_PREYS; i++) {
      preys.push(new Prey(random(width), random(height)));
  }
  for (let i = 0; i < NUM_PREDATORS; i++) {
      predators.push(new Predator(random(width), random(height)));
  }
  startTime = new Date(); // Reset the start time
  // Optionally reset any other relevant simulation state
}

function togglePredatorInfo(){
    predator_info = !predator_info;
}

function togglePreyInfo(){
    prey_info = !prey_info;
}

function toggleAudio() {
  audio1.muted = !audio1.muted;
  audio2.muted = !audio2.muted;
  audio3.muted = !audio3.muted;
  audio4.muted = !audio4.muted;
  audio5.muted = !audio5.muted;
  prey_born1.muted = !prey_born1.muted;
  prey_born2.muted = !prey_born2.muted;
  prey_born3.muted = !prey_born3.muted;
  predator_dead.muted = !predator_dead.muted;
}

function changeSimulationSpeed(){
    const slider_value = document.getElementById('simSpeed').value;
    simulation_speed = parseFloat(slider_value);
    document.getElementById("simSpeedValue").textContent = simulation_speed;
}

function draw() {
    // sets the background color to a light-blue color
    background(173, 216, 230);

  // Generate food every 1 seconds
    if (frameCount % Math.floor(FRAMERATE / simulation_speed) === 0) {
        generateFood(20);

        // Spawn more preys if the number is less than 10% of the initial population
        if (preys.length < NUM_PREYS * 0.1) {
            spawnPrey();
        }
        if (predators.length < 1) {
            spawnPredator(2);
        }
        if (preys.length >= predators.length * 40) {
            spawnPredator(1);
        }
    }


  for (const food of foods) {
    food.display();
  }

  for (const prey of preys) {
    prey.move(predators);
    prey.display();
  }

  for (const predator of predators) {
    predator.chase(preys);
    // predator is starved remove it from the array
    if (predator.isStarved) {
        const index = predators.indexOf(predator);
        if (index > -1) {
            predators.splice(index, 1);
        }
        // two foods will be generated at the location near the dead predator, with some randomness
        foods.push(new Food(predator.pos.x + random(-10, 10), predator.pos.y + random(-10, 10)));
        foods.push(new Food(predator.pos.x + random(-10, 10), predator.pos.y + random(-10, 10)));

    }
    predator.display();
  }

  // Display the number of predators and prey
  displayCounts();
}

// food generator
function generateFood(num) {
  // half of the food will be generated at random locations
    for(let i = 0; i < num / 2; i++) {
        foods.push(new Food(random(width), random(height)));
    }
    // half of the food will be generated in clusters
    let x = random(width);
    let y = random(height);
    for(let i = 0; i < num / 2; i++) {
      // x, y needs to wrap around the canvas
      x = (x + random(-20, 20) + width) % width;
      y = (y + random(-20, 20) + height) % height;
      foods.push(new Food(x, y));
    }
    
}

function spawnPrey() {
    preys.push(new Prey(random(width), random(height)));
}

function spawnPredator(num) {
    for (let i = 0; i < num; i++) {
        predators.push(new Predator(random(width), random(height)));
    }
}

// Function to display the counts of predator and prey
function displayCounts() {
    // Calculate elapsed time in seconds
    let elapsedTime = (new Date() - startTime) / 1000;

    fill(0); // Black color for the text
    noStroke();
    textSize(16); // Set the text size
    textAlign(LEFT, TOP); // Align text to the left top corner
    text('Predators: ' + predators.length, 10, 10);
    text('Prey: ' + preys.length, 10, 30);
    text('Food: ' + foods.length, 10, 50);
    text(`Elapsed Time: ${elapsedTime.toFixed(2)} seconds`, 10, 70);
  }

class Food {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.shape = random(1, 4) | 0;
    }
    
    display() {
        push(); // Save the current drawing style settings
        // Orange Fill with 50% transparency
        fill(255, 165, 0, 127);
        // generate random number 1-3, has to be integer
        if(this.shape == 1) {
            // Draw a diamond
            beginShape();
            vertex(this.pos.x, this.pos.y - 5);
            vertex(this.pos.x + 5, this.pos.y);
            vertex(this.pos.x, this.pos.y + 5);
            vertex(this.pos.x - 5, this.pos.y);
            endShape(CLOSE);
        }
        else if(this.shape == 2) {
            // draw a rectangle
            rect(this.pos.x, this.pos.y, 7, 7);
        }
        else {
            ellipse(this.pos.x, this.pos.y, 7, 7);
        }
        pop(); // Restore the original drawing style settings
    }
    
}

class Prey {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.escapeSpeed = 3;  // Higher speed for escaping
    this.normalSpeed = 2.8;  // Normal speed
    this.closePredatorDist = 120;  // Distance to check for nearby predators
    // Random Initial facing direction
    this.direction = createVector(random(-1, 1), random(-1, 1)).normalize();
    this.foodEaten = 0; // Number of food eaten
    this.foodRequiredtoReproduce = 2; // Number of food required to reproduce
    this.isBeingPursued = false; // Flag to indicate if the prey is being pursued
  }

  move(predators) {
    let escapeVector = createVector(0, 0);
    let isPredatorClose = false;
    let closestFood = null;
    let closestFoodDist = Infinity;
  
    // Check for nearby predators and calculate an escape vector
    predators.forEach(predator => {
      let distance = p5.Vector.dist(this.pos, predator.pos);
      if (distance < this.closePredatorDist) {
        isPredatorClose = true;
        // Create a vector that points from the predator to this prey
        let fromPredator = p5.Vector.sub(this.pos, predator.pos);
        fromPredator.normalize(); // Normalize to get only the direction
        fromPredator.mult(this.escapeSpeed / distance); // Weight by the inverse of distance
        escapeVector.add(fromPredator);
      }
    });

    // Find the closest food
    if(!closestFood) {
      for (const food of foods) {
        let d = p5.Vector.dist(this.pos, food.pos);
        // If the food is within xx pixels, 
        // consider it as the closest food (hope this will increase the performance)
        if(d < 50) {
          closestFood = food;
          closestFoodDist = d;
          break;
        }
        if (d < closestFoodDist) {
          closestFood = food;
          closestFoodDist = d;
        }
      }
    }
    
  
    // Priority to escape from predators
    if (isPredatorClose) {
      this.velocity.add(escapeVector);
      this.isBeingPursued = true;
    } else if (closestFood) {
        this.isBeingPursued = false;
        // Move towards the closest food if not escaping predators
        let foodVector = p5.Vector.sub(closestFood.pos, this.pos);
        foodVector.setMag(this.normalSpeed);
        this.velocity.add(foodVector);
    }
    else {
      // Slow movement if no predator is close and no food detected
      this.isBeingPursued = false;
      let randomAngle = random(-PI / 72, PI / 72); // Small angle change, ±2.5 degrees
      this.direction.rotate(randomAngle); // Slightly adjust the facing direction
      let moveStep = p5.Vector.fromAngle(this.direction.heading()).mult(this.normalSpeed * 0.5 * simulation_speed);
      this.pos.add(moveStep); // Move in the adjusted direction
    }
  
    // Limit the velocity to the appropriate maximum speed, add randomness, apply simulation speed
    this.velocity.limit(isPredatorClose ? 
      (this.escapeSpeed + random(-0.1, 0.4)) * simulation_speed 
      : (this.normalSpeed + random(-0.4, 0.2)) * simulation_speed);
    this.pos.add(this.velocity);

    // Handle food consumption and reproduction
    if (closestFood && closestFoodDist < 5) { // Considered as reaching the food
        for (let i = 0; i < foods.length; i++) {
            if (foods[i] === closestFood) {
                this.foodEaten++; // Increment the food eaten count
                foods.splice(i, 1); // Remove the food from the array
                break;
            }
        }
        if(this.foodEaten >= this.foodRequiredtoReproduce) {
            preys.push(new Prey(this.pos.x, this.pos.y)); // Reproduce at current location
            this.foodEaten = 0; // Reset the food eaten count
            // play audio 1-3 randomly for reproducing a prey
            let audio = Math.floor(Math.random() * 3) + 1;
            if (audio == 1) {
                prey_born1.play().catch(error => console.error("Failed to play muted audio automatically:", error));
            }
            else if (audio == 2) {
                prey_born2.play().catch(error => console.error("Failed to play muted audio automatically:", error));
            }
            else {
                prey_born3.play().catch(error => console.error("Failed to play muted audio automatically:", error));
            }
        }
    }
  
    // Wrap around edges
    this.pos.x = (this.pos.x + width) % width;
    this.pos.y = (this.pos.y + height) % height;
  }
  
  display() {
    push(); // Save the current drawing style settings
    translate(this.pos.x, this.pos.y); // Move to the position of the prey
    rotate(this.velocity.heading()); // Rotate to align with the velocity vector

    // Body: Green fill with 50% transparency
    fill(0, 200, 0, 127);
    noStroke();
    ellipse(0, 0, 10, 10);

    // Mouse: Draw stick-like rectangle indicating direction
    fill(255, 255, 0, 127); // Yellow color for the direction indicator
    rect(8, -2, 6, 2); // Positioned to start from the edge of the ellipse

    // Eyes
    fill(0, 0, 0, 127); // Black color for the eyes
    rect(0, -1, 2, 2); // One Eye
    // fill(0, 0, 0); // Black color for the eyes
    // rect(2, 0, 2, 2); // Right Eye
    // rect(2, -3, 2, 2); // Left Eye

    pop(); // Restore the original drawing style settings

    if (prey_info) {
      push(); // Another push to draw the circle without affecting the rotation
      translate(this.pos.x, this.pos.y); // Move the origin to the prey's position
      if(this.isBeingPursued) {
          stroke(255, 0, 0, 63); // Red stroke when being pursued
      }
      else {
          stroke(255, 255, 0, 63); // Yellow stroke when not being pursued
      }
      noFill();
      drawDottedCircle(0, 0, this.closePredatorDist); // Prey's escape awareness circle
      pop(); // Restore the original drawing style settings
    }
    
  }
}

class Predator {
    constructor(x, y) {
      this.pos = createVector(x, y);
      this.speedConstant = 3.1; // Speed constant
      this.Speed = this.speedConstant; // Speed of the predator
      this.catchDistance = 10; // Distance at which prey is considered caught
      this.visibilityConstant = 80; // Visibility range constant
      this.visibilityRange = this.visibilityConstant; // Predators can see prey within x pixels
      this.viewAngle = PI / 3; // Viewing angle in radians (60 degrees to each side)
      // Random Initial facing direction
      this.direction = createVector(random(-1, 1), random(-1, 1)).normalize();
      this.lastCatchTime = new Date(); // Time of the last caught prey (initialized to 0)
      this.starvingTime = 0; // How long the predator has been starving
      this.isStarved = false; // Flag to indicate if the predator is staved
      this.starveLimit = 15; // Time limit for starving
      this.preyEaten = 0; // Number of prey eaten 
      this.preyRequiredtoReproduce = 4; // Number of prey required to reproduce
    }

    chase(preys) {
      let closest = null;
      let closestD = Infinity;
      this.starvingTime = (new Date() - this.lastCatchTime) / 1000 * simulation_speed;
      if (this.starvingTime > this.starveLimit) {
        this.isStarved = true;
        predator_dead.play().catch(error => console.error("Failed to play muted audio automatically:", error));
      }
      else if (this.starvingTime >= this.starveLimit * 2 / 3) {
        this.Speed = this.speedConstant * 1.2; // Increase the speed when starving
        this.visibilityRange = this.visibilityConstant * 1.5; // Increase the visibility range when starving
      }
      else {
        this.Speed = this.speedConstant; // Reset the speed to the original value
        this.visibilityRange = this.visibilityConstant; // Reset the visibility range to the original value
      }

      if(!this.isStarved) {
        // Find the closest prey within visibility range and field of view
        for (const prey of preys) {
            let preyDir = p5.Vector.sub(prey.pos, this.pos);
            let d = preyDir.mag();
            let angleBetween = this.direction.angleBetween(preyDir);

            if (d < closestD && d < this.visibilityRange && abs(angleBetween) < this.viewAngle / 2) {
              closest = prey;
              closestD = d;
            }
        }

        // Move towards the closest prey
        if (closest) {
            let desired = p5.Vector.sub(closest.pos, this.pos);
            let d = desired.mag();
            if (d < this.catchDistance) {
                // Catch the prey: remove it from the array
                const index = preys.indexOf(closest);
                if (index > -1) {
                    preys.splice(index, 1);
                }
                this.lastCatchTime = new Date(); // Update the last catch time

                // reproduce at the current location
                this.preyEaten++;
                if(this.preyEaten >= this.preyRequiredtoReproduce) {
                    predators.push(new Predator(this.pos.x, this.pos.y));
                    this.preyEaten = 0;
                }

                // play audio 1-5 randomly for eating a prey
                let audio = Math.floor(Math.random() * 5) + 1;
                if (audio == 1) {
                    audio1.play().catch(error => console.error("Failed to play muted audio automatically:", error));
                }
                else if (audio == 2) {
                    audio2.play().catch(error => console.error("Failed to play muted audio automatically:", error));
                }
                else if (audio == 3) {
                    audio3.play().catch(error => console.error("Failed to play muted audio automatically:", error));
                }
                else if (audio == 4) {
                    audio4.play().catch(error => console.error("Failed to play muted audio automatically:", error));
                }
                else {
                    audio5.play().catch(error => console.error("Failed to play muted audio automatically:", error));
                }
            } else {
                if (d < this.catchDistance * 2) { 
                    // Start accelerating when twice the catch distance away
                    let m = map(d, this.catchDistance * 2, this.catchDistance, this.Speed, this.Speed * 1.2);
                    desired.setMag(m);
                } else {
                    desired.setMag(this.Speed);
                }
                // apply simulation speed
                desired.mult(simulation_speed);
                desired.add(p5.Vector.random2D().mult(0.3 * simulation_speed)); // Add randomness to the movement
                this.pos.add(desired);
                this.direction = desired.copy().normalize(); // Update direction to face the prey
            }
        } else {
            // If no prey is detected, move in a consistent direction with slight random deviations
            let randomAngle = random(-PI / 72, PI / 72); // Small angle change, ±2.5 degrees
            this.direction.rotate(randomAngle); // Slightly adjust the facing direction
            let moveStep = p5.Vector.fromAngle(this.direction.heading()).mult(this.Speed * 0.5 * simulation_speed);
            this.pos.add(moveStep); // Move in the adjusted direction
        }

        // Wrap around edges
        this.pos.x = (this.pos.x + width) % width;
        this.pos.y = (this.pos.y + height) % height;
      }

      
    }

    display() {
        push(); // Save the current drawing style settings
        translate(this.pos.x, this.pos.y); // Move to the position of the predator
        rotate(this.direction.heading()); // Rotate to align with the velocity vector
        
        if (predator_info) {
          // Draw visibility sector
          fill(255, 255, 0, 63); // Yellow fill when not starving, with 25% transparency
          if (this.starvingTime >= this.starveLimit * 2 / 3) {
              let r = map(this.starvingTime, this.starveLimit * 2 / 3, this.starveLimit, 255, 0);
              fill(r, 0, 0, 63); // Red fill when starving, with 25% transparency
          }
          beginShape();
          vertex(0, 0); // Center point
      
          let startAngle = -this.viewAngle / 2;
          let endAngle = this.viewAngle / 2;
      
          // Draw the arc as a series of vertices
          for (let a = startAngle; a <= endAngle; a += 0.01) {
              let x = this.visibilityRange * cos(a);
              let y = this.visibilityRange * sin(a);
              vertex(x, y);
          }
      
          vertex(0, 0); // Close the shape back at the center
          endShape(CLOSE);
        }
        
        
        // Draw the predator itself
        if(this.starvingTime >= this.starveLimit * 2 / 3) {
          // interpolate between red and black, based on the starving time
          let r = map(this.starvingTime, this.starveLimit * 2 / 3, this.starveLimit, 255, 0);
          fill(r, 0, 0); // Red fill when starving
        }
        else {
          fill(255, 0, 0); // Solid red fill for the predator when not starving
        }
        ellipse(0, 0, 20, 20);
        
        // Draw stick-like rectangle indicating direction
        fill(0, 0, 0); // Black color for the direction indicator
        rect(12, 1, 10, 2); // Positioned to start from the edge of the ellipse
        rect(12, -5, 10, 2); // Positioned to start from the edge of the ellipse

        // Draw eyes
        fill(0, 0, 0); // Black color for the eyes
        rect(4, 3, 2, 2); // Right Eye
        rect(4, -6, 2, 2); // Left Eye
    
        pop(); // Restore the original drawing style settings
    }
    
      
  }

  
  function drawDottedCircle(x, y, radius) {
    const steps = 100; // Number of dots
    const angleStep = TWO_PI / steps;
    for (let i = 0; i < TWO_PI; i += angleStep) {
      let px = x + cos(i) * radius;
      let py = y + sin(i) * radius;
      point(px, py); // Draw each point along the circle
    }
  }
  
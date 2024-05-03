let preys = [];
let predators = [];
let foods = [];
let startTime = new Date(); // Capture start time upon first draw call
const NUM_FOODS = 50;
const NUM_PREYS = 100;
const NUM_PREDATORS = 10;


function setup() {
  // auto adjust the canvas size based on the window size
  createCanvas(windowWidth * 0.99, windowHeight * 0.98);
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

function draw() {
    // sets the background color to a beige color
    background(200);

  // Generate food every 1 seconds
    if (frameCount % 60 === 0) {
        if (preys.length < 50) {
            generateFood(10);
        }
        else if (preys.length < 100) {
            generateFood(preys.length * 0.1);
        }
        else if (preys.length < 200) {
            generateFood(preys.length * 0.04);
        }

        // Spawn more preys if the number is less than 10% of the initial population
        if (preys.length < NUM_PREYS * 0.1) {
            spawnPrey();
        }
        if (predators.length < 1) {
            spawnPredator(2);
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
    }
    predator.display();
  }

  // Display the number of predators and prey
  displayCounts();
}

// food generator
function generateFood(num) {
    for(let i = 0; i < num; i++) {
        foods.push(new Food(random(width), random(height)));
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
        fill(255, 165, 0);
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
    this.escapeSpeed = 1.8;  // Higher speed for escaping
    this.normalSpeed = 1;  // Normal speed
    this.closePredatorDist = 110;  // Distance to check for nearby predators
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
    for (const food of foods) {
      let d = p5.Vector.dist(this.pos, food.pos);
      if (d < closestFoodDist) {
        closestFood = food;
        closestFoodDist = d;
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
      let moveStep = p5.Vector.fromAngle(this.direction.heading()).mult(this.normalSpeed * 0.5);
      this.pos.add(moveStep); // Move in the adjusted direction
    }
  
    // Limit the velocity to the appropriate maximum speed, add randomness
    this.velocity.limit(isPredatorClose ? this.escapeSpeed + random(-0.2, 0.2) : this.normalSpeed + random(-0.4, 0.2));
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

    // Darker Green
    fill(0, 200, 0);
    noStroke();
    ellipse(0, 0, 10, 10);

    // Draw stick-like rectangle indicating direction
    fill(255, 255, 0); // Yellow color for the direction indicator
    rect(8, -2, 6, 2); // Positioned to start from the edge of the ellipse
    pop(); // Restore the original drawing style settings

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

class Predator {
    constructor(x, y) {
      this.pos = createVector(x, y);
      this.maxSpeed = 2;
      this.catchDistance = 10; // Distance at which prey is considered caught
      this.visibilityRange = 120; // Predators can see prey within x pixels
      this.viewAngle = PI / 3; // Viewing angle in radians (60 degrees to each side)
      // Random Initial facing direction
      this.direction = createVector(random(-1, 1), random(-1, 1)).normalize();
      this.lastCatchTime = new Date(); // Time of the last caught prey (initialized to 0)
      this.starvingTime = 0; // How long the predator has been starving
      this.isStarved = false; // Flag to indicate if the predator is staved
      this.starveLimit = 20; // Time limit for starving
      this.preyEaten = 0; // Number of prey eaten 
      this.preyRequiredtoReproduce = 3; // Number of prey required to reproduce
    }

    chase(preys) {
      let closest = null;
      let closestD = Infinity;
      this.starvingTime = (new Date() - this.lastCatchTime) / 1000;
      if (this.starvingTime > this.starveLimit) {
        this.isStarved = true;
      }
      else if (this.starvingTime >= this.starveLimit * 2 / 3) {
        this.maxSpeed = 2.5; // Increase the speed when starving
        this.visibilityRange = 180; // Increase the visibility range when starving
      }
      else {
        this.maxSpeed = 2; // Reset the speed to the original value
        this.visibilityRange = 120; // Reset the visibility range to the original value
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
            } else {
                if (d < this.catchDistance * 2) { 
                    // Start accelerating when twice the catch distance away
                    let m = map(d, this.catchDistance * 2, this.catchDistance, this.maxSpeed, this.maxSpeed * 1.2);
                    desired.setMag(m);
                } else {
                    desired.setMag(this.maxSpeed);
                }
                desired.add(p5.Vector.random2D().mult(0.3)); // Add randomness to the movement
                this.pos.add(desired);
                this.direction = desired.copy().normalize(); // Update direction to face the prey
            }
        } else {
            // If no prey is detected, move in a consistent direction with slight random deviations
            let randomAngle = random(-PI / 72, PI / 72); // Small angle change, ±2.5 degrees
            this.direction.rotate(randomAngle); // Slightly adjust the facing direction
            let moveStep = p5.Vector.fromAngle(this.direction.heading()).mult(this.maxSpeed * 0.5);
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
    
        // Draw visibility sector
        fill(255, 255, 0, 63); // Yellow fill when not starving, with 25% transparency
        if (this.starvingTime >= this.starveLimit * 2 / 3) {
            fill(255, 0, 0, 63); // Red fill when starving, with 25% transparency
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
    
        // Draw the predator itself
        fill(255, 0, 0); // Solid red fill for the predator
        ellipse(0, 0, 20, 20);
    
        // Draw stick-like rectangle indicating direction
        fill(0, 0, 0); // Blue color for the direction indicator
        rect(12, 1, 10, 2); // Positioned to start from the edge of the ellipse
        rect(12, -5, 10, 2); // Positioned to start from the edge of the ellipse
    
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
  
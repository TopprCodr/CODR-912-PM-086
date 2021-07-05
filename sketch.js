var Engine = Matter.Engine,
Render = Matter.Render,
Runner = Matter.Runner,
Body = Matter.Body,
Events = Matter.Events,
Composite = Matter.Composite,
Composites = Matter.Composites,
Common = Matter.Common,
MouseConstraint = Matter.MouseConstraint,
Mouse = Matter.Mouse,
Bodies = Matter.Bodies;

// create engine
var engine = Engine.create(),
world = engine.world;

// create renderer
var render = Render.create({
element: document.body,
engine: engine,
options: {
    width: 800,
    height: 600,
    wireframes: false
}
});

Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);

var bodyStyle = { fillStyle: '#222' };

// Creating edges
var wall1 = Bodies.rectangle(400, 0, 800, 50, { isStatic: true, render: bodyStyle }),
    wall2 = Bodies.rectangle(400, 600, 800, 50, { isStatic: true, render: bodyStyle }),
    wall3 = Bodies.rectangle(800, 300, 50, 600, { isStatic: true, render: bodyStyle }),
    wall4 = Bodies.rectangle(0, 300, 50, 600, { isStatic: true, render: bodyStyle });

//stack of circular bodies
var stack = Composites.stack(70, 100, 9, 4, 50, 50, function(x, y) {
    return Bodies.circle(x, y, 15, { restitution: 1, render: bodyStyle });
});

//Adding them to the world
Composite.add(world, [wall1, wall2, wall3, wall4, stack]);

// using collisionStart event on an engine
Events.on(engine, 'collisionStart', function(event) {
    var pairs = event.pairs;
    //console.log("Executing collisionStart event...");
    // change object colours to show those starting a collision
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        pair.bodyA.render.fillStyle = 'red';
        pair.bodyB.render.fillStyle = 'red';
    }
});

// an example of using collisionActive event on an engine
Events.on(engine, 'collisionActive', function(event) {
    var pairs = event.pairs;
    //console.log("Executing collisionActive event...");
    // change object colours to show those in an active collision (e.g. resting contact)
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        pair.bodyA.render.fillStyle = '#333';
        pair.bodyB.render.fillStyle = '#333';
    }
});

// an example of using collisionEnd event on an engine
Events.on(engine, 'collisionEnd', function(event) {
    var pairs = event.pairs;
    //console.log("Executing collisionEnd event...");
    // change object colours to show those ending a collision
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
    
        pair.bodyA.render.fillStyle = '#222';
        pair.bodyB.render.fillStyle = '#222';
    }
});

/*
Events.on(engine, 'beforeUpdate', function(event) {
    //console.log("Executing beforeUpdate event...");
    console.log(event);
});
*/

//using beforeUpdate event on an engine
Events.on(engine, 'beforeUpdate', function(event) {
    var engine = event.source;
    // apply random forces every 5 secs
    // timeframe at which the event is checked
    if (event.timestamp % 5000 < 50){
        shakeScene(engine);
    }
});
    
// function to shake bodies on canvas
var shakeScene = function(engine) {
    var bodies = Composite.allBodies(engine.world);
    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];
        if (!body.isStatic && body.position.y >= 500) {

            //Calculating force and then giving it randomness
            //multiplying body mass with 0.02 makes it lighter for extra bounce
            var forceMagnitude=(0.02 * body.mass)*Common.random();
            
            Body.applyForce(body, body.position, {
                x: forceMagnitude*Common.choose([1,-1]),
                y:-forceMagnitude
            });
        }
    }
};

// add mouse control (optional)
var mouse = Mouse.create(render.canvas),
mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});

Composite.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

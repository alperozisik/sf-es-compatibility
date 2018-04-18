return;
var p1 = new Promise(function(resolve, reject) { resolve("foo"); });
var p2 = new Promise(function(resolve, reject) { reject("quux"); });
var score = 0;

function thenFn(result) {
  console.log("thenFn");
  score += (result === "foo");
  check();
}

function catchFn(result) {
  console.log("catchFn");
  score += (result === "quux");
  check();
}

function shouldNotRun(result) {
  console.log("shouldNotRun");
  score = -Infinity;
}

function check() {
  console.log(`score = ${score}`);
  if (score === 4) console.log("passed");
}


p1.then(thenFn, shouldNotRun);

p2.then(shouldNotRun, catchFn);
p1.catch(shouldNotRun);
p2.catch(catchFn);

p1.then(function() {
  console.log("custom then p1");
  // Promise.prototype.then() should return a new Promise
  score += p1.then() !== p1;
  check();
});
console.log("alper");


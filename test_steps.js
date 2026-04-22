const distanceMeters = 0;
function calculateSteps(distanceMeters) {
  return Math.round(distanceMeters / 0.75);
}
console.log(calculateSteps(100)); // 133
console.log(calculateSteps(1000)); // 1333

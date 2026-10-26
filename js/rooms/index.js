(function(root){
  "use strict";
  const files=[
    "js/rooms/data/01-order-of-operations.js",
    "js/rooms/data/02-fractions-add-subtract.js",
    "js/rooms/data/03-percentages-of-amount.js",
    "js/rooms/data/04-linear-equations.js",
    "js/rooms/data/05-statistics-basics.js",
    "js/rooms/data/06-dot-product.js",
    "js/rooms/data/07-matrix-vectors.js",
    "js/rooms/data/08-linear-regression.js",
    "js/rooms/data/09-gradient-descent.js"
  ];
  root.ROOM_FILES=files;
  if(typeof module!=="undefined"&&module.exports)module.exports=files;
})(typeof window!=="undefined"?window:globalThis);

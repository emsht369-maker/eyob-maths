(function(root){
  "use strict";
  const question=function(q,answer,hint,explain){
    return {q:q,answer:String(answer),accept:[],type:"number",tolerance:0,hint:hint,explain:explain,points:10};
  };
  (root.ROOMS=root.ROOMS||[]).push({
    id:"ml-dot-product",
    title:"Dot Product of Two Vectors",
    path:"ml",
    order:1,
    next:"ml-matrix-vectors",
    area:"Linear algebra",
    difficulty:"Beginner",
    minutes:18,
    points:150,
    icon:"🔺",
    blurb:"Multiply matching vector components and add to get a single number.",
    objectives:["You will match components in the same position.","You will calculate a 2D and 3D dot product.","You will connect a zero dot product with perpendicular directions."],
    tasks:[
      {title:"Start here",story:"A simple model combines two input features with two learned weights. Each matching pair contributes to one score.",learn:"A vector is an ordered list of numbers. The dot product multiplies entries in the same positions, then adds those products. The result is one number, not a vector.",example:"(2, 3) · (4, 5) = 2 × 4 + 3 × 5 = 23.",questions:[question("Find (1, 2) · (3, 4).",11,"Multiply matching positions, then add.",["Multiply first entries: 1 × 3 = 3.","Multiply second entries: 2 × 4 = 8.","Add: 3 + 8 = 11."])]},
      {title:"Match positions",story:"A model uses a feature list and a weight list. Keep first with first, second with second.",learn:"For vectors (a, b) and (c, d), the dot product is ac + bd. Never cross-match components. Add the products only after multiplying.",example:"(3, 1) · (2, 6) = 3 × 2 + 1 × 6 = 12.",questions:[question("Find (2, 5) · (4, 1).",13,"Multiply 2×4 and 5×1.",["Match the first entries: 2 × 4 = 8.","Match the second entries: 5 × 1 = 5.","Add 8 + 5 = 13."]),question("Find (4, 3) · (2, 7).",29,"Keep each position paired.",["First product: 4 × 2 = 8.","Second product: 3 × 7 = 21.","8 + 21 = 29."])]},
      {title:"Use negative values",story:"Some features can reduce a model score. A negative component makes its product negative.",learn:"Signs matter in each multiplication. A negative times a positive is negative. Then add the signed products.",example:"(2, −1) · (3, 4) = 6 − 4 = 2.",questions:[question("Find (3, −2) · (4, 5).",2,"The second product is negative.",["3 × 4 = 12.","(−2) × 5 = −10.","12 + (−10) = 2."]),question("Find (−2, 4) · (3, −1).",-10,"Keep the signs in both products.",["(−2) × 3 = −6.","4 × (−1) = −4.","−6 + (−4) = −10."]) ]},
      {title:"Three dimensions and direction",story:"A data point can have three features. The dot product still pairs entries in order.",learn:"For three entries, multiply all three matching pairs and add. If a dot product is zero, the vectors are perpendicular (at right angles), provided neither vector is zero.",example:"(1, 2, 3) · (4, 5, 6) = 4 + 10 + 18 = 32.",questions:[question("Find (2, 0, 1) · (3, 7, −2).",4,"Multiply all three matching pairs, then add the signed results.",["First pair: 2 × 3 = 6.","Second pair: 0 × 7 = 0. Third pair: 1 × (−2) = −2.","Add: 6 + 0 + (−2) = 4."]),question("Find (2, 1) · (1, −2).",0,"Check whether the products cancel.",["2 × 1 = 2.","1 × (−2) = −2.","2 + (−2) = 0, so the vectors are perpendicular."])]},
      {title:"Ready for the exam?",story:"You can calculate a dot product in any matching dimension.",learn:"Multiply corresponding components, keep negative signs, and add. The answer is a scalar, which means a single number. The Hard Exam has 25 questions and needs 20 correct answers to pass.",example:"(2, 0, −1) · (3, 4, 5) = 6 + 0 − 5 = 1.",questions:[question("How many correct answers are needed to pass a 25-question exam at 80%?",20,"Find 80% of 25.",["Pass mark = 80% of 25.","0.8 × 25 = 20.","You need 20 correct answers."])]}
    ],
    examPool:root.ROOMS_DATA.makePool("dot-product"),
    links:[["Dot product search","https://www.khanacademy.org/search?page_search_query=dot%20product%20vectors"]]
  });
})(typeof window!=="undefined"?window:globalThis);

(window.GCSE=window.GCSE||[]).push({
  "id":"tree-diagrams",
  "title":"Probability Tree Diagrams",
  "area":"Probability",
  "tier":"FH",
  "grade":"4-5",
  "idea":"A tree diagram shows the possible paths through events. Put probabilities on branches leaving each point; they add to 1. Multiply along a path for AND. Add the probabilities of separate paths for OR. With replacement, the probabilities stay the same. Without replacement, update the totals after the first item is taken.<p><b>Calculator:</b> A calculator is allowed for fraction and decimal arithmetic. Keep fractions exact when possible.</p><b>Method:</b><ol><li>Draw branches for each possible result and label their probabilities.</li><li>For replacement, keep the same branch probabilities; without replacement, update counts.</li><li>Multiply along each path for its probability.</li><li>Add probabilities of all paths that answer the question.</li></ol>",
  "example":["A bag has 2 red and 3 blue counters. Draw, replace, draw. P(two red) = 2/5 × 2/5 = <span class='ans'>4/25</span>.","A bag has 2 red and 3 blue counters. Draw twice without replacement. P(two red) = 2/5 × 1/4 = <span class='ans'>1/10</span>."],
  "mistakes":"<ol><li>Forgetting to multiply branch probabilities along a path.</li><li>Forgetting that probabilities change after a draw without replacement.</li><li>Adding the branches for an AND event instead of multiplying.</li></ol>",
  "key":[["Branch","A line showing one possible event result."],["Path","A route through the tree for a sequence of outcomes."],["With replacement","The item is returned, so totals stay the same."],["Without replacement","The item is not returned, so totals change."]],
  "practice":[
    {"q":"A fair coin is tossed twice. Find P(two heads).","a":"1/2 × 1/2 = 1/4","hint":"Multiply the probabilities along the HH path.","marks":1,"level":"easy"},
    {"q":"A fair coin is tossed twice. Find P(heads then tails).","a":"1/2 × 1/2 = 1/4","hint":"Multiply the two branch probabilities.","marks":1,"level":"easy"},
    {"q":"A bag has 1 red and 3 blue counters. One counter is drawn, replaced, then drawn again. Find P(red then blue).","a":"1/4 × 3/4 = 3/16","hint":"Replacement means the second probabilities stay the same.","marks":1,"level":"easy"},
    {"q":"A bag has 2 green and 2 yellow counters. One draw is made. What is P(yellow)?","a":"2/4 = 1/2","hint":"Count yellow counters over all counters.","marks":1,"level":"easy"},
    {"q":"A bag has 2 red and 3 blue counters. Draw, replace, draw. Find P(two red).","a":"2/5 × 2/5 = 4/25","hint":"The red probability stays 2/5 on both draws.","marks":1,"level":"medium"},
    {"q":"A bag has 2 red and 3 blue counters. Draw twice without replacement. Find P(two red).","a":"2/5 × 1/4 = 1/10","hint":"After a red counter, 1 red remains among 4.","marks":2,"level":"medium"},
    {"q":"A bag has 2 red and 3 blue counters. Draw twice without replacement. Find P(red then blue).","a":"2/5 × 3/4 = 3/10","hint":"After red, 3 blue counters remain among 4.","marks":2,"level":"medium"},
    {"q":"A fair coin is tossed twice. Find P(exactly one head).","a":"1/4 + 1/4 = 1/2","hint":"Add the HT and TH path probabilities.","marks":2,"level":"medium"},
    {"q":"A bag has 3 white and 2 black counters. Draw twice with replacement. Find P(at least one black).","a":"1 - (3/5 × 3/5) = 16/25","hint":"Subtract the probability of two whites from 1.","marks":2,"level":"medium"},
    {"q":"A bag has 4 red and 2 blue counters. Draw twice without replacement. Find P(one of each colour).","a":"4/6 × 2/5 + 2/6 × 4/5 = 8/15","hint":"Add the red-blue and blue-red path probabilities.","marks":2,"level":"hard"},
    {"q":"A bag has 3 red and 2 blue counters. Draw twice with replacement. Find P(both the same colour).","a":"3/5 × 3/5 + 2/5 × 2/5 = 13/25","hint":"Add the RR and BB paths.","marks":2,"level":"hard"},
    {"q":"A bag has 3 red and 2 blue counters. Draw twice without replacement. Find P(at least one red).","a":"1 - (2/5 × 1/4) = 9/10","hint":"The only way to have no red is to draw two blues.","marks":2,"level":"hard"}
  ],
  "exam":[
    {"q":"A bag has 2 red and 3 blue counters. Draw twice with replacement. Find P(two red).","marks":2,"scheme":"M1 for 2/5 × 2/5. A1 for 4/25."},
    {"q":"A bag has 2 red and 3 blue counters. Draw twice without replacement. Find P(two red).","marks":3,"scheme":"M1 for first probability 2/5. M1 for second probability 1/4. A1 for 1/10."},
    {"q":"A fair coin is tossed twice. Find the probability of exactly one head.","marks":3,"scheme":"M1 for each path probability 1/4. M1 for adding HT and TH. A1 for 1/2."},
    {"q":"A bag has 4 red and 2 blue counters. Draw twice without replacement. Find the probability of one of each colour.","marks":3,"scheme":"M1 for 4/6 × 2/5. M1 for adding 2/6 × 4/5. A1 for 8/15."}
  ]
});

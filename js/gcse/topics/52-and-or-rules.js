(window.GCSE=window.GCSE||[]).push({
  "id":"and-or-rules",
  "title":"Probability: AND and OR Rules",
  "area":"Probability",
  "tier":"FH",
  "grade":"4-5",
  "idea":"For independent events, P(A and B) = P(A) × P(B). For mutually exclusive events, which cannot both happen, P(A or B) = P(A) + P(B). If events can overlap, subtract the overlap: P(A or B) = P(A) + P(B) - P(A and B).<p><b>Calculator:</b> A calculator is allowed for products and fractions. Decide whether the events are independent or can overlap before choosing a rule.</p><b>Method:</b><ol><li>Identify whether the question says AND or OR.</li><li>For independent AND, multiply probabilities.</li><li>For OR, add if the events cannot both happen; if they overlap, subtract the overlap once.</li><li>Check that the result lies from 0 to 1.</li></ol>",
  "example":["Roll a fair die and toss a fair coin. P(6 and heads) = 1/6 × 1/2 = <span class='ans'>1/12</span>.","On a fair die, let A = even and B = greater than 4. P(A or B) = 3/6 + 2/6 - 1/6 = <span class='ans'>4/6 = 2/3</span>; 6 is in both events."],
  "mistakes":"<ol><li>Adding probabilities for AND when independent events should be multiplied.</li><li>Adding overlapping OR probabilities without subtracting the overlap.</li><li>Subtracting an overlap when the events cannot happen together.</li></ol>",
  "key":[["Independent","One event does not change the probability of the other."],["Mutually exclusive","Two events that cannot happen together."],["Overlap","Outcomes that are in both events."],["AND","Both events happen."],["OR","At least one event happens."]],
  "practice":[
    {"q":"A fair coin and a fair die are used. Find P(heads and 4).","a":"1/2 × 1/6 = 1/12","hint":"For independent events joined by AND, multiply.","marks":1,"level":"easy"},
    {"q":"A fair die is rolled. Find P(1 or 2).","a":"1/6 + 1/6 = 1/3","hint":"The two results cannot happen on the same roll.","marks":1,"level":"easy"},
    {"q":"A bag has 2 red and 3 blue counters. Find P(red or blue) for one draw.","a":"2/5 + 3/5 = 1","hint":"Every counter is either red or blue; these events do not overlap.","marks":1,"level":"easy"},
    {"q":"Two fair coins are tossed. Find P(two tails).","a":"1/2 × 1/2 = 1/4","hint":"The tosses are independent and both must be tails.","marks":1,"level":"easy"},
    {"q":"A fair die is rolled. Find P(even or 5).","a":"3/6 + 1/6 = 4/6 = 2/3","hint":"Even results and 5 cannot happen together on one roll.","marks":1,"level":"medium"},
    {"q":"A fair die is rolled. Find P(even or greater than 4).","a":"3/6 + 2/6 - 1/6 = 2/3","hint":"The result 6 is in both events, so subtract it once.","marks":2,"level":"medium"},
    {"q":"A fair coin is tossed twice. Find P(heads then tails).","a":"1/2 × 1/2 = 1/4","hint":"Both specified tosses must happen; the tosses are independent.","marks":1,"level":"medium"},
    {"q":"A fair die is rolled. A is rolling a number below 3; B is rolling an even number. Find P(A or B).","a":"2/6 + 3/6 - 1/6 = 4/6 = 2/3","hint":"The events overlap at the result 2.","marks":2,"level":"medium"},
    {"q":"A card is chosen from cards numbered 1 to 10. Find P(multiple of 2 or multiple of 5).","a":"5/10 + 2/10 - 1/10 = 3/5","hint":"The number 10 is counted in both groups, so subtract it once.","marks":2,"level":"medium"},
    {"q":"Two independent events have probabilities 0.4 and 0.7. Find the probability both happen.","a":"0.4 × 0.7 = 0.28","hint":"Multiply for independent AND events.","marks":1,"level":"hard"},
    {"q":"P(A)=0.5, P(B)=0.3 and P(A and B)=0.1. Find P(A or B).","a":"0.5 + 0.3 - 0.1 = 0.7","hint":"Add both probabilities, then subtract the overlap.","marks":2,"level":"hard"},
    {"q":"A fair die is rolled twice. Find P(at least one 6).","a":"1 - (5/6 × 5/6) = 11/36","hint":"Use the complement: subtract the chance of no sixes from 1.","marks":2,"level":"hard"}
  ],
  "exam":[
    {"q":"A fair coin and fair die are used. Find the probability of heads and a 4.","marks":2,"scheme":"M1 for multiplying 1/2 × 1/6. A1 for 1/12."},
    {"q":"A fair die is rolled. Find P(even or 5).","marks":2,"scheme":"M1 for adding 3/6 + 1/6 as mutually exclusive events. A1 for 2/3."},
    {"q":"A fair die is rolled. Find P(even or greater than 4).","marks":3,"scheme":"M1 for 3/6 + 2/6. M1 for subtracting the overlap 1/6. A1 for 2/3."},
    {"q":"A fair die is rolled twice. Find the probability of at least one 6.","marks":3,"scheme":"M1 for using the complement. M1 for 1 - (5/6 × 5/6). A1 for 11/36."}
  ]
});

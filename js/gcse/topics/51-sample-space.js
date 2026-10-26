(window.GCSE=window.GCSE||[]).push({
  "id":"sample-space",
  "title":"Sample Space and Listing Outcomes",
  "area":"Probability",
  "tier":"F",
  "grade":"4-5",
  "idea":"A sample space lists every possible outcome. A table or an ordered list helps make sure none are missed. When two events happen, list ordered pairs if the order matters: (coin result, die result) is different from (die result, coin result). Count outcomes only when they are equally likely.<p><b>Calculator:</b> A calculator is allowed for probability arithmetic. Listing outcomes is usually clearest by hand.</p><b>Method:</b><ol><li>Decide which result or results each outcome contains.</li><li>List systematically using a table, tree or ordered pairs.</li><li>Check the count; for independent events, multiply the numbers of possibilities.</li><li>Count favourable outcomes and divide by the total if asked for probability.</li></ol>",
  "example":["Toss a coin and roll a die: there are 2 × 6 = <span class='ans'>12</span> ordered outcomes. For example (H,1), (H,2), …, (T,6).","Two coins have sample space HH, HT, TH, TT. Exactly one head occurs in HT and TH, so the probability is 2/4 = <span class='ans'>1/2</span>."],
  "mistakes":"<ol><li>Leaving out an outcome or listing it twice.</li><li>Ignoring the order of two results when order matters.</li><li>Assuming outcomes are equally likely without checking.</li></ol>",
  "key":[["Sample space","A complete list of possible outcomes."],["Outcome","One possible result."],["Ordered pair","A pair in which the first and second positions matter."],["Systematic","Using an organised pattern to avoid missed results."]],
  "practice":[
    {"q":"List all outcomes when tossing one coin.","a":"H, T","hint":"A coin has a head side and a tail side.","marks":1,"level":"easy"},
    {"q":"How many outcomes are there when rolling one normal die?","a":"6","hint":"List the faces 1 to 6.","marks":1,"level":"easy"},
    {"q":"List the sample space for two coin tosses, in order.","a":"HH, HT, TH, TT","hint":"For each first toss, list both possibilities for the second.","marks":1,"level":"easy"},
    {"q":"How many outcomes are there for a coin toss and a four-sided spinner?","a":"2 × 4 = 8","hint":"Multiply the number of possibilities for each event.","marks":1,"level":"easy"},
    {"q":"Two fair coins are tossed. Find the probability of exactly one head.","a":"2/4 = 1/2","hint":"The favourable outcomes are HT and TH.","marks":1,"level":"medium"},
    {"q":"A die and a coin are used. How many ordered outcomes are possible?","a":"6 × 2 = 12","hint":"Multiply the number of die faces by the coin outcomes.","marks":1,"level":"medium"},
    {"q":"Two number cards, 1 and 2, are drawn with replacement. List the ordered pairs.","a":"(1,1), (1,2), (2,1), (2,2)","hint":"Each first card can be followed by either card.","marks":2,"level":"medium"},
    {"q":"A spinner can land on red, blue or green. A coin is tossed. How many outcomes are possible?","a":"3 × 2 = 6","hint":"Multiply the 3 spinner outcomes by the 2 coin outcomes.","marks":1,"level":"medium"},
    {"q":"A die and a coin are used. Find the probability of a 6 and heads.","a":"1/12","hint":"Only one of the 12 equally likely ordered outcomes is (6,H).","marks":2,"level":"medium"},
    {"q":"Two fair dice are rolled. How many ordered outcomes are there?","a":"6 × 6 = 36","hint":"Each first-die result can pair with six second-die results.","marks":1,"level":"hard"},
    {"q":"Two fair dice are rolled. How many ordered outcomes have a total of 3?","a":"2: (1,2), (2,1)","hint":"List the pairs that add to 3; order matters.","marks":2,"level":"hard"},
    {"q":"A coin is tossed three times. How many ordered outcomes are possible?","a":"2 × 2 × 2 = 8","hint":"There are two choices at each of three tosses.","marks":1,"level":"hard"}
  ],
  "exam":[
    {"q":"Write the sample space for two coin tosses, keeping the order of the tosses.","marks":2,"scheme":"B1 for a complete systematic list. A1 for HH, HT, TH, TT."},
    {"q":"A coin and a four-sided spinner are used. How many outcomes are possible?","marks":2,"scheme":"M1 for 2 × 4. A1 for 8."},
    {"q":"Two fair coins are tossed. Find the probability of exactly one head.","marks":2,"scheme":"M1 for identifying HT and TH among 4 outcomes. A1 for 2/4 = 1/2."},
    {"q":"Two fair dice are rolled. How many ordered outcomes have total 3?","marks":2,"scheme":"B1 for considering ordered pairs. B1 for (1,2) and (2,1), giving 2."}
  ]
});

(function(root){
  "use strict";
  const question=function(q,answer,hint,explain){
    return {q:q,answer:String(answer),accept:[],type:"number",tolerance:0,hint:hint,explain:explain,points:10};
  };
  (root.ROOMS=root.ROOMS||[]).push({
    id:"gcse-fractions",
    title:"Fractions: Add and Subtract",
    path:"gcse",
    order:2,
    next:"gcse-percentages",
    area:"Number",
    tier:"F",
    difficulty:"Foundation",
    minutes:20,
    points:110,
    icon:"🍕",
    blurb:"Add and subtract parts of a whole by making their denominators match.",
    objectives:["You will recognise the numerator and denominator.","You will find an equivalent fraction with a common denominator.","You will simplify a fraction when possible."],
    tasks:[
      {title:"Start here",story:"Two friends share parts of a pizza. The slices must be the same size before adding.",learn:"The numerator is the top number. The denominator is the bottom number and tells how many equal parts make one whole. If denominators match, add or subtract only the numerators.",example:"2/7 + 3/7 = 5/7.",questions:[question("Work out 2/9 + 4/9.",2/3,"Keep the denominator and add the top numbers.",["The denominators are both 9.","Add numerators: 2 + 4 = 6, giving 6/9.","Simplify 6/9 to 2/3."])]},
      {title:"Make equal-sized parts",story:"A measuring cup marks thirds and sixths. Convert to the same-sized parts before combining.",learn:"Equivalent fractions name the same amount. Multiply the top and bottom by the same number. Use a common denominator before adding or subtracting unlike fractions.",example:"1/3 = 2/6, so 1/3 + 1/6 = 3/6 = 1/2.",questions:[question("Work out 1/4 + 1/2.",0.75,"Rewrite one half in quarters.",["The common denominator is 4.","1/2 = 2/4, so add 1/4 + 2/4 = 3/4.","3/4 is 0.75."]),question("Work out 5/6 − 1/4.",7/12,"Use denominator 12.",["The common denominator of 6 and 4 is 12.","5/6 = 10/12 and 1/4 = 3/12.","10/12 − 3/12 = 7/12."])]},
      {title:"Subtract fractions",story:"A water bottle is partly full. Work out the amount left after some is poured out.",learn:"Subtraction follows the same denominator rule as addition. Convert each fraction to equal-sized parts, subtract the numerators, and simplify.",example:"3/4 − 1/8 = 6/8 − 1/8 = 5/8.",questions:[question("Work out 7/8 − 1/4.",5/8,"Change one quarter into eighths.",["Use eighths as the common parts.","1/4 = 2/8.","7/8 − 2/8 = 5/8."]),question("Work out 5/6 − 1/3.",0.5,"Write one third in sixths.",["The common denominator is 6.","1/3 = 2/6.","5/6 − 2/6 = 3/6 = 1/2."])]},
      {title:"Simplify and check",story:"A recipe amount can be written in many equivalent ways. The simplest form is easiest to compare.",learn:"To simplify, divide the numerator and denominator by the same common factor. The fraction keeps the same value. Check by multiplying back or comparing decimals.",example:"6/8 simplifies by dividing top and bottom by 2: 3/4.",questions:[question("Simplify 12/18.",2/3,"Divide top and bottom by 6.",["A common factor of 12 and 18 is 6.","12 ÷ 6 = 2 and 18 ÷ 6 = 3.","So 12/18 = 2/3."]),question("Work out 3/10 + 1/5.",0.5,"Change one fifth into tenths.",["Use denominator 10.","1/5 = 2/10.","3/10 + 2/10 = 5/10 = 1/2."])]},
      {title:"Ready for the exam?",story:"You can combine fractions once they describe equal-sized parts.",learn:"Find a common denominator, rewrite equivalent fractions, add or subtract the numerators, then simplify. The Hard Exam has 25 questions and needs 20 correct answers to pass.",example:"2/3 − 1/6 = 4/6 − 1/6 = 3/6 = 1/2.",questions:[question("How many correct answers are needed to pass a 25-question exam at 80%?",20,"Find 80% of 25.",["Pass mark = 80% of 25.","0.8 × 25 = 20.","You need 20 correct answers."])]}
    ],
    examPool:root.ROOMS_DATA.makePool("fractions"),
    links:[["Fractions search","https://www.khanacademy.org/search?page_search_query=adding%20subtracting%20fractions"]]
  });
})(typeof window!=="undefined"?window:globalThis);

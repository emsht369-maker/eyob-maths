(function(root){
  "use strict";
  const question=function(q,answer,hint,explain){
    return {q:q,answer:String(answer),accept:["x = "+String(answer),"x="+String(answer)],type:"number",tolerance:0,hint:hint,explain:explain,points:10};
  };
  (root.ROOMS=root.ROOMS||[]).push({
    id:"gcse-linear-equations",
    title:"Solving Linear Equations",
    path:"gcse",
    order:4,
    next:"gcse-statistics",
    area:"Algebra",
    tier:"FH",
    difficulty:"Foundation to Higher",
    minutes:22,
    points:130,
    icon:"⚖️",
    blurb:"Keep both sides balanced while undoing operations to find an unknown value.",
    objectives:["You will identify the operation acting on the unknown.","You will use inverse operations on both sides.","You will check a solution by substitution."],
    tasks:[
      {title:"Start here",story:"A mystery number plus a known amount gives a total. Work backwards to find the mystery number.",learn:"An equation says two expressions have the same value. Keep it balanced: do the same operation to both sides. Use inverse operations, which undo each other. Addition is undone by subtraction.",example:"x + 4 = 11. Subtract 4 from both sides: x = 7.",questions:[question("Solve x + 6 = 14.",8,"Subtract 6 from both sides.",["Subtract 6 from both sides to keep the equation balanced.","x = 14 − 6.","Therefore x = 8."])]},
      {title:"Undo addition and subtraction",story:"A score has a fixed bonus added or removed. Undo that change first.",learn:"If a number is added to x, subtract it from both sides. If a number is subtracted from x, add it to both sides. This isolates the term with x.",example:"x − 5 = 12. Add 5 to both sides: x = 17.",questions:[question("Solve x − 9 = 4.",13,"Add 9 to both sides.",["Add 9 to both sides.","x = 4 + 9.","So x = 13."]),question("Solve 3x + 5 = 26.",7,"Subtract 5, then divide by 3.",["Subtract 5: 3x = 21.","Divide both sides by 3.","x = 7."])]},
      {title:"Undo multiplication",story:"A total cost is the price of one item multiplied by the number of items. Divide to find the one-item price.",learn:"When x is multiplied by a number, divide both sides by that number. Undo any addition or subtraction first.",example:"4x = 28. Divide both sides by 4: x = 7.",questions:[question("Solve 5x = 45.",9,"Divide both sides by 5.",["The coefficient of x is 5.","Divide: x = 45 ÷ 5.","Therefore x = 9."]),question("Solve 4x − 7 = 25.",8,"Add 7, then divide by 4.",["Add 7 to both sides: 4x = 32.","Divide by 4.","x = 8."])]},
      {title:"x on both sides",story:"Two plans have different starting costs and per-item costs. Find where their totals match.",learn:"Collect x terms on one side and number terms on the other. Use the same operation on both sides at each step.",example:"5x + 2 = 3x + 10. Subtract 3x, then subtract 2: 2x = 8, so x = 4.",questions:[question("Solve 5x + 4 = 3x + 18.",7,"Subtract 3x, then subtract 4.",["Subtract 3x from both sides: 2x + 4 = 18.","Subtract 4: 2x = 14.","Divide by 2: x = 7."]),question("Solve 7x − 8 = 4x + 10.",6,"Collect x terms, then constants.",["Subtract 4x: 3x − 8 = 10.","Add 8: 3x = 18.","Divide by 3: x = 6."])]},
      {title:"Ready for the exam?",story:"Now solve equations with brackets and check the value in the original equation.",learn:"Undo additions and subtractions, then multiplication or division. Expand brackets when needed. Substitute your answer into the original equation to check both sides match. The Hard Exam has 25 questions and needs 20 correct answers to pass.",example:"2(x + 3) = 18. Divide by 2: x + 3 = 9. Subtract 3: x = 6.",questions:[question("How many correct answers are needed to pass a 25-question exam at 80%?",20,"Find 80% of 25.",["Pass mark = 80% of 25.","0.8 × 25 = 20.","You need 20 correct answers."])]}
    ],
    examPool:root.ROOMS_DATA.makePool("equations"),
    links:[["Linear equations search","https://www.khanacademy.org/search?page_search_query=solving%20linear%20equations"]]
  });
})(typeof window!=="undefined"?window:globalThis);

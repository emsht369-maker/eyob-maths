(function(root){
  "use strict";
  const question=function(q,answer,hint,explain){
    return {q:q,answer:String(answer),accept:[],type:"number",tolerance:0.00001,hint:hint,explain:explain,points:10};
  };
  (root.ROOMS=root.ROOMS||[]).push({
    id:"gcse-percentages",
    title:"Percentages of an Amount",
    path:"gcse",
    order:3,
    next:"gcse-linear-equations",
    area:"Number",
    tier:"FH",
    difficulty:"Foundation to Higher",
    minutes:20,
    points:120,
    icon:"💯",
    blurb:"Find a percentage of an amount, then use multipliers for changes.",
    objectives:["You will explain percent as out of 100.","You will find percentages using a decimal multiplier.","You will calculate percentage increases and decreases."],
    tasks:[
      {title:"Start here",story:"A ticket costs £40. A 10% discount takes a part of the price away.",learn:"Percent means out of 100. So 10% = 10/100 = 0.1. To find a percentage of an amount, multiply the amount by the percentage written as a decimal.",example:"10% of £40 = 0.1 × 40 = £4.",questions:[question("Find 10% of 70.",7,"Ten percent is one tenth.",["10% = 0.1.","Multiply: 70 × 0.1 = 7.","So 10% of 70 is 7."])]},
      {title:"Find a percentage part",story:"A class has 80 pupils. Find how many are 25% of the group.",learn:"For any percentage, divide it by 100 to make a decimal, then multiply. If the percentage is easy, you can split it into familiar parts such as 10% and 5%.",example:"25% of 80 = 0.25 × 80 = 20.",questions:[question("Find 15% of 200.",30,"Write 15% as 0.15.",["Convert: 15% = 0.15.","Multiply: 200 × 0.15 = 30.","The amount is 30."]),question("Find 35% of 80.",28,"Use 0.35 × 80.",["35% = 0.35.","Multiply: 80 × 0.35 = 28.","So 35% of 80 is 28."])]},
      {title:"Increase an amount",story:"A weekly budget rises by 20%. Find the new budget in one step.",learn:"An increase of p% uses multiplier 1 + p/100. Multiply the starting amount by this multiplier. This combines the original 100% and the increase.",example:"Increase 50 by 20%: multiplier 1.2, so 50 × 1.2 = 60.",questions:[question("Increase 80 by 15%.",92,"Use multiplier 1.15.",["An increase multiplier is 1 + 0.15 = 1.15.","Multiply: 80 × 1.15 = 92.","The new amount is 92."]),question("Increase 240 by 12.5%.",270,"12.5% is 0.125.",["Use multiplier 1 + 0.125 = 1.125.","Multiply: 240 × 1.125 = 270.","The increased amount is 270."])]},
      {title:"Decrease and reverse",story:"A coat is reduced by 30%. A multiplier makes the new price quick to find.",learn:"A decrease of p% leaves 100 − p percent. Use multiplier 1 − p/100. For a reverse percentage, divide the final amount by the change multiplier to find the start.",example:"Decrease 90 by 20%: 90 × 0.8 = 72.",questions:[question("Decrease 150 by 20%.",120,"A 20% decrease leaves 80%.",["The remaining percentage is 100% − 20% = 80%.","Use multiplier 0.8: 150 × 0.8 = 120.","The new amount is 120."]),question("After a 20% increase, a price is 96. Find the original price.",80,"Divide by the increase multiplier 1.2.",["A 20% increase uses multiplier 1.2.","Original price = 96 ÷ 1.2.","The original price was 80."])]},
      {title:"Ready for the exam?",story:"You have practised parts, increases and decreases. Check which value is the starting amount.",learn:"Percent of an amount: multiply by p/100. Increase: multiply by 1 + p/100. Decrease: multiply by 1 − p/100. The Hard Exam has 25 questions and needs 20 correct answers to pass.",example:"Find 30% of 70: 0.3 × 70 = 21.",questions:[question("How many correct answers are needed to pass a 25-question exam at 80%?",20,"Find 80% of 25.",["Pass mark = 80% of 25.","0.8 × 25 = 20.","You need 20 correct answers."])]}
    ],
    examPool:root.ROOMS_DATA.makePool("percentages"),
    links:[["Percentages search","https://www.khanacademy.org/search?page_search_query=percentages%20of%20amounts"]]
  });
})(typeof window!=="undefined"?window:globalThis);

(function(root){
  "use strict";
  const question=function(q,answer,hint,explain){
    return {q:q,answer:String(answer),accept:[],type:"number",tolerance:0,hint:hint,explain:explain,points:10};
  };
  (root.ROOMS=root.ROOMS||[]).push({
    id:"gcse-bidmas",
    title:"Order of Operations (BIDMAS)",
    path:"gcse",
    order:1,
    next:"gcse-fractions",
    area:"Number",
    tier:"F",
    difficulty:"Foundation",
    minutes:18,
    points:100,
    icon:"🧮",
    blurb:"Follow the calculation order so brackets, powers and operations give one correct answer.",
    objectives:["You will learn the BIDMAS order.","You will handle brackets and powers before other operations.","You will check a multi-step answer."],
    tasks:[
      {title:"Start here",story:"A shop total is calculated from a basket with a discount. The order of the steps changes the price.",learn:"BIDMAS means Brackets, Indices, Division and Multiplication, Addition and Subtraction. Do brackets and powers first. Do division and multiplication from left to right, then addition and subtraction from left to right.",example:"For 8 + 3 × 4, multiply first: 3 × 4 = 12. Then add: 8 + 12 = 20.",questions:[question("Work out 6 + 2 × 5.",16,"Multiply before adding.",["BIDMAS says multiply before add.","2 × 5 = 10.","6 + 10 = 16."])]},
      {title:"Brackets first",story:"A group order receives one shared discount before the items are doubled.",learn:"Brackets tell you which part to calculate first. Finish the whole bracket before multiplying or dividing outside it.",example:"(7 + 3) × 2 = 10 × 2 = 20.",questions:[question("Work out (8 + 4) × 3.",36,"Add inside the brackets first.",["Brackets come first.","8 + 4 = 12.","12 × 3 = 36."]),question("Work out 30 − (9 − 4) × 2.",20,"Find the bracket, then multiply, then subtract.",["First calculate 9 − 4 = 5.","Then 5 × 2 = 10.","Finally 30 − 10 = 20."])]},
      {title:"Powers and roots",story:"A square garden has side 6 metres. Its area uses a power, not a multiplication added at the end.",learn:"An index is a small power, such as 4². It means 4 × 4. Work out powers and roots before multiplying, dividing, adding or subtracting.",example:"3² + 5 = 9 + 5 = 14.",questions:[question("Work out 5² + 3 × 4.",37,"Square first, multiply next, then add.",["The power comes first: 5² = 25.","Multiply: 3 × 4 = 12.","Add: 25 + 12 = 37."]),question("Work out (14 − 6)² ÷ 4.",16,"Brackets, then square, then divide.",["14 − 6 = 8.","Square 8: 8² = 64.","64 ÷ 4 = 16."])]},
      {title:"Left to right",story:"A recipe uses equal groups and then shares the result. Multiplication and division at the same stage follow left-to-right order.",learn:"Multiplication and division have equal priority. Addition and subtraction also have equal priority. Within each pair, move from left to right.",example:"24 ÷ 3 × 2 = 8 × 2 = 16.",questions:[question("Work out 36 ÷ 3 × 2.",24,"Do division and multiplication from left to right.",["Division and multiplication have equal priority.","36 ÷ 3 = 12.","12 × 2 = 24."]),question("Work out 18 − 5 + 2.",15,"Addition and subtraction go from left to right.",["Addition and subtraction have equal priority.","18 − 5 = 13.","13 + 2 = 15."])]},
      {title:"Ready for the exam?",story:"You have practised the order. Now use it carefully with mixed operations.",learn:"Remember: brackets, powers and roots, multiplication and division left to right, then addition and subtraction left to right. The Hard Exam has 25 questions and needs 20 correct answers to pass.",example:"2 × (9 − 3)² ÷ 6 = 2 × 36 ÷ 6 = 12.",questions:[question("How many correct answers are needed to pass a 25-question exam at 80%?",20,"Find 80% of 25.",["Pass mark = 80% of 25.","0.8 × 25 = 20.","You need 20 correct answers."])]}
    ],
    examPool:root.ROOMS_DATA.makePool("bidmas"),
    links:[["BIDMAS practice","https://www.khanacademy.org/search?page_search_query=order%20of%20operations"]]
  });
})(typeof window!=="undefined"?window:globalThis);

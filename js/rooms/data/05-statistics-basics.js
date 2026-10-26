(function(root){
  "use strict";
  const question=function(q,answer,hint,explain,accept){
    return {q:q,answer:String(answer),accept:accept||[],type:"number",tolerance:0,hint:hint,explain:explain,points:10};
  };
  (root.ROOMS=root.ROOMS||[]).push({
    id:"gcse-statistics",
    title:"Mean, Median, Mode and Range",
    path:"gcse",
    order:5,
    next:null,
    area:"Statistics",
    tier:"FH",
    difficulty:"Foundation to Higher",
    minutes:22,
    points:140,
    icon:"📊",
    blurb:"Describe a set of data using four useful summary values.",
    objectives:["You will find the mean as a fair share.","You will find the median after sorting.","You will identify the mode and calculate the range."],
    tasks:[
      {title:"Start here",story:"A sports team records practice scores. One number can describe the typical score.",learn:"The mean is the total divided by the number of values. It is like sharing the total equally. Add carefully, then divide by the count.",example:"For 2, 4, 6, the mean is (2 + 4 + 6) ÷ 3 = 4.",questions:[question("Find the mean of 3, 6, 9.",6,"Add, then divide by 3.",["Mean = total ÷ count.","3 + 6 + 9 = 18.","18 ÷ 3 = 6."])]},
      {title:"Find the median",story:"Line up race times from shortest to longest. The middle time splits the group in half.",learn:"The median is the middle value after sorting. With an even number of values, average the two middle values. Sorting first prevents a wrong middle.",example:"1, 5, 8 has median 5. For 2, 4, 6, 8, median is (4 + 6) ÷ 2 = 5.",questions:[question("Find the median of 2, 7, 4.",4,"Sort before choosing the middle.",["Sort: 2, 4, 7.","The middle value is 4.","The median is 4."]),question("Find the median of 3, 5, 9, 11.",7,"Average the two middle values.",["The values are in order: 3, 5, 9, 11.","The middle pair is 5 and 9.","(5 + 9) ÷ 2 = 7."])]},
      {title:"Find the mode",story:"A shop tracks the shoe size sold most often to decide what to restock.",learn:"The mode is the value that appears most often. Count repeats. A set can have more than one mode, or no mode if all values appear equally often.",example:"In 2, 4, 4, 7, the mode is 4 because it appears twice.",questions:[question("Find the mode of 2, 3, 3, 5.",3,"Count how often each number appears.",["Count the values.","3 appears twice; each other value appears once.","The mode is 3."]),question("Give one mode of 1, 4, 4, 6, 6.",4,"Two values tie for most frequent.",["Count each value: 4 and 6 each appear twice.","The other values appear once.","The data has two modes: 4 and 6."],["6"])]},
      {title:"Find the range",story:"A coach compares how spread out two teams' scores are. The range gives the full spread.",learn:"Range = largest value − smallest value. It uses only the two ends of the data, so one unusually high or low value can change it.",example:"For 3, 5, 9, range = 9 − 3 = 6.",questions:[question("Find the range of 4, 10, 13.",9,"Subtract the smallest from the largest.",["Largest is 13 and smallest is 4.","Range = 13 − 4.","The range is 9."]),question("The range is 8. The smallest value is 3. Find the largest value.",11,"Largest = range + smallest.",["Range = largest − smallest.","8 = largest − 3.","Largest = 8 + 3 = 11."])]},
      {title:"Ready for the exam?",story:"You can now choose the correct summary measure for a data question.",learn:"Mean: total ÷ count. Median: middle after sorting. Mode: most frequent. Range: largest − smallest. The Hard Exam has 25 questions and needs 20 correct answers to pass.",example:"For 2, 4, 4, 10: mean 5, median 4, mode 4 and range 8.",questions:[question("How many correct answers are needed to pass a 25-question exam at 80%?",20,"Find 80% of 25.",["Pass mark = 80% of 25.","0.8 × 25 = 20.","You need 20 correct answers."])]}
    ],
    examPool:root.ROOMS_DATA.makePool("statistics"),
    links:[["Statistics search","https://www.khanacademy.org/search?page_search_query=mean%20median%20mode%20range"]]
  });
})(typeof window!=="undefined"?window:globalThis);

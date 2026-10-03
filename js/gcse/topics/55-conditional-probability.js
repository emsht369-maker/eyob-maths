(window.GCSE=window.GCSE||[]).push({
  "id":"conditional-probability",
  "title":"Conditional Probability (H)",
  "area":"Probability",
  "tier":"H",
  "grade":"6-9",
  "idea":"Conditional probability is the chance of A happening given that B has happened, written P(A|B). Restrict the sample space to B, then find the fraction of B outcomes that are also in A: P(A|B) = P(A∩B) ÷ P(B). On a tree, the second branch probability is conditional on the first result. Without replacement, the counts change.<p><b>Calculator:</b> A calculator is allowed, but keep exact fractions where possible and show the restricted total.</p><b>Method:</b><ol><li>Identify what information is given after “given that”; this is the new sample space.</li><li>Count outcomes that satisfy the condition.</li><li>Within that smaller group, count outcomes that also satisfy the required event.</li><li>Divide the second count by the restricted total and simplify.</li></ol>",
  "example":["A class has 12 girls and 8 boys. Of the girls, 9 take the bus. Given that a pupil is a girl, P(bus|girl) = 9/12 = <span class='ans'>3/4</span>.","A bag has 3 red and 2 blue counters. Two are drawn without replacement. Given the first is red, P(second red|first red) = 2/4 = <span class='ans'>1/2</span>."],
  "mistakes":"<ol><li>Using the whole group as the denominator instead of the group after the condition.</li><li>Reversing the condition and the event.</li><li>Forgetting that without replacement changes the available counts.</li></ol>",
  "key":[["Conditional probability","Probability after some information is known."],["P(A|B)","Probability of A given B."],["Restricted sample space","Only the outcomes that satisfy the condition."],["Without replacement","A selected item is not returned, so counts change."]],
  "practice":[
    {"q":"In a class of 20, 12 are girls. Of the girls, 9 wear glasses. Find P(glasses|girl).","a":"9/12 = 3/4","hint":"Given girl, use the 12 girls as the total.","marks":1,"level":"easy"},
    {"q":"A die shows an even number. Given this, what is the probability it shows 4?","a":"1/3","hint":"The restricted outcomes are 2, 4 and 6; one is 4.","marks":1,"level":"easy"},
    {"q":"A bag has 3 red and 2 blue counters. A red is drawn and not replaced. Find P(red on second|red first).","a":"2/4 = 1/2","hint":"After the first red, 2 red remain among 4 counters.","marks":1,"level":"easy"},
    {"q":"In a group of 15, 6 play football. Of those 6, 4 also play tennis. Find P(tennis|football).","a":"4/6 = 2/3","hint":"Use only the football players as the restricted total.","marks":1,"level":"easy"},
    {"q":"A class has 10 boys and 15 girls. Five boys and 9 girls walk to school. Given a pupil walks, find P(girl|walks).","a":"9/(5+9) = 9/14","hint":"Among walkers, 9 are girls and 5 are boys.","marks":1,"level":"medium"},
    {"q":"A fair die is rolled. Given the result is greater than 3, find P(it is even).","a":"2/3","hint":"The restricted results are 4, 5 and 6; two are even.","marks":1,"level":"medium"},
    {"q":"A bag has 4 red and 3 blue counters. One red is removed. Find P(red on next draw|red removed first).","a":"3/6 = 1/2","hint":"There are now 3 red counters out of 6.","marks":1,"level":"medium"},
    {"q":"Of 30 people, 18 own a bike and 12 own a scooter. Eight own both. Find P(scooter|bike).","a":"8/18 = 4/9","hint":"The condition restricts the group to the 18 bike owners.","marks":2,"level":"medium"},
    {"q":"Two fair dice are rolled. Given the first die is 5, find P(the total is 8).","a":"1/6","hint":"The second die must be 3; it has six equally likely results.","marks":1,"level":"medium"},
    {"q":"A group has 40 students: 22 study French, 18 study Spanish, and 10 study both. Find P(French|Spanish).","a":"10/18 = 5/9","hint":"Among Spanish students, 10 also study French.","marks":2,"level":"hard"},
    {"q":"A box has 5 red and 4 green counters. Two are drawn without replacement. Find P(second green|first red).","a":"4/8 = 1/2","hint":"After a red, all 4 green remain among 8 counters.","marks":2,"level":"hard"},
    {"q":"P(A∩B)=0.18 and P(B)=0.6. Find P(A|B).","a":"0.18/0.6 = 0.3","hint":"Divide the intersection probability by the condition probability.","marks":2,"level":"hard"}
  ],
  "exam":[
    {"q":"Of 30 people, 18 own a bike and 12 own a scooter. Eight own both. Find P(scooter|bike).","marks":3,"scheme":"M1 for restricting the total to 18 bike owners. M1 for using 8/18. A1 for 4/9."},
    {"q":"A bag has 4 red and 3 blue counters. A red is drawn and not replaced. Find P(red on the second draw, given red first).","marks":3,"scheme":"M1 for 3 red counters remaining. M1 for 6 counters remaining. A1 for 3/6 = 1/2."},
    {"q":"A fair die is rolled. Given the result is greater than 3, find the probability it is even.","marks":3,"scheme":"M1 for restricted outcomes 4, 5, 6. M1 for identifying 4 and 6 as even. A1 for 2/3."},
    {"q":"P(A∩B)=0.18 and P(B)=0.6. Find P(A|B).","marks":2,"scheme":"M1 for 0.18 ÷ 0.6. A1 for 0.3."}
  ]
});

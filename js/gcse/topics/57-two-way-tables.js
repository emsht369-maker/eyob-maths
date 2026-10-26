(window.GCSE=window.GCSE||[]).push({
  "id":"two-way-tables",
  "title":"Two-Way Tables",
  "area":"Statistics",
  "tier":"F",
  "grade":"4-5",
  "idea":"A two-way table sorts counts using two categories. Each inside cell belongs to one row and one column. Row and column totals help find missing values. For a probability, use the number in the required cell or set of cells over the grand total; for a conditional probability, divide by the total for the given row or column.<p><b>Calculator:</b> A calculator is allowed for fractions and percentages. Check that row and column totals both add to the grand total.</p><b>Method:</b><ol><li>Write down which row and column describe the required group.</li><li>Use known totals to find any missing cell by addition or subtraction.</li><li>Check each row and column sum.</li><li>For probability, divide by the grand total, or the restricted row/column total if given a condition.</li></ol>",
  "example":["In a class of 30, 12 boys and 8 girls walk to school. The number who do not walk is 30 - 12 - 8 = <span class='ans'>10</span>.","If there are 18 girls and 8 walk, then P(walk|girl) = 8/18 = <span class='ans'>4/9</span>."],
  "mistakes":"<ol><li>Using the grand total when a question says “given that” and the denominator should be a row or column total.</li><li>Adding the row and column totals together as if they were separate people.</li><li>Not checking the completed totals.</li></ol>",
  "key":[["Cell","A count at the intersection of one row and one column."],["Row total","The total of the cells in a row."],["Column total","The total of the cells in a column."],["Grand total","The total number of observations."],["Conditional probability","A probability using a restricted row or column group."]],
  "practice":[
    {"q":"A table has 12 boys and 15 girls. Find the grand total.","a":"12 + 15 = 27","hint":"Add the two group counts.","marks":1,"level":"easy"},
    {"q":"There are 20 people, 11 are adults. How many are children?","a":"20 - 11 = 9","hint":"Subtract the adults from the grand total.","marks":1,"level":"easy"},
    {"q":"In a class of 24, 13 study French. How many do not study French?","a":"24 - 13 = 11","hint":"Use the class total minus the French count.","marks":1,"level":"easy"},
    {"q":"A club has 9 boys and 7 girls who swim. How many swimmers are there?","a":"9 + 7 = 16","hint":"Add the two row counts.","marks":1,"level":"easy"},
    {"q":"In a class of 30, 12 boys and 8 girls walk to school. Find the number who do not walk.","a":"30 - 12 - 8 = 10","hint":"Subtract all walkers from the class total.","marks":1,"level":"medium"},
    {"q":"There are 18 girls; 8 walk and 10 do not. Find P(walk|girl).","a":"8/18 = 4/9","hint":"Given girl, use the girls total as denominator.","marks":1,"level":"medium"},
    {"q":"A table shows 16 people play tennis, 9 of these are girls. How many boys play tennis?","a":"16 - 9 = 7","hint":"Subtract the girls in that column from the column total.","marks":1,"level":"medium"},
    {"q":"A school has 40 pupils, 22 are boys. 12 boys and 10 girls cycle. How many pupils do not cycle?","a":"40 - 12 - 10 = 18","hint":"Add cyclists from both groups, then subtract from 40.","marks":2,"level":"medium"},
    {"q":"Of 50 people, 20 are adults. 12 adults and 18 children prefer tea. Find P(tea).","a":"(12 + 18)/50 = 3/5","hint":"Add the tea counts, then divide by everyone surveyed.","marks":2,"level":"medium"},
    {"q":"A group has 60 people. 32 are women; 18 women and 12 men own a pet. Find P(pet|woman).","a":"18/32 = 9/16","hint":"Use women who own a pet over all women.","marks":2,"level":"hard"},
    {"q":"A table total is 80. Row A total is 35; its first cell is 14. Row B's first cell is 20. Find the other three cells' total.","a":"80 - 14 - 20 = 46","hint":"The three cells not specified must add to the remainder.","marks":2,"level":"hard"},
    {"q":"Among 45 pupils, 25 study art, 20 do not. Of those studying art, 15 are girls. Find P(girl|art).","a":"15/25 = 3/5","hint":"The restricted group is the 25 art pupils.","marks":2,"level":"hard"}
  ],
  "exam":[
    {"q":"In a class of 30, 12 boys and 8 girls walk to school. Find the number who do not walk.","marks":2,"scheme":"M1 for subtracting the walkers from 30. A1 for 10."},
    {"q":"There are 18 girls; 8 walk to school. Find P(walk|girl).","marks":2,"scheme":"M1 for using 18 as the restricted total. A1 for 8/18 = 4/9."},
    {"q":"Of 50 people, 20 are adults. 12 adults and 18 children prefer tea. Find the probability a randomly chosen person prefers tea.","marks":2,"scheme":"M1 for (12 + 18)/50. A1 for 3/5."},
    {"q":"A class has 40 pupils, 22 are boys. 12 boys and 10 girls cycle. Find the number who do not cycle.","marks":2,"scheme":"M1 for 40 - 12 - 10. A1 for 18."}
  ]
});

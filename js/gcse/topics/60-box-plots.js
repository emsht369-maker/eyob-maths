(window.GCSE=window.GCSE||[]).push({
  "id":"box-plots",
  "title":"Box Plots and Comparing Distributions",
  "area":"Statistics",
  "tier":"FH",
  "grade":"6-9",
  "idea":"A box plot displays the minimum, lower quartile Q1, median, upper quartile Q3 and maximum. The box runs from Q1 to Q3; the whiskers reach the minimum and maximum. Range = maximum - minimum; IQR = Q3 - Q1. Compare typical values using medians and spread using IQR or range. Use the context in a comparison.<p><b>Calculator:</b> A calculator is allowed for range and IQR. Read scale values carefully when drawing or comparing plots.</p><b>Method:</b><ol><li>Read the five-number summary from the scale: minimum, Q1, median, Q3, maximum.</li><li>For a comparison of centre, compare medians.</li><li>For consistency or middle spread, compare IQRs; for total spread, compare ranges.</li><li>State which group has the larger or smaller value and what that means in context.</li></ol>",
  "example":["A data set has minimum 3, Q1=8, median 12, Q3=19 and maximum 25. Its range is 25 - 3 = <span class='ans'>22</span> and IQR is 19 - 8 = <span class='ans'>11</span>.","Group A has median 12 and IQR 6; Group B has median 15 and IQR 10. B has the higher typical value, while A is more consistent (smaller IQR)."],
  "mistakes":"<ol><li>Confusing the median line with an edge of the box.</li><li>Calculating IQR as Q3 + Q1 instead of Q3 - Q1.</li><li>Comparing plots without saying which group or what the measure means.</li></ol>",
  "key":[["Five-number summary","Minimum, Q1, median, Q3 and maximum."],["Median","The middle value; a measure of centre."],["Range","Maximum minus minimum; total spread."],["IQR","Q3 minus Q1; spread of the middle half."],["Consistent","Less variable, often shown by a smaller IQR."]],
  "practice":[
    {"q":"A box plot has minimum 2 and maximum 18. Find the range.","a":"18 - 2 = 16","hint":"Subtract the minimum from the maximum.","marks":1,"level":"easy"},
    {"q":"A box plot has Q1=5 and Q3=13. Find the IQR.","a":"13 - 5 = 8","hint":"Subtract Q1 from Q3.","marks":1,"level":"easy"},
    {"q":"What five values are shown in a box plot?","a":"Minimum, Q1, median, Q3, maximum","hint":"The five-number summary includes both ends and three quartiles.","marks":1,"level":"easy"},
    {"q":"Group A's median is 20 and Group B's median is 16. Which has the higher typical value?","a":"Group A","hint":"Compare the medians.","marks":1,"level":"easy"},
    {"q":"Group A has Q1=10 and Q3=22. Group B has Q1=12 and Q3=30. Which has greater IQR?","a":"A: 12; B: 18, so Group B","hint":"Calculate both Q3 - Q1 values.","marks":2,"level":"medium"},
    {"q":"A box plot has five-number summary 4, 9, 15, 21, 29. Find its range and IQR.","a":"Range = 29 - 4 = 25; IQR = 21 - 9 = 12","hint":"Use maximum - minimum and Q3 - Q1.","marks":2,"level":"medium"},
    {"q":"A has median 40 and IQR 8. B has median 36 and IQR 12. Which is more consistent?","a":"A, because its IQR is smaller.","hint":"A smaller IQR means the middle half is less spread out.","marks":1,"level":"medium"},
    {"q":"Scores for X have median 62; scores for Y have median 70. Make a comparison of typical scores.","a":"Y has a higher typical score; its median is 8 marks higher.","hint":"Compare the medians and refer to scores.","marks":1,"level":"medium"},
    {"q":"A box plot has minimum 12, Q1=18, median=25, Q3=31, maximum=40. Find the IQR and range.","a":"IQR = 31 - 18 = 13; range = 40 - 12 = 28","hint":"Use the quartiles for IQR and the endpoints for range.","marks":2,"level":"medium"},
    {"q":"A has median 50 and IQR 10; B has median 46 and IQR 6. Compare typical value and consistency.","a":"A has the higher median; B is more consistent because its IQR is smaller.","hint":"Use the median for centre and IQR for spread.","marks":2,"level":"hard"},
    {"q":"Group P's range is 40 and IQR is 12; Group Q's range is 30 and IQR is 18. Which has a larger overall spread and which a larger middle spread?","a":"P has the larger overall range; Q has the larger IQR.","hint":"Compare range and IQR separately.","marks":2,"level":"hard"},
    {"q":"A box plot shows Q1=24, median=30, Q3=38. Find the fraction of data between Q1 and Q3.","a":"3/4 - 1/4 = 1/2","hint":"The box contains the middle half of the data.","marks":1,"level":"hard"}
  ],
  "exam":[
    {"q":"A box plot has five-number summary 4, 9, 15, 21, 29. Find the IQR and range.","marks":3,"scheme":"M1 for 21 - 9. M1 for 29 - 4. A1 for IQR 12 and range 25."},
    {"q":"Group A has median 40 and IQR 8. Group B has median 36 and IQR 12. Compare the groups' typical scores and consistency.","marks":3,"scheme":"B1 for A's higher median/typical score. B1 for A's smaller IQR. B1 for stating A is more consistent."},
    {"q":"Group P has range 40 and IQR 12; Group Q has range 30 and IQR 18. Which has the greater total spread and which has the greater middle spread?","marks":2,"scheme":"B1 for P having the greater range/total spread. B1 for Q having the greater IQR/middle spread."},
    {"q":"What fraction of the data lies between Q1 and Q3?","marks":2,"scheme":"B1 for recognising the box covers the middle half. B1 for 1/2."}
  ]
});

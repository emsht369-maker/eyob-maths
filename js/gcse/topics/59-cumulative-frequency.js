(window.GCSE=window.GCSE||[]).push({
  "id":"cumulative-frequency",
  "title":"Cumulative Frequency: Median, Quartiles and IQR",
  "area":"Statistics",
  "tier":"FH",
  "grade":"6-9",
  "idea":"Cumulative frequency (CF) is a running total. On a cumulative frequency graph, the median is read at half the total frequency, the lower quartile Q1 at one quarter, and the upper quartile Q3 at three quarters. Interquartile range (IQR) = Q3 - Q1; it describes the middle half of the data. Values read from grouped data are estimates.<p><b>Calculator:</b> A calculator is allowed for fractions and IQR. Read the corresponding value from the horizontal axis carefully.</p><b>Method:</b><ol><li>Find the total frequency N from the last cumulative frequency.</li><li>Calculate N/4, N/2 and 3N/4.</li><li>On the graph, read the data values at those cumulative frequencies to estimate Q1, median and Q3.</li><li>Calculate IQR = Q3 - Q1 and compare distributions using centre and spread.</li></ol>",
  "example":["For N=80, the median is read at CF 40, Q1 at CF 20 and Q3 at CF 60.","If Q1=12 and Q3=27, IQR = 27 - 12 = <span class='ans'>15</span>."],
  "mistakes":"<ol><li>Using N/2 for both quartiles instead of N/4 and 3N/4.</li><li>Subtracting Q1 from the median instead of Q3 - Q1.</li><li>Calling graph-read estimates exact values.</li></ol>",
  "key":[["Cumulative frequency","Running total of frequencies."],["Median","Middle value, read at N/2 on a CF graph."],["Lower quartile (Q1)","Value read at N/4."],["Upper quartile (Q3)","Value read at 3N/4."],["IQR","Q3 - Q1, the spread of the middle half."]],
  "practice":[
    {"q":"Find the median position for 40 values using cumulative frequency.","a":"40/2 = CF 20","hint":"The median is at half the total frequency.","marks":1,"level":"easy"},
    {"q":"Find the lower-quartile position for 80 values.","a":"80/4 = CF 20","hint":"Q1 is at one quarter of the total.","marks":1,"level":"easy"},
    {"q":"Find the upper-quartile position for 80 values.","a":"3 × 80/4 = CF 60","hint":"Q3 is at three quarters of the total.","marks":1,"level":"easy"},
    {"q":"Q1=8 and Q3=20. Find the IQR.","a":"20 - 8 = 12","hint":"Subtract the lower quartile from the upper quartile.","marks":1,"level":"easy"},
    {"q":"For a total frequency of 120, at what CF is the median read?","a":"120/2 = 60","hint":"Use half of the total frequency.","marks":1,"level":"medium"},
    {"q":"For N=200, find the CF positions for Q1 and Q3.","a":"Q1: 50; Q3: 150","hint":"Take one quarter and three quarters of 200.","marks":1,"level":"medium"},
    {"q":"A graph gives Q1=14 and Q3=32. Find the IQR.","a":"32 - 14 = 18","hint":"Subtract Q1 from Q3.","marks":1,"level":"medium"},
    {"q":"A graph gives Q1=25, median=38 and Q3=49. Find the IQR.","a":"49 - 25 = 24","hint":"The median is not used to calculate IQR.","marks":1,"level":"medium"},
    {"q":"The final cumulative frequency is 60. State the CF levels used to read Q1, median and Q3.","a":"15, 30, 45","hint":"Use N/4, N/2 and 3N/4.","marks":2,"level":"medium"},
    {"q":"For a data set of 240, the graph gives Q1=18 and Q3=42. Find the IQR and median position.","a":"IQR = 42 - 18 = 24; median at CF 120","hint":"Calculate the spread and half-total position separately.","marks":2,"level":"hard"},
    {"q":"Group A has Q1=20, Q3=50. Group B has Q1=24, Q3=45. Which has the greater IQR and by how much?","a":"A: 30; B: 21; A is greater by 9","hint":"Find both Q3 - Q1 values and compare.","marks":2,"level":"hard"},
    {"q":"Total frequency is 160. A graph gives values 12 at CF 40 and 30 at CF 120. Estimate the IQR.","a":"30 - 12 = 18","hint":"The quartiles are read at N/4=40 and 3N/4=120.","marks":2,"level":"hard"}
  ],
  "exam":[
    {"q":"For 120 values, state the cumulative frequencies at which to read Q1, the median and Q3.","marks":3,"scheme":"M1 for N/4. M1 for N/2 and 3N/4. A1 for CF 30, 60 and 90."},
    {"q":"A cumulative frequency graph gives Q1=14 and Q3=32. Find the IQR.","marks":2,"scheme":"M1 for 32 - 14. A1 for 18."},
    {"q":"Group A has Q1=20, Q3=50. Group B has Q1=24, Q3=45. Which has greater IQR, and by how much?","marks":3,"scheme":"M1 for IQR(A)=30. M1 for IQR(B)=21. A1 for A by 9."},
    {"q":"Explain why values read from a cumulative frequency graph for grouped data are estimates.","marks":2,"scheme":"B1 for noting data are grouped into intervals. B1 for noting exact individual values within each interval are not known."}
  ]
});

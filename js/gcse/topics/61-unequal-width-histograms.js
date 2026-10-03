(window.GCSE=window.GCSE||[]).push({
  "id":"unequal-width-histograms",
  "title":"Histograms with Unequal Class Widths (H)",
  "area":"Statistics",
  "tier":"H",
  "grade":"6-9",
  "idea":"In a histogram, the area of each bar represents frequency. When class widths are unequal, bar height must be frequency density, not frequency. Frequency density = frequency ÷ class width, so frequency = density × class width. Use consistent axes and touching bars for continuous classes.<p><b>Calculator:</b> A calculator is allowed for density and frequency calculations. Keep the units of the horizontal class width consistent.</p><b>Method:</b><ol><li>Find each class width by subtracting its lower boundary from its upper boundary.</li><li>Calculate frequency density = frequency ÷ class width.</li><li>Draw each bar with its class width and density as height; its area gives the frequency.</li><li>To recover frequency from a histogram, multiply density by class width.</li></ol>",
  "example":["A class 0–10 has frequency 20. Density = 20/10 = <span class='ans'>2</span>.","A class 10–30 has frequency density 1.5. Its width is 20, so frequency = 1.5 × 20 = <span class='ans'>30</span>."],
  "mistakes":"<ol><li>Using frequency itself as the bar height when class widths differ.</li><li>Multiplying frequency by class width to find density instead of dividing.</li><li>Forgetting that bar area, not just height, represents frequency.</li></ol>",
  "key":[["Class width","Upper boundary minus lower boundary."],["Frequency density","Frequency divided by class width."],["Bar area","Frequency density multiplied by class width; represents frequency."],["Unequal classes","Intervals with different widths."]],
  "practice":[
    {"q":"A class has width 5 and frequency 20. Find its frequency density.","a":"20/5 = 4","hint":"Divide frequency by class width.","marks":1,"level":"easy"},
    {"q":"A class has width 10 and frequency 30. Find its density.","a":"30/10 = 3","hint":"Use frequency ÷ width.","marks":1,"level":"easy"},
    {"q":"A class is 0 to 8. What is its class width?","a":"8","hint":"Subtract the lower boundary from the upper boundary.","marks":1,"level":"easy"},
    {"q":"Density is 2 and class width is 6. Find the frequency.","a":"2 × 6 = 12","hint":"Frequency equals density times width.","marks":1,"level":"easy"},
    {"q":"The interval 10–30 has frequency 40. Find its frequency density.","a":"40/20 = 2","hint":"The width is 30 - 10.","marks":1,"level":"medium"},
    {"q":"A bar has density 3.5 and width 4. Find its frequency.","a":"3.5 × 4 = 14","hint":"Bar area gives frequency.","marks":1,"level":"medium"},
    {"q":"A class 0–5 has frequency 15. Find its density.","a":"15/5 = 3","hint":"Find width, then divide frequency by it.","marks":1,"level":"medium"},
    {"q":"A class 20–50 has density 1.2. Find its frequency.","a":"(50 - 20) × 1.2 = 36","hint":"Find the width and multiply by density.","marks":2,"level":"medium"},
    {"q":"A class 0–10 has frequency 25; a class 10–30 has frequency 30. Find both densities.","a":"25/10 = 2.5; 30/20 = 1.5","hint":"Calculate each class width and divide each frequency by its own width.","marks":2,"level":"medium"},
    {"q":"A histogram bar from 5 to 25 has height 2.4. Find the frequency represented.","a":"(25 - 5) × 2.4 = 48","hint":"Frequency is the bar's area: width times height.","marks":2,"level":"hard"},
    {"q":"A class 0–4 has density 3; class 4–14 has density 2. Find the total frequency.","a":"4 × 3 + 10 × 2 = 32","hint":"Find both rectangular bar areas and add them.","marks":2,"level":"hard"},
    {"q":"A class width is 12 and frequency is 18. What bar height should a histogram use?","a":"18/12 = 1.5","hint":"The height is the frequency density.","marks":1,"level":"hard"}
  ],
  "exam":[
    {"q":"The interval 10–30 has frequency 40. Find its frequency density.","marks":2,"scheme":"M1 for width 30 - 10 = 20 and dividing 40 by 20. A1 for density 2."},
    {"q":"A histogram bar has width 6 and density 2.5. Find the frequency.","marks":2,"scheme":"M1 for multiplying density by width. A1 for 15."},
    {"q":"A class 0–4 has density 3; a class 4–14 has density 2. Find the total frequency.","marks":3,"scheme":"M1 for areas 4 × 3 and 10 × 2. M1 for adding the areas. A1 for 32."},
    {"q":"Explain why unequal-width histogram bars do not use frequency as their height.","marks":2,"scheme":"B1 for stating bar area represents frequency. B1 for stating height must be frequency density so areas are proportional to frequency."}
  ]
});

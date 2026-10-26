(window.GCSE=window.GCSE||[]).push({
  "id":"relative-frequency",
  "title":"Relative Frequency and Expected Outcomes",
  "area":"Probability",
  "tier":"F",
  "grade":"4-5",
  "idea":"Relative frequency is an estimate of probability from repeated trials: number of times the event happens ÷ number of trials. More trials usually give a more reliable estimate. Expected frequency = probability × number of trials; it is an average prediction, not a promise of the exact result.<p><b>Calculator:</b> A calculator is allowed for division and multiplication. Keep enough decimal places until the final answer.</p><b>Method:</b><ol><li>For an estimate, divide event frequency by total trials.</li><li>For an expected count, multiply probability by the number of trials.</li><li>Check that the estimated count is sensible and round only if needed.</li></ol>",
  "example":["A coin lands heads 27 times in 50 tosses. Relative frequency of heads = 27/50 = <span class='ans'>0.54</span>.","If a bus is late with probability 0.2 over 80 days, the expected number of late days is 0.2 × 80 = <span class='ans'>16</span>."],
  "mistakes":"<ol><li>Dividing the total trials by the event count instead of the other way round.</li><li>Claiming an expected number is guaranteed to happen.</li><li>Thinking a larger number of trials makes the relative frequency exactly equal to the true probability.</li></ol>",
  "key":[["Relative frequency","Event count divided by total trials."],["Trial","One run or attempt of an experiment."],["Expected frequency","Probability multiplied by the number of trials."],["Estimate","A value based on observed results."]],
  "practice":[
    {"q":"A coin lands tails 18 times in 30 tosses. Find the relative frequency of tails.","a":"18/30 = 0.6","hint":"Divide the number of tails by the total tosses.","marks":1,"level":"easy"},
    {"q":"A spinner lands on blue 12 times in 40 spins. Find its relative frequency.","a":"12/40 = 0.3","hint":"Event frequency divided by number of trials.","marks":1,"level":"easy"},
    {"q":"A player scores 9 goals in 15 penalty shots. Find the relative frequency of scoring.","a":"9/15 = 0.6","hint":"Divide goals by shots.","marks":1,"level":"easy"},
    {"q":"A machine makes 4 faulty items in 100. Find the relative frequency of a fault.","a":"4/100 = 0.04","hint":"Divide faulty items by all items.","marks":1,"level":"easy"},
    {"q":"The chance of rain on a day is 0.3. Find the expected number of rainy days in 20 days.","a":"0.3 × 20 = 6","hint":"Multiply probability by the number of days.","marks":1,"level":"medium"},
    {"q":"A spinner has relative frequency 0.25 for green. Estimate green results in 80 spins.","a":"0.25 × 80 = 20","hint":"Use expected frequency = probability × trials.","marks":1,"level":"medium"},
    {"q":"A player wins 42 games out of 60. Find the relative frequency of a win.","a":"42/60 = 0.7","hint":"Divide wins by games played.","marks":1,"level":"medium"},
    {"q":"A seed germinates with probability 0.8. How many are expected to germinate from 50 seeds?","a":"0.8 × 50 = 40","hint":"Multiply the probability by 50.","marks":1,"level":"medium"},
    {"q":"A bus is late on 15 of 75 days. Use this relative frequency to estimate late days in 200 days.","a":"15/75 × 200 = 40","hint":"First find the late-day probability, then multiply by 200.","marks":2,"level":"medium"},
    {"q":"A coin lands heads 36 times in 60 tosses. Using this estimate, predict heads in 250 tosses.","a":"36/60 × 250 = 150","hint":"Find the relative frequency, then multiply by 250.","marks":2,"level":"hard"},
    {"q":"A shop expects 12 returns from 300 sales. Use this to estimate the probability of a return and the expected returns from 500 sales.","a":"12/300 = 0.04; 0.04 × 500 = 20","hint":"Find relative frequency first; use it as the probability estimate.","marks":2,"level":"hard"},
    {"q":"A spinner landed red 28 times in 80 spins. How many red outcomes would you expect in 200 spins using this estimate?","a":"28/80 × 200 = 70","hint":"Use the observed relative frequency as the probability estimate.","marks":2,"level":"hard"}
  ],
  "exam":[
    {"q":"A coin lands tails 18 times in 30 tosses. Find the relative frequency of tails.","marks":2,"scheme":"M1 for 18 ÷ 30. A1 for 0.6 (or 3/5)."},
    {"q":"A spinner has probability 0.25 of landing green. Find the expected number of green results in 80 spins.","marks":2,"scheme":"M1 for 0.25 × 80. A1 for 20."},
    {"q":"A player wins 42 out of 60 games. Estimate the wins in 200 games.","marks":2,"scheme":"M1 for 42 ÷ 60 × 200. A1 for 140."},
    {"q":"Explain why 16 expected rainy days does not guarantee exactly 16 rainy days.","marks":2,"scheme":"B1 for identifying this as a prediction/average. B1 for stating the actual result can vary by chance."}
  ]
});

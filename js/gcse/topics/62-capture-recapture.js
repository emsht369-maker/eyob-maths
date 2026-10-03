(window.GCSE=window.GCSE||[]).push({
  "id":"capture-recapture",
  "title":"Capture-Recapture",
  "area":"Statistics",
  "tier":"H",
  "grade":"6-9",
  "idea":"Capture-recapture estimates the size of a population when counting every member is difficult. Mark a first sample, return it and allow it to mix, then take a second sample. Estimate population size N ≈ (number in first sample × number in second sample) ÷ number of marked members in the second sample. The estimate relies on suitable assumptions.<p><b>Calculator:</b> A calculator is allowed; write down the three counts and keep the fraction before rounding.</p><b>Method:</b><ol><li>Record n1, the number captured and marked first.</li><li>Record n2, the number in the second sample, and m, the marked ones in it.</li><li>Calculate estimate N = n1 × n2 ÷ m.</li><li>Check assumptions: marks stay visible, marked members mix, population is stable, and capture chances are similar.</li></ol>",
  "example":["First sample: 40 fish marked. Second sample: 50 fish, 10 marked. Estimate N = 40 × 50 ÷ 10 = <span class='ans'>200 fish</span>.","First sample: 30 beetles marked. Second sample: 40 beetles, 6 marked. Estimate N = 30 × 40 ÷ 6 = <span class='ans'>200 beetles</span>."],
  "mistakes":"<ol><li>Dividing by the second sample size instead of the number of marked recaptures.</li><li>Forgetting to multiply the two sample sizes.</li><li>Ignoring assumptions such as mixing, stable population and visible marks.</li></ol>",
  "key":[["First sample (n1)","Number captured and marked initially."],["Second sample (n2)","Number captured on the later sample."],["Marked recaptures (m)","Marked members found in the second sample."],["Estimate","n1 × n2 ÷ m, assuming the method's conditions hold."]],
  "practice":[
    {"q":"30 fish are marked; later 40 fish are caught, 6 are marked. State the three counts n1, n2 and m.","a":"n1=30, n2=40, m=6","hint":"Identify the first sample, second sample and marked recaptures.","marks":1,"level":"easy"},
    {"q":"Why must marked animals be returned and allowed to mix?","a":"So marked animals are spread through the population before the second sample.","hint":"Think about how the second sample should represent the whole population.","marks":1,"level":"easy"},
    {"q":"What does m represent in the capture-recapture formula?","a":"The number of marked animals in the second sample","hint":"It is the recaptured marked count.","marks":1,"level":"easy"},
    {"q":"Give one assumption needed for capture-recapture.","a":"The population stays about the same size between samples.","hint":"Think about changes, marks, mixing or equal capture chances.","marks":1,"level":"easy"},
    {"q":"20 insects are marked. A second sample has 25 insects, 5 marked. Estimate the population.","a":"20 × 25/5 = 100","hint":"Multiply sample sizes and divide by marked recaptures.","marks":2,"level":"medium"},
    {"q":"40 fish are marked, then 50 fish are caught and 10 are marked. Estimate the population.","a":"40 × 50/10 = 200","hint":"Use N ≈ n1 × n2 ÷ m.","marks":2,"level":"medium"},
    {"q":"A first sample marks 24 birds. A second sample has 36 birds, of which 8 are marked. Estimate the population.","a":"24 × 36/8 = 108","hint":"Multiply 24 by 36, then divide by 8.","marks":2,"level":"medium"},
    {"q":"A population estimate is 300. The first sample is 60 and the second is 50. How many marked animals were recaptured?","a":"60 × 50/300 = 10","hint":"Rearrange N = n1 × n2/m to find m.","marks":2,"level":"medium"},
    {"q":"State two assumptions of capture-recapture.","a":"For example, marks remain visible and the population does not change between samples.","hint":"Think of conditions needed for marks and the samples to remain representative.","marks":2,"level":"medium"},
    {"q":"First sample 45 marked; second sample 60 with 9 marked. Estimate population and state one assumption.","a":"45 × 60/9 = 300; e.g. marked animals mix back into the population.","hint":"Calculate with the formula, then check the sampling conditions.","marks":2,"level":"hard"},
    {"q":"A sample of 80 is marked. The later sample is 100 and includes 20 marked. Estimate the population. If the marks fell off, what could happen to the estimate?","a":"80 × 100/20 = 400; fewer marked recaptures could make the estimate too large.","hint":"Calculate the estimate; missing marks reduce the recaptured-mark count in the denominator.","marks":3,"level":"hard"},
    {"q":"A first sample of 50 and second sample of 40 produce an estimate of 250. How many marked animals were in the second sample?","a":"50 × 40/250 = 8","hint":"Rearrange to m = n1 × n2/N.","marks":2,"level":"hard"}
  ],
  "exam":[
    {"q":"40 fish are marked. A second sample has 50 fish, 10 of which are marked. Estimate the population size.","marks":3,"scheme":"M1 for using 40 × 50 ÷ 10. M1 for correct substitution/calculation. A1 for 200 fish."},
    {"q":"A first sample marks 24 birds. A second sample has 36 birds, including 8 marked. Estimate the population.","marks":3,"scheme":"M1 for 24 × 36 ÷ 8. M1 for calculation. A1 for 108 birds."},
    {"q":"Give two assumptions needed for a capture-recapture estimate to be reliable.","marks":2,"scheme":"B1 for one valid assumption, such as marks remain visible or marked animals mix. B1 for a second distinct assumption, such as stable population or equal chance of capture."},
    {"q":"Explain why losing marks between samples could make the population estimate too high.","marks":2,"scheme":"B1 for noting fewer marked animals would be counted in the second sample. B1 for the smaller denominator making n1 × n2 ÷ m larger."}
  ]
});

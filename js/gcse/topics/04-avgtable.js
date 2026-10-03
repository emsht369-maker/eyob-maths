(window.GCSE=window.GCSE||[]).push({
  "id": "avgtable",
  "title": "Averages from a Table",
  "area": "Statistics",
  "tier": "FH",
  "grade": "4-5",
  "idea": "In a frequency table, the <b>frequency</b> tells you how many times each value happens. <b>Mean</b> = &Sigma;(score &times; frequency) &divide; &Sigma;frequency. <b>Mode</b> = the score with the biggest frequency (not the frequency itself!). <b>Median</b>: find the middle position, then use a running total (cumulative frequency) to see which score it lands on. Modal <i>class</i> = the class with the highest frequency.",
  "example": [
    "Score 1 (f=2), 2 (f=5), 3 (f=3). Total f = 10. Score&times;f = 2+10+9 = 21. Mean = 21&divide;10 = <span class='ans'>2.1</span>. Median is between 5th and 6th; running totals 2, 7, 10, so both are score 2. Median = <span class='ans'>2</span>."
  ],
  "mistakes": "Dividing by the number of rows instead of the total frequency. Saying the mode is 5 (the frequency) instead of 2 (the score).",
  "key": [
    [
      "Frequency",
      "How often a value occurs."
    ],
    [
      "Mean",
      "Total score divided by total frequency."
    ],
    [
      "Mode",
      "The score with the highest frequency."
    ],
    [
      "Cumulative frequency",
      "A running total of frequencies."
    ]
  ],
  "practice": [
    {
      "q": "In the example table, what is the modal score?",
      "a": "2, because it has the highest frequency (5).",
      "hint": "Use the method explained in the idea and example. Check each step.",
      "marks": 1
    },
    {
      "q": "Table: score 0 (f=4), 1 (f=6), 2 (f=7), 3 (f=3). Find the mean.",
      "a": "Total f = 20. Sum = 0+6+14+9 = 29. Mean = 29&divide;20 = 1.45.",
      "hint": "Use the method explained in the idea and example. Check each step.",
      "marks": 1
    },
    {
      "q": "Same table: find the median.",
      "a": "Middle is between the 10th and 11th. Running totals: 4, 10, 17, 20. The 10th is score 1, the 11th is score 2. Median = (1+2)&divide;2 = 1.5.",
      "hint": "Use the method explained in the idea and example. Check each step.",
      "marks": 1
    },
    {
      "q": "Same table: what is the mode?",
      "a": "2 (frequency 7 is the highest).",
      "hint": "Use the method explained in the idea and example. Check each step.",
      "marks": 1
    },
    {
      "q": "Scores 1,2,3 have frequencies 2,3,1. Find total frequency.",
      "a": "6",
      "hint": "Add the frequencies.",
      "marks": 2
    },
    {
      "q": "Scores 1,2,3 have frequencies 2,3,1. Find the total score.",
      "a": "11",
      "hint": "Multiply each score by its frequency and add.",
      "marks": 2
    },
    {
      "q": "Find mean for score 2 (f=3), score 4 (f=1).",
      "a": "2.5",
      "hint": "Weighted total is 10 across four values.",
      "marks": 2
    },
    {
      "q": "Which is the modal score: 1(f=2), 2(f=5), 3(f=1)?",
      "a": "2",
      "hint": "Choose the score with the largest frequency.",
      "marks": 2
    },
    {
      "q": "Frequencies 3,4,2. Find cumulative frequency at the end.",
      "a": "9",
      "hint": "Add all frequencies.",
      "marks": 2
    },
    {
      "q": "Scores 0 and 1 have frequencies 4 and 6. Find the mean.",
      "a": "0.6",
      "hint": "Weighted total divided by 10.",
      "marks": 3
    },
    {
      "q": "Frequencies 2,3,5. Find the median position for 10 values.",
      "a": "5.5",
      "hint": "Average positions five and six.",
      "marks": 3
    },
    {
      "q": "Find total score: score 3 has frequency 4.",
      "a": "12",
      "hint": "Multiply score by frequency.",
      "marks": 3
    }
  ],
  "exam": [
    {
      "q": "Same table: find the median.",
      "marks": 2,
      "scheme": "M1 for a correct method. A1 for the correct final answer."
    },
    {
      "q": "Scores 1,2,3 have frequencies 2,3,1. Find the total score.",
      "marks": 3,
      "scheme": "M1 for the correct method. A1 for a correct intermediate result. B1 for the accurate final answer."
    },
    {
      "q": "Frequencies 3,4,2. Find cumulative frequency at the end.",
      "marks": 4,
      "scheme": "M1 for setting up correctly. M1 for a valid next step. A1 for a correct intermediate result. B1 for the final answer."
    },
    {
      "q": "Find total score: score 3 has frequency 4.",
      "marks": 5,
      "scheme": "M1 for the correct method. M1 for correct substitution or setup. M1 for a valid calculation. A1 for a correct intermediate result. B1 for the accurate final answer."
    }
  ]
});

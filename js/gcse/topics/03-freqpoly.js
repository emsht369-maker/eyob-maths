(window.GCSE=window.GCSE||[]).push({
  "id": "freqpoly",
  "title": "Frequency Polygons",
  "area": "Statistics",
  "tier": "FH",
  "grade": "4-5",
  "idea": "Used for <b>grouped data</b> (classes like 0&ndash;10). For each class, find the <b>midpoint</b> = (lower + upper) &divide; 2. Plot (midpoint, frequency), then join the points with straight lines. Do <i>not</i> join to the axis at the ends unless told. Why midpoints? The midpoint is the best 'typical value' of the class. Polygons are great for comparing two groups on one graph.<br><b>Estimated mean</b> from grouped data = &Sigma;(frequency &times; midpoint) &divide; &Sigma;frequency. It is only an <i>estimate</i> because we do not know the real values.",
  "example": [
    "Classes 0&ndash;10 (f=3), 10&ndash;20 (f=8), 20&ndash;30 (f=6). Midpoints 5, 15, 25. Points: (5,3), (15,8), (25,6). Estimated mean = (5&times;3+15&times;8+25&times;6) &divide; 17 = 285&divide;17 = <span class='ans'>16.8</span>."
  ],
  "mistakes": "Plotting at the class <i>end</i> instead of the midpoint. Curved lines (use a ruler). Saying the mean is exact.",
  "key": [
    [
      "Class",
      "A group of values."
    ],
    [
      "Midpoint",
      "The middle of a class interval."
    ],
    [
      "Frequency",
      "How many values are in a class."
    ],
    [
      "Estimate",
      "A close answer, not an exact one."
    ]
  ],
  "practice": [
    {
      "q": "A class is 20 &le; x &lt; 30. What midpoint do you plot?",
      "a": "(20+30)&divide;2 = 25.",
      "hint": "Use the method explained in the idea and example. Check each step.",
      "marks": 1
    },
    {
      "q": "Find the midpoint of the class 40&ndash;60.",
      "a": "(40+60)&divide;2 = 50.",
      "hint": "Use the method explained in the idea and example. Check each step.",
      "marks": 1
    },
    {
      "q": "Why is the mean from grouped data only an estimate?",
      "a": "We only know which class each value is in, not the exact values, so we use the midpoint as a guess.",
      "hint": "Use the method explained in the idea and example. Check each step.",
      "marks": 1
    },
    {
      "q": "Classes 0&ndash;10 (f=4), 10&ndash;20 (f=6): estimate the mean.",
      "a": "Midpoints 5 and 15. (5&times;4 + 15&times;6) &divide; 10 = (20+90)&divide;10 = 11.",
      "hint": "Use the method explained in the idea and example. Check each step.",
      "marks": 1
    },
    {
      "q": "Find the midpoint of 0 to 10.",
      "a": "5",
      "hint": "Average the class limits.",
      "marks": 2
    },
    {
      "q": "Find the midpoint of 10 to 30.",
      "a": "20",
      "hint": "Add the ends and divide by two.",
      "marks": 2
    },
    {
      "q": "For midpoint 5 and frequency 4, find f times midpoint.",
      "a": "20",
      "hint": "Multiply 5 by 4.",
      "marks": 2
    },
    {
      "q": "Classes 0-10 f=2 and 10-20 f=2. Estimate the mean.",
      "a": "10",
      "hint": "Use midpoints 5 and 15 with equal frequency.",
      "marks": 2
    },
    {
      "q": "Find the midpoint of 30 to 50.",
      "a": "40",
      "hint": "Add the limits and halve.",
      "marks": 2
    },
    {
      "q": "If f=3 and midpoint=8, find f times midpoint.",
      "a": "24",
      "hint": "Multiply the frequency by the midpoint.",
      "marks": 3
    },
    {
      "q": "For classes 0-10 f=1 and 10-20 f=3, estimate the mean.",
      "a": "12.5",
      "hint": "Use midpoints 5 and 15.",
      "marks": 3
    },
    {
      "q": "Find the total frequency for 2, 5 and 3.",
      "a": "10",
      "hint": "Add the frequencies.",
      "marks": 3
    }
  ],
  "exam": [
    {
      "q": "Why is the mean from grouped data only an estimate?",
      "marks": 2,
      "scheme": "M1 for a correct method. A1 for the correct final answer."
    },
    {
      "q": "Find the midpoint of 10 to 30.",
      "marks": 3,
      "scheme": "M1 for the correct method. A1 for a correct intermediate result. B1 for the accurate final answer."
    },
    {
      "q": "Find the midpoint of 30 to 50.",
      "marks": 4,
      "scheme": "M1 for setting up correctly. M1 for a valid next step. A1 for a correct intermediate result. B1 for the final answer."
    },
    {
      "q": "Find the total frequency for 2, 5 and 3.",
      "marks": 5,
      "scheme": "M1 for the correct method. M1 for correct substitution or setup. M1 for a valid calculation. A1 for a correct intermediate result. B1 for the accurate final answer."
    }
  ]
});

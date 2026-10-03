(window.GCSE=window.GCSE||[]).push({
  "id": "stemleaf",
  "title": "Stem &amp; Leaf Diagrams",
  "area": "Statistics",
  "tier": "FH",
  "grade": "4-5",
  "idea": "The <b>stem</b> is the first digit(s) (here, tens) and each <b>leaf</b> is the last digit. Always read the <b>key</b> first. Leaves must be in order, smallest to largest. Because the data is already sorted, you can count along to find the median.<pre class='c'>0 | 9\n1 | 2 3 3 4 5\n2 | 5 6 6 6 6 7\n3 | 1 3 4 6 8\n4 | 0 2 9\nKey: 1 | 2 means 12 points</pre>",
  "example": [
    "20 values in total. Median is between the 10th and 11th. Count: row 0 has 1 value, row 1 has 5 (total 6), then 25 is 7th, 26 is 8th, 9th, 10th and 11th. So median = <span class='ans'>26</span>."
  ],
  "mistakes": "Reading '2 | 6' as 2 and 6 instead of 26. Forgetting the key. Writing the mode as just '6' when the value is 26.",
  "key": [
    [
      "Stem",
      "The first digit or digits."
    ],
    [
      "Leaf",
      "The final digit."
    ],
    [
      "Key",
      "Shows how to read a stem and leaf."
    ],
    [
      "Median",
      "The middle value after sorting."
    ]
  ],
  "practice": [
    {
      "q": "What is the mode in the diagram above?",
      "a": "26. The leaf 6 appears four times in the row with stem 2.",
      "hint": "Use the method explained in the idea and example. Check each step.",
      "marks": 1
    },
    {
      "q": "How many values are there? Which positions give the median?",
      "a": "1+5+6+5+3 = 20 values. The median is between the 10th and 11th values.",
      "hint": "Use the method explained in the idea and example. Check each step.",
      "marks": 1
    },
    {
      "q": "Find the range.",
      "a": "Largest = 49, smallest = 9. Range = 49&minus;9 = 40.",
      "hint": "Use the method explained in the idea and example. Check each step.",
      "marks": 1
    },
    {
      "q": "How many people scored fewer than 20?",
      "a": "Row 0 has 1 and row 1 has 5. So 6 people.",
      "hint": "Use the method explained in the idea and example. Check each step.",
      "marks": 1
    },
    {
      "q": "What does '3 | 4' mean, using the key style 'stem | leaf = tens | units'?",
      "a": "It means 34.",
      "hint": "Use the method explained in the idea and example. Check each step.",
      "marks": 2
    },
    {
      "q": "Using the key 2|4 = 24, what is 3|7?",
      "a": "37",
      "hint": "Join the stem and leaf digits.",
      "marks": 2
    },
    {
      "q": "Sort the leaves 8, 2, 5.",
      "a": "2, 5, 8",
      "hint": "Put the smallest leaf first.",
      "marks": 2
    },
    {
      "q": "How many leaves are in 1|2 4 9?",
      "a": "3",
      "hint": "Count the leaves in the row.",
      "marks": 2
    },
    {
      "q": "With key 4|1 = 41, what value is 4|1?",
      "a": "41",
      "hint": "Read the key.",
      "marks": 2
    },
    {
      "q": "What is the range of values 12, 18, 25?",
      "a": "13",
      "hint": "Subtract 12 from 25.",
      "marks": 3
    },
    {
      "q": "How many values are in 1|3 5 and 2|0?",
      "a": "3",
      "hint": "Count every leaf.",
      "marks": 3
    },
    {
      "q": "What is the median of 11, 14, 18?",
      "a": "14",
      "hint": "Choose the middle value.",
      "marks": 3
    }
  ],
  "exam": [
    {
      "q": "Find the range.",
      "marks": 2,
      "scheme": "M1 for a correct method. A1 for the correct final answer."
    },
    {
      "q": "Using the key 2|4 = 24, what is 3|7?",
      "marks": 3,
      "scheme": "M1 for the correct method. A1 for a correct intermediate result. B1 for the accurate final answer."
    },
    {
      "q": "With key 4|1 = 41, what value is 4|1?",
      "marks": 4,
      "scheme": "M1 for setting up correctly. M1 for a valid next step. A1 for a correct intermediate result. B1 for the final answer."
    },
    {
      "q": "What is the median of 11, 14, 18?",
      "marks": 5,
      "scheme": "M1 for the correct method. M1 for correct substitution or setup. M1 for a valid calculation. A1 for a correct intermediate result. B1 for the accurate final answer."
    }
  ]
});

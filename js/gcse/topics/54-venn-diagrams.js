(window.GCSE=window.GCSE||[]).push({
  "id":"venn-diagrams",
  "title":"Venn Diagrams and Set Notation",
  "area":"Probability",
  "tier":"FH",
  "grade":"4-5",
  "idea":"A Venn diagram uses circles inside a rectangle. The rectangle is the universal set, ξ. A∩B means in both sets; A∪B means in A or B or both; A′ means not in A. Put the overlap in first, then the parts in only one circle, then the outside. For probability, divide the number in the required region by the total number of outcomes.<p><b>Calculator:</b> A calculator is allowed for probability arithmetic; a Venn diagram is usually filled in by hand.</p><b>Method:</b><ol><li>Write the total in the rectangle and place any given overlap first.</li><li>Fill each circle-only region by subtracting the overlap.</li><li>Find the outside by subtracting all circle regions from the total.</li><li>Use the set notation to select the right regions, then divide by the total if asked for probability.</li></ol>",
  "example":["In a group of 20, 12 like tea, 9 like coffee and 5 like both. Tea only = 12 - 5 = 7; coffee only = 9 - 5 = 4; neither = 20 - 7 - 5 - 4 = <span class='ans'>4</span>.","Using those counts, n(T∪C) = 7+5+4 = 16, so P(T∪C) = 16/20 = <span class='ans'>4/5</span>."],
  "mistakes":"<ol><li>Putting the overlap count into each circle-only section as well as the middle.</li><li>Thinking A∪B means only the overlap; it means A or B or both.</li><li>Forgetting the outside region or the universal total.</li></ol>",
  "key":[["Universal set (ξ)","All outcomes in the question."],["Intersection (A∩B)","Outcomes in both A and B."],["Union (A∪B)","Outcomes in A or B or both."],["Complement (A′)","Outcomes not in A."],["Neither","Outcomes outside both circles."]],
  "practice":[
    {"q":"What does A∩B mean?","a":"In both A and B","hint":"The intersection is the shared part of the circles.","marks":1,"level":"easy"},
    {"q":"What does A′ mean?","a":"Not in A","hint":"The prime symbol means the complement.","marks":1,"level":"easy"},
    {"q":"In a group of 20, 8 are in A, 6 are in B and 3 are in both. How many are in A only?","a":"8 - 3 = 5","hint":"Subtract the overlap from the total in A.","marks":1,"level":"easy"},
    {"q":"A has 7 members and B has 4 members; none are in both. How many are in A∪B?","a":"7 + 4 = 11","hint":"With no overlap, add the two counts.","marks":1,"level":"easy"},
    {"q":"In 30 people, 16 like tea, 12 like coffee and 5 like both. How many like neither?","a":"30 - (16 + 12 - 5) = 7","hint":"Find the union without double-counting the overlap, then subtract from 30.","marks":2,"level":"medium"},
    {"q":"A class has 24 pupils; 14 play football, 10 play tennis and 6 play both. How many play football only?","a":"14 - 6 = 8","hint":"Remove the pupils who play both from the football total.","marks":1,"level":"medium"},
    {"q":"In a group of 25, 11 are in A only, 4 are in both and 6 are in B only. How many are in neither?","a":"25 - 11 - 4 - 6 = 4","hint":"Subtract all three circle regions from the total.","marks":1,"level":"medium"},
    {"q":"In 40 people, 20 like apples, 18 like pears and 8 like both. How many like apples or pears?","a":"20 + 18 - 8 = 30","hint":"Add the set totals and subtract the overlap once.","marks":1,"level":"medium"},
    {"q":"A group has 30 people; 9 are in A only, 7 in B only and 5 in both. Find P(A∩B).","a":"5/30 = 1/6","hint":"The intersection is the overlap region; divide by the group total.","marks":2,"level":"medium"},
    {"q":"In 50 people, 28 like A, 25 like B and 12 like both. Find the number in neither.","a":"50 - (28 + 25 - 12) = 9","hint":"Use n(A∪B) = n(A)+n(B)-n(A∩B).","marks":2,"level":"hard"},
    {"q":"There are 36 outcomes. 20 are in A, 17 in B and 9 in both. Find P(A∪B).","a":"(20 + 17 - 9)/36 = 7/9","hint":"Calculate the union count, then divide by 36.","marks":2,"level":"hard"},
    {"q":"In a group of 40, 18 are in A, 15 in B and 6 in both. How many are in A′?","a":"40 - 18 = 22","hint":"A′ includes everyone not in A, wherever they are in the rectangle.","marks":1,"level":"hard"}
  ],
  "exam":[
    {"q":"In 30 people, 16 like tea, 12 like coffee and 5 like both. Find the number who like neither.","marks":3,"scheme":"M1 for 16 + 12 - 5. M1 for subtracting the union from 30. A1 for 7."},
    {"q":"A class has 24 pupils; 14 play football, 10 play tennis and 6 play both. Find the number who play football only.","marks":2,"scheme":"M1 for 14 - 6. A1 for 8."},
    {"q":"There are 36 outcomes. 20 are in A, 17 in B and 9 in both. Find P(A∪B).","marks":3,"scheme":"M1 for 20 + 17 - 9. M1 for dividing by 36. A1 for 28/36 = 7/9."},
    {"q":"A group of 40 has 18 people in A. Find P(A′).","marks":2,"scheme":"M1 for 40 - 18 = 22 outcomes outside A. A1 for 22/40 = 11/20."}
  ]
});

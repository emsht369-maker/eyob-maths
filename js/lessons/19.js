L[18]={
s:[
["Counting principles","<p>The <b>addition rule</b> counts a choice from separate non-overlapping groups by adding. The <b>multiplication rule</b> counts a sequence of choices by multiplying. Example: 3 shirts and 2 pairs of trousers make 3×2=<b>6</b> outfits.</p>"],
["Factorials and permutations","<p>n! means n×(n−1)×…×1, with 0!=1. A <b>permutation</b> counts arrangements where order matters. Arranging r of n distinct items gives nPr=n!/(n−r)!. Example: arranging 2 of 4 books gives 4×3=<b>12</b>.</p>"],
["Combinations","<p>A <b>combination</b> counts selections where order does not matter: nCr=n!/[r!(n−r)!]. Example: choose 2 people from 4: 4C2=4×3/(2×1)=<b>6</b> groups.</p>"],
["Pascal's triangle and binomial theorem","<p>Pascal's triangle gives the combination numbers. The binomial theorem expands (a+b)ⁿ using coefficients nCr. Example: (x+1)²=x²+2x+1; the coefficients 1,2,1 are row 2 of Pascal's triangle.</p>"],
["Inclusion-exclusion","<p>For two sets, |A∪B|=|A|+|B|−|A∩B|. Subtract the overlap because it was counted twice. Example: 10 like tea, 8 like coffee, 3 like both; 10+8−3=<b>15</b> like at least one.</p>"],
["Pigeonhole principle","<p>If more objects are placed into fewer boxes, some box has at least two objects. More exactly, n objects in k boxes means one box has at least ceiling(n/k). Example: 13 people and 12 birth months guarantee at least two share a month.</p>"],
["Common mistakes","<ul><li>Ask whether order matters before choosing permutations or combinations.</li><li>Use multiplication for a sequence of independent choices.</li><li>Do not include repeated arrangements as different combinations.</li><li>Subtract overlaps once in inclusion-exclusion.</li><li>Factorial applies to whole numbers, with 0!=1.</li><li>State what is being counted so the result has a clear meaning.</li></ul>"],
["Where this is used in machine learning","<ul><li>Combinations count possible feature subsets and model choices.</li><li>Permutations count orders in schedules, rankings and data sequences.</li><li>Counting supports probability calculations over possible outcomes.</li><li>Inclusion-exclusion helps count unique records across overlapping groups.</li></ul>"]
],
e:[
["How many ways can 3 shirts and 2 trousers be paired?","<p>Each shirt can pair with either pair of trousers.<br>Use the multiplication rule: 3×2.<br><b>6 outfits.</b></p>"],
["Evaluate 5!.","<p>Expand the factorial: 5×4×3×2×1.<br>Calculate: 20×3×2×1=120.<br><b>5!=120.</b></p>"],
["How many ways can 2 of 5 people be selected?","<p>Order does not matter, so use combinations.<br>5C2=5×4/(2×1)=10.<br><b>10 groups.</b></p>"],
["Expand (x+2)³.","<p>Use (a+b)³=a³+3a²b+3ab²+b³.<br>Substitute a=x, b=2: x³+6x²+12x+8.<br><b>Expansion = x³+6x²+12x+8.</b></p>"],
["In a group of 20, 12 like tea, 9 like coffee and 5 like both. How many like at least one?","<p>Use inclusion-exclusion: |T∪C|=|T|+|C|−|T∩C|.<br>12+9−5=16.<br><b>16 people.</b></p>"]
],
q:TOPICS[18][5].concat([
["Evaluate 4!.","24","Multiply the whole numbers from 4 down to 1.","<p>4!=4×3×2×1.<br>4×3×2=24.<br><b>4!=24.</b></p>","E"],
["How many ways to arrange 2 different books?","2","Two objects have 2! possible orders.","<p>The orders are AB and BA.<br><b>There are 2 arrangements.</b></p>","E"],
["How many outfits from 2 hats and 3 coats?","6","Multiply the independent choices.","<p>Each of 2 hats can go with 3 coats.<br>2×3=6.<br><b>6 outfits.</b></p>","E"],
["How many ways to choose 1 item from 5?","5","There are 5 possible single-item choices.","<p>Each item gives one possible selection.<br><b>5 choices.</b></p>","E"],
["Evaluate 0!.","1","By definition, zero factorial equals one.","<p>Factorials use the convention 0!=1.<br><b>Answer = 1.</b></p>","E"],
["How many ways can 2 of 4 people be chosen if order does not matter?","6","Use 4C2.","<p>4C2=4×3/(2×1).<br>12÷2=6.<br><b>6 groups.</b></p>","E"],
["How many ordered choices are there for a first and second place from 3 runners?","6","There are 3 first-place choices then 2 remaining second-place choices.","<p>Use the multiplication rule: 3×2.<br><b>6 rankings.</b></p>","E"],
["What is the coefficient of x in (x+1)²?","2","Expand using the binomial theorem.","<p>(x+1)²=x²+2x+1.<br>The coefficient of x is <b>2</b>.</p>","E"],
["How many ways can 3 of 5 books be arranged?","60","Order matters: 5×4×3.","<p>Choose the first book in 5 ways, then 4, then 3.<br>5×4×3=60.<br><b>60 arrangements.</b></p>","M"],
["How many ways can 3 of 5 people be chosen?","10","Use 5C3 because order does not matter.","<p>5C3=5!/(3!2!).<br>(5×4)/(2×1)=10.<br><b>10 groups.</b></p>","M"],
["How many subsets does a 4-element set have?","16","Each element is either included or not: 2ⁿ.","<p>Each of 4 elements has 2 choices.<br>2⁴=16.<br><b>16 subsets.</b></p>","M"],
["Find the coefficient of x² in (x+1)⁴.","6","The coefficient is 4C2.","<p>Binomial theorem gives 4C2 for x².<br>4C2=4×3/2=6.<br><b>Coefficient = 6.</b></p>","M"],
["A class has 10 who study French, 8 Spanish and 3 both. How many study at least one?","15","Add group sizes and subtract the overlap once.","<p>|F∪S|=10+8−3.<br>15 students study at least one.<br><b>Answer = 15.</b></p>","M"],
["How many ways to choose 4 of 7 items?","35","Use 7C4=7C3.","<p>7C3=7×6×5/(3×2×1).<br>210÷6=35.<br><b>35 choices.</b></p>","M"],
["How many arrangements of the letters ABC are there?","6","There are 3! orders.","<p>3!=3×2×1.<br><b>6 arrangements.</b></p>","H"],
["How many 3-digit codes can be made from 4 digits if repeats are allowed?","64","Each of 3 positions has 4 choices.","<p>Use the multiplication rule: 4×4×4.<br>4³=64.<br><b>64 codes.</b></p>","H"],
["How many 3-digit codes from 4 digits if repeats are not allowed?","24","Choose 4, then 3, then 2 options.","<p>Use ordered choices: 4×3×2.<br><b>24 codes.</b></p>","H"],
["How many ways to select a committee of 2 from 6 people?","15","A committee has no ordering, so use 6C2.","<p>6C2=6×5/(2×1).<br>30÷2=15.<br><b>15 committees.</b></p>","H"],
["Using inclusion-exclusion, if |A|=14, |B|=11 and |A∩B|=4, find |A∪B|.","21","Use |A|+|B|−|A∩B|.","<p>14+11−4=21.<br>The shared 4 were counted twice, so subtract once.<br><b>|A∪B|=21.</b></p>","H"],
["How many diagonals does a hexagon have?","9","Use n(n−3)/2 for an n-sided polygon.","<p>For n=6: 6(6−3)/2=18/2.<br><b>There are 9 diagonals.</b></p>","H"],
["At least how many people must be in a room to guarantee two share a birth month?","13","There are 12 months; one more person forces a repeated month.","<p>With 12 people, each could have a different birth month.<br>The 13th must share one of the 12 months.<br><b>At least 13 people.</b></p>","H"],
["Find the coefficient of x³ in (x+2)⁵.","40","Choose the x³ term and 2² term: 5C3×2².","<p>Coefficient = 5C3×2².<br>10×4=40.<br><b>Coefficient = 40.</b></p>","H"],
["How many distinct 4-letter arrangements can be made from 4 distinct letters?","24","There are 4! permutations.","<p>4!=4×3×2×1.<br><b>24 arrangements.</b></p>","H"]
]),
v:[
["Combinatorics Explained","https://www.youtube.com/results?search_query=combinatorics+counting+permutations+combinations"],
["Khan Academy: Counting and Probability","https://www.youtube.com/results?search_query=Khan+Academy+permutations+combinations"],
["Binomial Theorem Lessons","https://www.youtube.com/results?search_query=binomial+theorem+explained"]
],
k:[
["Khan Academy: Counting","https://www.khanacademy.org/math/statistics-probability"],
["OpenStax: Introductory Statistics","https://openstax.org/details/books/introductory-statistics"]
]};
L[18].q=window.MATH_EXPLANATIONS.fill(18,L[18].q);

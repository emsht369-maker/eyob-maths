L[13]={
s:[
["Sequences and common differences","<p>A <b>sequence</b> is an ordered list. An arithmetic sequence adds the same number each time; this number is its common difference d. Its nth term is aₙ = a₁ + (n−1)d. Example: 4, 7, 10, … has d=3 and 10th term 4+9×3=<b>31</b>.</p>"],
["Geometric sequences and ratios","<p>A geometric sequence multiplies by the same ratio r each time. Its nth term is aₙ = a₁rⁿ⁻¹. Example: 3, 6, 12, … has ratio 2 and fifth term 3×2⁴=<b>48</b>.</p>"],
["Recursive sequences","<p>A <b>recursive rule</b> gives a term using an earlier term. It needs a starting value. Example: a₁=2 and aₙ₊₁=aₙ+3 gives 2, 5, 8, 11, …; each new term uses the previous one.</p>"],
["Arithmetic and geometric series","<p>A <b>series</b> is a sum of sequence terms. The first n arithmetic terms sum to Sₙ=n(a₁+aₙ)/2. A finite geometric sum is Sₙ=a₁(1−rⁿ)/(1−r), when r≠1. Example: 2+5+8+11 has sum <b>26</b>.</p>"],
["Sigma notation","<p>The Greek letter <b>Σ</b> means “add these terms”. The expression Σᵢ₌₁ⁿ i means 1+2+…+n = n(n+1)/2. Example: Σᵢ₌₁⁴ i = 1+2+3+4=<b>10</b>.</p>"],
["Infinite series and convergence","<p>An infinite series <b>converges</b> if its partial sums approach a finite number; otherwise it diverges. A geometric series with |r|&lt;1 has sum a₁/(1−r). Example: 1+1/2+1/4+… converges to 1/(1−1/2)=<b>2</b>.</p>"],
["Common mistakes","<ul><li>For the nth term, there are n−1 gaps after the first term.</li><li>Do not confuse a sequence (list) with a series (sum).</li><li>Check whether the pattern adds a fixed difference or multiplies by a fixed ratio.</li><li>The infinite geometric sum formula requires |r|&lt;1.</li><li>Write the starting term when using a recursive rule.</li><li>Sigma notation includes only the stated index values.</li></ul>"],
["Where this is used in machine learning","<ul><li>Learning-rate schedules use sequences to change step sizes during training.</li><li>Series appear in sums of losses, probabilities and approximations.</li><li>Geometric decay models shrinking weights or errors over repeated steps.</li><li>Recursive rules describe iterative algorithms that update a model again and again.</li></ul>"]
],
e:[
 ["Find the 12th term of 4, 9, 14, …","<p>The first term is 4 and the common difference is 5.<br>There are 12 − 1 = 11 steps from term 1 to term 12.<br>4 + 11 × 5 = 4 + 55 = <b>59</b>.</p>"],
["Find the 12th term of 5, 8, 11, …","<p>Common difference d=3 and first term a₁=5.<br>Use aₙ=a₁+(n−1)d: a₁₂=5+11×3.<br><b>12th term = 38.</b></p>"],
["Find the 6th term of 2, 6, 18, …","<p>The common ratio is 3.<br>a₆=2×3⁵=2×243.<br><b>6th term = 486.</b></p>"],
["Find the sum of the first 10 positive integers.","<p>Use Sₙ=n(n+1)/2 for 1+2+…+n.<br>S₁₀=10×11/2.<br><b>Sum = 55.</b></p>"],
["Find the sum of 3+6+12+24.","<p>This is a geometric series with first term 3 and ratio 2.<br>Add the four terms: 3+6+12+24.<br><b>Sum = 45.</b></p>"],
["Find the sum of 8+4+2+1+… forever.","<p>This geometric series has a₁=8 and r=1/2.<br>|r|&lt;1, so it converges; sum = a₁/(1−r).<br>8/(1−1/2)=8/(1/2).<br><b>Sum = 16.</b></p>"]
],
q:TOPICS[13][5].concat([
["Find the common difference of 6, 10, 14, …","4","Subtract adjacent terms.","<p>Common difference = next term − previous term.<br>10 − 6 = 4 and 14 − 10 = 4.<br><b>d=4.</b></p>","E"],
["Find the 5th term of 2, 5, 8, …","14","Add the common difference four times after the first term.","<p>The common difference is 3; there are 5−1=4 steps.<br>2 + 4×3 = 14.<br><b>5th term = 14.</b></p>","E"],
["Find the next term: 3, 6, 12, …","24","Multiply each term by the same ratio.","<p>The ratio is 2 because 6÷3=2 and 12÷6=2.<br>12×2=24.<br><b>Next term = 24.</b></p>","E"],
["Evaluate Σᵢ₌₁⁴ i.","10","Add the terms for i=1,2,3,4.","<p>Σ means add the listed values.<br>1+2+3+4=10.<br><b>Answer = 10.</b></p>","E"],
["Find 1+2+3+4+5.","15","Use the sum formula n(n+1)/2.","<p>There are n=5 terms.<br>5×6÷2=15.<br><b>Sum = 15.</b></p>","E"],
["A sequence starts at 7 and adds 2. Find its 4th term.","13","Write terms until the fourth.","<p>Start at 7, then add 2 each time: 7, 9, 11, 13.<br>The fourth term is <b>13</b>.</p>","E"],
["Find the common ratio of 5, 15, 45, …","3","Divide a term by the previous term.","<p>15÷5=3 and 45÷15=3.<br>The multiplier is constant.<br><b>r=3.</b></p>","E"],
["Is 2+4+8 a sequence or a series?","A series","A sum of terms is called a series.","<p>The plus signs show the terms are being added.<br>A sum of sequence terms is a series.<br><b>It is a series.</b></p>","E"],
["Find the 10th term of 4, 7, 10, …","31","Use aₙ=a₁+(n−1)d.","<p>a₁=4, d=3, n=10.<br>a₁₀=4+9×3=31.<br><b>Answer = 31.</b></p>","M"],
["Find the 8th term of 3, 6, 12, …","384","Use aₙ=a₁rⁿ⁻¹.","<p>a₁=3 and r=2.<br>a₈=3×2⁷=3×128.<br><b>Answer = 384.</b></p>","M"],
["Find the sum of the first 8 terms of 2, 5, 8, …","100","Use n(first+last)/2; find the eighth term first.","<p>The 8th term is 2+7×3=23.<br>Sum = 8(2+23)/2 = 100.<br><b>Sum = 100.</b></p>","M"],
["Find the sum 5+10+20+40.","75","Add the four terms, or use the finite geometric rule.","<p>Add the terms: 5+10+20+40.<br>15+60=75.<br><b>Sum = 75.</b></p>","M"],
["Find the infinite sum 3+1.5+0.75+…","6","Use a₁/(1−r) when |r|<1.","<p>a₁=3 and r=1/2, so the series converges.<br>Sum=3/(1−1/2)=3/(1/2).<br><b>Sum = 6.</b></p>","M"],
["For a₁=4 and aₙ₊₁=aₙ+3, find a₅.","16","Apply the recursive rule four times.","<p>Starting at 4 gives 4, 7, 10, 13, 16.<br>The fifth term is <b>16</b>.</p>","M"],
["Find the 20th term of 7, 11, 15, …","83","There are 19 steps of size 4.","<p>a₁=7 and d=4.<br>a₂₀=7+19×4=7+76.<br><b>Answer = 83.</b></p>","H"],
["Find the sum of the first 12 terms of 1, 4, 7, …","210","Find the last term, then use n(first+last)/2.","<p>a₁₂=1+11×3=34.<br>S₁₂=12(1+34)/2=6×35.<br><b>Sum = 210.</b></p>","H"],
["Find the sum of the first 6 terms of 2, 6, 18, …","728","Use the finite geometric sum or add the six terms.","<p>The terms are 2, 6, 18, 54, 162, 486.<br>Add: 2+6+18+54+162+486=728.<br><b>Sum = 728.</b></p>","H"],
["Does 1+2+4+8+… converge?","No; it diverges.","A geometric series converges only when |r|<1.","<p>The common ratio is 2, so |r|=2 is not less than 1.<br>Its terms do not approach zero.<br><b>The series diverges.</b></p>","H"],
["Evaluate Σᵢ₌₁⁵ (2i−1).","25","Substitute i=1 through 5 and add.","<p>The terms are 1, 3, 5, 7, 9.<br>Add them: 1+3+5+7+9=25.<br><b>Answer = 25.</b></p>","H"],
["A geometric sequence has a₁=81 and r=1/3. Find a₅.","1","Use aₙ=a₁rⁿ⁻¹.","<p>a₅=81×(1/3)⁴.<br>(1/3)⁴=1/81, so 81×1/81=1.<br><b>a₅=1.</b></p>","H"],
["Find the sum to infinity of 12+6+3+…","24","Use a₁/(1−r), with r=1/2.","<p>The common ratio is 1/2, whose absolute value is below 1.<br>Sum=12/(1−1/2)=12/(1/2).<br><b>Sum to infinity = 24.</b></p>","H"],
["A sequence has a₁=5 and d=−2. Find a₁₀.","−13","Apply aₙ=a₁+(n−1)d.","<p>a₁₀=5+9(−2).<br>5−18=−13.<br><b>a₁₀=−13.</b></p>","H"]
]),
v:[
["Sequences and Series Lessons","https://www.youtube.com/results?search_query=sequences+and+series+math+lessons"],
["Khan Academy: Sequences and Series","https://www.youtube.com/results?search_query=Khan+Academy+sequences+series"],
["Geometric Series Explained","https://www.youtube.com/results?search_query=infinite+geometric+series+explained"]
],
k:[
["Khan Academy: Sequences and Series","https://www.khanacademy.org/math/algebra2"],
["Paul's Online Notes: Series","https://tutorial.math.lamar.edu/Classes/CalcII/SeriesIntro.aspx"]
]};
L[13].q=window.MATH_EXPLANATIONS.fill(13,L[13].q);

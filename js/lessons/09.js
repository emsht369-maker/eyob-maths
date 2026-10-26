L[8]={
s:[
["Outcomes, sample spaces and probability","<p>An <b>outcome</b> is one possible result of an experiment. A <b>sample space</b> lists all possible outcomes. Probability is between 0 and 1. <b>Theoretical probability</b> uses equally likely outcomes; <b>experimental probability</b> uses observed results. The <b>complement</b> of an event is that it does not happen, so P(not A) = 1 − P(A). Example: for a fair coin, P(heads) = 1/2 and P(not heads) = <b>1/2</b>.</p>"],
["Independent, dependent and conditional events; Bayes' rule","<p>Two events are <b>independent</b> when knowing one happened does not change the other's probability; then P(A and B) = P(A)P(B). Events are <b>dependent</b> when the first changes the second probability. <b>Conditional probability</b> is P(A|B) = P(A and B)/P(B). <b>Bayes' rule</b> reverses a condition: P(A|B) = P(B|A)P(A)/P(B). Example: two heads in two fair coin flips have probability (1/2)(1/2) = <b>1/4</b>.</p>"],
["Probability trees","<p>A <b>probability tree</b> draws each step as branches. Branch probabilities leaving one point add to 1. Multiply probabilities along a path; add probabilities of separate paths that meet the event. Example: two independent fair coin flips have HH on one path with probability 1/2 × 1/2 = <b>1/4</b>.</p>"],
["Permutations and combinations","<p>A <b>permutation</b> counts selections where order matters. A <b>combination</b> counts selections where order does not matter. n! means n × (n−1) × … × 1. The number of ways to choose r objects from n is nCr = n!/[r!(n−r)!]. Example: choosing 2 people from 4 gives 4C2 = <b>6</b> pairs.</p>"],
["Random variables and expected value","<p>A <b>random variable</b> assigns a number to each outcome. Its <b>expected value</b> is the long-run average: multiply each value by its probability and add. Example: a fair six-sided die has expectation (1+2+3+4+5+6)/6 = <b>3.5</b>. The result of one roll need not equal the expectation.</p>"],
["Binomial and normal distributions","<p>A <b>binomial distribution</b> counts successes in a fixed number of independent trials with the same success probability p. For n trials, P(X=k) = nCk pᵏ(1−p)ⁿ⁻ᵏ. Example: for one fair coin flip, the chance of one head is 1C1 × (1/2) × (1/2)⁰ = 1/2. A <b>normal distribution</b> is a symmetric bell-shaped model described by its mean and standard deviation; many measurement errors are modelled this way.</p>"],
["Common mistakes","<ul><li>Check that all outcomes in a probability model are counted and probabilities add to 1.</li><li>Multiply along one sequence of events; add separate paths that satisfy the same event.</li><li>Without replacement, update the total and the relevant counts before the next draw.</li><li>Use conditional probability's given condition in the denominator.</li><li>Do not confuse expected value with a guaranteed single result.</li><li>Use a binomial model only when the trial count is fixed, outcomes are success/failure, trials are independent, and p stays the same.</li></ul>"],
["Where this is used in machine learning","<ul><li>Classification models often estimate the probability that an example belongs to each class.</li><li>Bayes' rule updates a belief when new evidence arrives.</li><li>Expected value helps compare uncertain predictions and decisions.</li><li>Binomial and normal models describe data variation and support statistical evaluation.</li></ul>"]
],
e:[
["A fair coin is flipped twice. Find the probability of at least one head.","<p>The sample space is HH, HT, TH, TT, with four equally likely outcomes.<br>Three outcomes contain at least one head: HH, HT and TH.<br>Probability = 3/4.<br><b>Answer: 3/4.</b></p>"],
["A disease affects 1% of people. A test is positive for 90% of people with the disease and for 5% without it. Given a positive result, find the probability of disease.","<p>For 100,000 people, 1,000 have the disease; 90% of them gives 900 true positives.<br>99,000 do not have it; 5% gives 4,950 false positives.<br>Total positive results = 900 + 4,950 = 5,850.<br>Required probability = 900/5,850 = 2/13 ≈ 0.1538.<br><b>Answer: about 15.4%.</b></p>"],
["A bag has 3 red and 2 blue counters. Two are drawn without replacement. Find the probability both are red.","<p>First red probability = 3/5.<br>After a red is drawn, 2 of the 4 remaining counters are red.<br>Multiply along the tree path: (3/5)(2/4) = 6/20.<br>Simplify: <b>3/10.</b></p>"],
["How many different groups of 3 can be chosen from 5 people?","<p>Order does not matter, so use combinations.<br>5C3 = 5!/[3!2!].<br>Cancel: (5 × 4)/(2 × 1) = 10.<br><b>There are 10 groups.</b></p>"],
["A fair die is rolled once. Find its expected value.","<p>Each face has probability 1/6.<br>Expected value = Σ(value × probability).<br>E = (1+2+3+4+5+6)/6 = 21/6.<br><b>Expected value = 3.5.</b></p>"]
],
q:TOPICS[8][5].concat([
["A fair coin is flipped twice. Find P(at least one head).","3/4","Use the complement: subtract P(no heads) from 1.","<p>P(no heads)=P(TT)=1/4.<br>1−1/4=3/4.<br><b>Probability=3/4.</b></p>","E"],
["A bag has 3 red and 2 blue counters. Find P(red).","3/5","Probability=red outcomes/total outcomes.","<p>There are 3 red out of 5 counters.<br><b>P(red)=3/5.</b></p>","E"],
["Find the complement of an event with probability 0.3.","0.7","P(not A)=1−P(A).","<p>1−0.3=0.7.<br><b>Complement=0.7.</b></p>","E"],
["Find the expected value of a fair six-sided die.","3.5","Average the six equally likely outcomes.","<p>Expected value=(1+2+3+4+5+6)/6.<br>21/6=3.5.<br><b>Expected value=3.5.</b></p>","E"],
["Two fair coins are tossed. Find P(two tails).","1/4","Multiply the independent tail probabilities.","<p>P(TT)=1/2×1/2.<br><b>Probability=1/4.</b></p>","E"],
["A fair die is rolled. Find P(rolling a number greater than 4).","1/3","Count outcomes 5 and 6 out of 6.","<p>There are 2 favourable outcomes out of 6.<br>2/6=1/3.<br><b>Probability=1/3.</b></p>","E"],
["A fair coin is flipped. What is P(heads)?","1/2","There is one head outcome among two equally likely outcomes.","<p>P(heads)=1/2.<br><b>Answer=1/2.</b></p>","E"],
["If P(A∩B)=0.2 and P(B)=0.5, find P(A|B).","0.4","Use P(A|B)=P(A∩B)/P(B).","<p>P(A|B)=0.2/0.5.<br><b>P(A|B)=0.4.</b></p>","M"],
["Two independent events have probabilities 0.6 and 0.5. Find P(both).","0.3","Multiply probabilities for independent events.","<p>P(A∩B)=0.6×0.5.<br><b>Probability=0.3.</b></p>","M"],
["A fair die is rolled twice. Find P(total is 7).","1/6","Count the six ordered pairs totaling 7 out of 36.","<p>Favourable pairs: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1).<br>6/36=1/6.<br><b>Probability=1/6.</b></p>","M"],
["How many ways can 2 people be chosen from 5?","10","Order does not matter; calculate 5C2.","<p>5C2=5×4/(2×1).<br><b>10 ways.</b></p>","M"],
["A binomial experiment has n=4 and p=1/2. Find P(X=0).","1/16","All four trials must be failures.","<p>P(X=0)=(1−p)⁴=(1/2)⁴.<br><b>Probability=1/16.</b></p>","M"],
["A bag has 2 green and 3 yellow counters. Find P(green then yellow) without replacement.","3/10","Multiply 2/5 by 3/4.","<p>First green=2/5; then yellow=3/4.<br>(2/5)(3/4)=6/20.<br><b>Probability=3/10.</b></p>","M"],
["If P(A)=0.7 and P(B)=0.5 and they are independent, find P(A∩B).","0.35","Multiply independent event probabilities.","<p>P(A∩B)=0.7×0.5.<br><b>Probability=0.35.</b></p>","M"],
["A fair die is rolled twice. Find P(total is at least 11).","1/12","Count totals 11 and 12 among 36 outcomes.","<p>Favourable outcomes: (5,6),(6,5),(6,6), three outcomes.<br>3/36=1/12.<br><b>Probability=1/12.</b></p>","H"],
["A test has sensitivity 90%, prevalence 2%, and false-positive rate 5%. Find P(disease|positive) to 3 d.p.","0.269","Use Bayes: true positives divided by all positive results.","<p>True-positive probability=0.9×0.02=0.018.<br>All positives=0.018+0.05×0.98=0.067.<br>0.018/0.067≈<b>0.269</b>.</p>","H"],
["A bag has 5 red and 7 blue counters. Two are drawn without replacement. Find P(both red).","5/33","Multiply 5/12 by 4/11.","<p>P=5/12×4/11=20/132.<br>Simplify by 4.<br><b>5/33.</b></p>","H"],
["A game pays £12 with probability 0.2 and loses £3 otherwise. Find expected profit.","0","Expected value is sum of outcome×probability.","<p>E=12×0.2+(−3)×0.8.<br>2.4−2.4=0.<br><b>Expected profit=£0.</b></p>","H"],
["If P(A)=0.7, P(B)=0.5 and P(A∩B)=0.4, find P(A∪B).","0.8","Use P(A∪B)=P(A)+P(B)−P(A∩B).","<p>0.7+0.5−0.4=0.8.<br><b>Probability=0.8.</b></p>","H"],
["For X~Binomial(5,0.2), find P(X=0).","0.32768","Use P(X=0)=(1−p)⁵.","<p>P(X=0)=0.8⁵.<br>0.8×0.8×0.8×0.8×0.8=0.32768.<br><b>Answer=0.32768.</b></p>","H"],
["If P(A)=0.4, P(B)=0.6 and events are independent, find P(A∪B).","0.76","Use P(A)+P(B)−P(A)P(B).","<p>Intersection=0.4×0.6=0.24.<br>Union=0.4+0.6−0.24.<br><b>Probability=0.76.</b></p>","H"],
["A normal distribution has mean 50 and standard deviation 10. Find the z-score for 65.","1.5","Use z=(value−mean)/standard deviation.","<p>z=(65−50)/10=15/10.<br><b>z=1.5.</b></p>","H"]
]),
v:[
["StatQuest: Probability","https://www.youtube.com/@statquest"],
["3Blue1Brown: Probability","https://www.youtube.com/@3blue1brown"],
["Professor Leonard: Probability","https://www.youtube.com/@ProfessorLeonard"]
],
k:[
["Khan Academy: Statistics and Probability","https://www.khanacademy.org/math/statistics-probability"],
["Seeing Theory","https://seeing-theory.brown.edu"]
]};
L[8].q=window.MATH_EXPLANATIONS.fill(8,L[8].q);

L[12]={
s:[
["Statements and truth values","<p>A <b>statement</b> is a sentence that is either true or false. A question or command is not a statement. A variable statement such as “x &gt; 2” becomes true or false after x is chosen. Example: “4 is even” is true.</p>"],
["AND, OR and NOT","<p><b>AND</b> (p ∧ q) is true only when both statements are true. <b>OR</b> (p ∨ q) is true when at least one is true. <b>NOT</b> (¬p) reverses a truth value. In maths, OR usually includes the case where both are true. Example: “2 is even AND 3 is odd” is true.</p>"],
["Implication and if-and-only-if","<p>“If p, then q” is written p → q. It is false only when p is true and q is false. Its <b>converse</b> is q → p, and it may not have the same truth. “p if and only if q” means both implications are true. Example: “If n is divisible by 4, then n is even” is true; the converse is also true for evenness only if n is divisible by 4? It is not, since 2 is even but not divisible by 4.</p>"],
["Sets, subsets and Venn diagrams","<p>A <b>set</b> is a collection of objects. A ∈ A means an element belongs to set A. A ⊆ B means every element of A is also in B. The intersection A ∩ B contains shared elements; the union A ∪ B contains elements in either set. Example: {1,2} ∩ {2,3} = <b>{2}</b>.</p>"],
["Direct proof and counterexamples","<p>A <b>direct proof</b> starts with known facts and uses valid steps to reach the claim. To show an even number n has even square, write n=2k; then n²=4k²=2(2k²). A single <b>counterexample</b> disproves a claim that says “for every”. Example: “all primes are odd” is false because 2 is prime and even.</p>"],
["Contradiction and induction","<p>A <b>proof by contradiction</b> assumes the claim is false and derives an impossibility. <b>Mathematical induction</b> proves a base case, then proves that if a claim holds for n=k, it holds for n=k+1. Example: 1+2+…+n = n(n+1)/2; check n=1, then add k+1 to the formula for k to obtain the formula for k+1.</p>"],
["Common mistakes","<ul><li>Do not confuse an implication with its converse.</li><li>In inclusive OR, both statements may be true.</li><li>A counterexample must meet the claim's conditions and fail its conclusion.</li><li>For a subset, every element of the smaller set must be in the larger set.</li><li>Induction needs both a base case and a step from k to k+1.</li><li>For contradiction, clearly state the opposite assumption before deriving the conflict.</li></ul>"],
["Where this is used in machine learning","<ul><li>Logic creates conditions in decision rules and data filters.</li><li>Set operations help define groups, labels and intersections in datasets.</li><li>Proofs support correctness checks for algorithms and mathematical models.</li><li>Implication and probability statements help make model assumptions precise.</li></ul>"]
],
e:[
["If p is true and q is false, find the truth value of p → q.","<p>An implication is false only when its first part is true and its second part is false.<br>Here p is true and q is false.<br><b>p → q is false.</b></p>"],
["For A={1,2,3} and B={3,4}, find A∩B and A∪B.","<p>Intersection lists elements in both sets: only 3.<br>Union lists each element that appears in either set once.<br><b>A∩B={3}; A∪B={1,2,3,4}.</b></p>"],
["Give a counterexample to “every even number is divisible by 4.”","<p>A counterexample must be even but not divisible by 4.<br>2 is even, but 2 ÷ 4 is not an integer.<br><b>Counterexample: 2.</b></p>"],
["Prove directly that the sum of two even integers is even.","<p>Let the even integers be 2a and 2b, where a and b are integers.<br>Their sum is 2a+2b = 2(a+b).<br>a+b is an integer, so the sum is a multiple of 2.<br><b>The sum is even.</b></p>"],
["Use induction to show 1+2+…+n = n(n+1)/2 for n=1 and then the induction step.","<p>Base case n=1: left side 1; right side 1×2/2=1.<br>Assume the sum to k is k(k+1)/2.<br>Add k+1: k(k+1)/2 + (k+1) = (k+1)(k+2)/2.<br><b>The formula holds for k+1.</b></p>"]
],
q:TOPICS[12][5].concat([
["Is “7 is prime” a statement, and is it true?","Yes; true.","A statement has a truth value; check the positive divisors.","<p>This sentence makes a claim with a truth value.<br>7 has only positive divisors 1 and 7.<br><b>It is a true statement.</b></p>","E"],
["If p is true, what is NOT p?","False","NOT reverses the truth value.","<p>Negation changes true to false.<br>Since p is true, ¬p is false.<br><b>False.</b></p>","E"],
["If p and q are both true, what is p AND q?","True","AND requires both parts to be true.","<p>Conjunction is true when both statements are true.<br>Both p and q are true.<br><b>p AND q is true.</b></p>","E"],
["For A={1,2} and B={2,3}, find A∩B.","{2}","Intersection keeps only shared elements.","<p>Compare the elements in both sets.<br>Only 2 appears in both A and B.<br><b>A∩B={2}.</b></p>","E"],
["For A={1,2} and B={2,3}, find A∪B.","{1,2,3}","Union includes each element from either set once.","<p>Collect elements from A and B.<br>Remove the repeated 2.<br><b>A∪B={1,2,3}.</b></p>","E"],
["Is {1,2} a subset of {1,2,3}?","Yes","Every element of the first set must appear in the second.","<p>Check 1 and 2 in the larger set.<br>Both are present in {1,2,3}.<br><b>Yes, it is a subset.</b></p>","E"],
["If p is false and q is true, what is p OR q?","True","OR is true if at least one part is true.","<p>Inclusive OR needs one or both parts to be true.<br>q is true, so the condition is met.<br><b>p OR q is true.</b></p>","E"],
["Is the converse of “if a number is divisible by 4, it is even” true?","No","Test an even number that may not be divisible by 4.","<p>The converse says if even, then divisible by 4.<br>2 is even but not divisible by 4.<br><b>The converse is false.</b></p>","E"],
["For p=true and q=false, find p→q.","False","An implication fails only for true followed by false.","<p>Check the implication's truth rule.<br>Its antecedent is true and conclusion false.<br><b>p→q is false.</b></p>","M"],
["Negate “all birds can fly.”","Some bird cannot fly.","Negating “all” changes it to “there exists at least one not”.","<p>“All” claims every bird has the property.<br>Its negation says at least one bird lacks it.<br><b>Some bird cannot fly.</b></p>","M"],
["Give a counterexample to “all prime numbers are odd.”","2","A counterexample must be prime and not odd.","<p>2 has exactly two positive divisors, so it is prime.<br>2 is even, not odd.<br><b>Counterexample: 2.</b></p>","M"],
["If A={a,b} and B={b,c}, find A∩B and A∪B.","{b}; {a,b,c}","Intersection is shared; union combines without repeats.","<p>The shared element is b, so intersection is {b}.<br>Collect all distinct elements for union.<br><b>A∩B={b}; A∪B={a,b,c}.</b></p>","M"],
["Is 9∈{3,6,9,12}?","Yes","Membership asks whether the value is an element of the set.","<p>Read the listed elements in the set.<br>9 appears in the list.<br><b>Yes, 9 belongs to the set.</b></p>","M"],
["If p→q is true and p is true, what must q be?","True","A true implication cannot have a true first part and false second part.","<p>When p is true, p→q is false if q is false.<br>The implication is given true, so q cannot be false.<br><b>q must be true.</b></p>","H"],
["Prove that the sum of two odd integers is even.","Let them be 2a+1 and 2b+1; sum is 2(a+b+1).","Write odd numbers as 2k+1 and factor out 2.","<p>Let the odd integers be 2a+1 and 2b+1.<br>Sum = 2a+1+2b+1 = 2(a+b+1).<br>The bracket is an integer, so the sum is <b>even</b>.</p>","H"],
["Disprove “for every integer n, n² is odd” with a counterexample.","n=2","Choose an integer whose square is even.","<p>For n=2, n²=4.<br>4 is even, not odd.<br><b>n=2 disproves the claim.</b></p>","H"],
["If A={1,2,3} and B={2,3,4}, find A∖B.","{1}","A∖B contains elements in A but not B.","<p>Check A's elements: 1 is not in B; 2 and 3 are in B.<br>Keep only the elements exclusive to A.<br><b>A∖B={1}.</b></p>","H"],
["Is “if n is divisible by 6, then n is divisible by 3” true for integers?","Yes","Write n as 6k and show it is a multiple of 3.","<p>If 6 divides n, write n=6k for an integer k.<br>Then n=3(2k), also a multiple of 3.<br><b>The implication is true.</b></p>","H"],
["State the base case for induction proving 1+2+…+n=n(n+1)/2.","n=1","Test the first positive integer in the claim.","<p>Induction starts by checking the first allowed value.<br>Here that value is n=1: both sides equal 1.<br><b>Base case: n=1.</b></p>","H"],
["For p=false and q=false, find p OR q and p AND q.","False; false","Inclusive OR needs at least one true; AND needs both true.","<p>Neither statement is true, so OR is false.<br>AND also fails because both are not true.<br><b>Both results are false.</b></p>","H"],
["Negate “there exists an integer n with n²=9.”","For every integer n, n²≠9.","Negation changes “there exists” to “for every” and negates the property.","<p>Negate the existence claim by saying no integer has the property.<br>“No integer” is written “for every integer, not”.<br><b>For every integer n, n²≠9.</b></p>","H"],
["If p↔q is true and p is false, what is q?","False","A biconditional is true when both sides have the same truth value.","<p>p↔q means p and q have matching truth values.<br>Since p is false, q must also be false.<br><b>q is false.</b></p>","H"],
["Prove directly that if n is divisible by 8, then n is even.","Write n=8k=2(4k), so n is even.","Use the definition of divisibility and of an even integer.","<p>If 8 divides n, then n=8k for an integer k.<br>Rewrite n as 2(4k); 4k is an integer.<br><b>Therefore n is even.</b></p>","H"]
]),
v:[
["Book of Proof: Logic and Proof","https://www.youtube.com/results?search_query=Book+of+Proof+logic+proof+math"],
["Khan Academy: Logic and Sets","https://www.youtube.com/results?search_query=Khan+Academy+logic+sets+proof"],
["Mathematical Induction Lessons","https://www.youtube.com/results?search_query=mathematical+induction+proof+explained"]
],
k:[
["Book of Proof (free textbook)","https://www.people.vcu.edu/~rhammack/BookOfProof/"],
["Khan Academy: Set Operations","https://www.youtube.com/results?search_query=Khan+Academy+set+operations"]
]};
L[12].q=window.MATH_EXPLANATIONS.fill(12,L[12].q);

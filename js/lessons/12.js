L[11]={
s:[
["Integers, rational, irrational and real numbers","<p><b>Integers</b> are whole numbers, including negatives and zero. A <b>rational</b> number can be written as a fraction of integers, such as 3/4 or 0.5. An <b>irrational</b> number cannot be written as such a fraction, such as √2. The <b>real numbers</b> include rational and irrational numbers. Example: −3 is an integer and rational; π is real and irrational.</p>"],
["Prime numbers and factorisation","<p>A <b>prime</b> number has exactly two positive factors: 1 and itself. A <b>composite</b> number has more. Every integer greater than 1 has a unique prime factorisation. Example: 60 = 2²×3×5. The number 1 is neither prime nor composite.</p>"],
["Divisibility and modular arithmetic","<p>“a divides b” means b is an exact multiple of a. The remainder after division by m is written a mod m. In modular arithmetic, numbers wrap around after m. Example: 17 mod 5 = <b>2</b> because 17 = 3×5 + 2; on a 12-hour clock, 15 o'clock is 3.</p>"],
["GCD, LCM and Euclid's algorithm","<p>The <b>GCD</b> (also called HCF) is the greatest positive number dividing both inputs. The <b>LCM</b> is the least positive common multiple. Euclid's algorithm repeatedly replaces (a,b) by (b, remainder of a divided by b). Example: gcd(18,12)=gcd(12,6)=<b>6</b>.</p>"],
["Diophantine equations","<p>A <b>Diophantine equation</b> asks for integer solutions. For ax + by = c, an integer solution exists exactly when gcd(a,b) divides c. Example: 3x + 5y = 1 has integer solution x=2, y=−1 because 6−5=1. A real-number solution alone does not guarantee an integer solution.</p>"],
["Congruences and simple number patterns","<p>Numbers a and b are congruent modulo m if they have the same remainder; write a ≡ b (mod m). You may add, subtract or multiply both sides while keeping the modulus. Example: 14 ≡ 2 (mod 12), so 14² ≡ 2² = <b>4 (mod 12)</b>. A modular inverse of a exists only when gcd(a,m)=1.</p>"],
["Common mistakes","<ul><li>1 is not prime because it has only one positive factor.</li><li>For a remainder, use 0 ≤ remainder &lt; divisor.</li><li>Keep the modulus when reducing a congruence.</li><li>Do not divide a congruence by a number unless it has a valid modular inverse.</li><li>Check the GCD divisibility condition before solving an integer equation.</li><li>Rational numbers terminate or repeat as decimals; an irrational decimal does neither.</li></ul>"],
["Where this is used in machine learning","<ul><li>Modular arithmetic is used in hashes, checksums and parts of secure data handling.</li><li>Integer factorisation and prime numbers are central ideas in some cryptography systems.</li><li>Divisibility and remainders support indexing and grouping data in software.</li><li>Exact rational arithmetic helps verify algorithms and small numeric examples.</li></ul>"]
],
e:[
["Find 47 mod 6.","<p>Divide 47 by 6: 6×7 = 42.<br>Subtract: 47 − 42 = 5.<br>The remainder is less than 6.<br><b>47 mod 6 = 5.</b></p>"],
["Find gcd(84,30) using Euclid's algorithm.","<p>84 = 2×30 + 24, so gcd(84,30)=gcd(30,24).<br>30 = 1×24 + 6, so gcd(30,24)=gcd(24,6).<br>24 is divisible by 6.<br><b>gcd = 6.</b></p>"],
["Find the prime factorisation of 90.","<p>90 = 9×10 = 3²×2×5.<br>All factors 2, 3 and 5 are prime.<br><b>90 = 2×3²×5.</b></p>"],
["Solve 3x + 5y = 1 with x=2; find y.","<p>Substitute x=2: 3×2 + 5y = 1.<br>Subtract 6: 5y = −5.<br>Divide by 5.<br><b>y = −1.</b></p>"],
["Are 35 and 64 congruent modulo 7?","<p>Reduce each number modulo 7.<br>35 mod 7 = 0, while 64 = 9×7 + 1 gives 1.<br>The remainders differ.<br><b>No, they are not congruent modulo 7.</b></p>"]
],
q:TOPICS[11][5].concat([
["Is 11 prime?","Yes","Check that no integer from 2 up to √11 divides it.","<p>A prime has exactly two positive factors.<br>11 is divisible only by 1 and 11.<br><b>11 is prime.</b></p>","E"],
["Find 23 mod 5.","3","Subtract the largest multiple of 5 not above 23.","<p>5×4 = 20, the largest multiple not above 23.<br>23 − 20 = 3.<br><b>Remainder = 3.</b></p>","E"],
["Find gcd(18,12).","6","Use the largest number dividing both.","<p>Factors common to 18 and 12 include 1, 2, 3, 6.<br>The greatest is 6.<br><b>gcd = 6.</b></p>","E"],
["Find the prime factorisation of 28.","2²×7","Split into prime factors.","<p>28 = 4×7.<br>4 = 2×2 and 7 is prime.<br><b>28 = 2²×7.</b></p>","E"],
["Is 0 rational?","Yes","A rational number is an integer fraction with non-zero denominator.","<p>Write 0 as a fraction: 0 = 0/1.<br>The numerator and denominator are integers and denominator is not zero.<br><b>0 is rational.</b></p>","E"],
["Find 31 mod 4.","3","Use 31 = 4q + r.","<p>4×7 = 28.<br>31 − 28 = 3, which is less than 4.<br><b>31 mod 4 = 3.</b></p>","E"],
["Find the LCM of 4 and 6.","12","List multiples until the first shared one.","<p>Multiples of 4: 4, 8, 12.<br>Multiples of 6: 6, 12.<br><b>LCM = 12.</b></p>","E"],
["Find the remainder of 50 divided by 9.","5","Use the largest multiple of 9 below 50.","<p>9×5 = 45.<br>50 − 45 = 5, and 5 is below 9.<br><b>Remainder = 5.</b></p>","M"],
["Find gcd(48,18) using remainders.","6","Apply Euclid's algorithm until the remainder is zero.","<p>48 = 2×18 + 12; 18 = 1×12 + 6.<br>12 = 2×6 + 0.<br><b>gcd = 6.</b></p>","M"],
["Is √9 rational?","Yes, it equals 3.","Evaluate the root and express the result as a fraction.","<p>√9 = 3.<br>3 = 3/1, a ratio of integers.<br><b>It is rational.</b></p>","M"],
["Find the prime factorisation of 72.","2³×3²","Divide repeatedly by prime factors.","<p>72 = 8×9.<br>8 = 2³ and 9 = 3².<br><b>72 = 2³×3².</b></p>","M"],
["Find 2⁵ mod 7.","4","Calculate the power, then divide by 7.","<p>2⁵ = 32.<br>32 = 4×7 + 4.<br><b>2⁵ mod 7 = 4.</b></p>","M"],
["Does 6x + 9y = 4 have integer solutions?","No","The gcd of the coefficients must divide the constant.","<p>gcd(6,9)=3.<br>3 does not divide 4.<br><b>No integer solutions exist.</b></p>","M"],
["Find the last digit of 3⁴.","1","Use the repeating last-digit cycle 3, 9, 7, 1.","<p>Compute the powers: 3¹ ends 3, 3² ends 9, 3³ ends 7.<br>3⁴ = 81.<br><b>Last digit = 1.</b></p>","H"],
["Find 7¹⁰⁰ mod 6.","1","Reduce 7 modulo 6 before taking the power.","<p>7 ≡ 1 (mod 6).<br>Therefore 7¹⁰⁰ ≡ 1¹⁰⁰ (mod 6).<br><b>Remainder = 1.</b></p>","H"],
["Find the least positive number divisible by 8 and 12.","24","Use the least common multiple.","<p>8 = 2³ and 12 = 2²×3.<br>LCM uses the greatest required powers: 2³×3.<br><b>LCM = 24.</b></p>","H"],
["Solve 5x ≡ 1 (mod 7) for 0 ≤ x &lt; 7.","3","Test residues or find the inverse of 5 modulo 7.","<p>Try x=3: 5×3 = 15.<br>15 = 2×7 + 1, so the remainder is 1.<br><b>x = 3.</b></p>","H"],
["How many positive divisors does 18 have?","6","For prime powers pᵃqᵇ, divisor count is (a+1)(b+1).","<p>18 = 2¹×3².<br>Number of divisors = (1+1)(2+1) = 2×3.<br><b>There are 6 positive divisors.</b></p>","H"],
["Find gcd(105,30).","15","Apply Euclid's algorithm.","<p>105 = 3×30 + 15.<br>30 = 2×15 + 0.<br><b>gcd = 15.</b></p>","H"],
["Find the remainder when 4⁵ is divided by 5.","4","Since 4 ≡ −1 (mod 5), raise −1 to the fifth power.","<p>4 ≡ −1 (mod 5).<br>Thus 4⁵ ≡ (−1)⁵ = −1 ≡ 4 (mod 5).<br><b>Remainder = 4.</b></p>","H"],
["Does 8x + 12y = 6 have integer solutions?","No","Check whether gcd(8,12) divides 6.","<p>gcd(8,12)=4.<br>4 does not divide 6.<br><b>No integer solutions.</b></p>","H"],
["Find the least positive number that leaves remainder 2 when divided by 5 and remainder 2 when divided by 3.","2","A number congruent to 2 modulo both has remainder 2 modulo their LCM.","<p>2 leaves remainder 2 on division by 5 and by 3.<br>The smallest positive number with this property is 2.<br><b>Answer = 2.</b></p>","H"],
["Is 0.125 rational? Write it as a fraction.","1/8","Write it over 1,000, then simplify.","<p>0.125 = 125/1000.<br>Divide numerator and denominator by 125.<br><b>0.125 = 1/8, so it is rational.</b></p>","H"]
]),
v:[
["Khan Academy: Number Theory","https://www.youtube.com/results?search_query=Khan+Academy+number+theory"],
["Numberphile: Prime Numbers","https://www.youtube.com/results?search_query=Numberphile+prime+numbers"],
["Modular Arithmetic Lessons","https://www.youtube.com/results?search_query=modular+arithmetic+explained"]
],
k:[
["Khan Academy: Cryptography","https://www.khanacademy.org/computing/computer-science/cryptography"],
["Book of Proof","https://www.people.vcu.edu/~rhammack/BookOfProof/"]
]};
L[11].q=window.MATH_EXPLANATIONS.fill(11,L[11].q);

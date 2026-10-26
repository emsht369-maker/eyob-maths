L[19]={
s:[
["Polynomials and division","<p>A <b>polynomial</b> is a sum of terms with non-negative whole-number powers, such as x³−2x+1. Polynomial long division works like number division, grouping terms by power. Example: (x²−1)÷(x−1)=<b>x+1</b>, because (x−1)(x+1)=x²−1.</p>"],
["Factor and remainder theorems","<p>The <b>remainder theorem</b> says dividing f(x) by x−a leaves remainder f(a). The <b>factor theorem</b> says x−a is a factor exactly when f(a)=0. Example: f(x)=x²+1 divided by x−2 leaves 2²+1=<b>5</b>.</p>"],
["Rational functions and asymptotes","<p>A <b>rational function</b> is a ratio of polynomials. Factor and cancel common factors, while remembering a cancelled denominator value is still excluded from the original domain. Vertical asymptotes occur at uncancelled denominator zeroes; horizontal behaviour compares degrees. Example: (x²−1)/(x−1) simplifies to x+1 for x≠1, with a hole at x=1.</p>"],
["Partial fractions","<p><b>Partial fractions</b> split a rational function into simpler fractions. For distinct linear factors, write A/(x−a)+B/(x−b) and solve for A and B. Example: 1/((x−1)(x+1)) = 1/2·1/(x−1) − 1/2·1/(x+1).</p>"],
["Groups, rings and fields","<p>A <b>group</b> has an operation with closure, associativity, an identity and inverses. A <b>ring</b> has addition and multiplication with distributivity; a <b>field</b> is a ring where every non-zero element has a multiplicative inverse. The real numbers form a field; integers do not, because 2 has no integer inverse.</p>"],
["Structure and solving equations","<p>Abstract algebra studies rules shared by number systems and symmetries. A <b>homomorphism</b> is a map that preserves the operation. For equations, use factorisation, division or a theorem that fits the expression. Example: if f(2)=0, the factor theorem says x−2 divides f(x).</p>"],
["Common mistakes","<ul><li>Order polynomial terms by descending powers during long division.</li><li>For the remainder theorem, substitute the root a into f(a).</li><li>Cancelling a factor does not restore a value excluded from the original denominator.</li><li>Partial fractions require a proper rational function or prior polynomial division.</li><li>Integers are not a field because non-zero integers need not have integer reciprocals.</li><li>Check a proposed factor by multiplying it back.</li></ul>"],
["Where this is used in machine learning","<ul><li>Polynomial features let a model represent curved relationships.</li><li>Rational functions appear in normalised scores and analytic models.</li><li>Abstract algebra provides tools for symmetry and structured data.</li><li>Factorisation and roots support exact algorithms and stability analysis.</li></ul>"]
],
e:[
["Divide x²−1 by x−1.","<p>Factor the difference of squares: x²−1=(x−1)(x+1).<br>Cancel the divisor x−1.<br><b>Quotient = x+1.</b></p>"],
["Find the remainder when x²+3x+1 is divided by x−2.","<p>Use the remainder theorem: evaluate f(2).<br>f(2)=2²+3×2+1=4+6+1.<br><b>Remainder = 11.</b></p>"],
["Is x−3 a factor of x²−5x+6?","<p>Use the factor theorem and evaluate f(3).<br>f(3)=9−15+6=0.<br><b>Yes, x−3 is a factor.</b></p>"],
["Decompose 1/((x−1)(x+1)) into partial fractions.","<p>Write A/(x−1)+B/(x+1).<br>Matching coefficients gives A=1/2 and B=−1/2.<br><b>1/[...]=1/(2(x−1))−1/(2(x+1)).</b></p>"],
["Does every non-zero integer have a multiplicative inverse among integers?","<p>A field requires every non-zero element to have an inverse.<br>2 would need inverse 1/2, which is not an integer.<br><b>No.</b></p>"]
],
q:TOPICS[19][5].concat([
["Find the remainder when x²+1 is divided by x−2.","5","Substitute x=2 using the remainder theorem.","<p>Remainder = f(2).<br>2²+1=4+1.<br><b>Remainder = 5.</b></p>","E"],
["Factor x²−1.","(x−1)(x+1)","Use the difference of squares.","<p>a²−b²=(a−b)(a+b).<br>x²−1²=(x−1)(x+1).<br><b>Factorisation complete.</b></p>","E"],
["Is x−1 a factor of x²−1?","Yes","Evaluate f(1); a factor gives remainder zero.","<p>f(1)=1²−1=0.<br>By the factor theorem, x−1 is a factor.<br><b>Yes.</b></p>","E"],
["Simplify (x²−4)/(x−2), for x≠2.","x+2","Factor the numerator, then cancel the common factor.","<p>x²−4=(x−2)(x+2).<br>For x≠2, cancel x−2.<br><b>x+2.</b></p>","E"],
["What is the degree of 3x⁴−2x+1?","4","The degree is the largest exponent with a non-zero coefficient.","<p>The powers are 4, 1 and 0.<br>The largest is 4.<br><b>Degree = 4.</b></p>","E"],
["Find f(2) for f(x)=x²+3.","7","Substitute 2 for x.","<p>f(2)=2²+3.<br>4+3=7.<br><b>f(2)=7.</b></p>","E"],
["Find the remainder when 2x³−1 is divided by x−1.","1","Use the remainder theorem: evaluate at x=1.","<p>f(1)=2×1³−1.<br>2−1=1.<br><b>Remainder = 1.</b></p>","E"],
["Does 2 have an integer multiplicative inverse?","No","Its reciprocal is not an integer.","<p>The number that multiplies by 2 to make 1 is 1/2.<br>1/2 is not an integer.<br><b>No integer inverse.</b></p>","E"],
["Divide x²+5x+6 by x+2.","x+3","Factor the numerator and cancel x+2.","<p>x²+5x+6=(x+2)(x+3).<br>Divide by x+2.<br><b>Quotient = x+3.</b></p>","M"],
["Find the remainder when x³−2x+4 is divided by x+1.","5","For divisor x+1, use f(−1).","<p>f(−1)=−1+2+4.<br>−1+2+4=5.<br><b>Remainder = 5.</b></p>","M"],
["Is x+2 a factor of x²+3x+2?","Yes","Substitute x=−2.","<p>f(−2)=4−6+2=0.<br>The factor theorem says x+2 is a factor.<br><b>Yes.</b></p>","M"],
["Simplify (x²−9)/(x−3), stating the restriction.","x+3, x≠3","Factor and cancel, but retain the original denominator restriction.","<p>x²−9=(x−3)(x+3).<br>Cancel x−3 only when x≠3.<br><b>x+3, with x≠3.</b></p>","M"],
["Decompose 1/((x−2)(x+2)) into partial fractions.","1/(4(x−2))−1/(4(x+2))","Set A/(x−2)+B/(x+2) and solve coefficients.","<p>1=A(x+2)+B(x−2).<br>At x=2, A=1/4; at x=−2, B=−1/4.<br><b>1/[...]=1/(4(x−2))−1/(4(x+2)).</b></p>","M"],
["What is the degree of (x²+1)(x³−x)?","5","For non-zero polynomials, degrees add when multiplying.","<p>The factor degrees are 2 and 3.<br>Product degree = 2+3.<br><b>Degree = 5.</b></p>","M"],
["Find the remainder of x⁴−1 divided by x−1.","0","Evaluate at x=1.","<p>f(1)=1⁴−1=0.<br><b>Remainder = 0.</b></p>","H"],
["Factor x³−x.","x(x−1)(x+1)","Take out x, then factor the difference of squares.","<p>x³−x=x(x²−1).<br>x²−1=(x−1)(x+1).<br><b>x(x−1)(x+1).</b></p>","H"],
["Solve x²−5x+6=0.","x=2 or x=3","Factor into two terms whose product is 6 and sum is −5.","<p>x²−5x+6=(x−2)(x−3).<br>Set each factor to zero.<br><b>x=2 or x=3.</b></p>","H"],
["Find the remainder when 3x²−4x+2 is divided by x+2.","22","Evaluate the polynomial at x=−2.","<p>f(−2)=3×4−4(−2)+2.<br>12+8+2=22.<br><b>Remainder = 22.</b></p>","H"],
["Decompose 3/((x−1)(x+2)) into partial fractions.","1/(x−1)−1/(x+2)","Set A/(x−1)+B/(x+2) and compare coefficients.","<p>3=A(x+2)+B(x−1).<br>x=1 gives A=1; x=−2 gives B=−1.<br><b>1/(x−1)−1/(x+2).</b></p>","H"],
["What is the vertical asymptote of (x+1)/(x−4)?","x=4","Set the uncancelled denominator to zero.","<p>The denominator x−4 is zero at x=4.<br>The factor does not cancel with the numerator.<br><b>Vertical asymptote: x=4.</b></p>","H"],
["Is the set of rational numbers a field under usual addition and multiplication?","Yes","Every non-zero rational has a rational reciprocal.","<p>Rationals are closed under addition and multiplication and have additive inverses.<br>Every non-zero p/q has reciprocal q/p, also rational.<br><b>Yes, they form a field.</b></p>","H"],
["If f(−3)=0, which linear factor is guaranteed?","x+3","Use the factor theorem: f(a)=0 means x−a divides f.","<p>Here a=−3.<br>The factor is x−(−3)=x+3.<br><b>x+3 divides f(x).</b></p>","H"],
["Find the horizontal asymptote of (2x²+1)/(x²−3).","y=2","For equal degrees, divide leading coefficients.","<p>Numerator and denominator both have degree 2.<br>As x grows, lower terms matter less; leading ratio is 2/1.<br><b>Horizontal asymptote y=2.</b></p>","H"]
]),
v:[
["Advanced Algebra Lessons","https://www.youtube.com/results?search_query=advanced+algebra+polynomial+theorems+partial+fractions"],
["Polynomial Long Division","https://www.youtube.com/results?search_query=polynomial+long+division+explained"],
["Groups Rings and Fields","https://www.youtube.com/results?search_query=groups+rings+fields+abstract+algebra+introduction"]
],
k:[
["Paul's Online Notes: Algebra","https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx"],
["Book of Proof","https://www.people.vcu.edu/~rhammack/BookOfProof/"]
]};
L[19].q=window.MATH_EXPLANATIONS.fill(19,L[19].q);

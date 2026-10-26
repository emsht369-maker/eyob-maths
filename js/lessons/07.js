L[6]={
s:[
["Powers and index laws","<p>A <b>power</b> says how many times to multiply a number by itself: 2³ = 2 × 2 × 2 = 8. For the same base, multiply powers by adding indices: xᵃ × xᵇ = xᵃ⁺ᵇ. Divide by subtracting: xᵃ ÷ xᵇ = xᵃ⁻ᵇ. A power raised to a power multiplies indices: (xᵃ)ᵇ = xᵃᵇ. Example: 2³ × 2² = 2⁵ = <b>32</b>.</p>"],
["Zero, negative and fractional powers","<p>For a non-zero number x, x⁰ = 1 and x⁻ⁿ = 1/xⁿ. A fractional power is a root: x¹⁄² = √x and x¹⁄³ = ∛x. Example: 2⁻³ = 1/2³ = <b>1/8</b>; 16³⁄⁴ = (⁴√16)³ = 2³ = <b>8</b>. For real numbers, an even root of a negative number is not real.</p>"],
["Roots and surds","<p>A <b>square root</b> undoes squaring: √25 = 5. A <b>cube root</b> undoes cubing: ∛27 = 3. A <b>surd</b> is a root left in exact form because it is not a whole number or a fraction. Simplify by taking out square factors: √50 = √(25 × 2) = <b>5√2</b>. Only like surds combine: 2√3 + √3 = 3√3.</p>"],
["Exponential functions","<p>An <b>exponential function</b> has the variable in the power, such as y = 2ˣ. If the base is bigger than 1, values grow as x increases; for a base between 0 and 1, they shrink. Example: 2⁰ = 1, 2¹ = 2, 2² = 4. Exponential change grows by the same factor each equal step.</p>"],
["Logarithms and natural logarithms","<p>A <b>logarithm</b> asks which power gives a number: log₂8 = 3 because 2³ = 8. The base-10 log is written log₁₀, often shortened to log; the natural log ln has base e. Logs undo exponentials: logₐ(aˣ) = x for a positive base a ≠ 1. Example: ln(e²) = <b>2</b>.</p>"],
["Laws of logarithms","<p>For positive M and N, logₐ(MN) = logₐM + logₐN; logₐ(M/N) = logₐM − logₐN; and logₐ(Mᵖ) = p logₐM. These rules turn multiplication into addition and powers into multiplication. Example: log₁₀(100 × 10) = 2 + 1 = <b>3</b>.</p>"],
["Common mistakes","<ul><li>Only add or subtract indices when the bases are the same.</li><li>A negative index means reciprocal; it does not make the value negative.</li><li>√(a + b) is not generally √a + √b.</li><li>Check that a logarithm's input is positive and its base is positive and not 1.</li><li>Do not split log(M + N) into log M + log N; the product rule is for multiplication.</li><li>Keep exact surds until the final step unless a decimal is requested.</li></ul>"],
["Where this is used in machine learning","<ul><li>Logarithms turn products of small probabilities into sums that computers can handle more safely.</li><li>Log loss measures how well a model's probability predictions match the correct answers.</li><li>Exponential functions describe growth, decay and the softmax calculation used to turn scores into probabilities.</li><li>Powers and roots appear in distances, squared errors and measures of variation.</li></ul>"]
],
e:[
["Simplify (2³ × 2⁻⁵) ÷ 2⁻¹.","<p>For multiplication of equal bases, add the indices: 3 + (−5) = −2.<br>For division, subtract the indices: −2 − (−1) = −1.<br>So the expression is 2⁻¹ = 1/2.<br><b>Answer: 1/2.</b></p>"],
["Evaluate 16³⁄⁴.","<p>Rewrite the fractional power as a fourth root, then a cube: 16³⁄⁴ = (⁴√16)³.<br>⁴√16 = 2 because 2⁴ = 16.<br>Then 2³ = 8.<br><b>Answer: 8.</b></p>"],
["Simplify √50.","<p>Find the largest square factor: 50 = 25 × 2.<br>Split the root: √50 = √25 × √2.<br>√25 = 5.<br><b>Answer: 5√2.</b></p>"],
["Solve 3ˣ = 81.","<p>Write 81 as a power of 3: 81 = 3⁴.<br>The bases match, so the indices match: x = 4.<br>Check: 3⁴ = 81.<br><b>Answer: x = 4.</b></p>"],
["Evaluate log₁₀(100) + log₁₀(10).","<p>log₁₀(100) = 2 because 10² = 100.<br>log₁₀(10) = 1 because 10¹ = 10.<br>Add: 2 + 1 = 3.<br><b>Answer: 3.</b></p>"]
],
q:TOPICS[6][5].concat([
["Evaluate 2⁴.","16","Multiply four factors of 2.","<p>2⁴=2×2×2×2.<br><b>2⁴=16.</b></p>","E"],
["Evaluate 10⁻².","0.01","A negative power means reciprocal.","<p>10⁻²=1/10².<br>1/100=0.01.<br><b>Answer=0.01.</b></p>","E"],
["Find √81.","9","Find the positive number whose square is 81.","<p>9²=81.<br><b>√81=9.</b></p>","E"],
["Find ∛(−8).","−2","A cube root cubed gives the original number.","<p>(−2)³=−8.<br><b>∛(−8)=−2.</b></p>","E"],
["Find log₃81.","4","Ask which power of 3 equals 81.","<p>3⁴=81.<br><b>log₃81=4.</b></p>","E"],
["Simplify √50.","5√2","Take the largest square factor out of the root.","<p>50=25×2.<br>√50=5√2.<br><b>Answer=5√2.</b></p>","E"],
["Evaluate 16^(1/2).","4","A power of 1/2 is a square root.","<p>16^(1/2)=√16.<br><b>Answer=4.</b></p>","E"],
["Simplify 3²×3⁴.","3⁶=729","For equal bases, add exponents.","<p>3²×3⁴=3^(2+4)=3⁶.<br>3⁶=729.<br><b>Answer=729.</b></p>","M"],
["Simplify 5⁷÷5³.","5⁴=625","For division with equal bases, subtract exponents.","<p>5⁷÷5³=5^(7−3)=5⁴.<br>5⁴=625.<br><b>Answer=625.</b></p>","M"],
["Solve 2ˣ=32.","x=5","Write 32 as a power of 2.","<p>32=2⁵.<br>Equal positive bases have equal exponents.<br><b>x=5.</b></p>","M"],
["Evaluate log₁₀(1000).","3","Ask which power of 10 is 1000.","<p>10³=1000.<br><b>log₁₀(1000)=3.</b></p>","M"],
["Simplify log₂8+log₂4.","5","Evaluate each logarithm as an exponent.","<p>log₂8=3 and log₂4=2.<br>3+2=5.<br><b>Answer=5.</b></p>","M"],
["Simplify √72.","6√2","Write 72 as 36×2.","<p>√72=√36×√2.<br><b>√72=6√2.</b></p>","H"],
["Solve 3^(x+1)=81.","x=3","Write 81 as a power of 3 and equate exponents.","<p>81=3⁴, so x+1=4.<br><b>x=3.</b></p>","H"],
["Solve log₃(x)=4.","81","Convert the logarithm to exponential form.","<p>log₃x=4 means x=3⁴.<br><b>x=81.</b></p>","H"],
["Simplify √72−√8.","4√2","Simplify both surds, then combine like terms.","<p>√72=6√2 and √8=2√2.<br>6√2−2√2=4√2.<br><b>Answer=4√2.</b></p>","H"],
["Solve 2ˣ=10 to 3 decimal places.","x≈3.322","Take logarithms: x=ln10/ln2.","<p>x=ln10/ln2≈3.321928.<br>Round to 3 decimal places.<br><b>x≈3.322.</b></p>","H"],
["If log₁₀x=−2, find x.","0.01","Rewrite as x=10⁻².","<p>log₁₀x=−2 means x=10⁻².<br>10⁻²=1/100.<br><b>x=0.01.</b></p>","H"],
["Simplify (x^(3/2))² for x≥0.","x³","Multiply the exponents.","<p>(x^(3/2))²=x^(3/2×2).<br><b>x³.</b></p>","H"],
["Solve 5^(2x)=125.","x=3/2","Write 125=5³ and match powers.","<p>5^(2x)=5³, so 2x=3.<br><b>x=3/2.</b></p>","H"],
["Simplify log₂(32)−log₂(4).","3","Evaluate both logs.","<p>log₂32=5 and log₂4=2.<br>5−2=3.<br><b>Answer=3.</b></p>","H"],
["Rationalize 1/√5.","√5/5","Multiply top and bottom by √5.","<p>(1/√5)(√5/√5)=√5/5.<br><b>Answer=√5/5.</b></p>","H"]
]),
v:[
["The Organic Chemistry Tutor: Exponents and Logarithms","https://www.youtube.com/@TheOrganicChemistryTutor"],
["Professor Leonard: Exponents and Logarithms","https://www.youtube.com/@ProfessorLeonard"],
["PatrickJMT: Exponents and Logarithms","https://www.youtube.com/@patrickjmt"]
],
k:[
["Khan Academy: Algebra 2","https://www.khanacademy.org/math/algebra2"],
["Paul's Online Notes: Algebra","https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx"]
]};
L[6].q=window.MATH_EXPLANATIONS.fill(6,L[6].q);

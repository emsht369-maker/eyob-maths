L[7]={
s:[
["Limits and continuity","<p>A <b>limit</b> is the value a function approaches as its input approaches a point. It describes nearby behaviour, even if the function is not defined at that point. A function is <b>continuous</b> when its graph has no break there and its value matches the limit. Example: as x approaches 2, x + 3 approaches <b>5</b>.</p>"],
["Derivatives, derivative rules and optimisation","<p>A <b>derivative</b> gives an instantaneous rate of change: on a graph it is the tangent slope. The power rule says d(xⁿ)/dx = nxⁿ⁻¹; constants have derivative 0. For a product, (uv)′ = u′v + uv′; for a quotient, (u/v)′ = (u′v − uv′)/v². The <b>chain rule</b> handles a function inside another function by multiplying by the inside derivative. <b>Optimisation</b> means finding a largest or smallest value; for a smooth graph, a maximum or minimum often occurs where the derivative is zero. Example: d(x³)/dx = <b>3x²</b>; f(x) = (x − 3)² has a minimum of 0 at x = 3.</p>"],
["Implicit differentiation, higher derivatives and tangents","<p><b>Implicit differentiation</b> finds dy/dx when x and y are mixed in one equation; treat y as a function of x. A <b>higher derivative</b> differentiates again; for position, the first derivative is velocity and the second is acceleration. The tangent at x = a has equation y − f(a) = f′(a)(x − a). Example: y = x² has slope 4 at x = 2, so its tangent is y − 4 = 4(x − 2).</p>"],
["Integrals and the fundamental theorem","<p>An <b>integral</b> can add many tiny amounts. An indefinite integral gives a family of antiderivatives and needs a constant C. The <b>fundamental theorem of calculus</b> connects derivatives and definite integrals: if F′ = f, then ∫ₐᵇ f(x)dx = F(b) − F(a). Example: ∫2x dx = <b>x² + C</b>.</p>"],
["Area under curves and volumes of revolution","<p>A definite integral gives signed area under a curve; area below the x-axis counts as negative, so split regions if total geometric area is needed. A <b>volume of revolution</b> is made by rotating a region. For a curve y=f(x) rotated around the x-axis, the disk method gives V = π∫[f(x)]²dx. Example: rotating y = x from 0 to 1 gives V = π∫₀¹x²dx = <b>π/3</b>.</p>"],
["Partial derivatives","<p>A <b>partial derivative</b> measures change in one input while the other inputs stay fixed. Use ∂ instead of d. For f(x,y) = x²y, its partial derivative with respect to x is 2xy; treat y as fixed. At (2,3), that rate is 2 × 2 × 3 = <b>12</b>.</p>"],
["Common mistakes","<ul><li>For the chain rule, multiply by the derivative of the inside function.</li><li>For a definite integral, subtract the lower-limit value from the upper-limit value.</li><li>Remember + C for an indefinite integral.</li><li>A stationary point where the derivative is zero could be a maximum, minimum or neither.</li><li>In implicit differentiation, differentiating y² gives 2y(dy/dx), not just 2y.</li><li>For partial derivatives, keep the other variables fixed.</li></ul>"],
["Where this is used in machine learning","<ul><li>Gradient descent uses derivatives to adjust model parameters and reduce error.</li><li>Partial derivatives show how a model's loss changes when one weight changes.</li><li>Integrals describe probability densities and expected values for continuous data.</li><li>Optimisation finds model settings that give the smallest loss or best fit.</li></ul>"]
],
e:[
["Evaluate the limit of (x² − 9)/(x − 3) as x approaches 3.","<p>Direct substitution gives 0/0, so factor the numerator.<br>x² − 9 = (x − 3)(x + 3).<br>For x ≠ 3, cancel x − 3; the expression becomes x + 3.<br>As x approaches 3, x + 3 approaches <b>6</b>.</p>"],
["Differentiate f(x) = x³ − 4x and find f′(2).","<p>Use the power rule on each term: derivative of x³ is 3x².<br>Derivative of −4x is −4.<br>So f′(x) = 3x² − 4.<br>At x = 2: 3 × 2² − 4 = 12 − 4 = <b>8</b>.</p>"],
["Differentiate y = (2x + 1)³ and find the derivative at x = 1.","<p>Use the chain rule: outer derivative is 3(2x + 1)².<br>Multiply by the inside derivative, 2: y′ = 6(2x + 1)².<br>At x = 1: y′ = 6 × 3² = 6 × 9.<br><b>Derivative = 54.</b></p>"],
["Find the gradient of x² + y² = 25 at the point (3, 4).","<p>Differentiate both sides with respect to x: 2x + 2y(dy/dx) = 0.<br>Rearrange: dy/dx = −x/y.<br>Substitute x = 3 and y = 4.<br><b>Gradient = −3/4.</b></p>"],
["A rectangle has perimeter 20 cm. What dimensions give the greatest area?","<p>Let its sides be x and y. Perimeter 20 gives 2x + 2y = 20, so y = 10 − x.<br>Area A = xy = x(10 − x) = 10x − x².<br>Differentiate: A′ = 10 − 2x. Set A′ = 0, giving x = 5.<br>Then y = 5, and the area is 5 × 5 = <b>25 cm²</b>. The second derivative is −2, so this is a maximum.</p>"]
],
q:TOPICS[7][5].concat([
["Differentiate x³.","3x²","Use the power rule.","<p>Power rule: d(xⁿ)/dx=nxⁿ⁻¹.<br>Bring down 3 and reduce the power to 2.<br><b>Derivative=3x².</b></p>","E"],
["Integrate 4x³.","x⁴+C","Increase the power and divide by the new power.","<p>∫x³dx=x⁴/4.<br>Multiply by 4 to get x⁴, then add C.<br><b>x⁴+C.</b></p>","E"],
["Find the derivative of x³ at x=2.","12","Differentiate first, then substitute.","<p>Derivative of x³ is 3x².<br>At x=2: 3×2²=12.<br><b>Answer=12.</b></p>","E"],
["Find the tangent to y=x² at x=1.","y=2x−1","Use slope f′(1) and point (1,1).","<p>f′(x)=2x, so slope at 1 is 2.<br>Line through (1,1): y−1=2(x−1).<br><b>y=2x−1.</b></p>","E"],
["Evaluate ∫₀² x dx.","2","Antiderivative is x²/2.","<p>Evaluate x²/2 at 2 and 0.<br>2−0=2.<br><b>Integral=2.</b></p>","E"],
["Differentiate the constant function f(x)=7.","0","The derivative of a constant is zero.","<p>7 does not change as x changes.<br><b>f′(x)=0.</b></p>","E"],
["Find ∂/∂y of x²y.","x²","Hold x fixed and differentiate by y.","<p>x² is constant with respect to y.<br>∂(x²y)/∂y=x².<br><b>Answer=x².</b></p>","E"],
["Evaluate lim x→2 of (x²−4)/(x−2).","4","Factor and cancel the common factor.","<p>x²−4=(x−2)(x+2).<br>For x≠2 the expression is x+2.<br>Limit is <b>4</b>.</p>","M"],
["Differentiate (x²+1)³.","6x(x²+1)²","Use the chain rule.","<p>Outer derivative is 3(x²+1)².<br>Multiply by inner derivative 2x.<br><b>6x(x²+1)².</b></p>","M"],
["Find the minimum of x²−4x+5.","1","Complete the square.","<p>x²−4x+5=(x−2)²+1.<br>The square is smallest at zero.<br><b>Minimum=1.</b></p>","M"],
["Differentiate 3x⁴.","12x³","Use the power rule and multiply by 3.","<p>d(3x⁴)/dx=3×4x³.<br><b>Derivative=12x³.</b></p>","M"],
["Evaluate ∫₀³(2x+1)dx.","12","Antiderivative is x²+x.","<p>[x²+x]₀³=9+3−0.<br><b>Integral=12.</b></p>","M"],
["Find the tangent to y=x³ at x=2.","y=12x−16","Find point (2,8) and slope 3x² at 2.","<p>f′(x)=3x², so slope=12; point is (2,8).<br>y−8=12(x−2).<br><b>y=12x−16.</b></p>","M"],
["For f=x²y, find ∂f/∂x at (2,3).","12","Differentiate with respect to x, then substitute.","<p>fₓ=2xy.<br>At (2,3): 2×2×3=12.<br><b>Answer=12.</b></p>","H"],
["Find dy/dx for x²+y²=25 at (3,4).","−3/4","Implicitly differentiate both sides.","<p>2x+2y(dy/dx)=0, so dy/dx=−x/y.<br>At (3,4), slope=−3/4.<br><b>Answer=−3/4.</b></p>","H"],
["Differentiate (2x+1)⁴.","8(2x+1)³","Apply the chain rule.","<p>Outer derivative=4(2x+1)³.<br>Multiply by inner derivative 2.<br><b>8(2x+1)³.</b></p>","H"],
["Find the minimum of x²+6x+10.","1","Complete the square.","<p>x²+6x+10=(x+3)²+1.<br>The square reaches zero at x=−3.<br><b>Minimum=1.</b></p>","H"],
["Evaluate ∫₁³ x² dx.","26/3","Antiderivative is x³/3.","<p>[x³/3]₁³=(27−1)/3.<br><b>Integral=26/3.</b></p>","H"],
["Find d/dx of (x+1)/(x−1).","−2/(x−1)²","Use the quotient rule.","<p>Numerator derivative: ((x−1)−(x+1))/(x−1)².<br>Numerator simplifies to −2.<br><b>Derivative=−2/(x−1)².</b></p>","H"],
["Rotate y=x from x=0 to x=1 around the x-axis. Find the volume.","π/3","Use V=π∫₀¹ y²dx.","<p>V=π∫₀¹x²dx.<br>Integral is 1/3.<br><b>V=π/3.</b></p>","H"],
["A rectangle has perimeter 20. Find its maximum possible area.","25","Write area as x(10−x), then find its vertex.","<p>Perimeter gives sides x and 10−x.<br>A=10x−x² has maximum at x=5; other side=5.<br><b>Maximum area=25.</b></p>","H"],
["For f=3x²y+2y, find ∂f/∂x at (2,3).","36","Treat y as constant; derivative is 6xy.","<p>fₓ=6xy.<br>At (2,3): 6×2×3=36.<br><b>Answer=36.</b></p>","H"]
]),
v:[
["Professor Leonard: Calculus","https://www.youtube.com/@ProfessorLeonard"],
["3Blue1Brown: Calculus","https://www.youtube.com/@3blue1brown"],
["PatrickJMT: Calculus","https://www.youtube.com/@patrickjmt"]
],
k:[
["Khan Academy: Calculus 1","https://www.khanacademy.org/math/calculus-1"],
["MIT OpenCourseWare: Single Variable Calculus","https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/"],
["Paul's Online Notes: Calculus I","https://tutorial.math.lamar.edu/Classes/CalcI/CalcI.aspx"]
]};
L[7].q=window.MATH_EXPLANATIONS.fill(7,L[7].q);

L[22]={
s:[
["Real analysis and limits","<p><b>Real analysis</b> studies real numbers, limits and continuity with careful definitions. A limit describes the value approached as inputs get close to a point. Continuity means the function's value matches that limit. Example: limₓ→2(x²)=<b>4</b>.</p>"],
["Differentiability and multivariable functions","<p>A function is <b>differentiable</b> if a derivative describes its local change. A multivariable function takes several inputs, such as f(x,y). Its gradient collects partial derivatives and points in the direction of greatest increase. Example: for f=x²+y², ∇f=(2x,2y).</p>"],
["Partial derivatives and chain rule","<p>A <b>partial derivative</b> changes one variable while holding the others fixed. The multivariable chain rule combines derivatives along a path. Example: if f=x²y, then ∂f/∂x=2xy; y is treated as fixed.</p>"],
["Multiple integrals and vector calculus","<p>A <b>double integral</b> adds values over a region; it can measure volume under a surface. Vector calculus studies vector fields, divergence and curl. The divergence measures outward flow; curl measures local rotation. Example: integrating constant 1 over a rectangle of area 6 gives <b>6</b>.</p>"],
["Complex analysis","<p><b>Complex analysis</b> studies functions of complex numbers. A complex function can be written f(z); differentiability in the complex sense is a strong condition. Example: f(z)=z² is complex differentiable everywhere.</p>"],
["Fourier series","<p>A <b>Fourier series</b> represents a repeating function as sums of sine and cosine waves. It separates a signal into frequencies. Example: sin x is already one Fourier component, at its single frequency.</p>"],
["Common mistakes","<ul><li>For partial derivatives, hold the other variables fixed.</li><li>The gradient is a vector of partial derivatives, not a single number.</li><li>Check the region and limits before evaluating multiple integrals.</li><li>Divergence and curl describe different properties of a vector field.</li><li>Fourier series represent periodic behaviour; check the period and interval.</li><li>Do not assume every real-differentiable fact transfers directly to complex functions.</li></ul>"],
["Where this is used in machine learning","<ul><li>Gradients drive training of models with many parameters.</li><li>Multiple integrals describe continuous probability and expectations.</li><li>Fourier features help models represent periodic patterns and signals.</li><li>Vector calculus describes flow and physical systems used in scientific machine learning.</li></ul>"]
],
e:[
["Find ∇f for f(x,y)=x²+3y² at (1,2).","<p>Partial derivatives: fₓ=2x and fᵧ=6y.<br>At (1,2), these are 2 and 12.<br><b>Gradient=(2,12).</b></p>"],
["Find ∂/∂x of f=x²y+3y.","<p>Treat y as a constant.<br>Derivative of x²y is 2xy; derivative of 3y with respect to x is 0.<br><b>∂f/∂x=2xy.</b></p>"],
["Evaluate ∫₀²∫₀³ 1 dy dx.","<p>The integrand is 1 over a rectangle with side lengths 3 and 2.<br>Area=3×2=6.<br><b>Integral=6.</b></p>"],
["Find the divergence of F=(x²,y²,z²).","<p>Divergence=∂x²/∂x+∂y²/∂y+∂z²/∂z.<br>=2x+2y+2z.<br><b>div F=2x+2y+2z.</b></p>"],
["What frequencies appear in 2cos x+sin 3x?","<p>The terms are cosine at frequency 1 and sine at frequency 3.<br><b>Frequencies 1 and 3.</b></p>"]
],
q:TOPICS[22][5].concat([
["Find ∂/∂x of x²y.","2xy","Treat y as a constant.","<p>Use the power rule on x² and keep y fixed.<br>Derivative is 2xy.<br><b>2xy.</b></p>","E"],
["Find the gradient of f=x²+y² at (1,2).","(2,4)","Differentiate with respect to x and y.","<p>fₓ=2x and fᵧ=2y.<br>At (1,2), gradient=(2,4).<br><b>(2,4).</b></p>","E"],
["Evaluate ∫₀¹ x dx.","1/2","Antiderivative is x²/2.","<p>Antiderivative of x is x²/2.<br>Evaluate: 1/2−0.<br><b>Integral=1/2.</b></p>","E"],
["Find ∂/∂y of x²y.","x²","Treat x as fixed.","<p>With respect to y, x² is constant.<br>Derivative of x²y is x².<br><b>x².</b></p>","E"],
["Find the gradient of f=3x+4y.","(3,4)","Take each partial derivative.","<p>fₓ=3 and fᵧ=4.<br><b>Gradient=(3,4).</b></p>","E"],
["What is the derivative of a constant with respect to x?","0","A constant does not change as x changes.","<p>The rate of change of a fixed value is zero.<br><b>Derivative=0.</b></p>","E"],
["What does a double integral add over?","A 2D region","It accumulates function values across an area.","<p>A double integral uses two variables and a region in the plane.<br><b>It adds over a 2D region.</b></p>","E"],
["Is sin x a Fourier component?","Yes","Fourier components are sine and cosine waves.","<p>sin x is a sine wave with a fixed frequency.<br><b>Yes.</b></p>","E"],
["Find ∇f for f=x²+2y² at (2,1).","(4,4)","Use partials (2x,4y).","<p>fₓ=2x=4; fᵧ=4y=4.<br><b>Gradient=(4,4).</b></p>","M"],
["Find ∂/∂x of 3x²y+2y.","6xy","Hold y fixed.","<p>Derivative of 3x²y is 6xy.<br>Derivative of 2y with respect to x is zero.<br><b>6xy.</b></p>","M"],
["Evaluate ∫₀² 3x² dx.","8","Antiderivative is x³.","<p>∫3x²dx=x³.<br>At 2 minus at 0: 8−0.<br><b>8.</b></p>","M"],
["Find divergence of F=(2x,3y).","5","Add partial derivatives of each matching component.","<p>div F=∂(2x)/∂x+∂(3y)/∂y.<br>2+3=5.<br><b>Divergence=5.</b></p>","M"],
["If f=x²y, find ∂²f/∂x∂y.","2x","Differentiate first with respect to x, then y.","<p>First fₓ=2xy.<br>Differentiate with respect to y: 2x.<br><b>Mixed partial=2x.</b></p>","M"],
["Find the directional derivative of f=x²+y² at (1,0) in unit direction (0,1).","0","Dot the gradient with the unit direction.","<p>Gradient at (1,0) is (2,0).<br>(2,0)·(0,1)=0.<br><b>Directional derivative=0.</b></p>","M"],
["Evaluate ∫₀¹∫₀² 1 dy dx.","2","The region is a rectangle with area 2.","<p>The integrand is 1 over width 2 and height 1.<br>Area=2×1=2.<br><b>Integral=2.</b></p>","M"],
["For f=x²+xy, find fₓ and fᵧ.","2x+y; x","Differentiate separately, holding the other variable fixed.","<p>With y fixed, fₓ=2x+y.<br>With x fixed, fᵧ=x.<br><b>Partials: 2x+y and x.</b></p>","H"],
["Find the divergence of F=(xy,yz,zx).","y+z+x","Differentiate the first component by x, second by y, third by z.","<p>∂(xy)/∂x=y; ∂(yz)/∂y=z; ∂(zx)/∂z=x.<br>Add them.<br><b>div F=x+y+z.</b></p>","H"],
["Find the curl of F=(−y,x,0).","(0,0,2)","Use curl=(∂R/∂y−∂Q/∂z, ∂P/∂z−∂R/∂x, ∂Q/∂x−∂P/∂y).","<p>P=−y, Q=x, R=0.<br>Only the z-component remains: ∂Q/∂x−∂P/∂y=1−(−1)=2.<br><b>Curl=(0,0,2).</b></p>","H"],
["Evaluate ∫₀¹∫₀¹ (x+y) dy dx.","1","Integrate over the unit square or use symmetry.","<p>Average of x+y over the unit square is 1.<br>Area is 1, so the integral is 1.<br><b>Answer=1.</b></p>","H"],
["Find the gradient magnitude of f=x²+y² at (3,4).","10","Gradient is (2x,2y); then take its length.","<p>Gradient=(6,8).<br>Magnitude=√(6²+8²)=√100.<br><b>Magnitude=10.</b></p>","H"],
["If g(t)=f(2t,t), with f=x²+y, find g′(1).","9","Substitute the path first, then differentiate.","<p>g(t)=(2t)²+t=4t²+t.<br>g′(t)=8t+1; g′(1)=9.<br><b>g′(1)=9.</b></p>","H"],
["Find the average value of f(x)=x on [0,2].","1","Average value = (1/(b−a))∫ₐᵇ f(x)dx.","<p>Integral ∫₀²x dx=2.<br>Divide by interval length 2: 2/2.<br><b>Average value=1.</b></p>","H"],
["What is the gradient of f(x,y,z)=x²+y²+z² at (1,2,3)?","(2,4,6)","Differentiate with respect to each coordinate.","<p>Gradient=(2x,2y,2z).<br>At (1,2,3), this is (2,4,6).<br><b>(2,4,6).</b></p>","H"]
]),
v:[
["3Blue1Brown: Multivariable Calculus","https://www.youtube.com/@3blue1brown"],
["MIT OpenCourseWare: Multivariable Calculus","https://www.youtube.com/results?search_query=MIT+multivariable+calculus+lecture"],
["Vector Calculus Explained","https://www.youtube.com/results?search_query=vector+calculus+divergence+curl+explained"]
],
k:[
["Khan Academy: Multivariable Calculus","https://www.khanacademy.org/math/multivariable-calculus"],
["MIT OpenCourseWare: Multivariable Calculus","https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/"]
]};
L[22].q=window.MATH_EXPLANATIONS.fill(22,L[22].q);

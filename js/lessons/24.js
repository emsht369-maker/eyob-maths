L[23]={
s:[
["What is a differential equation?","<p>A <b>differential equation</b> contains an unknown function and its derivatives. Its <b>order</b> is the highest derivative present. Example: y′=2y is first order; y″+y=0 is second order.</p>"],
["First-order ordinary equations","<p>An <b>ordinary differential equation (ODE)</b> uses derivatives with respect to one variable. A separable equation puts y terms with dy and x terms with dx. Example: y′=2y gives dy/y=2dx; integrating gives ln|y|=2x+C.</p>"],
["Second-order equations and systems","<p>A second-order ODE contains y″. Initial values such as y(0) and y′(0) can select one solution. A system tracks several unknown functions together. Example: position and velocity form a system of first-order equations for motion.</p>"],
["Partial differential equations","<p>A <b>partial differential equation (PDE)</b> uses partial derivatives in two or more independent variables. The heat equation models spreading temperature; the wave equation models vibration. Example: ∂u/∂t = ∂²u/∂x² describes one form of heat flow.</p>"],
["Initial-value and boundary-value problems","<p>An <b>initial-value problem</b> gives the function and needed derivatives at one starting point. A <b>boundary-value problem</b> gives conditions at different edges of a region. These conditions help choose a particular solution. Example: y′=y with y(0)=1 has solution y=eˣ.</p>"],
["Numerical solution methods","<p>Some equations cannot be solved neatly by a formula. Numerical methods estimate a solution at steps. Euler's method uses yₙ₊₁≈yₙ+h f(xₙ,yₙ). Example: for y′=y, y=1 and h=0.1, one step gives 1+0.1×1=<b>1.1</b>.</p>"],
["Common mistakes","<ul><li>The order is the highest derivative, not the number of terms.</li><li>When separating variables, keep track of constants of integration.</li><li>Use initial or boundary conditions to determine constants.</li><li>Do not confuse an ODE with a PDE; check how many independent variables appear.</li><li>Euler steps use the slope at the start of the step.</li><li>A numerical approximation is not an exact solution unless proved so.</li></ul>"],
["Where this is used in machine learning","<ul><li>Differential equations model changing systems and continuous-time learning.</li><li>Neural ODEs describe hidden states that evolve continuously.</li><li>Optimisation can be viewed as a differential flow toward lower loss.</li><li>Numerical methods simulate models when exact formulas are unavailable.</li></ul>"]
],
e:[
["Solve y′=2y with y(0)=1.","<p>Separate: dy/y=2dx.<br>Integrate: ln|y|=2x+C, so y=Ae²ˣ.<br>Use y(0)=1, giving A=1.<br><b>y=e²ˣ.</b></p>"],
["Find the order of y‴+4y′=0.","<p>The highest derivative is y‴, the third derivative.<br><b>Order = 3.</b></p>"],
["Use one Euler step for y′=y from y=2 with step h=0.1.","<p>Euler update: new y = y + h y′.<br>Here y′=2, so new y=2+0.1×2.<br><b>New y≈2.2.</b></p>"],
["Solve y′=3 with y(0)=2.","<p>Integrate the constant derivative: y=3x+C.<br>Use y(0)=2, so C=2.<br><b>y=3x+2.</b></p>"],
["Is ∂u/∂t=∂²u/∂x² an ODE or PDE?","<p>It contains partial derivatives with respect to x and t.<br>That means it has multiple independent variables.<br><b>It is a PDE.</b></p>"]
],
q:TOPICS[23][5].concat([
["What is the order of y′+y=0?","1","The highest derivative is the first derivative.","<p>The highest derivative shown is y′.<br>That is order 1.<br><b>Order=1.</b></p>","E"],
["What is the order of y″+y=0?","2","The highest derivative is y double-prime.","<p>The highest derivative shown is y″.<br>That is order 2.<br><b>Order=2.</b></p>","E"],
["Is ∂u/∂t=∂²u/∂x² a PDE?","Yes","It uses partial derivatives in multiple variables.","<p>The equation involves x and t and partial derivative symbols.<br>That makes it a partial differential equation.<br><b>Yes.</b></p>","E"],
["Use one Euler step for y′=y, y=1, h=0.1.","1.1","Update with y_new=y+h×slope.","<p>Slope y′ equals 1 at the start.<br>y_new=1+0.1×1.<br><b>1.1.</b></p>","E"],
["Solve y′=2 with y(0)=3.","y=2x+3","Integrate the constant derivative and use the initial value.","<p>Integrating y′=2 gives y=2x+C.<br>At x=0, y=3, so C=3.<br><b>y=2x+3.</b></p>","E"],
["What does an initial condition specify?","A value at a starting point","It selects a particular solution.","<p>An initial condition gives the function or derivatives at the starting input.<br><b>A starting value.</b></p>","E"],
["Is y′=x² an ODE or PDE?","ODE","It has derivatives with respect to only one independent variable.","<p>There is one independent variable x.<br>The derivative is ordinary, not partial.<br><b>ODE.</b></p>","E"],
["Find the order of y⁽⁴⁾+y=0.","4","The highest derivative is the fourth derivative.","<p>The highest derivative is y⁽⁴⁾.<br><b>Order=4.</b></p>","E"],
["Solve y′=y with y(0)=2.","y=2eˣ","The general solution is Ceˣ; apply the initial value.","<p>For y′=y, y=Ceˣ.<br>At x=0, C=2.<br><b>y=2eˣ.</b></p>","M"],
["Use Euler's method for y′=2x, y=1 at x=0, h=0.5.","1","Slope at x=0 is zero; update y+h×slope.","<p>At x=0, y′=2x=0.<br>Euler update gives 1+0.5×0.<br><b>Approximation=1.</b></p>","M"],
["Solve y′=3y with y(0)=1.","y=e³ˣ","Separation gives ln y=3x+C.","<p>dy/y=3dx, so ln y=3x+C.<br>Using y(0)=1 gives C=0.<br><b>y=e³ˣ.</b></p>","M"],
["A second-order ODE needs how many independent initial values for a typical unique solution?","2","One condition is needed for each integration constant.","<p>A second-order equation generally gives two integration constants.<br>Two suitable initial values determine them.<br><b>Two.</b></p>","M"],
["Find the general solution of y′=4.","y=4x+C","Integrate both sides with respect to x.","<p>Integrate the constant 4.<br>∫4dx=4x+C.<br><b>y=4x+C.</b></p>","M"],
["For y′=y, y=3 and h=0.2, find one Euler step.","3.6","Use y_new=y+h y′ with y′=3.","<p>Slope at the start is 3.<br>y_new=3+0.2×3=3.6.<br><b>3.6.</b></p>","M"],
["Solve y′=−2y with y(0)=4.","y=4e⁻²ˣ","The solution to y′=ky is Ceᵏˣ.","<p>For y′=−2y, y=Ce⁻²ˣ.<br>At x=0, y=4, so C=4.<br><b>y=4e⁻²ˣ.</b></p>","H"],
["Use Euler's method for y′=x+y, y=1 at x=0, h=0.1.","1.1","Evaluate the starting slope, then add h times it.","<p>At (0,1), slope=x+y=1.<br>y_new=1+0.1×1.<br><b>1.1.</b></p>","H"],
["Find the order of ∂²u/∂x²+∂u/∂t=0.","2","The highest derivative has total order 2.","<p>The equation includes a second derivative with respect to x.<br>That is its highest order.<br><b>Order=2.</b></p>","H"],
["Solve y″=0 with y(0)=2 and y′(0)=3.","y=3x+2","Integrate twice, then use the two conditions.","<p>Integrate y″=0: y′=C₁; y′(0)=3 gives C₁=3.<br>Integrate: y=3x+C₂; y(0)=2 gives C₂=2.<br><b>y=3x+2.</b></p>","H"],
["Use two Euler steps for y′=y from y₀=1 with h=0.1.","1.21","At each step add 0.1 times the current y.","<p>First step: y₁=1+0.1×1=1.1.<br>Second: y₂=1.1+0.1×1.1=1.21.<br><b>y₂≈1.21.</b></p>","H"],
["Does y′=2y have the solution y=3e²ˣ?","Yes","Differentiate and check the equation.","<p>Derivative is y′=6e²ˣ.<br>2y=2(3e²ˣ)=6e²ˣ, so both sides match.<br><b>Yes.</b></p>","H"],
["Solve y′=−y with y(0)=5.","y=5e⁻ˣ","Use y=Ce⁻ˣ and apply the initial condition.","<p>General solution is y=Ce⁻ˣ.<br>At x=0, C=5.<br><b>y=5e⁻ˣ.</b></p>","H"],
["For y′=x, y(0)=0, use one Euler step of size 1.","0","The initial slope at x=0 is zero.","<p>At x=0 the slope y′=x=0.<br>Euler update y₁=0+1×0.<br><b>Approximation=0.</b></p>","H"],
["Find the general solution of y″=6.","y=3x²+C₁x+C₂","Integrate twice and include a constant each time.","<p>Integrate once: y′=6x+C₁.<br>Integrate again: y=3x²+C₁x+C₂.<br><b>General solution as stated.</b></p>","H"]
]),
v:[
["Differential Equations Explained","https://www.youtube.com/results?search_query=differential+equations+first+order+explained"],
["MIT OpenCourseWare: Differential Equations","https://www.youtube.com/results?search_query=MIT+OpenCourseWare+differential+equations"],
["Euler's Method Explained","https://www.youtube.com/results?search_query=Euler+method+differential+equations"]
],
k:[
["Khan Academy: Differential Equations","https://www.khanacademy.org/math/differential-equations"],
["Paul's Online Notes: Differential Equations","https://tutorial.math.lamar.edu/Classes/DE/DE.aspx"]
]};
L[23].q=window.MATH_EXPLANATIONS.fill(23,L[23].q);

L[24]={
s:[
["Approximation and error","<p>An <b>approximation</b> is a close value used when an exact answer is hard or unnecessary. Error is the difference between an estimate and the true value. Absolute error is |estimate−true value|; relative error compares that error to the true size. Example: 3.14 approximates π.</p>"],
["Numerical differentiation","<p>Numerical differentiation estimates a derivative from nearby function values. A central difference is f′(x)≈[f(x+h)−f(x−h)]/(2h). Smaller h can improve accuracy until rounding error becomes important. Example: for f(x)=x² at x=3 and h=0.1, the central difference is exactly 6.</p>"],
["Numerical integration","<p>Numerical integration estimates area from sample points. The trapezoidal rule joins neighbouring points with straight lines; Simpson's rule uses parabolas. More, narrower intervals usually improve a well-behaved approximation. Example: the trapezoid with width 2 and parallel heights 3 and 5 has area 2(3+5)/2=<b>8</b>.</p>"],
["Mathematical modelling","<p>A <b>model</b> simplifies a real situation into variables, assumptions and equations. Build it, solve or simulate it, then compare predictions with observations. Example: distance = speed × time assumes speed is constant.</p>"],
["Optimisation and gradient descent","<p><b>Optimisation</b> finds the best value under a goal and any constraints. Gradient descent updates a parameter by w←w−η∇L, moving opposite the gradient to lower the loss L. Example: w=5, gradient=4, η=0.5 gives 5−0.5×4=<b>3</b>.</p>"],
["Operations research and financial maths","<p><b>Operations research</b> uses maths to plan resources, routes and schedules. Financial maths uses rates, growth, interest and cash flows. Example: simple interest on £100 at 5% for one year is £100×0.05=<b>£5</b>.</p>"],
["Common mistakes","<ul><li>State units and precision when giving approximations.</li><li>Numerical derivative accuracy depends on both step size and rounding.</li><li>Use the correct interval widths in numerical integration.</li><li>Check model assumptions against the real situation.</li><li>For gradient descent, subtract the learning-rate-scaled gradient.</li><li>In finance, check whether a rate is per year, month or another period.</li></ul>"],
["Where this is used in machine learning","<ul><li>Gradient descent and its variants train most neural networks.</li><li>Numerical integration estimates probabilities and expectations.</li><li>Numerical derivatives test gradients and support optimisation.</li><li>Operations research plans compute, data collection and model deployment.</li></ul>"]
],
e:[
["Use the trapezoidal rule for one interval of width 2 with endpoint heights 3 and 5.","<p>Trapezoid area = width×(height₁+height₂)/2.<br>2×(3+5)/2=8.<br><b>Approximate area = 8.</b></p>"],
["Estimate f′(3) for f(x)=x² using a central difference with h=0.1.","<p>Central difference=[f(3.1)−f(2.9)]/0.2.<br>(9.61−8.41)/0.2=1.2/0.2.<br><b>Estimate = 6.</b></p>"],
["Take one gradient-descent step from w=5 with gradient 4 and learning rate 0.5.","<p>Update w←w−ηg.<br>5−0.5×4=5−2.<br><b>New w=3.</b></p>"],
["Find simple interest on £200 at 3% for 2 years.","<p>Simple interest = principal×rate×time.<br>200×0.03×2=12.<br><b>Interest = £12.</b></p>"],
["A model predicts 18 when the observed value is 20. Find the absolute error.","<p>Absolute error = |prediction−observed|.<br>|18−20|=2.<br><b>Absolute error = 2.</b></p>"]
],
q:TOPICS[24][5].concat([
["If w=5, gradient=4 and learning rate=0.5, find the updated w.","3","Use w_new=w−learning rate×gradient.","<p>w_new=5−0.5×4.<br>5−2=3.<br><b>w_new=3.</b></p>","E"],
["Find simple interest on £100 at 5% for one year.","£5","Use principal×rate×time.","<p>Interest=100×0.05×1.<br><b>Interest=£5.</b></p>","E"],
["A prediction is 9 and the observed value is 12. Find absolute error.","3","Take the absolute value of prediction minus observation.","<p>|9−12|=|−3|.<br><b>Absolute error=3.</b></p>","E"],
["Find the trapezoid area with width 2 and parallel heights 3 and 5.","8","Use width×(sum of heights)/2.","<p>Area=2×(3+5)/2.<br>Area=8.<br><b>8 square units.</b></p>","E"],
["What is the exact value of 2+2?","4","Add the two numbers.","<p>2+2=4.<br><b>Answer=4.</b></p>","E"],
["If the objective is to minimize loss, should a gradient step move with or against the gradient?","Against","The gradient points toward greatest increase.","<p>The gradient points uphill for the loss.<br>To reduce loss, move in the opposite direction.<br><b>Against the gradient.</b></p>","E"],
["Approximate π to 2 decimal places.","3.14","Round π≈3.14159 to hundredths.","<p>The hundredths digit is 4; the next digit is 1.<br>Keep the 4.<br><b>π≈3.14.</b></p>","E"],
["If a car travels at 60 km/h for 2 hours, how far does it go at constant speed?","120 km","Distance=speed×time.","<p>Distance=60×2.<br><b>Distance=120 km.</b></p>","E"],
["Find one Euler-style parameter step w_new=w−ηg for w=4, η=0.1, g=5.","3.5","Multiply ηg, then subtract from w.","<p>ηg=0.1×5=0.5.<br>w_new=4−0.5=3.5.<br><b>3.5.</b></p>","M"],
["Use the trapezoidal rule for width 1 and endpoint heights 2 and 6.","4","Area=width×average endpoint height.","<p>Area=1×(2+6)/2.<br>Area=4.<br><b>Approximation=4.</b></p>","M"],
["For f(x)=x², estimate f′(2) with central difference h=0.5.","4","Use [f(2.5)−f(1.5)]/(1.0).","<p>f(2.5)=6.25 and f(1.5)=2.25.<br>(6.25−2.25)/1=4.<br><b>Estimate=4.</b></p>","M"],
["Find compound value of £100 after 2 years at 10% per year.","£121","Use A=P(1+r)ⁿ.","<p>A=100(1.1)².<br>100×1.21=121.<br><b>Value=£121.</b></p>","M"],
["A model predicts 47 for an observed value 50. Find absolute and relative errors.","3; 0.06","Absolute error is 3; relative error is 3/50.","<p>Absolute error=|47−50|=3.<br>Relative error=3/50=0.06.<br><b>Errors: 3 and 0.06.</b></p>","M"],
["Minimize f(x)=(x−3)². State the minimum value and x.","0 at x=3","A square is non-negative and is zero when its inside is zero.","<p>(x−3)²≥0 for all x.<br>It equals zero at x=3.<br><b>Minimum 0 at x=3.</b></p>","M"],
["Find simple interest on £500 at 4% for 3 years.","£60","Use I=Prt.","<p>I=500×0.04×3.<br>500×0.12=60.<br><b>Interest=£60.</b></p>","M"],
["Gradient descent: w=2, gradient=−3, learning rate=0.2. Find w_new.","2.6","Subtract the product of learning rate and gradient.","<p>w_new=2−0.2(−3).<br>Subtracting a negative gives 2+0.6.<br><b>w_new=2.6.</b></p>","H"],
["Use one Euler step for y′=y, y=2, h=0.25.","2.5","Update y_new=y+h×slope with slope 2.","<p>y_new=2+0.25×2.<br>2+0.5=2.5.<br><b>Approximation=2.5.</b></p>","H"],
["Use the trapezoidal rule over width 3 with heights 4 and 8.","18","Area=3×(4+8)/2.","<p>Average height=(4+8)/2=6.<br>Area=3×6=18.<br><b>18 square units.</b></p>","H"],
["A parameter w=10 takes a gradient step with η=0.05 and gradient=8. Find the new value.","9.6","Calculate the change ηg and subtract it.","<p>Change=0.05×8=0.4.<br>New w=10−0.4=9.6.<br><b>w_new=9.6.</b></p>","H"],
["Estimate f′(1) for f(x)=x³ by central difference with h=0.1.","3.01","Compute [f(1.1)−f(0.9)]/0.2.","<p>1.1³=1.331 and 0.9³=0.729.<br>(1.331−0.729)/0.2=0.602/0.2=3.01.<br><b>Estimate=3.01.</b></p>","H"],
["Find the compound value of £200 at 5% per year for 2 years.","£220.50","Use A=P(1+r)ⁿ.","<p>A=200(1.05)²=200×1.1025.<br><b>A=£220.50.</b></p>","H"],
["A solution estimates √2 as 1.4. Find the absolute error to 3 decimal places.","0.014","Use √2≈1.41421356 and subtract 1.4.","<p>Absolute error=|1.41421356−1.4|=0.01421356.<br>Rounded to 3 decimal places it is 0.014.<br><b>Error≈0.014.</b></p>","H"],
["A project needs 12 staff-hours per task for 5 tasks. Find total staff-hours.","60","Multiply workload per task by number of tasks.","<p>Total=12×5.<br><b>60 staff-hours.</b></p>","H"]
]),
v:[
["StatQuest: Gradient Descent","https://www.youtube.com/@statquest"],
["Numerical Integration Explained","https://www.youtube.com/results?search_query=numerical+integration+trapezoidal+rule+explained"],
["Optimisation for Machine Learning","https://www.youtube.com/results?search_query=optimisation+gradient+descent+machine+learning"]
],
k:[
["Mathematics for Machine Learning","https://mml-book.com/"],
["Convex Optimisation (Boyd and Vandenberghe)","https://web.stanford.edu/~boyd/cvxbook/"]
]};
L[24].q=window.MATH_EXPLANATIONS.fill(24,L[24].q);

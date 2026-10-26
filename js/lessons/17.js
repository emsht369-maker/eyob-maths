L[16]={
s:[
["Coordinate geometry and distance","<p><b>Analytic geometry</b> uses coordinates and equations to study shapes. The distance between (x₁,y₁) and (x₂,y₂) is √((x₂−x₁)²+(y₂−y₁)²). The midpoint averages coordinates. Example: between (0,0) and (3,4), distance is <b>5</b>.</p>"],
["Lines and circles","<p>A line has form y=mx+c. A circle with centre (h,k) and radius r has equation (x−h)²+(y−k)²=r². Example: x²+y²=25 has centre (0,0) and radius <b>5</b>.</p>"],
["Parabolas and ellipses","<p>A <b>parabola</b> is a U-shaped conic, such as y=x². An <b>ellipse</b> is an oval; (x−h)²/a²+(y−k)²/b²=1 has centre (h,k) and horizontal and vertical radii a and b. Example: x²/9+y²/4=1 has radii 3 and 2.</p>"],
["Hyperbolas and conic sections","<p>A <b>hyperbola</b> has two separate curved branches; x²/a²−y²/b²=1 is a common form. Circles, ellipses, parabolas and hyperbolas are <b>conic sections</b>, made by slicing a cone in different ways. Example: x²/4−y²=1 is a hyperbola.</p>"],
["3D coordinates and planes","<p>A 3D point is (x,y,z). Distance uses all three coordinate changes: √((Δx)²+(Δy)²+(Δz)²). A plane can be written ax+by+cz=d; (a,b,c) is perpendicular to it. Example: the distance from (0,0,0) to (1,2,2) is <b>3</b>.</p>"],
["Intersections and geometric meaning","<p>An intersection is a point that satisfies both shape equations. To find it, solve the equations together. A line may meet a circle at zero, one or two points. Example: substituting y=0 into x²+y²=9 gives x=±3, so the x-axis meets the circle at two points.</p>"],
["Common mistakes","<ul><li>Complete squares before reading a circle's centre and radius.</li><li>In the distance formula, square coordinate differences before adding.</li><li>For 3D distance, include the z-coordinate difference.</li><li>Check the sign between squared terms to tell a hyperbola from an ellipse.</li><li>Substitute intersection points into both equations.</li><li>Radii are positive lengths, even if the centre coordinates are negative.</li></ul>"],
["Where this is used in machine learning","<ul><li>Distances define similarity in clustering and nearest-neighbour methods.</li><li>Geometric boundaries help explain how classifiers separate data classes.</li><li>3D coordinates support robotics, computer vision and spatial data.</li><li>Conic equations model curved boundaries and constraint regions.</li></ul>"]
],
e:[
["Find the centre and radius of (x−2)²+(y+1)²=16.","<p>Compare with (x−h)²+(y−k)²=r².<br>h=2, k=−1 and r=√16.<br><b>Centre (2,−1), radius 4.</b></p>"],
["Find the distance between (1,2) and (4,6).","<p>Coordinate changes are 3 and 4.<br>Distance = √(3²+4²)=√25.<br><b>Distance = 5.</b></p>"],
["Find the intersection of y=x and x²+y²=8.","<p>Substitute y=x into the circle: 2x²=8.<br>x²=4, so x=±2; y=x.<br><b>Intersections: (2,2) and (−2,−2).</b></p>"],
["Read the centre and radii of x²/25+y²/9=1.","<p>Compare with x²/a²+y²/b²=1.<br>a²=25 and b²=9.<br><b>Centre (0,0), radii 5 and 3.</b></p>"],
["Find the distance from (0,0,0) to (2,3,6).","<p>Distance = √(2²+3²+6²).<br>√(4+9+36)=√49.<br><b>Distance = 7.</b></p>"]
],
q:TOPICS[16][5].concat([
["Find the midpoint of (0,0) and (4,6).","(2,3)","Average the x-values and y-values.","<p>Midpoint x=(0+4)/2=2.<br>Midpoint y=(0+6)/2=3.<br><b>Midpoint=(2,3).</b></p>","E"],
["Find the distance between (0,0) and (3,4).","5","Use √(Δx²+Δy²).","<p>Changes are 3 and 4.<br>Distance=√(9+16)=√25.<br><b>Distance=5.</b></p>","E"],
["What are the centre and radius of x²+y²=9?","(0,0); 3","Compare with (x−h)²+(y−k)²=r².","<p>Centre is the origin because there are no shifts.<br>r²=9, so r=3.<br><b>Centre (0,0), radius 3.</b></p>","E"],
["What type of graph is y=x²?","A parabola","A quadratic graph is a parabola.","<p>The equation has x squared and forms a U-shaped curve.<br><b>It is a parabola.</b></p>","E"],
["What are the radii of x²/16+y²/4=1?","4 and 2","Take square roots of the denominators.","<p>Horizontal radius is √16=4.<br>Vertical radius is √4=2.<br><b>Radii 4 and 2.</b></p>","E"],
["What type of conic is x²/9+y²/4=1?","Ellipse","A sum of two positive squared terms equals 1.","<p>The standard ellipse form adds two positive squared terms.<br>This equation has that form.<br><b>Ellipse.</b></p>","E"],
["Find the distance from (1,1) to (4,5).","5","The coordinate changes are 3 and 4.","<p>Distance=√((4−1)²+(5−1)²).<br>√(9+16)=√25.<br><b>Distance=5.</b></p>","M"],
["Find the x-intercepts of x²+y²=16.","(−4,0) and (4,0)","Set y=0 and solve for x.","<p>Set y=0: x²=16.<br>x=±4.<br><b>Intercepts (−4,0) and (4,0).</b></p>","M"],
["Find the centre and radius of (x+3)²+(y−2)²=25.","(−3,2); 5","Read signs carefully from (x−h)²+(y−k)².","<p>x+3=x−(−3), so h=−3; k=2.<br>Radius=√25=5.<br><b>Centre (−3,2), radius 5.</b></p>","M"],
["Where does y=0 meet the circle x²+y²=4?","(−2,0) and (2,0)","Set y to zero in the circle equation.","<p>x²+0²=4, so x²=4.<br>x=−2 or x=2.<br><b>Points (−2,0) and (2,0).</b></p>","M"],
["Find the distance between (1,2,2) and (4,6,2).","5","Use the 3D distance formula; z difference is zero.","<p>Differences are 3, 4 and 0.<br>Distance=√(9+16+0)=√25.<br><b>Distance=5.</b></p>","M"],
["Is x²/4−y²=1 an ellipse or hyperbola?","Hyperbola","A difference of squared terms is a hyperbola form.","<p>The x² and y² terms have opposite signs.<br>That is the standard hyperbola pattern.<br><b>Hyperbola.</b></p>","M"],
["Find where y=2 meets x²+y²=13.","(±3,2)","Substitute y=2, then solve x²+4=13.","<p>x²+4=13, so x²=9.<br>x=3 or x=−3, with y=2.<br><b>(3,2) and (−3,2).</b></p>","H"],
["Find the distance between (−2,1) and (4,9).","10","Coordinate changes are 6 and 8.","<p>Δx=6 and Δy=8.<br>Distance=√(6²+8²)=√100.<br><b>Distance=10.</b></p>","H"],
["Find the centre and radius of x²+y²−6x+4y=12.","(3,−2); 5","Complete the square in x and y.","<p>(x−3)²−9+(y+2)²−4=12.<br>(x−3)²+(y+2)²=25.<br><b>Centre (3,−2), radius 5.</b></p>","H"],
["Find where y=x and x²+y²=18 intersect.","(3,3) and (−3,−3)","Substitute y=x to get 2x²=18.","<p>2x²=18, so x²=9 and x=±3.<br>Since y=x, y has the same value.<br><b>(3,3) and (−3,−3).</b></p>","H"],
["Find the distance from (0,0,0) to (1,2,2).","3","Square all three coordinates, add and take the square root.","<p>Distance=√(1²+2²+2²).<br>√(1+4+4)=√9.<br><b>Distance=3.</b></p>","H"],
["Identify the conic x²/25−y²/9=1.","Hyperbola","Opposite signs between squared terms indicate a hyperbola.","<p>The standard hyperbola equation subtracts one squared term from another.<br>This equation has that form.<br><b>It is a hyperbola.</b></p>","H"],
["Find the intersection of x²+y²=25 and x=3.","(3,4) and (3,−4)","Substitute x=3, then solve y²=16.","<p>9+y²=25, so y²=16.<br>Thus y=4 or y=−4.<br><b>Intersections (3,4) and (3,−4).</b></p>","H"],
["Find the radii of the ellipse (x−1)²/36+(y+2)²/9=1.","6 and 3","Square-root the denominators in the standard ellipse equation.","<p>Horizontal radius=√36=6.<br>Vertical radius=√9=3.<br><b>Radii 6 and 3.</b></p>","H"],
["Find the midpoint of (−4,7) and (8,−1).","(2,3)","Average coordinates separately.","<p>x midpoint=(−4+8)/2=2.<br>y midpoint=(7−1)/2=3.<br><b>Midpoint=(2,3).</b></p>","H"],
["Does the line y=3 intersect x²+y²=25? If so, give the points.","(−4,3) and (4,3)","Substitute y=3 and solve x²+9=25.","<p>x²=16, so x=±4.<br>Both points have y=3.<br><b>(−4,3) and (4,3).</b></p>","H"],
["Is (3,4) on the circle x²+y²=25?","Yes","Substitute the coordinates into the circle equation.","<p>Substitute x=3 and y=4: 3²+4²=9+16=25.<br>This matches the circle's right-hand side.<br><b>Yes, (3,4) is on the circle.</b></p>","H"]
]),
v:[
["Analytic Geometry Lessons","https://www.youtube.com/results?search_query=analytic+geometry+conic+sections+explained"],
["Khan Academy: Conic Sections","https://www.youtube.com/results?search_query=Khan+Academy+conic+sections"],
["Circle and Ellipse Equations","https://www.youtube.com/results?search_query=coordinate+geometry+circles+ellipses"]
],
k:[
["Khan Academy: Precalculus","https://www.khanacademy.org/math/precalculus"],
["Desmos Graphing Calculator","https://www.desmos.com/calculator"]
]};
L[16].q=window.MATH_EXPLANATIONS.fill(16,L[16].q);

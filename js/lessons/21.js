L[20]={
s:[
["Euclidean and coordinate geometry","<p><b>Euclidean geometry</b> studies flat space with familiar rules for lines, angles and shapes. Coordinate geometry uses equations and points to solve geometric questions. Example: a triangle's interior angles total <b>180°</b> on a flat plane.</p>"],
["Projective geometry","<p><b>Projective geometry</b> studies properties that stay true under projection, such as points lying on one line. Parallel lines may meet at a point at infinity in the projective plane. Lengths and angles usually do not stay the same. Example: railway tracks appear to meet in a photograph.</p>"],
["Spherical geometry","<p><b>Spherical geometry</b> studies points and paths on a sphere. Its straightest paths are great-circle arcs. A triangle's angles add to more than 180°. Example: on a sphere, a triangle with three right angles totals <b>270°</b>.</p>"],
["Hyperbolic geometry","<p><b>Hyperbolic geometry</b> is a curved geometry where many parallel lines can pass through one point outside a given line. A triangle's angles add to less than 180°. It is useful for describing negatively curved spaces. Example: a hyperbolic triangle with angles 50°, 60° and 40° has total <b>150°</b>.</p>"],
["Differential geometry and curvature","<p><b>Differential geometry</b> uses calculus to study smooth curves and surfaces. <b>Curvature</b> measures how much a path or surface bends. A sphere has positive curvature; a saddle-like surface has negative curvature. Example: a flat plane has zero curvature.</p>"],
["Distances and shortest paths on curved spaces","<p>On a curved surface, the shortest path that stays on the surface can differ from a straight line through space. On Earth, routes often follow great circles. Geometry on curved spaces can use a special distance rule rather than ordinary Pythagoras. Example: the equator is a great circle.</p>"],
["Common mistakes","<ul><li>Do not apply the flat triangle angle total to curved surfaces.</li><li>Projective geometry preserves incidence, not ordinary lengths and angles.</li><li>Great circles are the sphere's geodesics, not every circle on its surface.</li><li>Positive and negative curvature describe different kinds of bending.</li><li>Check whether the question is about a flat plane or curved surface.</li><li>A shortest surface route must remain on the surface.</li></ul>"],
["Where this is used in machine learning","<ul><li>Computer vision uses projective geometry to model cameras and perspective.</li><li>Geospatial learning uses spherical distances for locations on Earth.</li><li>Manifold learning studies data that lies on curved lower-dimensional spaces.</li><li>Curvature and geometry help build models for networks and non-flat data.</li></ul>"]
],
e:[
["Find the total angles of a spherical triangle with three right angles.","<p>Each right angle is 90°.<br>90°+90°+90°=270°.<br><b>Total = 270°.</b></p>"],
["A hyperbolic triangle has angles 40°, 55° and 65°. Find their sum.","<p>Add the interior angles: 40+55+65.<br>40+55=95; 95+65=160.<br><b>Total = 160°.</b></p>"],
["A flat triangle has angles 45° and 75°. Find its third angle.","<p>Flat triangle angles total 180°.<br>180−45−75=60.<br><b>Third angle = 60°.</b></p>"],
["Is the equator a great circle?","<p>A great circle has the same centre as the sphere and divides it into equal halves.<br>The equator divides Earth into northern and southern halves.<br><b>Yes.</b></p>"],
["What geometric idea explains parallel railway tracks seeming to meet in the distance?","<p>Perspective maps parallel lines to lines that can meet at a vanishing point.<br>This is described by projective geometry.<br><b>Projective geometry.</b></p>"]
],
q:TOPICS[20][5].concat([
["Do flat triangle angles total 180°?","Yes","Use the Euclidean triangle angle rule.","<p>In flat Euclidean geometry, the interior angles of a triangle sum to 180°.<br><b>Yes.</b></p>","E"],
["Does projective geometry preserve lengths?","No","Projection preserves incidence, but generally changes lengths.","<p>Projection can stretch or shrink distances.<br>It preserves properties such as points lying on one line.<br><b>Lengths are not generally preserved.</b></p>","E"],
["What is a great circle?","A circle on a sphere whose centre is the sphere's centre.","It divides the sphere into two equal halves.","<p>A great circle has the same centre as the sphere.<br>It is the largest possible circle on the sphere.<br><b>It divides the sphere into equal halves.</b></p>","E"],
["Is the shortest route along a sphere usually a straight line drawn through space?","No","The path must remain on the spherical surface.","<p>A straight chord through space leaves the sphere's surface.<br>A surface route follows a geodesic, such as a great-circle arc.<br><b>No.</b></p>","E"],
["What is the angle total of a flat triangle?","180°","Use the Euclidean triangle-sum rule.","<p>All flat triangle interior angles add to 180°.<br><b>180°.</b></p>","E"],
["Does a sphere have positive or negative curvature?","Positive","A sphere bends outward in every direction.","<p>A sphere is a standard example of positive curvature.<br><b>Positive curvature.</b></p>","E"],
["Does a saddle-like surface have positive or negative curvature?","Negative","A saddle bends in opposite directions.","<p>A saddle curves up in one direction and down in another.<br>This is negative curvature.<br><b>Negative.</b></p>","E"],
["Do angles of a spherical triangle add to more than 180°?","Yes","Spherical triangle angle sum exceeds the flat-plane sum.","<p>Curvature changes the angle total.<br>A spherical triangle has angle sum greater than 180°.<br><b>Yes.</b></p>","E"],
["A spherical triangle has three 90° angles. Find the total.","270°","Add the three angles.","<p>90°+90°+90°=270°.<br><b>Total = 270°.</b></p>","M"],
["A hyperbolic triangle has angles 50°, 60°, 40°. Find its total.","150°","Add the three stated angles.","<p>50+60+40=150.<br>The result is below 180°, as expected in hyperbolic geometry.<br><b>150°.</b></p>","M"],
["A flat triangle has angles 35° and 85°. Find the third.","60°","Subtract the known angles from 180°.","<p>Third angle=180−35−85.<br>180−120=60.<br><b>60°.</b></p>","M"],
["What feature stays preserved under projective transformations: angle size or collinearity?","Collinearity","Projective transformations preserve incidence relations.","<p>Projective maps can change angle sizes.<br>They preserve points remaining on the same line.<br><b>Collinearity.</b></p>","M"],
["What is the curvature of a flat plane?","Zero","A plane does not bend.","<p>A flat plane has no local bending.<br><b>Curvature = 0.</b></p>","M"],
["Can two great circles on a sphere meet?","Yes","Great circles intersect at opposite points.","<p>Each great circle passes through the sphere's centre.<br>Two distinct great-circle planes intersect in a diameter, giving two surface points.<br><b>Yes.</b></p>","M"],
["A spherical triangle has angles 80°, 70° and 60°. Find the excess over 180°.","30°","Add the angles, then subtract 180°.","<p>Total=80+70+60=210°.<br>Excess=210−180=30°.<br><b>30°.</b></p>","H"],
["A hyperbolic triangle has angles 30°, 45° and 60°. Find the angle deficit from 180°.","45°","Add angles, then subtract their sum from 180°.","<p>Sum=30+45+60=135°.<br>Deficit=180−135=45°.<br><b>45°.</b></p>","H"],
["A flat triangle has angles 2x, 3x and 4x. Find x.","20°","Their sum is 180°.","<p>2x+3x+4x=180, so 9x=180.<br>x=180÷9=20.<br><b>x=20°.</b></p>","H"],
["How many distinct intersection points do two distinct great circles have?","2","Their planes intersect through a diameter.","<p>The planes meet in a line through the sphere's centre.<br>That line meets the sphere at two opposite points.<br><b>2 points.</b></p>","H"],
["A spherical triangle has angles 100°, 80° and 70°. Find its spherical excess.","70°","Spherical excess is angle sum minus 180°.","<p>Angle sum=100+80+70=250°.<br>Excess=250−180=70°.<br><b>Excess=70°.</b></p>","H"],
["A flat quadrilateral has three angles 90°, 80° and 100°. Find the fourth.","90°","A flat quadrilateral's interior angles sum to 360°.","<p>Known sum=90+80+100=270°.<br>Fourth=360−270=90°.<br><b>90°.</b></p>","H"],
["If a projective transformation maps a line, what shape does the line map to (when finite)?","A line","Projective transformations preserve lines and incidence.","<p>Collinearity is preserved by projective maps.<br>So points on one line remain on a line.<br><b>A line.</b></p>","H"],
["A spherical triangle's angles total 225°. Find its excess over a flat triangle.","45°","Subtract the Euclidean total 180°.","<p>Excess=225−180.<br><b>Excess=45°.</b></p>","H"],
["Are great-circle arcs examples of geodesics on a sphere?","Yes","A geodesic is a locally shortest path on a surface.","<p>Great-circle arcs are the sphere's shortest surface paths between nearby points.<br><b>Yes, they are geodesics.</b></p>","H"]
]),
v:[
["Non-Euclidean Geometry Explained","https://www.youtube.com/results?search_query=non+Euclidean+geometry+spherical+hyperbolic+explained"],
["Projective Geometry and Perspective","https://www.youtube.com/results?search_query=projective+geometry+perspective+explained"],
["Differential Geometry Introduction","https://www.youtube.com/results?search_query=differential+geometry+curvature+introduction"]
],
k:[
["Khan Academy: Geometry","https://www.khanacademy.org/math/geometry"],
["Geometry Lessons: Spherical and Hyperbolic","https://www.youtube.com/results?search_query=spherical+hyperbolic+geometry+lessons"]
]};
L[20].q=window.MATH_EXPLANATIONS.fill(20,L[20].q);

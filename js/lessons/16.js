L[15]={
s:[
["Components and vector notation","<p>A <b>vector</b> has size and direction. In coordinates, (a,b) is a 2D vector and (a,b,c) is 3D. Its components tell the amount in each direction. A <b>unit vector</b> has length 1. Example: (3,4) has components 3 and 4.</p>"],
["Magnitude and direction","<p>The <b>magnitude</b> is length: |v|=√(v₁²+…+vₙ²). Direction can be described by an angle or by a unit vector. To make a unit vector, divide by its magnitude. Example: (3,4) has magnitude 5, so its unit vector is (3/5,4/5).</p>"],
["Adding vectors and scalar multiplication","<p>Add vectors component by component. A scalar multiplication stretches, shrinks or reverses a vector. Example: (1,2)+(3,−1)=(4,1); 2(1,2)=(2,4).</p>"],
["Dot product and angles","<p>The <b>dot product</b> multiplies matching components and adds: a·b=Σaᵢbᵢ. Also a·b=|a||b|cos θ. A zero dot product means perpendicular vectors. Example: (1,2)·(2,−1)=2−2=<b>0</b>, so they are perpendicular.</p>"],
["Cross product in three dimensions","<p>The <b>cross product</b> of 3D vectors is perpendicular to both. Its magnitude is |a||b|sin θ. It is defined in 3D and direction follows the right-hand rule. Example: (1,0,0)×(0,1,0)=(0,0,1).</p>"],
["Vector lines and projections","<p>A line through point a in direction d can be written r=a+td. A <b>projection</b> gives the part of one vector along another: projᵦ(a)=((a·b)/(b·b))b when b is non-zero. Example: projecting (3,2) onto (1,0) gives (3,0).</p>"],
["Common mistakes","<ul><li>Add matching components only; do not mix coordinates.</li><li>Magnitude is non-negative and uses the square root of the sum of squares.</li><li>A dot product is a number; a cross product is a vector.</li><li>Zero dot product means perpendicular for non-zero vectors.</li><li>Normalize by dividing every component by the magnitude.</li><li>Cross product order matters: reversing the order reverses direction.</li></ul>"],
["Where this is used in machine learning","<ul><li>Feature rows and model weights are vectors.</li><li>Dot products calculate linear predictions and compare feature similarity.</li><li>Vector norms measure size and appear in regularization.</li><li>Vector directions describe gradients that tell a model how to update its weights.</li></ul>"]
],
e:[
["Find the magnitude and unit vector of (3,4).","<p>Magnitude = √(3²+4²)=√25=5.<br>Divide each component by 5.<br><b>Unit vector = (3/5,4/5).</b></p>"],
["Find (1,2,3)·(4,5,6).","<p>Multiply matching components: 1×4, 2×5 and 3×6.<br>Add: 4+10+18.<br><b>Dot product = 32.</b></p>"],
["Find the cross product (1,0,0)×(0,1,0).","<p>Use the determinant formula for the cross product.<br>The result points in the positive z-direction.<br><b>Cross product = (0,0,1).</b></p>"],
["Find the distance between P=(1,2) and Q=(4,6).","<p>Vector PQ=(4−1,6−2)=(3,4).<br>Distance = √(3²+4²)=√25.<br><b>Distance = 5.</b></p>"],
["Project (3,2) onto (1,0).","<p>a·b=3 and b·b=1.<br>Projection = (3/1)(1,0).<br><b>Projection = (3,0).</b></p>"]
],
q:TOPICS[15][5].concat([
["Find the magnitude of (6,8).","10","Use √(x²+y²).","<p>Magnitude = √(6²+8²).<br>√(36+64)=√100.<br><b>Magnitude = 10.</b></p>","E"],
["Add (1,2) and (3,4).","(4,6)","Add matching components.","<p>Add x-components: 1+3=4.<br>Add y-components: 2+4=6.<br><b>(4,6).</b></p>","E"],
["Multiply (2,−1) by 3.","(6,−3)","Multiply each component by 3.","<p>3×2=6 and 3×(−1)=−3.<br><b>Result = (6,−3).</b></p>","E"],
["Find (1,2)·(3,4).","11","Multiply corresponding components and add.","<p>Dot product = 1×3 + 2×4.<br>3+8=11.<br><b>Answer = 11.</b></p>","E"],
["Find the length of (5,12).","13","Use the Pythagorean length formula.","<p>Length = √(5²+12²).<br>√(25+144)=√169.<br><b>Length = 13.</b></p>","E"],
["What is the zero vector in 2D?","(0,0)","Every component is zero.","<p>The zero vector has no movement in either coordinate direction.<br><b>(0,0).</b></p>","E"],
["Are (1,0) and (0,1) perpendicular?","Yes","Their dot product is zero.","<p>(1,0)·(0,1)=1×0+0×1=0.<br>A zero dot product means perpendicular.<br><b>Yes.</b></p>","E"],
["Find (4,1)−(2,3).","(2,−2)","Subtract matching components.","<p>x-component: 4−2=2.<br>y-component: 1−3=−2.<br><b>(2,−2).</b></p>","E"],
["Find the magnitude of (1,2,2).","3","Square components, add, then take the square root.","<p>|v|=√(1²+2²+2²).<br>√(1+4+4)=√9.<br><b>Magnitude = 3.</b></p>","M"],
["Find (2,−1,3)·(1,4,2).","4","Multiply matching coordinates and add.","<p>2×1 + (−1)×4 + 3×2 = 2−4+6.<br>2−4+6=4.<br><b>Dot product = 4.</b></p>","M"],
["Find a unit vector in the direction of (0,5).","(0,1)","Divide the vector by its length.","<p>Length of (0,5) is 5.<br>(0/5,5/5)=(0,1).<br><b>Unit vector = (0,1).</b></p>","M"],
["Find the angle between (1,0) and (1,1).","45°","Use cos θ=(a·b)/(|a||b|).","<p>Dot product =1; lengths are 1 and √2.<br>cos θ=1/√2, whose acute angle is 45°.<br><b>θ=45°.</b></p>","M"],
["Find (1,2,0)×(0,1,0).","(0,0,1)","Use the 3D cross-product determinant.","<p>Compute components: (2×0−0×1, 0×0−1×0, 1×1−2×0).<br>This gives (0,0,1).<br><b>Cross product = (0,0,1).</b></p>","M"],
["Find the distance between (−1,2) and (2,6).","5","Subtract coordinates to get the displacement, then find its magnitude.","<p>Displacement=(3,4).<br>Distance=√(3²+4²)=√25.<br><b>Distance = 5.</b></p>","M"],
["Find the projection of (4,3) onto (1,0).","(4,0)","Use ((a·b)/(b·b))b.","<p>a·b=4 and b·b=1.<br>Multiply 4 by (1,0).<br><b>Projection=(4,0).</b></p>","H"],
["Find the angle between (1,1) and (1,−1).","90°","A zero dot product shows perpendicularity.","<p>Dot product = 1×1+1×(−1)=0.<br>Both vectors are non-zero, so the angle is a right angle.<br><b>90°.</b></p>","H"],
["Find the magnitude of the cross product of (1,0,0) and (0,0,2).","2","The cross product is perpendicular with magnitude |a||b|sin θ.","<p>The vectors are perpendicular, so sin θ=1.<br>Lengths are 1 and 2; magnitude =1×2×1.<br><b>Magnitude = 2.</b></p>","H"],
["For a=(2,1) and b=(1,3), find a·b and state if the angle is acute or obtuse.","5; acute","A positive dot product means the angle is acute.","<p>a·b=2×1+1×3=5, which is positive.<br>A positive dot product gives an acute angle.<br><b>Dot product 5; acute.</b></p>","H"],
["Find the unit vector in the direction of (3,4).","(3/5,4/5)","Length is 5; divide both coordinates by 5.","<p>Length=√(3²+4²)=5.<br>Divide each component by 5.<br><b>(3/5,4/5).</b></p>","H"],
["Find the scalar projection of (3,4) onto (0,2).","4","Scalar projection is (a·b)/|b|.","<p>a·b=3×0+4×2=8 and |b|=2.<br>8÷2=4.<br><b>Scalar projection = 4.</b></p>","H"],
["If v=(1,−2) and w=(4,3), find 2v−w.","(−2,−7)","Scale v first, then subtract component by component.","<p>2v=(2,−4).<br>(2,−4)−(4,3)=(−2,−7).<br><b>Answer = (−2,−7).</b></p>","H"],
["Find (2,0,0)×(0,3,0).","(0,0,6)","The cross product points along z; magnitude is product of perpendicular lengths.","<p>The vectors are perpendicular and lengths 2 and 3.<br>Right-hand direction is positive z; magnitude=6.<br><b>(0,0,6).</b></p>","H"]
]),
v:[
["3Blue1Brown: Vectors","https://www.youtube.com/@3blue1brown"],
["Khan Academy: Vectors","https://www.youtube.com/results?search_query=Khan+Academy+vectors"],
["Vector Dot and Cross Products","https://www.youtube.com/results?search_query=vector+dot+cross+product+explained"]
],
k:[
["Khan Academy: Linear Algebra","https://www.khanacademy.org/math/linear-algebra"],
["Interactive Linear Algebra","https://textbooks.math.gatech.edu/ila/"]
]};
L[15].q=window.MATH_EXPLANATIONS.fill(15,L[15].q);

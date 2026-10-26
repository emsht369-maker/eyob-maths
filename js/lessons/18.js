L[17]={
s:[
["Translations","<p>A <b>translation</b> slides every point by the same vector. A point (x,y) translated by (a,b) becomes (x+a,y+b). Shape, size and orientation stay the same. Example: translating (2,1) by (3,−2) gives <b>(5,−1)</b>.</p>"],
["Rotations","<p>A <b>rotation</b> turns a shape around a fixed centre by an angle. A 90° anticlockwise turn about the origin sends (x,y) to (−y,x); a 180° turn sends it to (−x,−y). Example: (2,1) turns 90° anticlockwise to <b>(−1,2)</b>.</p>"],
["Reflections","<p>A <b>reflection</b> flips a point across a line. Across the x-axis, (x,y) becomes (x,−y); across the y-axis, it becomes (−x,y); across y=x, swap coordinates. Example: reflect (3,2) across y=x to get <b>(2,3)</b>.</p>"],
["Enlargements and scale factors","<p>An <b>enlargement</b> changes size around a centre. From the origin, multiply coordinates by the scale factor k. If k is negative, the image is on the opposite side of the centre. Example: scale (2,3) by 2 to get <b>(4,6)</b>.</p>"],
["Stretches and shears","<p>A <b>stretch</b> changes one direction more than another. A horizontal scale k sends (x,y) to (kx,y); a vertical scale sends it to (x,ky). A <b>shear</b> slants a shape, for example (x,y)→(x+y,y). Example: a horizontal stretch by 3 sends (2,4) to <b>(6,4)</b>.</p>"],
["Transformation matrices","<p>A matrix can transform coordinates. For a column vector, a 90° anticlockwise rotation uses [[0,−1],[1,0]]; reflection in the x-axis uses [[1,0],[0,−1]]. Multiply the matrix by the coordinate column. Example: [[0,−1],[1,0]](2,1)ᵀ = <b>(−1,2)ᵀ</b>.</p>"],
["Common mistakes","<ul><li>State the centre and direction of a rotation; clockwise and anticlockwise differ.</li><li>A reflection changes position but preserves size.</li><li>Apply translations to both coordinates with their signs.</li><li>For a negative enlargement, include the direction reversal.</li><li>Check the order of coordinates when multiplying a matrix.</li><li>Do not confuse a stretch, which scales, with a shear, which slants.</li></ul>"],
["Where this is used in machine learning","<ul><li>Image augmentation rotates, flips or scales training images.</li><li>Computer vision uses transformations to track objects in different positions.</li><li>Matrix transformations change feature coordinates in a model.</li><li>Equivariance describes models that respond consistently when inputs are transformed.</li></ul>"]
],
e:[
["Translate (2,−1) by (3,4).","<p>Add the translation vector to the point.<br>(2+3,−1+4)=(5,3).<br><b>Image point = (5,3).</b></p>"],
["Rotate (3,1) 90° anticlockwise about the origin.","<p>Use (x,y)→(−y,x).<br>(3,1) becomes (−1,3).<br><b>Image point = (−1,3).</b></p>"],
["Reflect (−2,5) in the y-axis.","<p>A y-axis reflection changes x to −x and keeps y.<br>(−2,5) becomes (2,5).<br><b>Image point = (2,5).</b></p>"],
["Enlarge (−1,3) by scale factor 2 from the origin.","<p>Multiply both coordinates by 2.<br>(−1×2,3×2)=(−2,6).<br><b>Image point = (−2,6).</b></p>"],
["Apply the horizontal shear (x,y)→(x+y,y) to (2,3).","<p>Replace x with x+y and keep y.<br>(2+3,3)=(5,3).<br><b>Image point = (5,3).</b></p>"]
],
q:TOPICS[17][5].concat([
["Translate (1,2) by (3,1).","(4,3)","Add the matching coordinates.","<p>Add vectors coordinate by coordinate.<br>(1+3,2+1)=(4,3).<br><b>(4,3).</b></p>","E"],
["Reflect (3,2) in the x-axis.","(3,−2)","Keep x and reverse the sign of y.","<p>An x-axis reflection sends (x,y) to (x,−y).<br>(3,2) becomes <b>(3,−2)</b>.</p>","E"],
["Reflect (−1,4) in the y-axis.","(1,4)","Reverse x and keep y.","<p>A y-axis reflection sends (x,y) to (−x,y).<br>(−1,4) becomes <b>(1,4)</b>.</p>","E"],
["Rotate (1,0) 90° anticlockwise about the origin.","(0,1)","Use (x,y)→(−y,x).","<p>Apply the quarter-turn rule.<br>(1,0) becomes (−0,1).<br><b>(0,1).</b></p>","E"],
["Enlarge (2,3) by scale factor 2 from the origin.","(4,6)","Multiply both coordinates by 2.","<p>Apply the same scale to x and y.<br>(2×2,3×2)=(4,6).<br><b>(4,6).</b></p>","E"],
["Stretch (2,5) horizontally by factor 3.","(6,5)","Multiply x by 3; leave y unchanged.","<p>A horizontal stretch changes the x-coordinate only.<br>(2×3,5)=(6,5).<br><b>(6,5).</b></p>","E"],
["Apply the shear (x,y)→(x+y,y) to (1,2).","(3,2)","Add y to x and keep y.","<p>New x=1+2=3; new y=2.<br><b>Image point=(3,2).</b></p>","E"],
["What does a translation do to the size of a shape?","It keeps the same size.","A translation moves every point by the same vector.","<p>A translation slides, without scaling or turning the shape.<br>Distances stay unchanged.<br><b>Size is preserved.</b></p>","E"],
["Rotate (2,−1) 180° about the origin.","(−2,1)","Use (x,y)→(−x,−y).","<p>A half-turn reverses both coordinates.<br>(2,−1) becomes <b>(−2,1)</b>.</p>","M"],
["Translate (−2,4) by (5,−3).","(3,1)","Add each vector component.","<p>x: −2+5=3; y: 4−3=1.<br><b>(3,1).</b></p>","M"],
["Reflect (4,1) in the line y=x.","(1,4)","Swap x and y.","<p>Reflection in y=x swaps coordinates.<br>(4,1) becomes <b>(1,4)</b>.</p>","M"],
["Enlarge (3,−2) by factor −2 from the origin.","(−6,4)","Multiply both coordinates by −2.","<p>x image=3×(−2)=−6; y image=−2×(−2)=4.<br><b>(−6,4).</b></p>","M"],
["Apply the matrix [[0,−1],[1,0]] to (2,3).","(−3,2)","Multiply rows by the coordinate column.","<p>First coordinate=0×2−1×3=−3.<br>Second=1×2+0×3=2.<br><b>(−3,2).</b></p>","M"],
["A point (4,2) is rotated 90° clockwise. Find its image.","(2,−4)","Clockwise rule is (x,y)→(y,−x).","<p>Use (x,y)→(y,−x).<br>(4,2) becomes <b>(2,−4)</b>.</p>","M"],
["What is the determinant of a 2D rotation matrix?","1","Rotations preserve area and have determinant 1.","<p>A rotation preserves orientation and area.<br>Its transformation matrix has determinant 1.<br><b>Determinant = 1.</b></p>","H"],
["Apply reflection matrix [[1,0],[0,−1]] to (−3,2).","(−3,−2)","Multiply the matrix by the coordinate column.","<p>First coordinate remains −3.<br>Second coordinate is −2.<br><b>(−3,−2).</b></p>","H"],
["Enlarge (1,−2) by factor 3 from centre (2,1).","(−1,−8)","Image = centre + 3×(point−centre).","<p>Vector from centre to point is (1−2,−2−1)=(−1,−3).<br>Scale to (−3,−9), then add centre (2,1).<br><b>Image=(−1,−8).</b></p>","H"],
["Apply the vertical stretch by factor 1/2 to (6,8).","(6,4)","Keep x and multiply y by 1/2.","<p>x stays 6; y becomes 8×1/2=4.<br><b>(6,4).</b></p>","H"],
["If a reflection has matrix [[−1,0],[0,1]], what line is it across?","The y-axis","It reverses x and keeps y.","<p>The matrix sends (x,y) to (−x,y).<br>This is the rule for reflecting across the y-axis.<br><b>Line: y-axis.</b></p>","H"],
["Rotate (−2,3) 90° anticlockwise. Find the image.","(−3,−2)","Use (x,y)→(−y,x).","<p>Substitute x=−2 and y=3.<br>(−y,x)=(−3,−2).<br><b>(−3,−2).</b></p>","H"],
["Find the image of (1,4) under (x,y)→(x−2,y+3).","(−1,7)","Apply the stated change to each coordinate.","<p>x becomes 1−2=−1.<br>y becomes 4+3=7.<br><b>(−1,7).</b></p>","H"],
["Does a scale factor −1 enlargement from the origin equal a 180° rotation?","Yes","Both send (x,y) to (−x,−y).","<p>Scale by −1 gives (−x,−y).<br>A 180° origin rotation gives the same coordinates.<br><b>Yes, the transformations match.</b></p>","H"],
["Translate (5,−2) by (−3,4).","(2,2)","Add the translation vector coordinate by coordinate.","<p>x: 5−3=2; y: −2+4=2.<br><b>Image point=(2,2).</b></p>","H"]
]),
v:[
["Transformations of Shapes Explained","https://www.youtube.com/results?search_query=transformations+of+shapes+explained"],
["Matrix Transformations","https://www.youtube.com/results?search_query=matrix+transformations+geometry"],
["Khan Academy: Transformations","https://www.youtube.com/results?search_query=Khan+Academy+transformations+geometry"]
],
k:[
["Khan Academy: Transformations","https://www.khanacademy.org/math/geometry"],
["GeoGebra","https://www.geogebra.org/geometry"]
]};
L[17].q=window.MATH_EXPLANATIONS.fill(17,L[17].q);

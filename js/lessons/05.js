L[4]={
s:[
["Angles and line pairs","<p>An <b>angle</b> measures a turn. A straight line makes 180°. <b>Parallel</b> lines never meet; when a crossing line cuts them, matching angles are equal. <b>Perpendicular</b> lines meet at 90°. Example: if one angle on a straight line is 118°, the next is 180° − 118° = <b>62°</b>.</p>"],
["Triangles, quadrilaterals and polygons","<p>A <b>triangle</b> has three sides and its angles total 180°; for example, angles 50°, 60° and 70° total 180°. A <b>quadrilateral</b> has four sides and its angles total 360°; a rectangle has four right angles. A <b>polygon</b> is a closed shape with straight sides. For an n-sided polygon, the interior-angle total is (n − 2) × 180°; a pentagon totals 540°.</p>"],
["Parts of a circle","<p>A <b>chord</b> joins two points on a circle; a diameter is a chord through the centre. An <b>arc</b> is part of the circle's edge. A <b>sector</b> is the slice between two radii and an arc. A <b>tangent</b> touches a circle once and is at right angles to the radius there. Example: a 90° sector is one quarter of its circle.</p>"],
["Symmetry, congruence and similarity","<p><b>Symmetry</b> means a shape matches itself after a flip or turn. A square has four lines of reflection symmetry. <b>Congruent</b> shapes have the same shape and size; matching triangles have equal corresponding sides and angles. <b>Similar</b> shapes have the same angles and proportional sides; if every side doubles, the scale factor is 2.</p>"],
["Pythagoras' theorem","<p>For a right-angled triangle, the two shorter sides are a and b and the hypotenuse c is opposite the right angle. The rule is <b>a² + b² = c²</b>. It works because the square areas on the two short sides add to the square area on the longest side. Example: legs 3 and 4 give c = √(9 + 16) = <b>5</b>.</p>"],
["Perimeter, area, surface area and volume","<p><b>Perimeter</b> is distance around a flat shape; a 4 by 3 rectangle has perimeter 14. <b>Area</b> is space inside a flat shape; that rectangle has area 12 square units. A circle has area πr² and circumference 2πr; with radius 2 its area is 4π. <b>Surface area</b> is the total area of a solid's outside faces; a cube of side 2 has surface area 24. <b>Volume</b> is space inside a solid; a 2 by 3 by 4 box has volume 24 cubic units.</p>"],
["Common mistakes","<ul><li>Use Pythagoras only when the triangle has a right angle.</li><li>The hypotenuse is opposite the right angle and is always the longest side.</li><li>Area uses square units; volume uses cubic units.</li><li>Do not confuse a circle's radius with its diameter: diameter is twice the radius.</li><li>Similar shapes have the same angles, but their side lengths can differ.</li><li>Check whether a question asks for perimeter, area, surface area or volume before choosing a rule.</li></ul>"],
["Where this is used in machine learning","<ul><li>Distance formulas compare how close two data points are.</li><li>Geometric regions help explain how a classifier divides data into groups.</li><li>Angles and vectors help measure the direction or similarity of data.</li><li>Symmetry can reduce repeated work when a model sees rotated or reflected images.</li></ul>"]
],
e:[
["Find the missing angle on a straight line when the other angle is 118°","<p>A straight line totals 180°.<br>Subtract the angle we know: 180° − 118° = 62°.<br><b>The missing angle is 62°.</b></p>"],
["A triangle has angles 48° and 67°. Find its third angle.","<p>Triangle angles total 180°.<br>Add the known angles: 48° + 67° = 115°.<br>Subtract: 180° − 115° = <b>65°</b>.</p>"],
["Find the area of a trapezium with parallel sides 6 cm and 10 cm and height 4 cm.","<p>Use area = (sum of parallel sides × height) ÷ 2.<br>Substitute: (6 + 10) × 4 ÷ 2.<br>Calculate: 16 × 4 ÷ 2 = 32.<br><b>Area = 32 cm².</b></p>"],
["A circle has radius 5 cm. Find its circumference in terms of π.","<p>Use circumference = 2πr.<br>Substitute r = 5: 2 × π × 5.<br><b>Circumference = 10π cm.</b></p>"],
["A right triangle has shorter sides 9 cm and 12 cm. Find its hypotenuse.","<p>Use Pythagoras because the triangle is right-angled.<br>c² = 9² + 12² = 81 + 144 = 225.<br>Take the positive square root: c = √225 = <b>15 cm</b>.</p>"]
],
q:TOPICS[4][5].concat([
["Find the perimeter of a 5 cm by 3 cm rectangle.","16 cm","Perimeter is 2(length+width).","<p>Perimeter=2(5+3).<br>2×8=16.<br><b>Answer: 16 cm.</b></p>","E"],
["A triangle has angles 45° and 65°. Find the third angle.","70°","Triangle angles total 180°.","<p>Known sum=45+65=110°.<br>180−110=70°.<br><b>Third angle=70°.</b></p>","E"],
["Find the area of a 7 cm by 4 cm rectangle.","28 cm²","Area=length×width.","<p>Area=7×4.<br><b>Area=28 cm².</b></p>","E"],
["Find the circumference of a circle with radius 4 cm.","8π cm","Use C=2πr.","<p>C=2π×4.<br><b>C=8π cm.</b></p>","E"],
["A right triangle has legs 5 and 12. Find its hypotenuse.","13","Use a²+b²=c².","<p>c²=25+144=169.<br>c=√169.<br><b>c=13.</b></p>","E"],
["How many lines of symmetry does a square have?","4","Count its two diagonal and two midline symmetries.","<p>A square reflects onto itself across two diagonals and two lines through side midpoints.<br><b>4 lines.</b></p>","E"],
["Find the volume of a cuboid measuring 2×3×4.","24 cubic units","Volume=length×width×height.","<p>V=2×3×4.<br><b>V=24 cubic units.</b></p>","E"],
["Find the area of a trapezium with parallel sides 8 and 14 and height 5.","55 square units","Area=(sum of parallel sides)×height÷2.","<p>A=(8+14)×5÷2.<br>22×5÷2=55.<br><b>Area=55.</b></p>","M"],
["A right triangle has hypotenuse 13 and one leg 5. Find the other leg.","12","Rearrange Pythagoras: other²=13²−5².","<p>Other²=169−25=144.<br>√144=12.<br><b>Other leg=12.</b></p>","M"],
["A cube has side 3 cm. Find its total surface area.","54 cm²","A cube has 6 square faces.","<p>One face area=3²=9 cm².<br>Total=6×9.<br><b>Surface area=54 cm².</b></p>","M"],
["Find the interior-angle sum of a 7-sided polygon.","900°","Use (n−2)×180°.","<p>Sum=(7−2)×180°.<br>5×180°=900°.<br><b>900°.</b></p>","M"],
["Similar shapes have scale factor 3. By what factor does area change?","9","Area scale factor is the square of the length scale factor.","<p>Area factor=3².<br><b>Area is multiplied by 9.</b></p>","M"],
["A sector has radius 6 and angle 60°. Find its area.","6π","Sector area=(angle/360°)πr².","<p>Area=(60/360)π×36.<br>(1/6)×36π.<br><b>Area=6π.</b></p>","H"],
["Find the volume of a cylinder with radius 2 and height 5.","20π","Use V=πr²h.","<p>V=π×2²×5.<br>π×4×5.<br><b>V=20π.</b></p>","H"],
["A circle has circumference 12π. Find its area.","36π","Use 2πr=12π to find r, then πr².","<p>2πr=12π gives r=6.<br>Area=π×6².<br><b>Area=36π.</b></p>","H"],
["A triangle has exterior angle 130° and one opposite interior angle 55°. Find the other opposite angle.","75°","An exterior angle equals the sum of the two opposite interior angles.","<p>130°=55°+x.<br>x=130−55.<br><b>x=75°.</b></p>","H"],
["Find the arc length of a 90° sector with radius 4.","2π","Arc length is the same fraction of circumference as the angle is of 360°.","<p>Full circumference=2π×4=8π.<br>Quarter-circle arc=8π/4.<br><b>Arc length=2π.</b></p>","H"],
["A solid is enlarged by scale factor 3. By what factor does volume change?","27","Volume scale factor is the cube of the length scale factor.","<p>Volume factor=3³.<br><b>Volume is multiplied by 27.</b></p>","H"],
["A circle has radius 5. The perpendicular distance from its centre to a chord is 3. Find the chord length.","8","The perpendicular from the centre bisects a chord; use Pythagoras.","<p>Half-chord²=5²−3²=25−9=16.<br>Half-chord=4, so full chord=8.<br><b>Chord=8.</b></p>","H"],
["Find the perimeter of a semicircle with radius 3.","3π+6","Add half the circumference and the diameter.","<p>Half circumference=πr=3π.<br>Diameter=2r=6.<br><b>Perimeter=3π+6.</b></p>","H"],
["A triangular prism has cross-section area 12 and length 7. Find its volume.","84 cubic units","Prism volume=cross-section area×length.","<p>V=12×7.<br><b>V=84 cubic units.</b></p>","H"],
["A cone has radius 3 and height 4. Find its volume.","12π","Use V=πr²h/3.","<p>V=π×3²×4/3.<br>π×9×4/3=12π.<br><b>V=12π.</b></p>","H"],
["Find each interior angle of a regular octagon.","135°","Each angle is (n−2)×180°÷n.","<p>Sum=(8−2)×180°=1080°.<br>Each=1080°÷8=135°.<br><b>135°.</b></p>","H"]
]),
v:[
["Math Antics: Geometry","https://www.youtube.com/@mathantics"],
["The Organic Chemistry Tutor: Geometry","https://www.youtube.com/@TheOrganicChemistryTutor"],
["Professor Leonard: Geometry","https://www.youtube.com/@ProfessorLeonard"]
],
k:[
["Khan Academy: Geometry","https://www.khanacademy.org/math/geometry"],
["GeoGebra","https://www.geogebra.org"]
]};
L[4].q=window.MATH_EXPLANATIONS.fill(4,L[4].q);

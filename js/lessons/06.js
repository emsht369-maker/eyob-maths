L[5]={
s:[
["Sine, cosine, tangent and SOH-CAH-TOA","<p>In a right triangle, choose an angle θ. The <b>opposite</b> side is across from it, the <b>adjacent</b> side touches it, and the <b>hypotenuse</b> is across from the right angle. The ratios are sin θ = opposite ÷ hypotenuse, cos θ = adjacent ÷ hypotenuse, and tan θ = opposite ÷ adjacent. <b>SOH-CAH-TOA</b> helps remember them. Example: opposite 3 and hypotenuse 5 gives sin θ = 3/5 = <b>0.6</b>.</p>"],
["Sine rule and cosine rule","<p>The <b>sine rule</b> links each side to its opposite angle: a/sin A = b/sin B = c/sin C. The <b>cosine rule</b> works when you know two sides and their included angle: c² = a² + b² − 2ab cos C. Example: sides 5 and 7 with included angle 60° give c² = 25 + 49 − 70 × 0.5 = 39, so c = <b>√39</b>.</p>"],
["A key trigonometric identity","<p>An <b>identity</b> is a rule that is true for every allowed angle. The basic identity is <b>sin² θ + cos² θ = 1</b>. It comes from the unit circle, where the coordinates are cos θ and sin θ and x² + y² = 1. Example: if sin θ = 3/5 and θ is acute, cos θ = 4/5 because 9/25 + 16/25 = 1.</p>"],
["Radians and the unit circle","<p>A <b>radian</b> measures an angle by comparing arc length with radius. A full turn is 2π radians, which is 360°; therefore π radians is 180°. On the <b>unit circle</b>, a point at angle θ has coordinates (cos θ, sin θ). Example: 150° = 150π/180 = <b>5π/6</b>; its unit-circle point is (−√3/2, 1/2).</p>"],
["Trigonometric graphs","<p>The graphs of sin x and cos x repeat every 360° (2π radians), and their values stay between −1 and 1. The graph of tan x repeats every 180° (π radians) and is undefined where cos x = 0. These repeating graphs model waves. Example: sin 90° = <b>1</b>, the highest value of the sine graph.</p>"],
["Inverse trigonometric functions","<p>Inverse functions work backwards: sin⁻¹ (also written arcsin) finds an angle from its sine; cos⁻¹ and tan⁻¹ do the same for cosine and tangent. A calculator's angle mode must match the question. Example: sin⁻¹(0.5) = <b>30°</b> when using degrees.</p>"],
["Common mistakes","<ul><li>First check which sides are opposite, adjacent and hypotenuse for the chosen angle.</li><li>Do not use right-triangle SOH-CAH-TOA for a triangle without a right angle.</li><li>In the sine rule, pair each side with its opposite angle.</li><li>In the cosine rule, use the angle between the two known sides.</li><li>Check whether the angle is in degrees or radians before calculating.</li><li>Inverse sine can have more than one solution over a full turn; use the question's stated range.</li></ul>"],
["Where this is used in machine learning","<ul><li>Trigonometric functions model repeating signals such as sound and sensor data.</li><li>Angles compare directions of vectors, including word or image representations.</li><li>Sine and cosine features help models represent periodic dates and cycles.</li><li>Geometry with angles supports computer vision and 3D position calculations.</li></ul>"]
],
e:[
["A right triangle has opposite side 3 and hypotenuse 5. Find sin θ and θ to 1 decimal place.","<p>Use SOH: sin θ = opposite ÷ hypotenuse.<br>Substitute: sin θ = 3 ÷ 5 = 0.6.<br>Use the inverse sine: θ = sin⁻¹(0.6).<br><b>sin θ = 0.6 and θ ≈ 36.9°.</b></p>"],
["Two sides are 5 cm and 7 cm with included angle 60°. Find the third side.","<p>Use the cosine rule because two sides and their included angle are known.<br>c² = 5² + 7² − 2 × 5 × 7 × cos 60°.<br>cos 60° = 0.5, so c² = 25 + 49 − 35 = 39.<br><b>c = √39 cm ≈ 6.245 cm.</b></p>"],
["In a triangle, side a = 5 cm is opposite 30°. Side b = 10 cm is opposite angle B. Find B.","<p>Use the sine rule: sin B ÷ 10 = sin 30° ÷ 5.<br>sin B = 10 × 0.5 ÷ 5 = 1.<br>The angle from 0° to 180° with sine 1 is 90°.<br><b>B = 90°.</b></p>"],
["Convert 150° to radians and give the unit-circle coordinates.","<p>Multiply degrees by π/180: 150 × π/180 = 5π/6.<br>At 150°, the reference angle is 30° and the point is in quadrant II.<br>Cosine is negative and sine is positive there.<br><b>Angle = 5π/6; coordinates = (−√3/2, 1/2).</b></p>"],
["A right triangle has an acute angle of 45° and adjacent side 5 cm. Find the opposite side.","<p>Use TOA: tan 45° = opposite ÷ adjacent.<br>tan 45° = 1, so 1 = opposite ÷ 5.<br>Multiply by 5.<br><b>The opposite side is 5 cm.</b></p>"]
],
q:TOPICS[5][5].concat([
["Find sin 30°.","0.5","Use the exact special-angle value.","<p>On the unit circle, sin 30°=1/2.<br><b>Answer=0.5.</b></p>","E"],
["Find cos 60°.","0.5","Use the exact special-angle value.","<p>cos 60°=1/2.<br><b>Answer=0.5.</b></p>","E"],
["Find tan 45°.","1","tan θ=opposite/adjacent.","<p>At 45°, opposite and adjacent legs are equal.<br>tan 45°=1.<br><b>Answer=1.</b></p>","E"],
["Convert 180° to radians.","π","Multiply degrees by π/180.","<p>180×π/180=π.<br><b>180°=π radians.</b></p>","E"],
["Simplify sin²x+cos²x.","1","Use the fundamental trigonometric identity.","<p>The identity holds for every angle x.<br><b>sin²x+cos²x=1.</b></p>","E"],
["If opposite=3 and hypotenuse=5, find sin θ.","3/5","Use SOH.","<p>sin θ=opposite/hypotenuse.<br>3/5.<br><b>sin θ=3/5.</b></p>","E"],
["Convert 90° to radians.","π/2","Multiply degrees by π/180.","<p>90×π/180=π/2.<br><b>90°=π/2.</b></p>","E"],
["A right triangle has opposite 5 and adjacent 12. Find tan θ.","5/12","Use TOA.","<p>tan θ=opposite/adjacent.<br><b>tan θ=5/12.</b></p>","M"],
["A right triangle has hypotenuse 10 and angle 30°. Find the opposite side.","5","Use sin 30°=opposite/10.","<p>Opposite=10×sin30°.<br>10×1/2=5.<br><b>Opposite=5.</b></p>","M"],
["Convert 5π/6 radians to degrees.","150°","Multiply radians by 180/π.","<p>(5π/6)×180/π=5×30.<br><b>150°.</b></p>","M"],
["If sin θ=3/5 and θ is acute, find cos θ.","4/5","Use sin²θ+cos²θ=1 and choose the positive root.","<p>cos²θ=1−9/25=16/25.<br>Acute θ has positive cosine.<br><b>cos θ=4/5.</b></p>","M"],
["Find the area of a triangle with sides 8 and 5 and included angle 30°.","10","Use area=ab sin C/2.","<p>Area=(1/2)×8×5×sin30°.<br>20×1/2=10.<br><b>Area=10.</b></p>","M"],
["Solve 2cos θ=1 for 0°≤θ<360°.","60°, 300°","Cosine is 1/2 in quadrants I and IV.","<p>cos θ=1/2.<br>The reference angle is 60°; cosine is positive in I and IV.<br><b>θ=60°,300°.</b></p>","H"],
["Use the cosine rule for sides 5 and 7 with included angle 60°. Find the opposite side.","√39","Use c²=a²+b²−2ab cos C.","<p>c²=25+49−70×1/2=39.<br><b>c=√39.</b></p>","H"],
["In a triangle, a=6 opposite 30°, and b=12 opposite B. Find B.","90°","Use the sine rule.","<p>sin B/12=sin30°/6, so sin B=1.<br>The angle with sine 1 is 90°.<br><b>B=90°.</b></p>","H"],
["Find the exact value of sin 150°.","1/2","150° is in quadrant II with reference angle 30°.","<p>Sine is positive in quadrant II.<br>sin150°=sin30°.<br><b>sin150°=1/2.</b></p>","H"],
["Solve sin θ=0 for 0°≤θ<360°.","0°, 180°","Sine is zero on the horizontal axis of the unit circle.","<p>Within one full turn, the x-axis angles are 0° and 180°.<br><b>θ=0°,180°.</b></p>","H"],
["Find tan θ if sin θ=5/13 and θ is acute.","5/12","Use a right triangle and Pythagoras to find adjacent.","<p>Opposite=5, hypotenuse=13; adjacent=√(169−25)=12.<br>tan θ=5/12.<br><b>Answer=5/12.</b></p>","H"],
["A triangle has sides 7 and 8 with included angle 60°. Find its area.","14√3","Use area=ab sin C/2.","<p>Area=(1/2)×7×8×sin60°.<br>28×√3/2.<br><b>Area=14√3.</b></p>","H"],
["Convert 2 radians to degrees to 1 decimal place.","114.6°","Multiply by 180/π.","<p>2×180/π≈114.5916°.<br>Round to one decimal place.<br><b>114.6°.</b></p>","H"],
["Find cos 210°.","−√3/2","210° is in quadrant III with reference angle 30°.","<p>Cosine is negative in quadrant III.<br>|cos210°|=cos30°=√3/2.<br><b>cos210°=−√3/2.</b></p>","H"],
["Solve tan θ=1 for 0°≤θ<360°.","45°, 225°","Tangent is positive in quadrants I and III.","<p>Reference angle is 45°.<br>Tangent is positive in I and III.<br><b>θ=45°,225°.</b></p>","H"]
]),
v:[
["Professor Leonard: Trigonometry","https://www.youtube.com/@ProfessorLeonard"],
["The Organic Chemistry Tutor: Trigonometry","https://www.youtube.com/@TheOrganicChemistryTutor"],
["PatrickJMT: Trigonometry","https://www.youtube.com/@patrickjmt"]
],
k:[
["Khan Academy: Trigonometry","https://www.khanacademy.org/math/trigonometry"],
["GeoGebra Calculator Suite","https://www.geogebra.org/calculator"]
]};
L[5].q=window.MATH_EXPLANATIONS.fill(5,L[5].q);

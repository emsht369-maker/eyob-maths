L[14]={
s:[
["The imaginary unit and a+bi","<p>The imaginary unit <b>i</b> is defined by i²=−1. A complex number is a+bi, where a is its real part and b is its imaginary part. Example: 3−2i has real part 3 and imaginary part −2. Real numbers are complex numbers with b=0.</p>"],
["Adding and multiplying complex numbers","<p>Add real parts and imaginary parts separately. Multiply like brackets, then replace i² by −1. Example: (2+i)(3+i)=6+5i+i²=<b>5+5i</b>.</p>"],
["Complex plane and conjugates","<p>The <b>complex plane</b> places a+bi at point (a,b): real part on the horizontal axis and imaginary part on the vertical. The conjugate of a+bi is a−bi. Multiplying by the conjugate gives a real number: (a+bi)(a−bi)=a²+b². Example: conjugate of 3+4i is <b>3−4i</b>.</p>"],
["Modulus and argument","<p>The <b>modulus</b> is distance from zero: |a+bi|=√(a²+b²). The <b>argument</b> is its angle from the positive real axis. Choose the angle's quadrant from the signs of a and b. Example: |3+4i|=√(9+16)=<b>5</b>.</p>"],
["Polar form and Euler's formula","<p>Polar form writes z=r(cos θ+i sin θ), where r=|z| and θ is its argument. Euler's formula says eⁱθ=cos θ+i sin θ, so z=reⁱθ. Multiplying complex numbers multiplies their moduli and adds their angles. Example: 2eⁱ⁰ × 3eⁱπ/2 = <b>6eⁱπ/2</b>.</p>"],
["Powers and roots","<p>De Moivre's rule is (r(cos θ+i sin θ))ⁿ=rⁿ(cos nθ+i sin nθ). An nth root has modulus r¹/ⁿ and angles spaced evenly around a circle. Example: the square roots of 1 are 1 and −1 because each squares to 1.</p>"],
["Common mistakes","<ul><li>Use i²=−1 when multiplying; do not leave i² in the final simplified form.</li><li>The imaginary part is the coefficient of i, not the full term bi.</li><li>Use the signs of both coordinates to select the correct argument quadrant.</li><li>The conjugate changes the sign of the imaginary part only.</li><li>Angles in polar form can differ by full turns of 2π.</li><li>Complex numbers do not have a usual greater-than ordering.</li></ul>"],
["Where this is used in machine learning","<ul><li>Complex numbers represent amplitude and phase in signal processing.</li><li>Fourier transforms use complex values to analyse sound, images and repeating patterns.</li><li>Complex arithmetic can simplify calculations with waves and rotations.</li><li>Some scientific machine-learning models use complex-valued data and parameters.</li></ul>"]
],
e:[
["Simplify (2+3i)+(1−i).","<p>Add real parts: 2+1=3.<br>Add imaginary coefficients: 3−1=2.<br><b>Sum = 3+2i.</b></p>"],
["Simplify (2+i)(3−i).","<p>Expand: 6−2i+3i−i².<br>Use i²=−1, so −i²=1.<br>6+1+i=<b>7+i</b>.</p>"],
["Find the modulus and conjugate of 3+4i.","<p>Modulus = √(3²+4²)=√25=5.<br>The conjugate changes the sign of the imaginary part.<br><b>Modulus 5; conjugate 3−4i.</b></p>"],
["Divide 1+i by 1−i.","<p>Multiply top and bottom by the conjugate 1+i.<br>Numerator (1+i)²=1+2i+i²=2i; denominator (1−i)(1+i)=2.<br><b>Quotient = i.</b></p>"],
["Write −1 in polar form with an argument in [0,2π).","<p>Its distance from zero is 1.<br>It lies on the negative real axis, angle π.<br><b>−1=1(cos π+i sin π)=eⁱπ.</b></p>"]
],
q:TOPICS[14][5].concat([
["What is i²?","−1","This is the defining rule for i.","<p>The imaginary unit is defined so its square is −1.<br><b>i²=−1.</b></p>","E"],
["Find the real part of 5−3i.","5","In a+bi, the real part is a.","<p>Compare 5−3i with a+bi.<br>The non-imaginary term is 5.<br><b>Real part = 5.</b></p>","E"],
["Find the imaginary part of 2+7i.","7","The imaginary part is the coefficient of i.","<p>In a+bi, the imaginary part is b.<br>For 2+7i, b=7.<br><b>Imaginary part = 7.</b></p>","E"],
["Find the conjugate of 4+2i.","4−2i","Change the sign of the imaginary term.","<p>The conjugate of a+bi is a−bi.<br>Keep 4 and reverse the sign of 2i.<br><b>4−2i.</b></p>","E"],
["Simplify (1+2i)+(3+i).","4+3i","Add real parts and imaginary coefficients separately.","<p>Real part: 1+3=4.<br>Imaginary part: 2+1=3.<br><b>Sum = 4+3i.</b></p>","E"],
["Simplify 3i².","−3","Replace i² with −1.","<p>Use i²=−1.<br>3i²=3(−1).<br><b>−3.</b></p>","E"],
["Find |3+4i|.","5","Use √(a²+b²).","<p>Modulus = √(3²+4²).<br>√(9+16)=√25.<br><b>|3+4i|=5.</b></p>","E"],
["What point represents 2−3i on the complex plane?","(2,−3)","Use real part as x and imaginary part as y.","<p>The real coordinate is 2.<br>The imaginary coefficient is −3.<br><b>Point (2,−3).</b></p>","E"],
["Simplify (2+i)+(−2+4i).","5i","Combine real and imaginary parts separately.","<p>Real parts cancel: 2−2=0.<br>Imaginary part is i+4i=5i.<br><b>5i.</b></p>","M"],
["Simplify (1+i)(1−i).","2","Use conjugates: (a+bi)(a−bi)=a²+b².","<p>Expand: 1−i+i−i²=1−(−1).<br>That is 2.<br><b>Product = 2.</b></p>","M"],
["Simplify (3+2i)(1+i).","1+5i","Expand and replace i² with −1.","<p>Expand: 3+3i+2i+2i².<br>2i²=−2, so real part 3−2=1 and imaginary part 5i.<br><b>1+5i.</b></p>","M"],
["Find the modulus of 5−12i.","13","Use √(a²+b²).","<p>|5−12i|=√(5²+(−12)²).<br>√(25+144)=√169.<br><b>Modulus = 13.</b></p>","M"],
["Find the conjugate of −2−5i.","−2+5i","Reverse only the imaginary sign.","<p>Keep the real part −2.<br>Change −5i to +5i.<br><b>Conjugate = −2+5i.</b></p>","M"],
["Simplify (2+3i)(2−3i).","13","A number times its conjugate is a²+b².","<p>Use the conjugate product rule: 2²+3².<br>4+9=13.<br><b>Product = 13.</b></p>","M"],
["Divide 2+i by i.","1−2i","Use 1/i=−i, since i(−i)=1.","<p>(2+i)/i = 2/i + 1.<br>1/i=−i, so 2/i=−2i.<br><b>Quotient = 1−2i.</b></p>","H"],
["Find the polar modulus of −3+4i.","5","Distance from origin is √(real²+imaginary²).","<p>Modulus = √((-3)²+4²).<br>√(9+16)=√25.<br><b>Modulus = 5.</b></p>","H"],
["Give an argument of −1+i in radians between 0 and 2π.","3π/4","It is in quadrant II with reference angle π/4.","<p>The point (−1,1) is in quadrant II.<br>Its reference angle is π/4, so argument = π−π/4.<br><b>Argument = 3π/4.</b></p>","H"],
["Simplify (1−i)².","−2i","Expand and use i²=−1.","<p>(1−i)²=1−2i+i².<br>Replace i² by −1: 1−2i−1.<br><b>−2i.</b></p>","H"],
["Solve z+ (2−i)=5+3i.","z=3+4i","Subtract 2−i from both sides.","<p>z=5+3i−2+i.<br>Combine real parts 5−2=3 and imaginary parts 3i+i=4i.<br><b>z=3+4i.</b></p>","H"],
["Write i in polar form with argument in [0,2π).","eⁱπ/2","Its modulus is 1 and it lies on the positive imaginary axis.","<p>The point for i is (0,1), so its modulus is 1.<br>The angle from the positive real axis is π/2.<br><b>i=eⁱπ/2.</b></p>","H"],
["Find the square roots of −1.","i and −i","Solve z²=−1 using i²=−1.","<p>i²=−1, so i is a root.<br>(−i)²=i²=−1, so −i is also a root.<br><b>Roots are i and −i.</b></p>","H"],
["Simplify (3+i)/(1−i).","1+2i","Multiply numerator and denominator by 1+i.","<p>(3+i)(1+i)=3+3i+i+i²=2+4i.<br>(1−i)(1+i)=2.<br>Divide: <b>1+2i.</b></p>","H"],
["If z=2eⁱπ/3, give its modulus and an argument.","2; π/3","In polar form r eⁱθ, modulus is r and argument is θ.","<p>Compare z with r eⁱθ.<br>Here r=2 and θ=π/3.<br><b>Modulus 2; argument π/3.</b></p>","H"]
]),
v:[
["Complex Numbers Explained","https://www.youtube.com/results?search_query=complex+numbers+explained"],
["The Organic Chemistry Tutor: Complex Numbers","https://www.youtube.com/results?search_query=Organic+Chemistry+Tutor+complex+numbers"],
["Complex Plane and Polar Form","https://www.youtube.com/results?search_query=complex+plane+polar+form+explained"]
],
k:[
["Khan Academy: Complex Numbers","https://www.khanacademy.org/math/precalculus"],
["Paul's Online Notes: Complex Numbers","https://tutorial.math.lamar.edu/Classes/Alg/ComplexNumbers.aspx"]
]};
L[14].q=window.MATH_EXPLANATIONS.fill(14,L[14].q);

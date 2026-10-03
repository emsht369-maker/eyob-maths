L[3]={
s:[
["The coordinate plane","<p>The <b>x-axis</b> is horizontal. The <b>y-axis</b> is vertical. They meet at the <b>origin</b> (0, 0). A point (x, y): go across x, then up or down y. There are 4 quadrants: top right (+,+), top left (−,+), bottom left (−,−), bottom right (+,−).</p>"],
["Gradient and straight lines","<ul><li><b>Gradient</b> (slope) m = rise ÷ run = (y₂ − y₁) ÷ (x₂ − x₁).</li><li>Line equation: <b>y = mx + c</b>. c is where it crosses the y-axis (<b>y-intercept</b>). For the x-intercept, set y = 0.</li><li><b>Parallel</b> lines have the same m. <b>Perpendicular</b> lines have m₁ × m₂ = −1.</li></ul>"],
["Distance and midpoint","<p>Distance (Pythagoras): d = √((x₂ − x₁)² + (y₂ − y₁)²).<br>Midpoint = ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2).</p>"],
["Curve shapes and transformations","<ul><li>y = x²: U-shape (parabola). y = x³: S-shape.</li><li>y = 2ˣ: grows very fast, passes (0, 1). y = log x: the mirror image of the exponential.</li><li>y = f(x) + a moves the graph <b>up</b> a. y = f(x − a) moves it <b>right</b> a. y = −f(x) flips it upside down.</li></ul>"],
["Plotting and common graph families","<p>To <b>plot</b> a point, find its x-position first and then its y-position. For example, (2, −1) is 2 across and 1 down. A <b>quadratic</b> graph such as y = x² has a curved U shape; at x = 2, y = 4. A <b>cubic</b> graph such as y = x³ can go below and above the x-axis; at x = −2, y = −8. An <b>exponential</b> graph such as y = 2ˣ doubles when x increases by 1; at x = 3, y = 8. A <b>logarithmic</b> graph reverses that rule; log₂8 = 3.</p>"],
["Common mistakes","<ul><li>Coordinates are written (x, y), not (y, x).</li><li>For slope, subtract y-values and x-values in the same order.</li><li>For a y-intercept, set x = 0. For an x-intercept, set y = 0.</li><li>A negative inside the brackets moves a graph right: y = f(x − 2).</li><li>Distance is never negative, even if coordinate differences are negative.</li></ul>"],
["Where this is used in machine learning","<ul><li>Graphs show how a model prediction changes as an input changes.</li><li>Slope shows a rate of change and helps explain the direction and size of updates while a model learns.</li><li>Distance between points helps compare data examples.</li><li>Exponential and logarithmic graphs appear in growth models, probabilities, and scores that measure model error.</li></ul>"]
],
e:[
["Line through (1, 3) and (3, 7)","<p>m = (7 − 3) ÷ (3 − 1) = 2<br>Use point (1, 3): 3 = 2 × 1 + c, so c = 1<br><b>y = 2x + 1</b></p>"],
["Distance from (−1, 2) to (5, 10)","<p>Across: 5 − (−1) = 6. Up: 10 − 2 = 8.<br>d = √(36 + 64) = √100 = <b>10</b></p>"],
["Vertex of y = (x − 3)² + 1","<p>The bracket is zero when x = 3, so the lowest point has y = 1.<br>Vertex: <b>(3, 1)</b></p>"],
["Find the line with slope 3 through (2, 1)","<p>Start with y = 3x + c.<br>Substitute (2, 1): 1 = 3 × 2 + c.<br>So c = −5.<br>The line is <b>y = 3x − 5</b>.</p>"],
["Move y = x² two units right and three units up","<p>Right by 2 changes x to (x − 2).<br>Up by 3 adds 3 to the output.<br>The new graph is <b>y = (x − 2)² + 3</b>.</p>"]
],
q:[
["Which quadrant is (−2, 5) in?","Second (top left)","Negative x, positive y."],
["Gradient of the line through (2, 1) and (6, 9)","2","8 ÷ 4."],
["y-intercept of y = −3x + 7","7","Compare with y = mx + c."],
["x-intercept of y = 2x − 6","3","Set y = 0."],
["Line with gradient 4 through (0, −2)","y = 4x − 2","c is the y-intercept."],
["Line parallel to y = 3x + 1 through (0, 5)","y = 3x + 5","Same gradient."],
["Gradient of a line perpendicular to y = 2x","−1/2","m₁ × m₂ = −1."],
["Midpoint of (−4, 3) and (2, 9)","(−1, 6)","Average each coordinate."],
["Distance from (0, 0) to (5, 12)","13","5² + 12² = 169."],
["Value of y = 2ˣ at x = 3","8","2 × 2 × 2."],
["Vertex of y = (x + 2)² − 5","(−2, −5)","x + 2 = 0."],
["y = x² moved 3 units right","y = (x − 3)²","Right means minus inside."],
["Where do y = 2x + 1 and y = −x + 7 cross?","(2, 5)","2x + 1 = −x + 7, so x = 2."],
["Which quadrant contains (−3, 2)?","Second quadrant","Negative x and positive y."],
["Gradient through (−1, 4) and (3, −4)","−2","Change in y divided by change in x."],
["Find the x-intercept of y = 3x − 12","(4, 0)","Set y equal to zero."],
["Find the line with slope −2 and y-intercept 5","y = −2x + 5","Use y = mx + c."],
["Midpoint of (3, −2) and (7, 8)","(5, 3)","Average the x-values and the y-values."],
["Distance from (1, 2) to (4, 6)","5","The horizontal and vertical changes are 3 and 4."],
["Find y = x³ when x = −2","−8","Cube −2: (−2) × (−2) × (−2)."],
["Find y = 3ˣ when x = 2","9","Calculate 3 × 3."],
["Find log₁₀(1000)","3","Ask which power of 10 gives 1000."],
["Move y = x² down by 4 units","y = x² − 4","A downward move subtracts from the output."],
["Where do y = x + 2 and y = 8 − x cross?","(3, 5)","Set x + 2 equal to 8 − x."],
["Distance from (2, −1) to (2, −1)","0","The two points are the same."]
],
v:[
["Coordinates and graphs explained","https://www.youtube.com/results?search_query=coordinates+and+graphs+explained"],
["Gradient and straight lines explained","https://www.youtube.com/results?search_query=gradient+and+straight+lines+explained"],
["Quadratic and exponential graphs explained","https://www.youtube.com/results?search_query=quadratic+exponential+graphs+explained"]
],
k:[
["Khan Academy coordinate graphs","https://www.khanacademy.org/search?page_search_query=coordinate%20graphs"],
["Desmos graphing calculator","https://www.desmos.com/calculator"]
]};

L[10]={
s:[
["Matrix size, entries and addition","<p>A <b>matrix</b> is a rectangular table of numbers. Its size is rows × columns; a 2 × 3 matrix has two rows and three columns. Add or subtract matrices entry by entry, and only when their sizes match. Example: [[1,2],[3,4]] + [[2,0],[1,5]] = [[3,2],[4,9]].</p>"],
["Scalar and matrix multiplication","<p>A <b>scalar</b> is one number. Scalar multiplication multiplies every matrix entry by that number. For matrix multiplication, inner dimensions must match: an m × n matrix times an n × p matrix gives an m × p matrix. Each output entry is a row-by-column dot product. Example: [[1,2]] × [[3],[4]] = [[11]].</p>"],
["Identity, zero and transpose","<p>The <b>identity matrix</b> has 1s on the main diagonal and 0s elsewhere; multiplying by it leaves a compatible matrix unchanged. The <b>zero matrix</b> contains only zeroes. The <b>transpose</b> swaps rows and columns. Example: transpose of [[1,2,3],[4,5,6]] is [[1,4],[2,5],[3,6]].</p>"],
["Determinants and inverses","<p>For [[a,b],[c,d]], the <b>determinant</b> is ad − bc. A square matrix has an inverse only when its determinant is not zero. For a 2 × 2 matrix, inverse = 1/(ad−bc) × [[d,−b],[−c,a]]. Example: determinant of [[2,1],[3,4]] is 8 − 3 = <b>5</b>.</p>"],
["Matrices solve systems","<p>A system of linear equations can be written Ax = b. If A has an inverse, multiply both sides by A⁻¹ to get x = A⁻¹b. This packages several equations into one calculation. Example: x + y = 5 and x − y = 1 give x = <b>3</b>, y = <b>2</b>.</p>"],
["Eigenvalues and eigenvectors","<p>An <b>eigenvector</b> is a non-zero vector whose direction stays the same after a matrix acts on it. Its <b>eigenvalue</b> is the scale factor: Av = λv. Find eigenvalues by solving det(A − λI) = 0. For a diagonal matrix, the diagonal entries are eigenvalues. Example: [[2,0],[0,3]] has eigenvalues <b>2 and 3</b>.</p>"],
["Common mistakes","<ul><li>Check matrix dimensions before multiplying; rows and columns do not commute in general.</li><li>For each product entry, multiply a full row by a full column and add.</li><li>Transpose swaps rows with columns; it does not reverse every row.</li><li>A zero determinant means no inverse exists.</li><li>In a system Ax = b, keep the order: x = A⁻¹b.</li><li>An eigenvector cannot be the zero vector.</li></ul>"],
["Where this is used in machine learning","<ul><li>Neural-network layers use matrix multiplication to transform batches of input features.</li><li>Data tables are stored as matrices so many examples can be processed together.</li><li>Eigenvectors and eigenvalues help describe principal component analysis and data directions.</li><li>Matrix equations describe linear regression and other prediction models.</li></ul>"]
],
e:[
["Add [[1,2],[3,4]] and [[2,0],[1,5]].","<p>Add matching entries: 1+2=3 and 2+0=2 in the first row.<br>Then 3+1=4 and 4+5=9 in the second row.<br><b>Sum = [[3,2],[4,9]].</b></p>"],
["Multiply [[1,2],[3,4]] by 2.","<p>Scalar multiplication multiplies every entry by 2.<br>Rows become (2,4) and (6,8).<br><b>Result = [[2,4],[6,8]].</b></p>"],
["Multiply [[1,2],[3,4]] by [[2],[1]].","<p>First output: 1×2 + 2×1 = 4.<br>Second output: 3×2 + 4×1 = 10.<br><b>Product = [[4],[10]].</b></p>"],
["Find the determinant and inverse of [[2,1],[1,1]].","<p>Determinant = 2×1 − 1×1 = 1, so an inverse exists.<br>Swap the diagonal entries and negate the other two: [[1,−1],[−1,2]].<br>Divide by determinant 1.<br><b>Inverse = [[1,−1],[−1,2]].</b></p>"],
["Find the eigenvalues of [[4,0],[0,−2]].","<p>This matrix is diagonal, so its diagonal entries are the eigenvalues.<br>They are 4 and −2.<br>Check using det(A−λI) = (4−λ)(−2−λ).<br><b>Eigenvalues: 4 and −2.</b></p>"]
],
q:TOPICS[10][5].concat([
["How many rows and columns does [[1,2,3],[4,5,6]] have?","2 rows and 3 columns","Count horizontal rows, then entries in each row.","<p>Matrix size is rows × columns.<br>There are 2 horizontal rows and 3 entries in each row.<br><b>Size = 2 × 3.</b></p>","E"],
["Add [[1,2],[3,4]] and [[2,1],[0,3]].","[[3,3],[3,7]]","Add matching positions.","<p>Add each position separately: 1+2=3, 2+1=3.<br>Second row: 3+0=3 and 4+3=7.<br><b>[[3,3],[3,7]].</b></p>","E"],
["Multiply [[1,−2],[0,3]] by 2.","[[2,−4],[0,6]]","Multiply every entry by the scalar 2.","<p>Scalar multiplication acts on every entry.<br>1×2=2, −2×2=−4, 0×2=0, 3×2=6.<br><b>[[2,−4],[0,6]].</b></p>","E"],
["Transpose [[1,2,3],[4,5,6]].","[[1,4],[2,5],[3,6]]","Turn each row into a column.","<p>Transpose swaps rows and columns.<br>First column becomes (1,4), next (2,5), next (3,6).<br><b>[[1,4],[2,5],[3,6]].</b></p>","E"],
["What is the 2×2 identity matrix?","[[1,0],[0,1]]","Put ones on the main diagonal and zeroes elsewhere.","<p>The identity has diagonal entries 1.<br>Every off-diagonal entry is 0.<br><b>I = [[1,0],[0,1]].</b></p>","E"],
["What is the determinant of [[3,1],[2,4]]?","10","Use ad − bc.","<p>For [[a,b],[c,d]], determinant = ad − bc.<br>3×4 − 1×2 = 12 − 2.<br><b>Determinant = 10.</b></p>","E"],
["Multiply [[1,0],[2,1]] by [[3],[4]].","[[3],[10]]","Use row-by-column multiplication.","<p>First row: 1×3 + 0×4 = 3.<br>Second row: 2×3 + 1×4 = 10.<br><b>[[3],[10]].</b></p>","E"],
["Does the zero matrix change a matrix when added?","No","Adding zero leaves each entry unchanged.","<p>Matrix addition is entry by entry.<br>Adding 0 to every entry leaves every entry the same.<br><b>No change.</b></p>","E"],
["Find 3A if A=[[1,−1],[2,0]].","[[3,−3],[6,0]]","Multiply all four entries by 3.","<p>Scalar multiplication multiplies each entry by 3.<br>Entries become 3, −3, 6, and 0.<br><b>3A = [[3,−3],[6,0]].</b></p>","M"],
["Find the determinant of [[5,2],[3,1]].","−1","Calculate 5×1 − 2×3.","<p>Use ad − bc for a 2×2 determinant.<br>5×1 − 2×3 = 5 − 6.<br><b>Determinant = −1.</b></p>","M"],
["Can [[1,2],[2,4]] have an inverse?","No","A square matrix is invertible only if its determinant is non-zero.","<p>Determinant = 1×4 − 2×2 = 0.<br>A zero determinant means no inverse exists.<br><b>No inverse.</b></p>","M"],
["Find the inverse of [[1,0],[0,2]].","[[1,0],[0,1/2]]","For a diagonal matrix, invert each non-zero diagonal entry.","<p>The matrix scales the axes by 1 and 2.<br>Undo those scales with 1 and 1/2.<br><b>Inverse = [[1,0],[0,1/2]].</b></p>","M"],
["Find A×B where A=[[1,2]] and B=[[3],[4]].","11","Multiply the row by the column and add.","<p>The inner dimensions match, so the product is defined.<br>Row-column product = 1×3 + 2×4 = 3 + 8.<br><b>Product = [[11]].</b></p>","M"],
["Solve x+y=7 and x−y=1.","x=4, y=3","Add the equations to remove y, then substitute.","<p>Add equations: 2x = 8, so x = 4.<br>Put x=4 into x+y=7: y=3.<br><b>x=4, y=3.</b></p>","M"],
["Find the trace of [[4,−1],[2,7]].","11","Trace is the sum of diagonal entries.","<p>The diagonal entries are 4 and 7.<br>Trace = 4 + 7.<br><b>Trace = 11.</b></p>","H"],
["Find A² for A=[[1,1],[0,1]].","[[1,2],[0,1]]","Multiply A by itself using row-by-column products.","<p>Top-left = 1; top-right = 1×1+1×1=2.<br>Bottom row gives 0 and 1.<br><b>A² = [[1,2],[0,1]].</b></p>","H"],
["Find the eigenvalues of [[5,0],[0,2]].","5 and 2","For a diagonal matrix, read the diagonal entries.","<p>For a diagonal matrix, each diagonal entry is an eigenvalue.<br>The entries are 5 and 2.<br><b>Eigenvalues are 5 and 2.</b></p>","H"],
["Solve [[1,1],[1,−1]][x,y]=[8,2]. Find x and y.","x=5, y=3","This is x+y=8 and x−y=2; add, then substitute.","<p>Add the equations: 2x=10, so x=5.<br>Substitute into x+y=8: y=3.<br><b>x=5, y=3.</b></p>","H"],
["Find the determinant of [[2,3],[1,4]] and state if it is invertible.","5; yes","Use ad − bc; a non-zero determinant means invertible.","<p>Determinant = 2×4 − 3×1 = 8 − 3 = 5.<br>Since 5 is not zero, an inverse exists.<br><b>Determinant 5; invertible.</b></p>","H"],
["If A is 2×3 and B is 3×4, what size is AB?","2×4","The outer dimensions give the product size.","<p>The inner dimensions 3 and 3 match, so multiplication is possible.<br>The outer dimensions are 2 and 4.<br><b>AB has size 2×4.</b></p>","H"],
["For A=[[2,0],[0,−3]], give eigenvector directions for eigenvalues 2 and −3.","(1,0) and (0,1)","A diagonal matrix scales each coordinate axis separately.","<p>A(1,0) = (2,0) = 2(1,0).<br>A(0,1) = (0,−3) = −3(0,1).<br><b>Directions are (1,0) and (0,1).</b></p>","H"],
["If det(A)=−4, what is det(A⁻¹)?","−1/4","The determinant of an inverse is the reciprocal determinant.","<p>For an invertible matrix, det(A⁻¹)=1/det(A).<br>1/(−4)=−1/4.<br><b>det(A⁻¹)=−1/4.</b></p>","H"],
["Solve 2x+y=11 and x−y=1.","x=4, y=3","Add equations to eliminate y, then substitute.","<p>Add: 3x=12, so x=4.<br>Substitute into x−y=1: 4−y=1, so y=3.<br><b>x=4, y=3.</b></p>","H"]
]),
v:[
["3Blue1Brown: Linear Algebra","https://www.youtube.com/@3blue1brown"],
["Khan Academy: Matrices","https://www.youtube.com/results?search_query=Khan+Academy+matrices"],
["MIT OpenCourseWare: Linear Algebra","https://www.youtube.com/results?search_query=MIT+OpenCourseWare+linear+algebra"]
],
k:[
["Khan Academy: Matrices","https://www.khanacademy.org/math/linear-algebra"],
["Interactive Linear Algebra","https://textbooks.math.gatech.edu/ila/"]
]};
L[10].q=window.MATH_EXPLANATIONS.fill(10,L[10].q);

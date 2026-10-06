// MIT OpenCourseWare, 18.06 Linear Algebra, Spring 2010, CC BY-NC-SA 4.0.
window.IMPORTED_LEARN = [
  {
    id: "MIT18-06-SYMMETRIC-MATRICES-LEARN-1",
    topic: "linear-algebra",
    title: "A basis for 3 by 3 symmetric matrices",
    text: "The 3 by 3 real matrices form a vector space M. Its symmetric matrices form a subspace S: sums and real scalar multiples of symmetric matrices remain symmetric. A basis for S must consist of symmetric matrices, be linearly independent, and span every matrix in S. One such basis uses the three diagonal unit matrices and the three symmetric off-diagonal pairs. Therefore dim(S) = 6. The source also asks for a basis of the antisymmetric matrices AS (A^T = −A), then notes that bases for S and AS together form a basis for all 3 by 3 matrices.",
    page: 1,
    sourceFile: "2c925bea168888404287bb6b848f79ca_MIT18_06S10_symmbases.pdf",
    sourceTitle: "Symmetric Matrices",
    author: "Gilbert Strang",
    licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare",
    image: "assets/imported-learn-images/mit18-06-symmetric-matrices/page-1.webp"
  },
  {
    id: "MIT18-06-GRAM-SCHMIDT-LEARN-1",
    topic: "linear-algebra",
    title: "Gram–Schmidt orthogonalization and QR factorization",
    text: "Starting with independent columns a₁,…,aₙ of A, Gram–Schmidt builds orthonormal columns q₁,…,qₙ of Q. At step j, subtract from aⱼ its projections onto the earlier q vectors, then divide the remaining vector by its length to obtain qⱼ. The projection coefficients fill an upper triangular matrix R, and A = QR. The notes give a modified Gram–Schmidt MATLAB loop and explain that it improves orthogonality in real arithmetic.",
    page: 1,
    sourceFile: "768d6fe735722547c3f5e74824532c53_MIT18_06S10_gramschmidtmat.pdf",
    sourceTitle: "Gram-Schmidt in MATLAB",
    author: "Gilbert Strang",
    licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare",
    image: "assets/imported-learn-images/mit18-06-gram-schmidt/page-1.webp"
  },
  {
    id: "MIT18-06-GRAM-SCHMIDT-LEARN-2",
    topic: "linear-algebra",
    title: "Worked example: orthonormalizing two columns",
    text: "For A = [[4, −2], [3, 1]], the first column has length 5, so q₁ = (1/5)[4, 3]ᵀ. Subtracting its projection from the second column gives v = (1/5)[−6, 8]ᵀ, whose length is 2. Thus q₂ = (1/5)[−3, 4]ᵀ. The projection coefficient q₁ᵀa₂ is −1, and the factorization is A = QR with Q = (1/5)[[4, −3], [3, 4]] and R = [[5, −1], [0, 2]].",
    page: 2,
    sourceFile: "768d6fe735722547c3f5e74824532c53_MIT18_06S10_gramschmidtmat.pdf",
    sourceTitle: "Gram-Schmidt in MATLAB",
    author: "Gilbert Strang",
    licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare",
    image: "assets/imported-learn-images/mit18-06-gram-schmidt/page-2.webp"
  },
  {
    id: "MIT18-06-MATLAB-TUTORIAL-LEARN-1",
    topic: "linear-algebra",
    title: "Worked example: solve a linear system in MATLAB",
    text: "The tutorial sets A = ones(3) + eye(3), then takes b from the third column of A. The solution of Ax = b is x = [0, 0, 1]ᵀ, because multiplying A by that vector selects its third column. For a square system, MATLAB’s backslash command A\\b uses Gaussian elimination; the notes say this is preferable to explicitly forming inv(A) and multiplying by b.",
    page: 1,
    sourceFile: "a7d11b1b00c1c2bd2574c3f896ce4eb3_MIT18_06S10_matlab.pdf",
    sourceTitle: "MATLAB Tutorial",
    author: "Gilbert Strang",
    licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare"
  },
  {
    id: "MIT18-06-MATLAB-TUTORIAL-LEARN-2",
    topic: "linear-algebra",
    title: "MATLAB commands for matrix spaces and factorizations",
    text: "The tutorial defines rank(A) as the number of pivots, equal to the dimensions of the row and column spaces; trace(A) as the sum of diagonal entries (and eigenvalues); null(A) as a matrix whose columns form an orthogonal basis for the nullspace; and orth(A) as a matrix whose columns form an orthogonal basis for the column space. It lists [L,U,P] = lu(A) for PA = LU, [S,E] = eig(A) for AS = SE, and [Q,R] = qr(A) for A = QR.",
    page: 4,
    sourceFile: "a7d11b1b00c1c2bd2574c3f896ce4eb3_MIT18_06S10_matlab.pdf",
    sourceTitle: "MATLAB Tutorial",
    author: "Gilbert Strang",
    licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare"
  },
  {
    id: "MIT18-06-PASCAL-MATRICES-LEARN-1",
    topic: "linear-algebra",
    title: "Pascal matrices and an LU factorization",
    text: "The paper places the binomial coefficients from Pascal’s triangle into a symmetric matrix Sₙ. It also defines lower triangular Lₙ and upper triangular Uₙ versions of the pattern. For every n, Sₙ = LₙUₙ, and det(Sₙ) = 1 because both triangular factors have diagonal entries 1. This is the paper’s stated connection between Pascal’s triangle and LU factorization.",
    page: 1,
    sourceFile: "d61af89db7c6303dc024e52d8ff18f96_MIT18_06S10_pascal_work.pdf",
    sourceTitle: "Pascal Matrices",
    author: "Alan Edelman and Gilbert Strang",
    licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare",
    image: "assets/imported-learn-images/mit18-06-pascal-matrices/page-1.webp"
  },
  {
    id: "MIT18-06-PASCAL-MATRICES-LEARN-2",
    topic: "linear-algebra",
    title: "Pascal matrices acting on powers of x",
    text: "Let v = (1, x, x², …)ᵀ. The paper’s lower triangular Pascal matrix L sends v to (1, 1+x, (1+x)², …)ᵀ. Each row follows the binomial theorem: its binomial coefficients combine the powers of x into the corresponding power of 1+x. The article uses this identity to give a functional interpretation of the Pascal matrix factorization.",
    page: 7,
    sourceFile: "d61af89db7c6303dc024e52d8ff18f96_MIT18_06S10_pascal_work.pdf",
    sourceTitle: "Pascal Matrices",
    author: "Alan Edelman and Gilbert Strang",
    licence: "CC BY-NC-SA 4.0, MIT OpenCourseWare",
    image: "assets/imported-learn-images/mit18-06-pascal-matrices/page-7.webp"
  }
];

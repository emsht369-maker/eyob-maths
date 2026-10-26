(function(){
  "use strict";
  const item=(label,url,note)=>[label,url,note];
  const topicSearch=title=>`https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(title+" maths practice")}`;
  const videoSearch=title=>`https://www.youtube.com/results?search_query=${encodeURIComponent(title+" maths lesson")}`;
  const googleSearch=query=>`https://www.google.com/search?q=${encodeURIComponent(query)}`;
  const wolframSearch=title=>`https://www.wolframalpha.com/input?i=${encodeURIComponent(title+" mathematics")}`;
  const findMore=title=>[
    item("Explore "+title+" with Wolfram|Alpha",wolframSearch(title),"Open a Wolfram|Alpha query for this exact topic. It may show definitions, calculations or related facts."),
    item("YouTube topic search",videoSearch(title),"Search videos using this topic name."),
    item("Khan Academy topic search",`https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(title+" maths")}`,"Search Khan Academy lessons using this topic name."),
    item("Corbettmaths topic search",`https://corbettmaths.com/?s=${encodeURIComponent(title)}`,"Search Corbettmaths for this topic."),
    item("BBC Bitesize topic search",googleSearch(`site:bbc.co.uk/bitesize ${title} maths`),"Search BBC Bitesize for a matching topic."),
    item("Maths Genie topic search",googleSearch(`site:mathsgenie.co.uk ${title} maths`),"Search Maths Genie for matching notes and questions.")
  ];
  const channel=(label,url,title)=>item(label,url,"Open the channel and search for "+title+".");
  const mitLinearAlgebraPack=[
    item("Gilbert Strang: ZoomNotes for Linear Algebra (80-page summary)","/assets/mit-linear-algebra/4d876a9159e32543eb0d73b4d4382f4c_MIT18_06S10ZoomNotes.pdf","An 80-page summary of Gilbert Strang's MIT 18.06 linear algebra notes."),
    item("MIT 18.06 Gram–Schmidt notes","/assets/mit-linear-algebra/768d6fe735722547c3f5e74824532c53_MIT18_06S10_gramschmidtmat.pdf","Helpful notes on Gram–Schmidt and orthogonalisation."),
    item("MIT 18.06 Symmetric matrices notes","/assets/mit-linear-algebra/2c925bea168888404287bb6b848f79ca_MIT18_06S10_symmbases.pdf","Notes on symmetric matrices and spectral ideas."),
    item("MIT 18.06: Pascal matrix notes","/assets/mit-linear-algebra/d61af89db7c6303dc024e52d8ff18f96_MIT18_06S10_pascal_work.pdf","A supplementary note covering related linear-algebra ideas."),
    item("MIT 18.06 MATLAB companion","/assets/mit-linear-algebra/a7d11b1b00c1c2bd2574c3f896ce4eb3_MIT18_06S10_matlab.pdf","MATLAB exercises and companion material for the course."),
    item("Problem set 1 solutions","/assets/mit-linear-algebra/22297c2a6dcf06d82e93ee4af115e91a_MIT18_06S10_pset1_s10_soln.pdf","Worked solutions for the first problem set."),
    item("Problem set 2 solutions","/assets/mit-linear-algebra/d039352aaa83a27f11bb2b3778ecfa96_MIT18_06S10_pset2_s10_soln.pdf","Worked solutions for problem set 2."),
    item("Problem set 3 solutions","/assets/mit-linear-algebra/99823819ffda7c97ddee8abd68ca8764_MIT18_06S10_pset3_s10_soln.pdf","Worked solutions for problem set 3."),
    item("Problem set 4 solutions","/assets/mit-linear-algebra/4ece22f9c707878e1e57b9840469490e_MIT18_06S10_pset4_s10_soln.pdf","Worked solutions for problem set 4."),
    item("Problem set 5 solutions","/assets/mit-linear-algebra/ef8cf047287bc629eb243a691340c823_MIT18_06S10_pset5_s10_soln.pdf","Worked solutions for problem set 5."),
    item("Problem set 6 solutions","/assets/mit-linear-algebra/ace08d2d5a7b321229f191765c5ff2e3_MIT18_06S10_pset6_s10_soln.pdf","Worked solutions for problem set 6."),
    item("Problem set 7 solutions","/assets/mit-linear-algebra/4d1ef28c0836e81caec9122a69c7b931_MIT18_06S10_pset7_s10_soln.pdf","Worked solutions for problem set 7."),
    item("Problem set 8 solutions","/assets/mit-linear-algebra/6e0208c1241f197797f2757d680740c0_MIT18_06S10_pset8_s10_soln.pdf","Worked solutions for problem set 8."),
    item("Problem set 9 solutions","/assets/mit-linear-algebra/58e62cc93e3e8b6cb52e72fa5830fc4e_MIT18_06S10_pset9_s10_soln.pdf","Worked solutions for problem set 9."),
    item("Problem set 10 solutions","/assets/mit-linear-algebra/e6ea5d4104066f874afe1c34e06b8268_MIT18_06S10_pset10_s10_sol.pdf","Worked solutions for the final problem set."),
    item("Exam 1: Questions","/assets/mit-linear-algebra/e9bbec7a9a25a87715e8edd75e21d7b9_MIT18_06S10_exam1_s10.pdf","MIT 18.06 exam 1 question paper."),
    item("Exam 1: Solutions","/assets/mit-linear-algebra/b7efef974f7a2c8b5c925f5ea8fc9152_MIT18_06S10_exam1_s10_sol.pdf","Worked solutions for MIT 18.06 exam 1."),
    item("Exam 2: Questions","/assets/mit-linear-algebra/892238e7e16a658abd5813bea8399170_MIT18_06S10_exam2_s10.pdf","MIT 18.06 exam 2 question paper."),
    item("Exam 2: Solutions","/assets/mit-linear-algebra/d669bf89c103559d51427d0916c5db61_MIT18_06S10_exam2_s10_soln.pdf","Worked solutions for MIT 18.06 exam 2."),
    item("Exam 3: Questions","/assets/mit-linear-algebra/c72789c2ac2ccaf5568a024c662882d2_MIT18_06S10_exam3_s10.pdf","MIT 18.06 exam 3 question paper."),
    item("Exam 3: Solutions","/assets/mit-linear-algebra/edf08929f3b2b435c7d8ca85e8d5118d_MIT18_06S10_exam3_s10_soln.pdf","Worked solutions for MIT 18.06 exam 3."),
    item("Final exam: Questions","/assets/mit-linear-algebra/b799045edd80df18879088bcf872b214_MIT18_06S10_Final_Exam.pdf","MIT 18.06 final exam question paper."),
    item("Final exam: Solutions","/assets/mit-linear-algebra/45790724487e46dcc02f55d0fc092ab7_MIT18_06S10_Final_Answers.pdf","Answer key to the MIT 18.06 final exam.")
  ];
  const topics=[
    {
      title:"Basic Arithmetic and Number Skills",
      start:[item("Khan Academy: Arithmetic","https://www.khanacademy.org/math/arithmetic","Build number skills with guided lessons and practice."),item("Corbettmaths: GCSE maths resources","https://corbettmaths.com/contents/","Use the topic index to find short lessons and practice.")],
      videos:[channel("Math Antics","https://www.youtube.com/@mathantics","arithmetic"),channel("The Organic Chemistry Tutor","https://www.youtube.com/@TheOrganicChemistryTutor","arithmetic"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","arithmetic")],
      practice:"Use short arithmetic problems to practise number facts and operations."
    },
    {
      title:"Fractions, Decimals and Percentages",
      start:[item("Khan Academy: Arithmetic","https://www.khanacademy.org/math/arithmetic","Study fraction arithmetic and number operations."),item("Corbettmaths: GCSE maths resources","https://corbettmaths.com/contents/","Find fraction, decimal and percentage worksheets.")],
      videos:[channel("Math Antics","https://www.youtube.com/@mathantics","fractions and percentages"),channel("The Organic Chemistry Tutor","https://www.youtube.com/@TheOrganicChemistryTutor","fractions and percentages"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","fractions and percentages")],
      practice:"Practise fraction, decimal and percentage questions."
    },
    {
      title:"Algebra",
      start:[item("Khan Academy: Algebra","https://www.khanacademy.org/math/algebra","Free lessons and guided practice for expressions, equations and graphs."),item("Paul's Online Notes: Algebra","https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx","Free algebra notes with explanations and worked examples."),item("OpenStax Elementary Algebra 2e · Full textbook PDF · CC BY-NC-SA 4.0","https://openstax.org/details/books/elementary-algebra-2e","Open the free full 1,340-page PDF or read online on OpenStax. By Lynn Marecek, MaryAnne Anthony-Smith and Andrea Honeycutt Mathis."),item("MIT OpenCourseWare · License and attribution","https://ocw.mit.edu/pages/privacy-and-terms-of-use/","MIT 18.06 Spring 2010 · CC BY-NC-SA 4.0. Original MIT course materials are shown for study; this Math Master page is not affiliated with or endorsed by MIT.")],
      notes:mitLinearAlgebraPack,
      videos:[channel("The Organic Chemistry Tutor","https://www.youtube.com/@TheOrganicChemistryTutor","algebra"),channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","algebra"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","algebra")],
      practice:"Practise algebra questions with step-by-step hints."
    },
    {
      title:"Coordinates and Graphs",
      start:[item("Khan Academy: Algebra","https://www.khanacademy.org/math/algebra","Study coordinate graphs and linear equations."),item("Desmos Graphing Calculator","https://www.desmos.com/calculator","Plot equations and explore how graphs change.")],
      videos:[channel("3Blue1Brown","https://www.youtube.com/@3blue1brown","coordinates and graphs"),channel("The Organic Chemistry Tutor","https://www.youtube.com/@TheOrganicChemistryTutor","coordinate graphs"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","coordinate graphs")],
      practice:"Practise plotting points, gradients and graph questions.",
      tools:[item("Desmos Graphing Calculator","https://www.desmos.com/calculator","Test equations and graph transformations.")]
    },
    {
      title:"Geometry",
      start:[item("Khan Academy: Geometry","https://www.khanacademy.org/math/geometry","Learn shape, angle and measurement ideas."),item("GeoGebra","https://www.geogebra.org","Explore shapes and constructions interactively.")],
      videos:[channel("Math Antics","https://www.youtube.com/@mathantics","geometry"),channel("The Organic Chemistry Tutor","https://www.youtube.com/@TheOrganicChemistryTutor","geometry"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","geometry")],
      practice:"Practise geometry questions and check each diagram carefully.",
      tools:[item("GeoGebra","https://www.geogebra.org","Build and move geometric shapes.")]
    },
    {
      title:"Trigonometry",
      start:[item("Khan Academy: Trigonometry","https://www.khanacademy.org/math/trigonometry","Learn triangle ratios, angles and trigonometric graphs."),item("Paul's Online Notes: Algebra","https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx","Review algebra skills used in trigonometry.")],
      videos:[channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","trigonometry"),channel("The Organic Chemistry Tutor","https://www.youtube.com/@TheOrganicChemistryTutor","trigonometry"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","trigonometry")],
      practice:"Practise trigonometry questions, including ratios and identities."
    },
    {
      title:"Powers, Roots and Logarithms",
      start:[item("Khan Academy: Algebra 2","https://www.khanacademy.org/math/algebra2","Study exponents, exponentials and logarithms."),item("Paul's Online Notes: Algebra","https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx","Review powers, roots and algebraic rules.")],
      videos:[channel("The Organic Chemistry Tutor","https://www.youtube.com/@TheOrganicChemistryTutor","exponents and logarithms"),channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","exponents and logarithms"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","exponents and logarithms")],
      practice:"Practise powers, roots and logarithm questions."
    },
    {
      title:"Calculus",
      start:[item("Khan Academy: Calculus 1","https://www.khanacademy.org/math/calculus-1","Free lessons and guided practice for limits, derivatives and integrals."),item("MIT OpenCourseWare · 18.01SC Single Variable Calculus","https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/","Free MIT lectures, notes, problem sets and exams · Fall 2010.")],
      videos:[channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","calculus"),channel("3Blue1Brown","https://www.youtube.com/@3blue1brown","calculus"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","calculus")],
      practice:"Practise limits, derivatives and integrals.",
      notes:[item("Paul's Online Notes: Calculus I","https://tutorial.math.lamar.edu/Classes/CalcI/CalcI.aspx","Read concise notes with worked calculus examples.")],
      courses:[item("MIT OpenCourseWare: 18.01SC Single Variable Calculus","https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/","Free course materials from MIT OpenCourseWare.")]
    },
    {
      title:"Probability",
      start:[item("Khan Academy: Statistics and Probability","https://www.khanacademy.org/math/statistics-probability","Learn probability rules and random variables."),item("Seeing Theory","https://seeing-theory.brown.edu","Explore probability and statistics with interactive visuals.")],
      videos:[channel("StatQuest","https://www.youtube.com/@statquest","probability"),channel("3Blue1Brown","https://www.youtube.com/@3blue1brown","probability"),channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","probability")],
      practice:"Practise probability questions, including conditional probability and distributions.",
      notes:[item("OpenIntro Statistics topic search",googleSearch("site:openintro.org probability statistics"),"Find free probability and statistics chapters from OpenIntro.")]
    },
    {
      title:"Statistics",
      start:[item("Khan Academy: Statistics and Probability","https://www.khanacademy.org/math/statistics-probability","Study data, distributions and statistical inference."),item("StatQuest","https://www.statquest.org/","Find clear explanations of statistics and data science.")],
      videos:[channel("StatQuest","https://www.youtube.com/@statquest","statistics"),channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","statistics"),channel("3Blue1Brown","https://www.youtube.com/@3blue1brown","statistics and data")],
      practice:"Practise statistics questions and interpret the data in each problem.",
      notes:[item("OpenIntro Statistics topic search",googleSearch("site:openintro.org statistics textbook"),"Find free statistics lessons and textbook chapters.")]
    },
    {
      title:"Matrices",
      start:[item("Khan Academy: Linear Algebra","https://www.khanacademy.org/math/linear-algebra","Study matrices, systems and linear transformations."),item("MIT OpenCourseWare: Linear Algebra","https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/","Free lectures, notes and problem sets.")],
      videos:[channel("3Blue1Brown","https://www.youtube.com/@3blue1brown","matrices"),channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","matrices"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","matrices")],
      practice:"Practise matrix operations and solving linear systems.",
      notes:[item("Immersive Math resource search",googleSearch("site:immersivemath.com linear algebra matrices"),"Search for free interactive maths lessons; the direct site did not respond to the link check.")],
      tools:[item("Interactive Linear Algebra","https://textbooks.math.gatech.edu/ila/","Explore linear algebra ideas with interactive examples.")],
      courses:[item("MIT OpenCourseWare: 18.06 Linear Algebra","https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/","Free MIT lectures, notes and problem sets.")]
    },
    {
      title:"Number Theory",
      start:[item("Khan Academy: Cryptography","https://www.khanacademy.org/computing/computer-science/cryptography","Explore modular arithmetic and its use in codes."),item("Number theory topic search",googleSearch("site:khanacademy.org number theory primes divisibility"),"Find Khan Academy lessons on primes, divisibility and remainders.")],
      videos:[channel("3Blue1Brown","https://www.youtube.com/@3blue1brown","number theory"),channel("The Organic Chemistry Tutor","https://www.youtube.com/@TheOrganicChemistryTutor","number theory"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","number theory")],
      practice:"Practise primes, divisibility and modular arithmetic."
    },
    {
      title:"Logic and Proof",
      start:[item("Khan Academy logic and proof topic search",googleSearch("site:khanacademy.org/math/logic-and-proof logic proof"),"Find Khan Academy lessons on statements, sets and proof."),item("Book of Proof topic search",googleSearch("site:people.vcu.edu/~rhammack/BookOfProof proof logic sets"),"Search for the free Book of Proof and its supporting material.")],
      videos:[item("YouTube search: mathematical logic",videoSearch("mathematical logic and proof"),"Search for video lessons on logic and proof."),item("YouTube search: sets and logic",videoSearch("sets logic and proof maths"),"Search for worked examples about sets and logic."),item("YouTube search: proof by induction",videoSearch("mathematical proof by induction"),"Search for explanations of proof by induction.")],
      practice:"Practise logic, set notation and proof questions."
    },
    {
      title:"Sequences and Series",
      start:[item("Khan Academy: Calculus 2","https://www.khanacademy.org/math/calculus-2","Learn sequences, series and convergence."),item("Paul's Online Notes: Sequences and Series","https://tutorial.math.lamar.edu/Classes/CalcII/SeriesIntro.aspx","Read free notes and worked examples.")],
      videos:[channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","sequences and series"),channel("3Blue1Brown","https://www.youtube.com/@3blue1brown","sequences and series"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","sequences and series")],
      practice:"Practise sequence rules, sums and convergence questions."
    },
    {
      title:"Complex Numbers",
      start:[item("Khan Academy: Precalculus","https://www.khanacademy.org/math/precalculus","Study complex numbers and their graphs."),item("Paul's Online Notes: Algebra","https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx","Read the free notes on complex numbers and algebra.")],
      videos:[channel("The Organic Chemistry Tutor","https://www.youtube.com/@TheOrganicChemistryTutor","complex numbers"),channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","complex numbers"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","complex numbers")],
      practice:"Practise operations, modulus and roots of complex numbers."
    },
    {
      title:"Vectors",
      start:[item("Khan Academy: Linear Algebra","https://www.khanacademy.org/math/linear-algebra","Learn vector operations and linear algebra."),item("Interactive Linear Algebra","https://textbooks.math.gatech.edu/ila/","Use interactive examples to explore vectors and matrices.")],
      videos:[channel("3Blue1Brown","https://www.youtube.com/@3blue1brown","vectors"),channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","vectors"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","vectors")],
      practice:"Practise vector arithmetic, magnitude and dot products.",
      tools:[item("GeoGebra","https://www.geogebra.org","Draw and compare vectors in an interactive graph."),item("Immersive Math resource search",googleSearch("site:immersivemath.com vectors linear algebra"),"Search for free interactive maths lessons; the direct site did not respond to the link check.")]
    },
    {
      title:"Coordinate and Analytic Geometry",
      start:[item("Khan Academy: Precalculus","https://www.khanacademy.org/math/precalculus","Study coordinate geometry and conic sections."),item("Desmos Graphing Calculator","https://www.desmos.com/calculator","Plot lines, circles and other curves.")],
      videos:[channel("The Organic Chemistry Tutor","https://www.youtube.com/@TheOrganicChemistryTutor","coordinate geometry"),channel("3Blue1Brown","https://www.youtube.com/@3blue1brown","coordinate geometry"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","coordinate geometry")],
      practice:"Practise coordinate, line and conic-section questions.",
      tools:[item("Desmos Graphing Calculator","https://www.desmos.com/calculator","Explore equations and their graphs.")]
    },
    {
      title:"Transformations",
      start:[item("Khan Academy: Geometry","https://www.khanacademy.org/math/geometry","Study translations, rotations, reflections and dilations."),item("GeoGebra","https://www.geogebra.org","Move shapes and compare their transformations.")],
      videos:[channel("Math Antics","https://www.youtube.com/@mathantics","transformations"),channel("The Organic Chemistry Tutor","https://www.youtube.com/@TheOrganicChemistryTutor","transformations"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","transformations")],
      practice:"Practise transformations on coordinates and shapes.",
      tools:[item("GeoGebra","https://www.geogebra.org","Test geometric transformations interactively.")]
    },
    {
      title:"Combinatorics",
      start:[item("Khan Academy: Statistics and Probability","https://www.khanacademy.org/math/statistics-probability","Study counting, permutations and combinations."),item("StatQuest","https://www.statquest.org/","Find clear lessons on probability and counting ideas.")],
      videos:[channel("StatQuest","https://www.youtube.com/@statquest","combinatorics and probability"),channel("The Organic Chemistry Tutor","https://www.youtube.com/@TheOrganicChemistryTutor","permutations and combinations"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","permutations and combinations")],
      practice:"Practise counting, permutations and combinations."
    },
    {
      title:"Advanced Algebra",
      start:[item("Khan Academy: Algebra 2","https://www.khanacademy.org/math/algebra2","Study polynomials, functions and advanced equations."),item("Paul's Online Notes: Algebra","https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx","Review free algebra notes and worked examples.")],
      videos:[channel("The Organic Chemistry Tutor","https://www.youtube.com/@TheOrganicChemistryTutor","advanced algebra"),channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","advanced algebra"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","advanced algebra")],
      practice:"Practise polynomial, equation and function questions."
    },
    {
      title:"Advanced Geometry",
      start:[item("Khan Academy: Geometry","https://www.khanacademy.org/math/geometry","Review geometric ideas and shape properties."),item("GeoGebra","https://www.geogebra.org","Explore geometric constructions and diagrams.")],
      videos:[channel("3Blue1Brown","https://www.youtube.com/@3blue1brown","advanced geometry"),channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","advanced geometry"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","advanced geometry")],
      practice:"Practise geometry questions and justify each step.",
      tools:[item("GeoGebra","https://www.geogebra.org","Create and explore geometric constructions.")]
    },
    {
      title:"Linear Algebra",
      start:[item("Khan Academy: Linear Algebra","https://www.khanacademy.org/math/linear-algebra","Learn vectors, matrices and linear systems."),item("MIT OpenCourseWare: Linear Algebra","https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/","Free university lectures, notes and problem sets."),item("MIT OpenCourseWare · License and attribution","https://ocw.mit.edu/pages/privacy-and-terms-of-use/","MIT 18.06 Spring 2010 · CC BY-NC-SA 4.0. Original MIT course materials are shown for study; this Math Master page is not affiliated with or endorsed by MIT.")],
      videos:[channel("3Blue1Brown","https://www.youtube.com/@3blue1brown","linear algebra"),channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","linear algebra"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","linear algebra")],
      practice:"Practise matrix operations, vector spaces and linear systems.",
      notes:[
        item("Immersive Math resource search",googleSearch("site:immersivemath.com linear algebra matrices"),"Search for free interactive maths lessons; the direct site did not respond to the link check.")
      ],
      courses:[]
    },
    {
      title:"Advanced Calculus and Analysis",
      start:[item("Khan Academy: Multivariable Calculus","https://www.khanacademy.org/math/multivariable-calculus","Study functions and calculus with several variables."),item("MIT OpenCourseWare: Multivariable Calculus","https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/","Free course notes, lectures and problem sets.")],
      videos:[channel("3Blue1Brown","https://www.youtube.com/@3blue1brown","multivariable calculus"),channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","multivariable calculus"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","multivariable calculus")],
      practice:"Practise multivariable calculus and analysis questions.",
      notes:[item("Paul's Online Notes: Calculus III","https://tutorial.math.lamar.edu/Classes/CalcIII/CalcIII.aspx","Use free notes and worked multivariable calculus examples.")],
      courses:[item("MIT OpenCourseWare: 18.02SC Multivariable Calculus","https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/","Free MIT course materials.")]
    },
    {
      title:"Differential Equations",
      start:[item("Khan Academy: Differential Equations","https://www.khanacademy.org/math/differential-equations","Learn how equations describe changing quantities."),item("MIT OpenCourseWare: Differential Equations","https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/","Free lectures, notes and problem sets.")],
      videos:[channel("3Blue1Brown","https://www.youtube.com/@3blue1brown","differential equations"),channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","differential equations"),channel("PatrickJMT","https://www.youtube.com/@patrickjmt","differential equations")],
      practice:"Practise solving and interpreting differential equations.",
      notes:[item("Paul's Online Notes: Differential Equations","https://tutorial.math.lamar.edu/Classes/DE/DE.aspx","Read free differential-equation notes and examples.")],
      courses:[item("MIT OpenCourseWare: 18.03SC Differential Equations","https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/","Free MIT course materials.")]
    },
    {
      title:"Numerical and Applied Maths",
      start:[item("Khan Academy: Calculus 2","https://www.khanacademy.org/math/calculus-2","Review calculus ideas used in numerical methods."),item("Stanford: Convex Optimisation","https://web.stanford.edu/~boyd/cvxbook/","Read the free textbook on optimisation.")],
      videos:[channel("3Blue1Brown","https://www.youtube.com/@3blue1brown","numerical methods and optimisation"),channel("StatQuest","https://www.youtube.com/@statquest","optimisation and machine learning"),channel("Professor Leonard","https://www.youtube.com/@ProfessorLeonard","numerical methods")],
      practice:"Practise optimisation, approximation and numerical-method questions.",
      notes:[item("Mathematics for Machine Learning topic search",googleSearch("site:mml-book.github.io mathematics for machine learning textbook"),"Find the free Mathematics for Machine Learning book and course material.")],
      courses:[item("Stanford: Convex Optimisation","https://web.stanford.edu/~boyd/cvxbook/","Free textbook and course material on optimisation.")]
    }
  ];
  window.TOPIC_LINKS=Object.fromEntries(topics.map((topic,index)=>{
    const groups=[
      {title:"Start here",items:topic.start},
      {title:"Videos",items:topic.videos},
      {title:"Practice and questions",items:[item("Khan Academy topic practice",topicSearch(topic.title),topic.practice)]}
    ];
    if(topic.notes&&topic.notes.length)groups.push({title:"Notes and textbooks (free)",items:topic.notes});
    if(topic.tools&&topic.tools.length)groups.push({title:"Interactive tools",items:topic.tools});
    if(topic.courses&&topic.courses.length)groups.push({title:"University courses",items:topic.courses});
    const canonicalTitle=typeof TOPICS!=="undefined"&&TOPICS[index]?TOPICS[index][1]:topic.title;
    groups.push({title:"Find more",items:findMore(canonicalTitle)});
    return [String(index),{groups}];
  }));
})();

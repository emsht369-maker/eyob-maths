(function(){
  "use strict";
  const item=(label,url,note)=>[label,url,note];
  const search=query=>`https://www.google.com/search?q=${encodeURIComponent(query)}`;
  window.AREA_LINKS={
    Number:[
      item("Khan Academy: Arithmetic","https://www.khanacademy.org/math/arithmetic","Lessons and practice for number skills."),
      item("Khan Academy: Pre-algebra","https://www.khanacademy.org/math/pre-algebra","Build number and algebra foundations.")
    ],
    Algebra:[
      item("Khan Academy: Algebra","https://www.khanacademy.org/math/algebra","Lessons and practice for algebra."),
      item("Paul's Online Notes: Algebra","https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx","Free notes and worked algebra examples.")
    ],
    Ratio:[
      item("Khan Academy: Arithmetic","https://www.khanacademy.org/math/arithmetic","Practise fractions, ratios and proportional reasoning."),
      item("Khan Academy: Pre-algebra","https://www.khanacademy.org/math/pre-algebra","Review proportions and number relationships.")
    ],
    Geometry:[
      item("Khan Academy: Geometry","https://www.khanacademy.org/math/geometry","Lessons and practice for shapes and measures."),
      item("GeoGebra","https://www.geogebra.org","Explore geometric diagrams and constructions.")
    ],
    Probability:[
      item("Khan Academy: Statistics and Probability","https://www.khanacademy.org/math/statistics-probability","Lessons and practice for probability."),
      item("Seeing Theory","https://seeing-theory.brown.edu","Interactive pictures that explain probability.")
    ],
    Statistics:[
      item("Khan Academy: Statistics and Probability","https://www.khanacademy.org/math/statistics-probability","Lessons and practice for data and statistics."),
      item("StatQuest","https://www.statquest.org/","Clear lessons on statistics and data.")
    ]
  };
  const examLinks=[
    item("Corbettmaths","https://corbettmaths.com/contents/","Short lessons, worksheets and practice questions."),
    item("BBC Bitesize","https://www.bbc.co.uk/bitesize/subjects/zqhs34j","Clear GCSE topic lessons and revision."),
    item("Maths Genie","https://www.mathsgenie.co.uk/","GCSE topic practice arranged by grade."),
    item("Save My Exams","https://www.savemyexams.com/gcse/maths/","Revision notes and exam practice; some content may need an account."),
    item("Dr Frost Maths","https://www.drfrostmaths.com/","Interactive practice and teacher-made resources."),
    item("Physics and Maths Tutor","https://www.physicsandmathstutor.com/maths-revision/gcse/","GCSE topic notes, worksheets and exam questions."),
    item("AQA past papers","https://www.aqa.org.uk/find-past-papers-and-mark-schemes","Official AQA papers and mark schemes."),
    item("Edexcel past papers","https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html","Official Pearson Edexcel past papers."),
    item("OCR past papers","https://www.ocr.org.uk/qualifications/past-paper-finder/","Official OCR past-paper finder."),
    item("NRICH maths activities for secondary students","https://nrich.maths.org/maths-home-secondary","Free problem-solving activities for secondary students.")
  ];
  window.buildGCSESearchLinks=function(title){
    const topic=String(title||"").trim();
    const term=encodeURIComponent(topic);
    return [
      item("Explore "+topic+" with Wolfram|Alpha",`https://www.wolframalpha.com/input?i=${encodeURIComponent(topic+" GCSE maths")}`,"Open a Wolfram|Alpha query for this GCSE topic."),
      item("YouTube topic search",`https://www.youtube.com/results?search_query=${encodeURIComponent(topic+" GCSE maths")}`,"Search for video explanations of this GCSE topic."),
      item("Khan Academy topic search",`https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(topic+" maths")}`,"Search Khan Academy for lessons and practice."),
      item("Corbettmaths topic search",`https://corbettmaths.com/?s=${term}`,"Search Corbettmaths lessons and questions."),
      item("BBC Bitesize topic search",search(`site:bbc.co.uk/bitesize ${topic} GCSE maths`),"Search BBC Bitesize for a matching topic lesson."),
      item("Maths Genie topic search",search(`site:mathsgenie.co.uk ${topic} GCSE maths`),"Search Maths Genie topic notes and exam questions.")
    ];
  };
  window.buildGCSEResourceGroups=function(title,area,ownLinks){
    const groups=[];
    if(ownLinks&&Array.isArray(ownLinks.groups)&&ownLinks.groups.length){
      groups.push(...ownLinks.groups);
    }else if(Array.isArray(ownLinks)&&ownLinks.length){
      groups.push({title:"Room links",items:ownLinks.map(link=>[link[0],link[1],link[2]||"Additional links provided for this room."])});
    }
    const areaItems=window.AREA_LINKS[area]||[];
    if(areaItems.length)groups.push({title:"Start here",items:areaItems});
    groups.push({title:"Videos",items:[
      item("Math Antics","https://www.youtube.com/@mathantics","Clear videos for GCSE number, algebra and geometry."),
      item("The Organic Chemistry Tutor","https://www.youtube.com/@TheOrganicChemistryTutor","Search the channel for GCSE worked examples."),
      window.buildGCSESearchLinks(title)[0]
    ]});
    groups.push({title:"GCSE exam help",items:examLinks});
    groups.push({title:"Find more",items:window.buildGCSESearchLinks(title)});
    return groups;
  };
})();

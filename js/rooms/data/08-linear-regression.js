(function(root){
  "use strict";
  const q=(text,answer,hint,explain)=>({q:text,answer:String(answer),accept:[],type:"number",tolerance:0,hint:hint,explain:explain,points:10});
  (root.ROOMS=root.ROOMS||[]).push({
    id:"ml-linear-regression",title:"Linear Regression",path:"ml",order:3,next:"ml-gradient-descent",area:"Statistics and ML",difficulty:"Beginner",minutes:22,points:180,icon:"📈",
    blurb:"Use a fitted line to describe a trend, make a prediction and read a residual.",
    objectives:["You will use y = mx + c to make predictions.","You will interpret gradient and intercept in context.","You will calculate a residual as actual minus predicted."],
    tasks:[
      {title:"Read a fitted line",story:"A model describes the trend in a scatter graph with one straight line.",learn:"In y=mx+c, m is the gradient and c is the y-intercept. The line gives a prediction, not a guarantee.",example:"For y=2x+3 at x=4, predicted y = 2×4+3 = 11.",questions:[q("For y = 2x + 3, find the predicted y when x = 5.",13,"Substitute 5 for x.",["Use y = 2x + 3.","Substitute x = 5: y = 2 × 5 + 3.","10 + 3 = 13."])]},
      {title:"Understand the gradient",story:"The gradient tells how much the prediction changes when x increases by one.",learn:"Find gradient by change in y divided by change in x. A positive gradient means the line rises from left to right.",example:"Between (1,4) and (3,8), gradient = (8−4)/(3−1) = 2.",questions:[q("Find the gradient between (1, 5) and (3, 9).",2,"Use change in y divided by change in x.",["Change in y is 9 − 5 = 4.","Change in x is 3 − 1 = 2.","Gradient = 4 ÷ 2 = 2."])]},
      {title:"Find the intercept",story:"The intercept is the model prediction when the input x is zero.",learn:"At x=0, the term mx is zero, so y=c.",example:"For y=3x+4, the intercept is 4.",questions:[q("A model is y = 2x + c and passes through (3, 10). Find c.",4,"Substitute x=3 and y=10, then solve for c.",["10 = 2 × 3 + c.","10 = 6 + c.","Subtract 6: c = 4."])]},
      {title:"Make a prediction",story:"Use the fitted line to estimate an outcome for a chosen input.",learn:"Substitute the input into the line equation and calculate. Predictions far outside the data range may be unreliable.",example:"For y=3x+2 at x=4, predicted y=14.",questions:[q("Use y = 3x + 2 to predict y when x = 6.",20,"Put 6 in place of x.",["y = 3 × 6 + 2.","Multiply: 3 × 6 = 18.","Add 2: the prediction is 20."])]},
      {title:"Read a residual",story:"A residual shows how far one observed point is from the model prediction.",learn:"Residual = actual value − predicted value. A positive residual means the actual value is above the line.",example:"Actual 15, predicted 12: residual = 15−12 = 3.",questions:[q("A model predicts 14 but the actual value is 18. Find the residual.",4,"Subtract predicted from actual.",["Residual = actual − predicted.","Substitute: 18 − 14.","The residual is 4."])]}
    ],examPool:root.ROOMS_DATA.makePool("linear-regression"),links:[["Linear regression","https://www.khanacademy.org/search?page_search_query=linear%20regression%20line%20of%20best%20fit"]]
  });
})(typeof window!=="undefined"?window:globalThis);

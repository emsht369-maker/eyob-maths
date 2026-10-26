L[9]={
s:[
["Populations, samples and sampling","<p>A <b>population</b> is the whole group we want to learn about. A <b>sample</b> is the smaller group we measure. A random sample gives each member a fair chance of selection. A biased sample leaves some groups out or chooses them more often. Example: asking 100 randomly chosen students about a school of 1,000 students is a sample, not the whole population.</p>"],
["Mean, median, mode and range","<p>The <b>mean</b> is the total divided by the number of values. The <b>median</b> is the middle after sorting. The <b>mode</b> is the most common value. The <b>range</b> is largest minus smallest. Example: for 2, 4, 4, 10, mean = 20/4 = 5, median = 4, mode = 4, and range = 8.</p>"],
["Variance and standard deviation","<p><b>Variance</b> measures the average squared distance from the mean. For a population, variance = Σ(x − mean)² ÷ n. <b>Standard deviation</b> is the square root of variance, so it is in the original units. Example: for 2, 4, 6, the mean is 4; squared distances are 4, 0, 4, so population variance is 8/3.</p>"],
["Quartiles, percentiles and IQR","<p><b>Quartiles</b> split sorted data into four parts. Q1 is the lower quarter, Q2 is the median, and Q3 is the upper quarter. A <b>percentile</b> marks the value at a given percentage of the ordered data. The <b>interquartile range</b> is IQR = Q3 − Q1; it describes the middle half and is less affected by extreme values. Example: if Q1 = 5 and Q3 = 13, IQR = <b>8</b>.</p>"],
["Tables, charts and correlation","<p>A <b>frequency table</b> counts values. A <b>histogram</b> groups continuous values into touching bars. A <b>scatter plot</b> shows paired values; an upward pattern is positive correlation and a downward pattern is negative correlation. Correlation measures association, not cause. Example: a scatter plot that rises from left to right suggests positive correlation.</p>"],
["Regression and inference","<p><b>Regression</b> fits a rule, often a line, to predict one value from another. For y = mx + c, m is the change in predicted y for one unit of x. <b>Inference</b> uses a sample to estimate or test something about a population; uncertainty should be reported. Example: y = 2x + 1 predicts y = <b>9</b> when x = 4.</p>"],
["Common mistakes","<ul><li>Sort the data before finding the median or quartiles.</li><li>Use the population or sample variance rule the question asks for; their denominators differ.</li><li>Standard deviation is the square root of variance.</li><li>Use the same units as the data for standard deviation, but squared units for variance.</li><li>Correlation alone does not show that one thing caused another.</li><li>A sample estimate has uncertainty; it is not automatically the exact population value.</li></ul>"],
["Where this is used in machine learning","<ul><li>Mean and standard deviation help scale input features before training.</li><li>Quartiles and IQR help spot unusual data values that may need review.</li><li>Correlation helps explore which features move together before building a model.</li><li>Regression predicts numeric outcomes, such as prices or travel times.</li></ul>"]
],
e:[
["Find the mean, median, mode and range of 2, 4, 4, 10.","<p>Add: 2 + 4 + 4 + 10 = 20; divide by 4, so mean = 5.<br>The middle two values are 4 and 4, so median = 4.<br>4 appears most, so mode = 4; range = 10 − 2 = 8.<br><b>Mean 5, median 4, mode 4, range 8.</b></p>"],
["Find the population variance and standard deviation of 2, 4, 6.","<p>Mean = (2 + 4 + 6) ÷ 3 = 4.<br>Squared distances are (2−4)²=4, 0, and (6−4)²=4.<br>Variance = 8 ÷ 3; standard deviation = √(8/3).<br><b>Variance = 8/3; standard deviation ≈ 1.633.</b></p>"],
["For 1, 3, 5, 7, 9, find Q1, Q3 and IQR using the median-of-halves method.","<p>The median is 5. The lower half is 1, 3; its midpoint is Q1 = 2.<br>The upper half is 7, 9; its midpoint is Q3 = 8.<br>IQR = Q3 − Q1 = 8 − 2.<br><b>IQR = 6.</b></p>"],
["A regression line is y = 2x + 1. Predict y when x = 4.","<p>Substitute x = 4 into the line.<br>y = 2 × 4 + 1 = 8 + 1.<br><b>Predicted y = 9.</b></p>"],
["A sample has 30 successes from 50 trials. Find the sample proportion as a percentage.","<p>Proportion = successes ÷ trials = 30 ÷ 50.<br>30/50 simplifies to 3/5 = 0.6.<br>Convert to a percent: 0.6 × 100 = <b>60%.</b></p>"]
],
q:TOPICS[9][5].concat([
["Find the mean of 3, 6, 9.","6","Add the values, then divide by the three values.","<p>Mean = total ÷ count.<br>Total = 3 + 6 + 9 = 18; count = 3.<br>18 ÷ 3 = <b>6</b>.</p>","E"],
["Find the median of 1, 5, 8.","5","Sort first; the middle value is the median.","<p>Median means the middle after sorting.<br>1, 5, 8 has one value on each side of 5.<br><b>Median = 5.</b></p>","E"],
["Find the mode of 2, 2, 4, 7.","2","The mode appears most often.","<p>Count each value's frequency.<br>2 appears twice, more than any other value.<br><b>Mode = 2.</b></p>","E"],
["Find the range of 4, 9, 12.","8","Subtract the smallest value from the largest.","<p>Range = largest − smallest.<br>Largest is 12 and smallest is 4.<br>12 − 4 = <b>8</b>.</p>","E"],
["A group has 8 students. How many students are in the population if the group is the whole class?","8 students","A population is the whole group being studied.","<p>Use the definition of population: the entire group of interest.<br>The question says the group is the whole class.<br><b>Population size = 8.</b></p>","E"],
["A sample has 4 red balls and 6 blue balls. How many balls are in the sample?","10 balls","Add the category counts.","<p>Total sample size is the sum of its category counts.<br>4 + 6 = 10.<br><b>Sample size = 10.</b></p>","E"],
["Find the mean of 5, 7, 12, 16.","10","Mean is sum divided by count.","<p>Mean = sum ÷ number of values.<br>Sum = 5 + 7 + 12 + 16 = 40; there are 4 values.<br>40 ÷ 4 = <b>10</b>.</p>","E"],
["Find the median of 2, 3, 8, 10.","5.5","With an even count, average the two middle values.","<p>Sort the data: 2, 3, 8, 10.<br>The two middle values are 3 and 8, so average them.<br>(3 + 8) ÷ 2 = <b>5.5</b>.</p>","E"],
["Find the population variance of 1, 3, 5.","8/3","Find the mean, square each difference, then divide by n.","<p>Mean = (1 + 3 + 5) ÷ 3 = 3.<br>Squared distances: 4, 0, 4; total = 8.<br>Population variance = 8 ÷ 3 = <b>8/3</b>.</p>","M"],
["Find the population variance of 2, 2, 6, 6.","4","The mean is 4; use squared distances from 4.","<p>Mean = (2 + 2 + 6 + 6) ÷ 4 = 4.<br>Squared distances are 4, 4, 4, 4; sum = 16.<br>Population variance = 16 ÷ 4 = <b>4</b>.</p>","M"],
["A data set has variance 9. Find its standard deviation.","3","Standard deviation is the positive square root of variance.","<p>Standard deviation is the square root of variance.<br>√9 = 3.<br><b>Standard deviation = 3.</b></p>","M"],
["If every data value is increased by 7, what happens to the range?","Adding the same amount shifts both extremes equally.","The range stays the same because (max+7)−(min+7)=max−min.","<p>Range is maximum minus minimum.<br>After adding 7, range = (max + 7) − (min + 7).<br>The 7s cancel, so <b>the range is unchanged</b>.</p>","M"],
["If every value is multiplied by 3, by what factor does the variance change?","9","Variance scales by the square of a multiplier.","<p>Variance squares each distance from the mean.<br>Multiplying all values by 3 multiplies each distance by 3 and each squared distance by 3².<br><b>Variance is multiplied by 9.</b></p>","M"],
["A line of best fit is y = 3x − 2. Predict y when x = 5.","13","Substitute x into the regression line.","<p>Regression prediction uses the fitted equation.<br>Substitute x = 5: y = 3(5) − 2.<br>15 − 2 = <b>13</b>.</p>","M"],
["Q1 = 6 and Q3 = 15. Find the IQR.","9","IQR = Q3 − Q1.","<p>IQR is the width of the middle half of the data.<br>Use Q3 − Q1 = 15 − 6.<br><b>IQR = 9.</b></p>","H"],
["A data set has mean 12 and standard deviation 2. Find the z-score for 16.","2","z = (value − mean) ÷ standard deviation.","<p>A z-score counts standard deviations from the mean.<br>z = (16 − 12) ÷ 2 = 4 ÷ 2.<br><b>z = 2.</b></p>","H"],
["A sample of 100 has 64 successes. Find the estimated standard error of the proportion.","Use √(p(1−p)/n), with p = 64/100.","√(0.64×0.36/100) = 0.048.","<p>Estimated proportion p = 64/100 = 0.64.<br>Standard error = √(p(1−p)/n) = √(0.64×0.36/100).<br>√0.002304 = <b>0.048</b>.</p>","H"],
["A data set is 2, 4, 4, 6, 9. Find the median and range.","Median 4; range 7","Sort; take the middle, then max minus min.","<p>The values are already sorted; the middle value is 4.<br>Range = largest − smallest = 9 − 2.<br><b>Median = 4, range = 7.</b></p>","H"],
["A regression line predicts y = 2.5x + 4. Find y when x = 8.","24","Substitute x = 8 into the fitted line.","<p>Use the fitted rule y = 2.5x + 4.<br>Substitute 8: 2.5 × 8 + 4 = 20 + 4.<br><b>Predicted y = 24.</b></p>","H"],
["The mean of 4 values is 9. Three are 6, 8 and 10. Find the fourth.","12","Total = mean × count; subtract the known values.","<p>Mean = total ÷ count, so total = 9 × 4 = 36.<br>Known values sum to 6 + 8 + 10 = 24.<br>Missing value = 36 − 24 = <b>12</b>.</p>","H"],
["A sample has Q1=10 and Q3=18. Find the upper outlier fence using 1.5×IQR.","30","Upper fence = Q3 + 1.5×IQR.","<p>IQR = Q3 − Q1 = 18 − 10 = 8.<br>Upper fence = Q3 + 1.5×IQR = 18 + 12.<br><b>Upper fence = 30.</b></p>","H"],
["A survey samples only students who visit the library. Is this likely to be representative of all students?","No; it is biased","A biased sample over-represents a subgroup.","<p>A representative sample should reflect the whole population.<br>This method selects only library visitors, leaving other students out.<br><b>It is likely biased and not representative.</b></p>","H"]
]),
v:[
["StatQuest: Statistics","https://www.youtube.com/@statquest"],
["Khan Academy: Statistics and Probability","https://www.youtube.com/results?search_query=Khan+Academy+statistics+explained"],
["Crash Course Statistics","https://www.youtube.com/results?search_query=Crash+Course+Statistics"]
],
k:[
["Khan Academy: Statistics and Probability","https://www.khanacademy.org/math/statistics-probability"],
["OpenIntro Statistics","https://www.openintro.org/book/os/"]
]};
L[9].q=window.MATH_EXPLANATIONS.fill(9,L[9].q);

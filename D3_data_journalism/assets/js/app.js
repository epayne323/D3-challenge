// svg container
var svgHeight = 600;
var svgWidth = 1000;

// margins
var margin = {
  top: 50,
  right: 50,
  bottom: 100,
  left: 100
};

// chart area minus margins
var chartHeight = svgHeight - margin.top - margin.bottom;
var chartWidth = svgWidth - margin.left - margin.right;

// create svg container
var svg = d3.select("body").append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

// shift everything over by the margins
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


//------------------------------DYNAMIC FUNCTIONS------------------------------

// initial variables
var chosenXAxis = "poverty", 
    chosenYAxis = "healthcare"

// If xy is not "x", assume y scale change
function newScale(data, chosenAxis, xy) 
{
    // create scales
    if (xy === "x")
    {
        let xLinearScale = d3.scaleLinear()
            .domain([d3.min(data, d => d[chosenAxis])*0.9, d3.max(data, d => d[chosenAxis])*1.1])
            .range([0, chartWidth]);
        return xLinearScale;
    }
    else
    {
        let yLinearScale = d3.scaleLinear()
            .domain([d3.min(data, d => d[chosenAxis])*0.9, d3.max(data, d => d[chosenAxis])*1.1])
            .range([chartHeight, 0]);
        return yLinearScale;
    }
}

// If xy is not "x", assume y axis change
function renderAxes(newScale, axis, xy) 
{
    if (xy === "x")
    {
        let bottomAxis = d3.axisBottom(newScale)

        axis.transition()
            .duration(1000)
            .call(bottomAxis);
        return axis;
    }
    else
    {
        let leftAxis = d3.axisLeft(newScale);

        axis.transition()
            .duration(1000)
            .call(leftAxis);
        return axis;
    }
}

// cxy must be either "x" or "y"
function renderCircles(circlesGroup, newScale, chosenAxis, xy) 
{
    circlesGroup.selectAll("circle")
        .transition()
        .duration(1000)
        .attr(`c${xy}`, d => newScale(d[chosenAxis]));
    // console.log(chosenAxis);

        circlesGroup.selectAll("text")
            .transition()
            .duration(1000)
            .attr(`d${xy}`, d => newScale(d[chosenAxis]) + ((xy === "x") ? -7 : 4))
            .text(d => d.abbr);
    return circlesGroup;
}


// create tooltip function
// function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) 
// {
//     let xLabel = "", 
//         xUnit = "",
//         yLabel = ""
//     if (chosenXAxis === "poverty") 
//     { 
//         xLabel = "Poverty: "; 
//         xUnit = "%"; 
//     }
//     else if (chosenXAxis === "age") 
//     { 
//         xLabel = "Median Age: "; 
//         xUnit = ""; 
//     }
//     else if (chosenXAxis === "income") 
//     { 
//         xLabel = "Income: "; 
//         xUnit = "$"; 
//     }

//     if (chosenYAxis === "smokes") 
//     { 
//         yLabel = "Smokers: ";  
//     }
//     else if (chosenYAxis === "obesity") 
//     { 
//         yLabel = "Obesity: "; 
//     }
//     else if (chosenYAxis === "healthcare") 
//     { 
//         yLabel = "Lacks Healthcare: "; 
//     }

//     var toolTip = d3.tip()
//         .attr("class", "tooltip")
//         .offset([80, -60])
//         .html(function(d) 
//         {
//             return (`${d.state}<br>${xLabel} ${d[chosenXAxis]} ${xUnit}
//             <br>${xLabel} ${d[chosenYAxis]}%`);
//         });

//     circlesGroup.call(toolTip);

//     circlesGroup.on("mouseover", function(data) 
//     {
//         toolTip.show(data);
//     })
//     // onmouseout event
//     .on("mouseout", function(data, index) 
//     {
//         toolTip.hide(data);
//     });
  
//     return circlesGroup;
// }


//-----------------------------------------------------------------------------

// import data
d3.csv("assets/data/data.csv").then(function(data) 
{
    // format data (ESSENTIAL)
    data.forEach(d =>
    {   
        d.poverty = +d.poverty;
        d.age = +d.age;
        d.income = +d.income;
        d.healthcare = +d.healthcare;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;     
    });

    // create scales
    let xLinearScale = newScale(data, chosenXAxis, "x");
    let yLinearScale = newScale(data, chosenYAxis, "y");

    // create initial axes
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);
    

    // append axes to chart group
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);
    let yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // draw circles.
    // first append a new group for the circles
    let circlesGroup = chartGroup.selectAll("unused")
        .data(data)
        .enter()
        .append("g");

    circlesGroup.append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        
        .attr("fill", "teal")
        .attr("opacity", ".5");

    circlesGroup.append("text")
        .attr("dx", d => xLinearScale(d[chosenXAxis]) - 7)
        .attr("dy", d => yLinearScale(d[chosenYAxis]) + 4)
        .attr("font-size", "12px")
        .text(d => d.abbr);


    // variable labels
    let xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
    
    let xLabels = ["poverty", "age", "income"];

    let povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");
    
    let ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    let incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");    


    let yLabelsGroup = chartGroup.append("g")
        // .attr("transform", `translate(300, 1000)`)
        .attr("transform", "rotate(-90)");  
    
    let yLabels = ["smokes", "obesity", "healthcare"]

    let smokesLabel = yLabelsGroup.append("text")
        .attr("x", -chartHeight/2)
        .attr("y", -30)
        .attr("value", "smokes") // value to grab for event listener
        .classed("active", true)
        .text("Smokers (%)");
    
    let obesityLabel = yLabelsGroup.append("text")
        .attr("x", -chartHeight/2)
        .attr("y", -50)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obese (%)");

    let healthcareLabel = yLabelsGroup.append("text")
        .attr("x", -chartHeight/2)
        .attr("y", -70)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");  


        
    // update tool tip



    // x axis labels event listener
    // this would be better if it were part of a function
    xLabelsGroup.selectAll("text").on("click", function() 
    {
        // get value of selection
        var value = d3.select(this).attr("value");
        // console.log(value)
        if (value !== chosenXAxis) 
        {
            // replaces chosenXAxis with value
            chosenXAxis = value;

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = newScale(data, chosenXAxis, "x");

            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis, "x");

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, "x");


            // updates tooltips with new info
            // circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            xLabels.forEach(label =>
            {
                if (label != chosenXAxis)
                {
                    // CSS selector
                    xLabelsGroup.selectAll(`text[value='${label}'`)
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else
                {
                    xLabelsGroup.selectAll(`text[value='${label}'`)
                        .classed("active", true)
                        .classed("inactive", false);
                }
            });
        }
    });

    yLabelsGroup.selectAll("text").on("click", function() 
    {
        // get value of selection
        var value = d3.select(this).attr("value");
        // console.log(value)
        if (value !== chosenYAxis) 
        {
            // replaces chosenYAxis with value
            chosenYAxis = value;

            // functions here found above csv import
            // updates y scale for new data
            yLinearScale = newScale(data, chosenYAxis, "y");

            // updates y axis with transition
            yAxis = renderAxes(yLinearScale, yAxis, "y");

            // updates circles with new y values
            circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis, "y");


            // updates tooltips with new info
            // circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            yLabels.forEach(label =>
            {
                if (label != chosenYAxis)
                {
                    // CSS selector
                    yLabelsGroup.selectAll(`text[value='${label}'`)
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else
                {
                    yLabelsGroup.selectAll(`text[value='${label}'`)
                        .classed("active", true)
                        .classed("inactive", false);
                }
            });
        }
    });
}).catch(function(error) 
{
    console.log(error);
});

// svg container
var svgHeight = 600;
var svgWidth = 1000;

// margins
var margin = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 50
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
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.poverty)*0.9, d3.max(data, d => d.poverty)*1.1])
        // .domain(d3.extent(data, d => d.poverty))
        .range([0, chartWidth]);
    let yLinearScale = d3.scaleLinear() 
        .domain([d3.min(data, d => d.smokes)*0.9, d3.max(data, d => d.smokes)*1.1])
        // .domain(d3.extent(data, d => d.smokes))
        .range([chartHeight, 0]);

    // create axes
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // append axes to chart group
    chartGroup.append("g").attr("transform", `translate(0, ${chartHeight})`).call(bottomAxis);
    chartGroup.append("g").call(leftAxis);

    // draw circles
    // let circlesGroup = chartGroup.selectAll("circle")
    //     .data(data)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", d => xLinearScale(d.poverty))
    //     .attr("cy", d => yLinearScale(d.smokes))
    //     .attr("r", 15)
    //     .attr("fill", "teal")
    //     .attr("opacity", ".5");
    let circlesGroup = chartGroup.selectAll("unused")
        .data(data)
        .enter()
        .append("g");

    circlesGroup.append("circle")
        .attr("cx", d => xLinearScale(d.poverty)) // replace
        .attr("cy", d => yLinearScale(d.smokes)) // replace
        .attr("r", 15)
        .attr("fill", "teal")
        .attr("opacity", ".5");

    circlesGroup.append("text")
        .attr("dx", d => xLinearScale(d.poverty) - 10) // replace
        .attr("dy", d => yLinearScale(d.smokes) + 5) // replace
        .text(d => d.abbr);

    circlesGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Smokers (%)"); // replace
    
    circlesGroup.append("text")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top -10})`)
        .attr("class", "axisText")
        .text("In Poverty (%)");

    // data.forEach( d => console.log(d.smokes));
    // console.log(xLinearScale(19.3));
    // console.log(xLinearScale(11.4));
    // console.log(yLinearScale(35));
    // console.log(d3.max(data, d => d.smokes))

}).catch(function(error) 
{
    console.log(error);
});

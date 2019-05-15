// app.js including the optional challenge segment

const svgWidth = 960;
const svgHeight = 500;

const margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
const svg = d3
    //.select(".chart")
    .select(".scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Initial Params
let chosenXAxis = "poverty";     //make these a let since the value will be overwritten
let chosenYAxis = "healthcare";


// function used for updating x-scale const upon click on axis label to map data to pixels
function xScale(peopleData, chosenXAxis) {
    // create scales
    const xLinearScale = d3.scaleLinear()
        .domain([d3.min(peopleData, d => d[chosenXAxis]) * 0.8,
        d3.max(peopleData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}

// function used for updating y-scale const upon click on axis label to map data to pixels
function yScale(peopleData, chosenYAxis) {
    // create scales
    const yLinearScale = d3.scaleLinear()
        .domain([d3.min(peopleData, d => d[chosenYAxis]) * 0.8,
        d3.max(peopleData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;

}

// function used for updating xAxis const upon click on axis label
function renderXAxes(newXScale, xAxis) {
    const bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis const upon click on axis label
function renderYAxes(newYScale, yAxis) {
    const leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group (circlesGroup) with a transition to new circles
// circlesGroup knows about all of the elements..
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
    //.attr("x", d => newXScale(d[chosenXAxis]))
    return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]))
    // .attr("y", d => newYScale(d[chosenYAxis]))
    return circlesGroup;
}

// function used for updating state text (textGroup)  with a transition to new text
// textGroup knows about all of the elements..
function renderXText(textGroup, newXScale, chosenXAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
    return textGroup;
}

function renderYText(textGroup, newYScale, chosenYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[chosenYAxis]))
    return textGroup;
}

// function used for updating circles group with new tooltip when hovering
function updateToolTip(chosenXAxis, circlesGroup, chosenYAxis) {
    let label = "";
    let labely = "";
    //x axis
    console.log("updateToolTip-chosenXAxis: " + chosenXAxis)
    console.log("updateToolTip-circlesGroup: " + circlesGroup)
    console.log("updateToolTip-chosenYAxis: " + chosenYAxis)
    if (chosenXAxis === "poverty") {
        label = "Poverty (%)";
    }
    else if (chosenXAxis === "age") {
        label = "Age (Yrs)"
    } else if (chosenXAxis === "income") {
        label = "Income (USD)";
    }
    //y axis...this fn is passed values that axis is not important
    if (chosenYAxis === "healthcare") {
        labely = "No HealthCare (%)";
    }
    else if (chosenYAxis === "obesity") {
        labely = "Obesity (%)"
    } else if (chosenYAxis === "smokes") {
        labely = "Smokes (%)";
    }
    console.log("labely: " + labely)
    console.log("label: " + label)

    const toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([40, -85])
        .html(function (d) {
            return (`${d.state}<br>${label}: ${d[chosenXAxis]}<br>${labely}: ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);
    //chartGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data, this);
        });

    return circlesGroup;
}

// IIFE   main routine below
// Retrieve data from the CSV file and execute everything below
(async function () {
    let peopleData = await d3.csv("assets/data/data.csv");

    // parse data
    peopleData.forEach(function (data) {
        data.id = +data.id;
        data.state = data.state;
        data.abbr = data.abbr;
        data.poverty = +data.poverty;
        data.povertyMoe = +data.povertyMoe;
        data.age = +data.age;
        data.ageMoe = +data.ageMoe;
        data.income = +data.income;
        data.incomeMoe = +data.incomeMoe;
        data.healthcare = +data.healthcare;
        data.healthcareLow = +data.healthcareLow;
        data.healthcareHigh = +data.healthcareHigh;
        data.obesity = +data.obesity;
        data.obesityLow = +data.obesityLow;
        data.obesityHigh = +data.obesityHigh;
        data.smokes = +data.smokes;
        data.smokesLow = +data.smokesLow;
        data.smokesHigh = +data.smokesHigh;
    });
    console.log(peopleData)

    // xLinearScale function above csv import
    let xLinearScale = xScale(peopleData, chosenXAxis);

    // Create y scale function
    let yLinearScale = yScale(peopleData, chosenYAxis);  //need to use a fn since the y scale can also change

    // Create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    // below is what we will transition to when we move from one x choice to the other
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    //do a let yAxis here????    //eric
    let yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    //var circlesGroup = chartGroup.selectAll("circle")   //select all circle elements
    //stateCircle formatting defined in d3Style.css
    var circlesGroup = chartGroup.selectAll("stateCircle")   //select all circle elements

        .data(peopleData)    //bind to the data 
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 12)
        //.attr("fill", "#788dc3")
        //.attr("opacity", ".5")
        .classed("stateCircle", true)

    // create textGroup, append a statetext field for labels for the circles
    //statetext format defined in d3Style.css 
    var textGroup = chartGroup.selectAll(".stateText")
        .data(peopleData)    //bind to the data 
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy", 3)
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        //.attr("fill", "white")
        .text(d => (d.abbr))
        .classed("stateText", true);

    // Create group for  3 x- axis labels
    const labelsXGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    const inPovertyLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)   //init
        .text("In Poverty (%)");

    const ageLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)  //init
        .text("Age (years, median)");

    const incomeLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)  //init
        .text("Household Income (USD, median)");

    // Create group for  3 y- axis labels
    const labelsYGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    const obesityLabel = labelsYGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)  //init
        //.classed("axis-text", true)
        .text("Obesity (%)");

    const smokesLabel = labelsYGroup.append("text")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left + 20)
        .attr("dy", "1em")
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)   //init
        //.classed("axis-text", true)
        .text("Smokes (%)");

    const healthcareLabel = labelsYGroup.append("text")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left + 40)
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)  //init to true at first
        //.classed("axis-text", true)
        .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

    // x axis labels event listener
    labelsXGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            const value = d3.select(this).attr("value");
            //console.log("chosenXAxis= " + chosenXAxis)
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(peopleData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates state text labels with new x values
                textGroup = renderXText(textGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    inPovertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    inPovertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {   // income chosen
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    inPovertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    // y axis labels event listener
    labelsYGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            const value = d3.select(this).attr("value");
            console.log("value in y listener: " + value)
            console.log("pvs chosenYAxis in y listener: " + chosenYAxis)
            if (value !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;

                console.log(chosenYAxis)

                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(peopleData, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

                // updates state text labels with new y values
                textGroup = renderYText(textGroup, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

                // changes classes to change bold text
                if (chosenYAxis === "obesity") {
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "healthcare") {   // healthcare chosen
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
})()
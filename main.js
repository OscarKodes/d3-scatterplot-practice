/* CONSTANTS AND GLOBALS */
const height = window.innerHeight * 0.8;
const margin = {
  top: 50,
  left: 50,
  right: 200,
  bottom: 50,
};
let width = window.innerWidth * 0.8;

// Limiting the width,
// so the plot isn't stretched too much if have wide screen
width = width > height ? height + margin.right : width;

/* LOAD DATA */
d3.csv("data.csv", d3.autoType).then((data) => {
  console.log(data);

  // Plan for scatterplot:
  //   title = guildName
  //     x = avgLvl
  //     y = goldPerMonth
  //     size = membersCount
  //     color = mainClass

  /* SCALES ##################################################### */
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data.map((d) => d.avgLvl))])
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.goldPerMonth)])
    .range([height - margin.top, margin.bottom]);

  // // Placing genres and colors in variables to be reused in colorScale & Legend
  let allClasses = new Set(data.map((d) => d.mainClass));
  allClasses = [...allClasses];

  const colorScale = d3
    .scaleOrdinal()
    .domain(allClasses)
    .range(d3.schemeCategory10);
  const sizeScale = d3
    .scaleSqrt()
    .domain([1, d3.max(data, (d) => d.membersCount)])
    .range([3, 16]);

  /* HTML ELEMENTS ############################################## */
  // SVG CANVAS -----------------------------------------------
  const svg = d3
    .select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "lavender");
  // AXIS TICKS  ----------------------------------------------
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.top})`)
    .call(d3.axisBottom(xScale));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));
  // AXIS LABELS ----------------------------------------------
  svg
    .append("text")
    .attr("text-achor", "end")
    .attr("x", width / 3)
    .attr("y", height - margin.bottom / 4)
    .style("font-weight", "bold")
    .style("font-size", "1.2rem")
    .text("Average Guild Level");

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width * -0.35)
    .attr("y", 18)
    .attr("font-weight", "bold")
    .attr("font-size", "1.2rem")
    .attr("transform", "rotate(-90)")
    .text("Gold per Month");

  //   // INVISIBLE TOOLTIP DIV -----------------------------------
  //   const tooltip = d3.select("#container")
  //                     .append("div")
  //                     .attr("class", "tooltip")
  //                     .style("opacity", 0);
  //   // TOOLTIP MOUSE OVER EVENT HANDLER ------------------------
  //   const tipMouseover = function(event, d) {
  //     // Dynamic html to put inside tooltip div catered to specific film
  //     const tooltipHTML = `<b>Title:</b> ${d.Film}<br/>
  //                           <b>Genre:</b> ${d.Genre}</span><br/>
  //                           <b>Rotten Tomatoes:</b> ${d["Rotten Tomatoes Ratings %"]}%<br/>
  //                           <b>Audience Ratings:</b> ${d["Audience Ratings %"]}%<br/>
  //                           <b>Budget:</b> $${d["Budget (million $)"]} million (USD)<br>
  //                           <b>Year:</b> ${d["Year of release"]}`;
  //     let color = colorScale(d.Genre);
  //     let size = sizeScale(d["Budget (million $)"]);
  //     // Position the invisible tooltip div above and left of hovering cursor
  //     tooltip.html(tooltipHTML)
  //       .style("left", ((d.Film.length >= 20 ? // Dynamic positioning if long film title
  //                         event.pageX - 160 - ((d.Film.length - 19) * 5) :
  //                         event.pageX - 160) + "px"))
  //       .style("top", (event.pageY - 120 - 0.5 * size + "px"))
  //       .style("border", `${color} solid 0.2rem`) // Same border color as genre
  //       .style("outline", "1px solid black")
  //       .transition()
  //         .duration(100)
  //         .style("opacity", .85) // Make invisible div visable
  //     // Highlight the hovered circle
  //     d3.select(this)
  //       .transition()
  //       .duration(100)
  //       .style("opacity", 1);
  //   };
  //   // TOOLTIP MOUSE OUT EVENT HANDLER ----------------------
  //   const tipMouseout = function(d) {
  //       tooltip.transition()
  //           .duration(200)
  //           .style("opacity", 0); // Make tooltip div invisible once again
  //       // Remove highlight from hovered circle
  //       d3.select(this)
  //       .transition()
  //       .duration(200)
  //       .style("opacity", 0.5);
  //   };

  // DOTS FOR SCATTERPLOT ----------------------------------
  const dot = svg
    .selectAll(".dot") // Line below sorts films by largest budget to smallest, so small dots appear on top
    .data(data)
    .join("circle")
    .attr("class", "dot")
    .attr(
      "transform",
      (d) => `translate(${xScale(d.avgLvl)},${yScale(d.goldPerMonth)})`
    )
    .attr("r", (d) => sizeScale(d.membersCount))
    .attr("fill", (d) => colorScale(d.mainClass))
    .attr("stroke", "black");

  //   .join(
  //     enter => enter
  //       .append("circle")
  //         .attr("class", "dot")
  //         .attr("transform", `translate(${margin.left}, ${height - margin.top})`)
  //         .attr("r", d => sizeScale(d["Budget (million $)"]))
  //         .attr("fill", d => colorScale(d.Genre))
  //         .attr("stroke", "black")
  //         .attr("opacity", "0.4")
  //         .on("mouseover", tipMouseover)
  //         .on("mouseout", tipMouseout)
  //       .call(enter => enter
  //         .transition()
  //           .duration(1500)
  //           .delay((d, i) => yScale(d["Audience Ratings %"]) + i * 2)
  //           .attr("transform", d => `translate(${xScale(d["Rotten Tomatoes Ratings %"])}, ${yScale(d["Audience Ratings %"])})`)
  //       )
  //   );

  //   // LEGENDS ------------------------------------------------
  //   // Title for Legend
  svg
    .append("text")
    .text("Main Classes:")
    .attr("x", width - margin.right * 0.65)
    .attr("y", height * 0.3 - margin.top)
    .style("font-size", "1rem")
    .style("font-weight", "bold");

  //   // Color dots for Legend
  svg
    .selectAll(".legend-dot")
    .data(d3.schemeCategory10.slice(0, allClasses.length))
    .join("circle")
    .attr("class", "legend-dot")
    .attr("cx", width - margin.right * 0.62)
    .attr("cy", (_, i) => height * 0.33 - margin.top + 22 * i)
    .attr("r", 6)
    .attr("fill", (d) => d)
    .attr("stroke", "black")
    .attr("opacity", 0.7);

  //   // Class labels for Legend
  svg
    .selectAll(".legend-class")
    .data(allClasses)
    .join("text")
    .attr("class", "legend-class")
    .attr("x", width - margin.right * 0.55)
    .attr("y", (_, i) => height * 0.332 - margin.top + 22 * i)
    .text((d) => d)
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");

  //   // Grabbing the min, median, and max of budgets
  const allMemberCounts = data.map((d) => d.membersCount);
  const threeMemberCounts = [
    d3.min(allMemberCounts),
    d3.median(allMemberCounts),
    d3.max(allMemberCounts),
  ];

  //   // Title for Budget Legend
  svg
    .append("text")
    .text("Member Count:")
    .attr("x", width - margin.right * 0.65)
    .attr("y", height * 0.6 - margin.top)
    .style("font-weight", "bold")
    .style("font-size", "1rem");

  //   // Circle Sizes for Budget Legend
  svg
    .selectAll(".members-size")
    .data(threeMemberCounts)
    .join("circle")
    .attr("class", "members-size")
    .attr("cx", (d) => width - margin.right * 0.65 + sizeScale(d) / 2)
    .attr("cy", (d, i) => height * 0.63 - margin.top + i * 20 + sizeScale(d))
    .attr("r", (d) => sizeScale(d))
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("opacity", 0.7);

  //   svg.selectAll(".legend-size")
  //     .data(threeBudgets)
  //     .join("circle")
  //     .attr("class", "legend-size")
  //     .attr("cx", d => width - margin.right * .6 - sizeScale(d) / 2 - 5)
  //     .attr("cy", (_, i) => 378 + i * 35)
  //     .attr("r", d => sizeScale(d))
  //     .style("fill", "white")
  //     .attr("stroke", "black")
  //     .attr("opacity", "0.6")
  //   // Budget Dollars for Budget Legend
  //   svg.selectAll(".legend-budget")
  //     .data(threeBudgets)
  //     .join("text")
  //     .attr("class", "legend-budget")
  //     .attr("x", width - margin.right * .45 - 5)
  //     .attr("y", (_, i) => 380 + i * 35)
  //     .text(d => d === 0 ? "< $1 mill" : `$${d} mill`)
  //     .style("font-size", "15px")
  //     .attr("alignment-baseline","middle")
  // FILM TITLE LABELS ON HOVERED DOTS -----------------------
  // NOTE: Not used. Decided to replace with tooltips.
  // const text = svg
  //   .selectAll("text")
  //   .data(data)
  //   .enter()
  //   .append("text")
  //   .attr("x", d => xScale(d["Rotten Tomatoes Ratings %"]))
  //   .attr("y", d => yScale(d["Audience Ratings %"]))
  //   .text(d => d.Film)
  //   .style("opacity", 0)
  //   .on("mouseover", function(d) {
  //     d3.select(this)
  //       .transition()
  //       .duration("100")
  //       .style("opacity", 1)
  //   })
  //   .on("mouseout", function(d) {
  //     d3.select(this)
  //       .transition()
  //       .duration("200")
  //       .style("opacity", 0)
  //   });
});

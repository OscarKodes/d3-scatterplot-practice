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
  //   // AXIS LABELS ----------------------------------------------
  //   svg.append("text")
  //     .attr("text-anchor", "end")
  //     .attr("x", width / 2 + margin.left * 2)
  //     .attr("y", height - 6)
  //     .style("font-weight", "bold")
  //     .style("font-size", "1.2rem")
  //     .text("Rotten Tomatoes Ratings %");
  //   svg.append("text")
  //     .attr("text-anchor", "end")
  //     .attr("x", -height / 2 + margin.left * 2)
  //     .attr("y", 15)
  //     .style("font-weight", "bold")
  //     .style("font-size", "1.2rem")
  //     .attr("transform", "rotate(-90)")
  //     .text("Audience Ratings %");
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
  //   // Title for Genre Legend
  //   svg.append("text")
  //     .text("Genre:")
  //     .attr("x", width - margin.right / 2 - 15)
  //     .attr("y", 110)
  //     .style("font-size", "1rem")
  //     .style("font-weight", "bold")
  //   // Color dots for Genre Legend
  //   svg.selectAll(".legend-dot")
  //     .data(allColors)
  //     .join("circle")
  //     .attr("class", "legend-dot")
  //     .attr("cx", width - margin.right * .6 - 10)
  //     .attr("cy", (_, i) => 130 + i * 20)
  //     .attr("r", 6)
  //     .style("fill", d => d)
  //     .attr("stroke", "black")
  //     .attr("opacity", "0.6")
  //   // Genre labels for Genre Legend
  //   svg.selectAll(".legend-genre")
  //     .data(allGenres)
  //     .join("text")
  //     .attr("class", "legend-genre")
  //     .attr("x", width - margin.right / 2 - 10)
  //     .attr("y", (_, i) => 130 + i * 20)
  //     .text(d => d)
  //     .style("font-size", "15px")
  //     .attr("alignment-baseline","middle")
  //   // Grabbing the min, median, and max of budgets
  //   const allBudgets = data.map(d => d["Budget (million $)"]);
  //   const threeBudgets = [
  //     d3.min(allBudgets),
  //     d3.median(allBudgets),
  //     d3.max(allBudgets)
  //   ];
  //   // Title for Budget Legend
  //   svg.append("text")
  //     .text("Budget:")
  //     .attr("x", width - margin.right / 2 - 17)
  //     .attr("y", 355)
  //     .style("font-size", "1rem")
  //     .style("font-weight", "bold")
  //   // Circle Sizes for Budget Legend
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

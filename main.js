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

// Variables to be assigned in init() and used in draw()
let svg, xScale, yScale, colorScale, sizeScale;

// APPLICATION STATE #########################################
let state = {
  data: [],
  selectedClass: "All",
};

// IMPORT IN DATA ############################################
d3.csv("data.csv", d3.autoType).then((data) => {
  // Save the imported data into state object
  state.data = data;

  // Call init() function right after importing data
  init();
});

// INITIALIZING FUNTION ######################################
function init() {
  // Plan for scatterplot:
  //   title = guildName
  //     x = avgLvl
  //     y = goldPerMonth
  //     size = membersCount
  //     color = mainClass

  /* SCALES ##################################################### */
  xScale = d3
    .scaleLinear()
    .domain([0, d3.max(state.data.map((d) => d.avgLvl))])
    .range([margin.left, width - margin.right]);

  yScale = d3
    .scaleLinear()
    .domain([0, d3.max(state.data, (d) => d.goldPerMonth)])
    .range([height - margin.top, margin.bottom]);

  // // Placing genres and colors in variables to be reused in colorScale & Legend
  let allClasses = new Set(state.data.map((d) => d.mainClass));
  allClasses = [...allClasses];

  colorScale = d3.scaleOrdinal().domain(allClasses).range(d3.schemeCategory10);
  sizeScale = d3
    .scaleSqrt()
    .domain([1, d3.max(state.data, (d) => d.membersCount)])
    .range([3, 16]);

  /* HTML ELEMENTS ############################################## */
  // SVG CANVAS -----------------------------------------------
  svg = d3
    .select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  // .style("background-color", "lavender");
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
  const allMemberCounts = state.data.map((d) => d.membersCount);
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
    .attr("cy", (d, _) => height * 0.63 - margin.top * 1.6 + sizeScale(d) * 7)
    .attr("r", (d) => sizeScale(d))
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("opacity", 0.7);

  //   // Member Count for Legend
  svg
    .selectAll(".legend-memberCount")
    .data(threeMemberCounts)
    .join("text")
    .attr("class", "legend-memberCount")
    .attr("x", width - margin.right * 0.5)
    .attr("y", (d) => height * 0.625 - margin.top * 1.5 + sizeScale(d) * 7)
    .text((d) => d + " members")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");

  // USER INTERFACE SETUP FOR VIS OPTIONS ===================

  // Grab elements for listeners and values
  const selectMenu = d3.select("#dropdown");
  const selectClassText = d3.selectAll(".legend-class");
  const selectClassColor = d3.selectAll(".legend-dot");

  // Create array for holding vis options
  const menuData = [{ key: "All", label: "All" }];

  // Fill menuData with the possible data vis options
  allClasses.map((mainClass) => {
    menuData.push({ key: mainClass, label: mainClass });
  });

  // Create options in UI menu for user to click
  selectMenu
    .selectAll("option")
    .data(menuData)
    .join("option")
    .attr("value", (d) => d.key)
    .text((d) => d.label);

  // Listen for user changes on menu and call draw
  selectMenu.on("change", (event) => {
    state.selectedClass = event.target.value;
    draw();
  });

  // Listen for clicks on Class or Colors
  selectClassText.on("click", (_, d) => updateSelection(d));
  selectClassColor.on("click", (_, d) => updateSelection(d));

  // Update selected Class and call draw
  const updateSelection = (d) => {
    // Get index of Class or color
    let classIdx =
      allClasses.indexOf(d) >= 0 ? allClasses.indexOf(d) : allColors.indexOf(d);

    // Change menu option to current select option
    document.getElementById("dropdown").options.selectedIndex = classIdx + 1;

    state.selectedClass = allClasses[classIdx];

    draw();
  };

  // Call draw function once Init() is finished for the first time
  draw();
}

// DRAW FUNCTION ####################################################
function draw() {
  // Filter wanted data based on current state
  const filteredData = state.data.filter(
    (d) => state.selectedClass === "All" || state.selectedClass === d.mainClass
  );

  console.log(filteredData);

  // DOTS FOR SCATTERPLOT ----------------------------------
  const dot = svg
    .selectAll(".dot")
    .data(filteredData, (d) => d.guildName)
    .join(
      (enter) =>
        enter
          .append("circle")
          .attr("class", "dot")
          .attr(
            "transform",
            (d) => `translate(${xScale(d.avgLvl)},${yScale(d.goldPerMonth)})`
          )
          .attr("r", 0)
          .attr("fill", (d) => colorScale(d.mainClass))
          .attr("stroke", "black")
          .call((enter) =>
            enter
              .transition()
              .attr("r", (d) => sizeScale(d.membersCount))
              .duration(1500)
          ),
      (update) =>
        update
          .attr("stroke-width", "3px")
          .call((update) =>
            update.transition().attr("stroke-width", "1px").duration(1000)
          ),
      (exit) =>
        exit
          .call((exit) => exit.transition().duration(500).attr("r", 0))
          .remove()
    );

  // Tooltip Handling =============================================
  dot.attr("data-tippy-allowHTML", true);

  dot.attr("data-tippy-content", (d) => {
    return `
    <div class="tooltip">
      <p class="guild-name">The ${d.guildName}</p>
      <div class="info">
        <p><span>Main Class: </span>${d.mainClass}</p>
        <p><span>Average Level: </span>${d.avgLvl}</p>
        <p><span>Gold Per Month: </span>${d.goldPerMonth}</p>
        <p><span>Member Count: </span>${d.membersCount}</p>
      </div>
    </div>
    `;
  });

  tippy(dot.nodes());
}

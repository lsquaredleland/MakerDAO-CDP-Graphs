// d3.queue()
// 	.defer(d3.json, "data/blocks.json")
// 	.defer(d3.json, "data/cdps.json")
// 	.defer(d3.json, "data/cdps_actions.json")
// 	.defer(d3.json, "data/prices_eth.json")
// 	.defer(d3.json, "data/prices_mkr.json")
// 	.awaitAll(ready);

// function ready(error, results) {
// 	if (error) throw error;
// 	console.log(results)
// }

// query = `{
//   allCupActs(
//     first: 10,
//     orderBy: BLOCK_DESC,
//     condition: { act: BITE }
//   ) {
//     nodes {
//       id
//       lad
//       art
//       ink
//     }
//   }
// }`

// client = GraphQL.makeClient('https://graphql.makerdao.com/v1');

// // Pass the query and a callback to handle the response
// client.query(query, function(response){
//   console.log(response);
// });

// Will figure out graphQL later -> start with preloaded data + make visualization
const query768actions = `{
  getCup(id: 768) {
    lad
    art
    ink
    actions {
      nodes {
       	act
        arg
        art
        block
        ink
        pip
        ratio
        tab
        time
      }
    }
  }
}`

d3.queue()
	.defer(d3.json, "data/768actions.json")
	.defer(d3.json, "data/prices_eth.json")
	.awaitAll(ready);


function collateralizationRatio(ink, eth_price, peth_eth, art) {
	return ink * eth_price * peth_eth / art * 100;
}

function ready(err, res) {
	if (err) throw err;
	[ actions768, eth_prices ] = res;

	actions768 = actions768['data']['getCup']['actions']['nodes']

	console.log(actions768, eth_prices)

	const xRange = d3.extent(actions768, (d) => d.block)
	const xRangeTime = d3.extent(actions768, (d) => Date.parse(d.time))

	ethPricesConstrained = eth_prices.filter((d) => d.time > xRangeTime[0] && d.time < xRangeTime[1])


	function generateCollatRatio() {
		i = 0;
		l = actions768.length
		reversed = actions768.slice().reverse();
		collatRatio = ethPricesConstrained.map((d) => {
			const r = reversed[i];

			if (d.time > Date.parse(r.time)) {
				i++; // there is a corner case
				if (i == l) { i = l - 1}
			}

			ratio = collateralizationRatio(r.ink, d.price, 1.029, r.art)
			return {
				price: d.price,
				time: d.time,
				ratio: isFinite(ratio) ? ratio : 0,
				ink: r.ink,
				art: r.art
			}
		})
		return collatRatio
	}

	function calcLiquidationPrice() {
		// (Stability Debt * Liquidation Ratio) / (Collateral * PETH/ETH Ratio) = Liquidation Price

		i = 0;
		l = actions768.length
		reversed = actions768.slice().reverse();
		liquidationPrice = ethPricesConstrained.map((d) => {
			const r = reversed[i];

			if (d.time > Date.parse(r.time)) {
				i++; // there is a corner case?
				if (i == l) { i = l - 1}
			}

			// i is at the max value...
			liquid = r.art * 1.50 / (r.ink * 1.029)
			return {
				price: d.price,
				time: d.time,
				liquid: isFinite(liquid) ? liquid : 0,
			}
		})
		return liquidationPrice
	}

	function maximumDAI() {
		// to caculate the maximum DAI amount, set liquidation price equal to current price
		// (Stability Debt * Liquidation Ratio) / (Collateral * PETH/ETH Ratio) = Liquidation Price
		// Stability Debt = Liquidation Price * (Collateral * PETH/ETH Ratio) / Liquidation Ratio

		i = 0;
		l = actions768.length
		reversed = actions768.slice().reverse();
		maximumDAI = ethPricesConstrained.map((d) => {
			const r = reversed[i];

			if (d.time > Date.parse(r.time)) {
				i++; // there is a corner case?
				if (i == l) { i = l - 1}
			}

			// i is at the max value...
			maxDAI = d.price * r.ink * 1.029 / 1.50
			return {
				price: d.price,
				time: d.time,
				maxDAI: isFinite(maxDAI) ? maxDAI : 0,
				ink: r.ink,
				art: r.art
			}
		})
		return maximumDAI
	}

	// Amount of PETH outstanding
	createChart({
		svgName: "#svg1",
		data: actions768,
		xVar: 'block',
		xRange,
		yVar: 'ink',
		xLabel: 'Block Height',
		yLabel: 'Ink / PETH Balance'
	})

	// DAI issued from CDP vs maximum that could be
	dualLineChart({
		svgName: "#svg2",
		data: [actions768, maximumDAI()],
		xVar: ['block', 'time'],
		xRange: [xRange, xRangeTime],
		yVar: ['art', 'maxDAI'],
		xLabel: 'Block Height',
		yLabel: 'DAI Debt'
	})


	// Change in collateralization ratio (overlay with points when the user changed things)
	createChart({
		svgName: "#svg4",
		data: generateCollatRatio(),
		xVar: 'time',
		xRange: xRangeTime,
		yVar: 'ratio',
		xLabel: 'time',
		yLabel: 'collateral ratio'
	})

	// ETH prices (to overlay with liquidation prices)
	dualLineChart({
		svgName: "#svg3",
		data: [calcLiquidationPrice(), ethPricesConstrained],
		xVar: ['time', 'time'],
		xRange: [xRangeTime, xRangeTime],
		yVar: ['liquid', 'price'],
		xLabel: 'Time',
		yLabel: 'ETH Price (USD)'
	})
}

function createChart(input) {
	const { svgName, data, xVar, xRange, yVar, xLabel, yLabel } = input;
	var svg = d3.select(svgName),
	    margin = {top: 10, right: 20, bottom: 20, left: 50},
	    width = +svg.attr("width") - margin.left - margin.right,
	    height = +svg.attr("height") - margin.top - margin.bottom,
	    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scaleLinear()
	    .rangeRound([0, width]);
	x.domain(xRange);
	var y = d3.scaleLinear()
	    .domain([0, d3.max(data, (d) => parseInt(d[yVar]))]).nice()
    	.range([height, margin.top])
	var line = d3.line()
	    .x((d) => x(d[xVar]))
	    .y((d) => y(d[yVar]));

  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
    .append("text")
      .attr("fill", "#000")
      .attr("y", -9)
      .attr("x", width)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text(xLabel);
  g.append("g")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text(yLabel);
  g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);
}

function dualLineChart(input) {
	let { svgName, data, xVar, xRange, yVar, xLabel, yLabel } = input;
	let [ data1, data2 ] = data
	let [ xRange1, xRangeTime ] = xRange
	let [ yVar1, yVar2 ] = yVar
	let [ xVar1, xVar2 ] = xVar

	console.log('data1', data1, yVar1)

	var svg = d3.select(svgName),
	    margin = {top: 10, right: 20, bottom: 20, left: 50},
	    width = +svg.attr("width") - margin.left - margin.right,
	    height = +svg.attr("height") - margin.top - margin.bottom,
	    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scaleLinear()
	    .rangeRound([0, width]);
	x.domain(xRange1);
	var y = d3.scaleLinear()
	    .domain([0, d3.max(data2, (d) => parseInt(d[yVar2]))]).nice()
    	.range([height, margin.top])
	var line = d3.line()
	    .x((d) => x(d[xVar1]))
	    .y((d) => y(d[yVar1]));

	var x2 = d3.scaleLinear()
	    .rangeRound([0, width]);
	x2.domain(xRangeTime);

	var line2 = d3.line()
	    .x((d) => x2(d[xVar2]))
	    .y((d) => y(d[yVar2]));

  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
    .append("text")
      .attr("fill", "#000")
      .attr("y", -9)
      .attr("x", width)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text(xLabel);
  g.append("g")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text(yLabel);

  g.append("path")
      .datum(data1)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  g.append("path")
      .datum(data2)
      .attr("fill", "none")
      .attr("stroke", "maroon")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line2);
}

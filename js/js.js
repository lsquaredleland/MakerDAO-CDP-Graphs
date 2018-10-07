d3.queue()
	.defer(d3.json, "data/blocks.json")
	.defer(d3.json, "data/cdps.json")
	.defer(d3.json, "data/cdps_actions.json")
	.defer(d3.json, "data/prices_eth.json")
	.defer(d3.json, "data/prices_mkr.json")
	.awaitAll(ready);

function ready(error, results) {
	if (error) throw error;
	console.log(results)
}

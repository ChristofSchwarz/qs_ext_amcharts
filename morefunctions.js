requirejs.config({
    paths: {
        am4core: '../extensions/amchart/lib/core',
        am4charts: '../extensions/amchart/lib/charts'
    },
    shim: {
        am4core: {
            init: function () {
                console.log("adding am4core to window object.");
                return window.am4core;
            }
        },
        am4charts: {
            deps: ['am4core'],
            exports: 'am4charts',
            init: function () {
                console.log("adding am4charts to window object.");
                return window.am4charts;
            }
        }
    }
});
define(['am4core', 'am4charts'],
function (am4core, am4charts) {
	return {
		parseHyperCube: async function (layout, backendApi) {
			console.log('parseHyperCube function of morefunctions.js called');
			
			var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix; // the first datapage is already loaded
			var qHyperCubeHeight = qMatrix.length;
			var maxPages = Math.ceil(layout.qHyperCube.qSize.qcy / qHyperCubeHeight); 
			console.log('qHyperCube rows:', layout.qHyperCube.qSize.qcy, ' max pages: ', maxPages);
			var data = [];
			
			// start paging until the end of qHyperCube is reached
			for (page=0; page<maxPages; page++) {			
				console.log('dataPage ' + page);
				if (page > 0) {
					var requestPage = [{
						"qTop": qHyperCubeHeight * page,
						"qLeft": 0,
						"qWidth": 12, 
						"qHeight": qHyperCubeHeight
					}];
					// the first datapage is already returned
					var qDataPage = await backendApi.getData(requestPage);	
					qMatrix = qDataPage[0].qMatrix;
				}
				//console.log(qMatrix);
				
				qMatrix.forEach(function(row, i) {
					data.push({
						"dim1": row[0].qText,
						"value1": row[1].qNum
					});
                })
			}
			return data;
		},
		
		///////////////////////////////////////////////////////////////////////////////////////////////////////
		
		paintChart: function(layout, divTag, data) {
			console.log('paintChart function of morefunctions.js called');
			
			var chart = am4core.create(divTag, am4charts.XYChart);
			chart.data = data;
            
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "dim1";
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.renderer.minGridDistance = 30;

            categoryAxis.renderer.labels.template.adapter.add("dy", function (dy, target) {
                if (target.dataItem && target.dataItem.index & 2 == 2) {
                    return dy + 25;
                }
                return dy;
            });

            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

            // Create series
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = "value1";
            series.dataFields.categoryX = "dim1";
            series.name = layout.qHyperCube.qDimensionInfo[0].qFallbackTitle;
            series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
            series.columns.template.fillOpacity = layout.paramOpacity;

            var columnTemplate = series.columns.template;
            columnTemplate.strokeWidth = 2;
            columnTemplate.strokeOpacity = 1;

		}
	}
});


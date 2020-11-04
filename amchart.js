define(['qlik', './morefunctions'],
function (qlik, more) {
	var data; // global var in this function to keep the data for amChart
    return {
        initialProperties: {
            qHyperCubeDef: {
                qDimensions: [],
                qMeasures: [],
                qInitialDataFetch: [{
                    qWidth: 2,
                    qHeight: 5000
                }]
            }
        },
        definition: {
            type: "items",
            component: "accordion",
            items: {
                dimensions: {
                    uses: "dimensions",
                    min: 1,
                    max: 1
                },
                measures: {
                    uses: "measures",
                    min: 1,
                    max: 1
                },
                sorting: {
                    uses: "sorting"
                },
                addons: {
                    uses: "addons",
                    items: {
                        dataHandling: {
                            uses: "dataHandling",
                            items: {
                                calcCond: { uses: "calcCond" }
                            }
                        }
                    }
                },
                settings: {
                    uses: "settings",
                    items: {
                        i1: {
                            label: 'Extension Settings',
                            type: 'items',
                            items: [{
                                label: "More settings for the amChart ...",
                                component: "text"
                            }, {
                                ref: "paramOpacity",
                                label: "Opacity (0..1)",
                                type: "number",
                                defaultValue: .8,
                                expression: 'optional'
                            }]
                        }
                    }
                }
            }
        },
        support: {
            snapshot: true,
            export: true,
            exportData: false
        },
		resize: function($element, layout) {
			console.log('resize method of amchart.js called');
			var ownId = this.options.id;
			// data (global var) must be set by now
			//more.paintChart(layout, ownId + '_parent', data);  
			// amChart seem to catch resizes itself, no need to call paintChart again
			return qlik.Promise.resolve();
		},
		paint: async function($element, layout) {
			console.log('paint method of amchart.js called');
			var ownId = this.options.id;
			$element.html('<div id="' + ownId + '_parent" style="height:100%;">Initializing...</div>');
			//var app = qlik.currApp(this);
			//var enigma = app.model.enigmaModel;
			data = await more.parseHyperCube(layout, this.backendApi);
			more.paintChart(layout, ownId + '_parent', data);
			return qlik.Promise.resolve();
		}
    };
});

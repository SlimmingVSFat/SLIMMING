$(document).ready(function() {
	G6.registerNode(
		'tree-nodes', {
			// 节点形状
			draw: (cfg, group) => {
				const keyShape = group.addShape('rect', {
					attrs: {
						fill: cfg.fillColor,
						stroke: 'black',
						x: 0,
						y: 0,
					},
					// must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
					name: 'rect-shape',
				});
				const text = group.addShape('text', {
					attrs: {
						text: cfg.name,
						x: 65,
						y: 0,
						// fontSize: 15,
						textAlign: 'center',
						textBaseline: 'top',
						fill: 'black',
					},
					// must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
					name: 'text-shape',
				});
				const bbox = text.getBBox();
				const hasChildren = cfg.children && cfg.children.length > 0;
				keyShape.attr({
					width: bbox.maxX + (hasChildren ? 15 : 9),
					height: 34,
				});
				text.attr({
					x: bbox.maxX / 2,
					y: 15,
					textAlign: 'center',
					// textBaseline: 'middle',
				});
				if (hasChildren) {
					// 缩进环
					group.addShape('marker', {
						attrs: {
							x: bbox.maxX + 7,
							y: 17,
							r: 6,
							cursor: 'pointer',
							symbol: cfg.collapsed ? G6.Marker.expand : G6.Marker.collapse,
							stroke: '#666',
							lineWidth: 2,
						},
						// must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
						name: 'collapse-icon',
					});
				}
				const subGroup = group.addGroup();
				let constant = 0;
				cfg.problem.forEach((item, i) => {
					if (item === "1") {
						let color = "#87CEFA";
						if (i === 1) {
							color = "#FFA500";
						} else if (i === 2) {
							color = "purple";
						}
						subGroup.addShape('rect', {
							attrs: {
								x: 4 + constant,
								y: 2,
								width: 10,
								height: 10,
								fill: color,
								lineWidth: 2,
								stroke: 'black',
							},
							name: 'top-icon-${i}',
						});
						constant += 14;
					}
				});

				return keyShape;
			},
			update: (cfg, item) => {
				const group = item.getContainer();
				const icon = group.find((e) => e.get('name') === 'collapse-icon');
				icon.attr('symbol', cfg.collapsed ? G6.Marker.expand : G6.Marker.collapse);
			},
		},
		'rect',
	);
	// 自定义边
	G6.registerEdge(
		'line-dash', {
			afterDraw(cfg, group) {
				const {
					targetNode
				} = cfg;
				const edgeColor = targetNode._cfg.model.edgeColor;
				if (edgeColor === 'red') {
					cfg.style.lineDash = [4, 2, 1, 2];
				}
				if (edgeColor) {
					cfg.style.stroke = edgeColor;
					cfg.style.endArrow.fill = edgeColor;
				}
				const shape = group.get('children')[0];
				const startPoint = shape.getPoint(0);
				// add red circle shape
				const circle = group.addShape('circle', {
					attrs: {
						x: startPoint.x,
						y: startPoint.y,
						fill: '#1890ff',
						r: 3,
					},
					// must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
					name: 'circle-shape',
				});

				// animation for the red circle
				circle.animate(
					(ratio) => {
						// the operations in each frame. Ratio ranges from 0 to 1 indicating the prograss of the animation. Returns the modified configurations
						// get the position on the edge according to the ratio
						const tmpPoint = shape.getPoint(ratio);
						// returns the modified configurations here, x and y here
						return {
							x: tmpPoint.x,
							y: tmpPoint.y,
						};
					}, {
						repeat: true, // whether executes the animation repeatly
						duration: 2000, // the duration for executing once
					},
				);
			},
		},
		'polyline', // extend the built-in edge 'cubic'
	);
	const contains = document.getElementById('contains');
	const width = contains.scrollWidth;
	const height = contains.scrollHeight || 1000;

	// const minimap = new G6.Minimap({
	// 	size: [150, 100]
	// });

	const fittingString = (str, maxWidth, fontSize) => {
		let currentWidth = 0;
		let res = str;
		const pattern = new RegExp('[\u4E00-\u9FA5]+'); // distinguish the Chinese charactors and letters
		str.split('').forEach((letter, i) => {
			if (currentWidth > maxWidth) return;
			if (pattern.test(letter)) {
				// Chinese charactors
				currentWidth += fontSize;
			} else {
				// get the width of single letter according to the fontSize
				currentWidth += G6.Util.getLetterWidth(letter, fontSize);
			}
			if (currentWidth > maxWidth) {
				res = `${str.substr(0, i)}\n${str.substr(i)}`;
			}
		});
		return res;
	};
	// 创建提示框
	const tooltip = new G6.Tooltip({
		offsetX: 15,
		offsetY: 15,
		// 允许出现 tooltip 的 item 类型
		itemTypes: ["node"],
		getContent: (e) => {
			const outDiv = document.createElement("div");
			outDiv.style.width = "fit-content";
			outDiv.className = "tooltip";
			outDiv.style.transform = `scale(${e.currentTarget.getZoom()})`;
			outDiv.style.transformOrigin = "top left";

			outDiv.innerHTML =
				`
				  <div style="
				    background-color: rgba(255, 255, 255, 0.8);
				    padding: 12px 15px;
				    font-size: 12px;
				    box-shadow: rgb(174, 174, 174) 0px 0px 10px;">
				    <h4>Dependency Info</h4>
				    <ul>
				      <li><strong>GroupId:</strong> ${e.item.getModel().groupId}</li>
				      <li><strong>Version:</strong> ${e.item.getModel().version}</li>
				      <li><strong>Scope:</strong> ${e.item.getModel().scope}</li>
				      <li><strong>Type:</strong> ${e.item.getModel().jarType}</li>
				    </ul>
				  </div>`;
			return outDiv;
		},
		className: "tip"
	});
	// 图例
	const typeConfigs = {
		type1: {
			type: "rect",
			size: [40, 20],
			style: {
				stroke: "black",
				lineWidth: 1,
				fill: "red"
			}
		},
		type2: {
			type: "rect",
			size: [40, 20],
			style: {
				stroke: "black",
				lineWidth: 2,
				fill: "white",
				fillOpacity: 0
			}
		},
		type3: {
			type: "rect",
			size: [40, 20],
			style: {
				stroke: "black",
				lineWidth: 2,
				fill: "gray"
			}
		},
		type4: {
			type: "rect",
			size: [20, 20],
			style: {
				stroke: "black",
				lineWidth: 2,
				fill: "#87CEFA"
			}
		},
		type5: {
			type: "rect",
			size: [20, 20],
			style: {
				stroke: "black",
				lineWidth: 2,
				fill: "#FFA500"
			},
		},
		type6: {
			type: "rect",
			size: [20, 20],
			style: {
				stroke: "black",
				lineWidth: 2,
				fill: "purple"
			}
		},
		eType1: {
			type: "line",
			style: {
				width: 40,
				stroke: "red",
				lineDash: [4, 2, 1, 2],
				endArrow: {
					path: 'M 0,0 L 8,4 L 8,-4 Z',
					fill: 'red'
				}
			}
		},
		eType2: {
			type: "line",
			style: {
				width: 40,
				stroke: "black",
				endArrow: {
					path: 'M 0,0 L 8,4 L 8,-4 Z',
					fill: 'black'
				}
			}
		},
		eType3: {
			type: "line",
			style: {
				width: 40,
				stroke: "#FFA500",
				endArrow: {
					path: 'M 0,0 L 8,4 L 8,-4 Z',
					fill: '#FFA500'
				}
			}
		}
	};
	const legendData = {
		nodes: [{
				id: 'a',
				label: '冗余依赖',
				...typeConfigs["type1"],
				labelCfg: {
					style: {
						fontSize: 25,
					}
				}
			},
			{
				id: 'b',
				label: '使用的依赖',
				...typeConfigs["type2"],
				labelCfg: {
					style: {
						fontSize: 25,
					}
				}
			},
			{
				id: 'c',
				label: '依赖冲突',
				...typeConfigs["type3"],
				labelCfg: {
					style: {
						fontSize: 25,
					}
				}
			},
			{
				id: 'd',
				label: '过时依赖',
				...typeConfigs["type4"],
				labelCfg: {
					style: {
						fontSize: 25,
					}
				}
			},
			{
				id: 'd',
				label: '安全漏洞',
				...typeConfigs["type5"],
				labelCfg: {
					style: {
						fontSize: 25,
					}
				}
			},
			{
				id: 'd',
				label: '开源许可证冲突',
				...typeConfigs["type6"],
				labelCfg: {
					style: {
						fontSize: 25,
					}
				}
			}
		],
		edges: [{
				id: 'a',
				label: '未加载的依赖边',
				...typeConfigs["eType1"],
				labelCfg: {
					style: {
						fontSize: 25,
					}
				}
			},
			{
				id: 'b',
				label: '已加载的依赖边',
				...typeConfigs["eType2"],
				labelCfg: {
					style: {
						fontSize: 25,
					}
				}
			},
			{
				id: 'c',
				label: '通过反射加载的依赖边',
				...typeConfigs["eType3"],
				labelCfg: {
					style: {
						fontSize: 25,
					}
				}
			}
		]
	}
	const legend = new G6.Legend({
		data: legendData,
		align: 'center',
		layout: 'vertical', // vertical
		position: 'bottom-right',
		vertiSep: 10, // 图例间的竖直间距
		horiSep: 0, // 图例间的水平间距
		// offsetY: -220,
		padding: [4, 16, 20, 16],
		// margin: [0,0,8,0],
		containerStyle: {
			fill: 'white',
			lineWidth: 1,
		},
	});

	// 创建树图
	const graph = new G6.TreeGraph({
		container: 'contains',
		width,
		height,
		plugins: [legend, tooltip],
		nodeStateStyles: {
			// 各状态下的样式，平铺的配置项仅在 keyShape 上生效。需要在其他 shape 样式上响应状态变化则写法不同，参见上文提到的 配置状态样式 链接
			hover: {
				fillOpacity: 0.1,
				lineWidth: 2,
			},
		},
		modes: {
			default: [{
					// 数据展开操作
					type: 'collapse-expand',
					trigger: 'click',
					onChange: function onChange(item, collapsed) {
						const data = item.get('model');
						graph.updateItem(item, {
							collapsed,
						});
						data.collapsed = collapsed;
						return true;
					},
				},
				'drag-canvas', // 拖拽画布
				'zoom-canvas', // 缩放画布
				'activate-relations', // 显示该节点以及与其直接关联的节点和连线
			],
		},
		defaultNode: {
			type: 'tree-nodes',
			// 变的连入位置
			anchorPoints: [
				[0, 0.5],
				[1, 0.5],
			],
		},
		defaultEdge: {
			type: 'line-dash',
			style: {
				stroke: 'black',
				endArrow: {
					path: 'M 0,0 L 8,4 L 8,-4 Z',
					fill: 'black'
				}
			},
		},
		layout: {
			type: 'compactBox',
			direction: 'LR',
			getId: function getId(d) {
				return d.id;
			},
			// getHeight: function getHeight() { // 每个节点的高度
			// 	return 60;
			// },
			// getWidth: function getWidth() { // 每个节点的宽度
			// 	return 200;
			// },
			getVGap: function getVGap() { // 每个节点的高度
				return 30;
			},
			getHGap: function getHGap() { // 每个节点的水平间隙
				return 100;
			},
		},
		// fitView: true,
		// fitViewPadding: width * 0.1,
	});
	const data = {
		"id": "org.example:unindirectDependency:1.0",
		"name": "unindirectDependency",
		"groupId": "org.example",
		"version": "1.0",
		"scope": "client",
		"jarType": "jar",
		'fillColor': "",
		"edgeColor": "",
		"problem": ['0', '0', '0'], // 过时、安全漏洞、开源许可证冲突
		"children": [{
				"id": "neu.decca:TestParLib:1.0",
				"name": "TestParLib",
				"groupId": "neu.decca",
				"version": "1.0",
				"scope": "compile",
				"jarType": "jar",
				'fillColor': "red",
				"edgeColor": "#FFA500",
				"problem": ['0', '1', '0'],
				"children": [{
					"id": "neu.lab406:TestPreLib1:1.0",
					"name": "TestPreLib1",
					"groupId": "neu.lab406",
					"version": "1.0",
					"scope": "compile",
					"jarType": "jar",
					'fillColor': "white",
					"edgeColor": "",
					"problem": ['0', '0', '0'],
					"children": [{
						"id": "neu.lab:TestLib:1.1",
						"name": "TestLib",
						"groupId": "neu.lab",
						"version": "1.1",
						"scope": "compile",
						"jarType": "jar",
						'fillColor': "gray",
						"edgeColor": "red",
						"problem": ['0', '0', '1'],
						"children": []
					}]
				}]
			},
			{
				"id": "junit:junit:4.13.2",
				"name": "junit",
				"groupId": "junit:",
				"version": "4.13.2",
				"scope": "test",
				"jarType": "jar",
				'fillColor': "white",
				"edgeColor": "",
				"problem": ['0', '0', '0'],
				"children": [{
					"id": "org.hamcrest:hamcrest-core:1.3",
					"name": "hamcrest-core",
					"groupId": "org.hamcrest",
					"version": "1.3",
					"scope": "test",
					"jarType": "jar",
					'fillColor': "white",
					"edgeColor": "",
					"problem": ['0', '0', '0'],
					"children": []
				}]
			},
			{
				"id": "neu.lab:MixCasePre:1.1",
				"name": "MixCasePre",
				"groupId": "neu.lab",
				"version": "1.1",
				"scope": "compile",
				"jarType": "jar",
				'fillColor': "white",
				"edgeColor": "",
				"problem": ['1', '0', '0'],
				"children": [{
					"id": "neu.lab:MixCase:1.1",
					"name": "MixCase",
					"groupId": "neu.lab",
					"version": "1.1",
					"scope": "compile",
					"jarType": "jar",
					'fillColor': "gray",
					"edgeColor": "red",
					"problem": ['1', '1', '1'],
					"children": []
				}]
			},
			{
				"id": "java-string-similarity:info.debatty:2.0.0",
				"name": "java-string-similarity",
				"groupId": "info.debatty",
				"version": "2.0.0",
				"scope": "compile",
				"jarType": "jar",
				'fillColor': "white",
				"edgeColor": "",
				"problem": ['0', '0', '0'],
				"children": [{
					"id": "jcip-annotations:net.jcip:1.0",
					"name": "jcip-annotations",
					"groupId": "net.jcip",
					"version": "1.0",
					"scope": "compile",
					"jarType": "jar",
					'fillColor': "white",
					"edgeColor": "",
					"problem": ['0', '0', '0'],
					"children": []
				}]
			},
			{
				"id": "neu.lab:MixCase:2.0",
				"name": "MixCase",
				"groupId": "neu.lab",
				"version": "2.0",
				"scope": "compile",
				"jarType": "jar",
				'fillColor': "white",
				"edgeColor": "",
				"problem": ['0', '0', '0'],
				"children": [{
					"id": "neu.lab:TestLib:1.0()",
					"name": "TestLib",
					"groupId": "neu.lab",
					"version": "1.0",
					"scope": "compile",
					"jarType": "jar",
					'fillColor': "gray",
					"edgeColor": "red",
					"problem": ['0', '1', '0'],
					"children": []
				}]
			},
			{
				"id": "neu.lab:TestLib:1.0(omit)",
				"name": "TestLib",
				"groupId": "neu.lab",
				"version": "1.0",
				"scope": "compile",
				"jarType": "jar",
				'fillColor': "white",
				"edgeColor": "",
				"problem": ['0', '0', '0'],
				"children": []
			}
		]
	}
	G6.Util.traverseTree(data, function(item) {
		item.id = item.id;
	});
	graph.data(data);
	graph.render();
	graph.fitView();
	// 监听鼠标进入节点事件
	graph.on('node:mouseenter', (evt) => {
		const node = evt.item;
		// 激活该节点的 hover 状态
		graph.setItemState(node, 'hover', true);
	});
	// 监听鼠标离开节点事件
	graph.on('node:mouseleave', (evt) => {
		const node = evt.item;
		// 关闭该节点的 hover 状态
		graph.setItemState(node, 'hover', false);
	});
	if (typeof window !== 'undefined')
		window.onresize = () => {
			if (!graph || graph.get('destroyed')) return;
			if (!container || !container.scrollWidth || !container.scrollHeight) return;
			graph.changeSize(container.scrollWidth, container.scrollHeight);
		};
});

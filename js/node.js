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
	const height = contains.scrollHeight || 500;

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
		plugins: [legend],
		nodeStateStyles: {
			// 各状态下的样式，平铺的配置项仅在 keyShape 上生效。需要在其他 shape 样式上响应状态变化则写法不同，参见上文提到的 配置状态样式 链接
			hover: {
				fillOpacity: 0.1,
				lineWidth: 2,
			},
		},
		modes: {
			default: [{
					type: 'tooltip',
					formatText(model) {
						const text = '<strong>GroupId: </strong>' + model.groupId + '<br/> <strong>Version: </strong>' + model.version +
							'<br/> <strong>Scope: </strong>' + model.scope + '<br/> <strong>Type: </strong>' + model.jarType;
						return text;
					},
				}, {
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
		fitView: true,
		fitViewPadding: width * 0.07,
	});
	const data = {"name":"boot.etcd","id":"a910787e-5bb5-4250-ad96-3e2c18f33fce","groupId":"com.example","version":"0.0.1-SNAPSHOT","scope":"client","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-cloud-commons","id":"7518d784-b04a-4ace-997e-c426f17232dd","groupId":"org.springframework.cloud","version":"1.1.0.RELEASE","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-security-crypto","id":"84688839-850f-44e2-bb55-df61e0f116d0","groupId":"org.springframework.security","version":"5.6.2","scope":"compile","jarType":"jar","fillColor":"red","edgeColor":"","problem":["0","0","0"],"children":[]}]},{"name":"spring-cloud-cluster-etcd","id":"7ccc0ff3-4936-47b9-9ba8-8dc389fc2a65","groupId":"org.springframework.cloud","version":"1.0.2.RELEASE","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"etcd4j","id":"87ddef94-f650-4136-96d7-a08fbd4d30de","groupId":"org.mousio","version":"2.7.0","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jackson-core","id":"c81b705d-f901-4b84-b88f-75afb5354ce5","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"slf4j-api","id":"1a15ca80-edd6-4331-a6df-ad8e5558091d","groupId":"org.slf4j","version":"1.7.36","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"netty-codec-http","id":"3ea5df6b-cb8c-47d3-ac12-20ee81960bac","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"netty-handler","id":"92dc3f54-40c5-4d3d-b8b8-9e3f8751e7a1","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"netty-common","id":"b12a0102-8a86-42fa-bc85-8f310c531764","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"netty-buffer","id":"a61d02c9-f5a4-419a-bbdc-eb39a6cecdc8","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"netty-common","id":"b33b1d6a-1898-423a-8160-36aeb54c4d60","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"netty-transport","id":"8a419d10-f571-4be3-b516-158f63928c0f","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"netty-common","id":"5a028b08-571d-47e1-a66f-c766e23e6420","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"netty-resolver","id":"10be9134-45ed-4aa8-9b76-d6342a26ae2a","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"netty-buffer","id":"5d08bb1c-0827-40b1-a076-d90129f06ce9","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"netty-codec","id":"1122940c-4a4a-449c-bf93-10ab6c3eddd6","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"netty-transport","id":"0ce6088b-413a-400e-851c-710d34bf0de6","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"netty-common","id":"ec7f2206-578f-4d72-bd1e-9b7527dedbde","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"netty-buffer","id":"2e8c62ed-c9f3-4877-88d6-c1dc40c73c81","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]}]},{"name":"netty-handler","id":"babcaca5-3fdc-4770-883d-9aaf216f6ce1","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"netty-transport","id":"b30e4860-f720-46fa-b37e-d2fdd7fd1d92","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"netty-common","id":"81557356-5bfb-4743-aced-3cfd4c1db32f","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"netty-codec","id":"e0149992-9d0a-4cd0-9a7b-4381d24399e7","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"netty-tcnative-classes","id":"a400ce74-7aa5-40c9-8c59-033316a8ccae","groupId":"io.netty","version":"2.0.48.Final","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"netty-resolver","id":"61dcaa19-f435-4c11-8fb9-debe709d98f7","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"netty-common","id":"0d75ce89-c3b4-45d3-b458-54f50a78c006","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"netty-buffer","id":"75aae8a0-62e8-4820-99c0-bf3ff0fbed5a","groupId":"io.netty","version":"4.1.74.Final","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]}]},{"name":"spring-cloud-cluster-core","id":"bcd488e1-3f48-404d-84ab-a48368608972","groupId":"org.springframework.cloud","version":"1.0.2.RELEASE","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-boot-starter","id":"3d3c155e-9066-453b-b4c8-1b581d5c5183","groupId":"org.springframework.boot","version":"2.6.4","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-boot-starter-logging","id":"3107927f-b4d9-4e25-9cc9-ad5f7c1260b0","groupId":"org.springframework.boot","version":"2.6.4","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"log4j-to-slf4j","id":"c83f1a84-b931-4a61-97fb-5394f4e77963","groupId":"org.apache.logging.log4j","version":"2.17.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"slf4j-api","id":"24c2edf8-77ac-445b-84cc-af7d4fce1ca1","groupId":"org.slf4j","version":"1.7.36","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"log4j-api","id":"a400a78a-6fe4-4b35-9016-5a837ca6d838","groupId":"org.apache.logging.log4j","version":"2.17.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]}]},{"name":"jul-to-slf4j","id":"bf97826b-f2b5-4d19-b731-f8714256bec4","groupId":"org.slf4j","version":"1.7.36","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"slf4j-api","id":"7a8ebfab-bd96-4bde-bd91-af17cd2e3f99","groupId":"org.slf4j","version":"1.7.36","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"logback-classic","id":"e28c08d7-c771-48f8-86f3-e5a2e5eae90c","groupId":"ch.qos.logback","version":"1.2.10","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"slf4j-api","id":"aee4785a-58ab-4c04-98d1-3b154ee83446","groupId":"org.slf4j","version":"1.7.36","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"logback-core","id":"5a2dbf14-0707-4c51-885e-b25371f3f5a0","groupId":"ch.qos.logback","version":"1.2.10","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]}]}]},{"name":"jakarta.annotation-api","id":"95079fa2-79bd-4bf6-925d-946f41e92bc4","groupId":"jakarta.annotation","version":"1.3.5","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"#FFA500","problem":["0","0","0"],"children":[]},{"name":"snakeyaml","id":"56850c91-e1ee-4247-bccd-1f9162e29780","groupId":"org.yaml","version":"1.29","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"spring-boot","id":"c67eff3c-fd07-4895-ac77-5c1c62c8ae84","groupId":"org.springframework.boot","version":"2.6.4","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-context","id":"33cb7182-06ff-48fc-9c5c-1123dc7355f0","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"spring-core","id":"76e44e54-add8-4d44-8369-c7e9081a8a67","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"spring-boot-autoconfigure","id":"d16af879-86e5-4fd6-9d44-4835f346d4d4","groupId":"org.springframework.boot","version":"2.6.4","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-boot","id":"2a3d3082-8218-4b14-b08b-16752bba8571","groupId":"org.springframework.boot","version":"2.6.4","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"spring-core","id":"a899da2f-d057-4a0c-ba5a-ae68db536a5c","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"spring-tx","id":"3296b51d-7755-43a5-bc80-56c427982dad","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-core","id":"0fa4dea9-12da-4e94-9b8b-41c4efdbfeb7","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"spring-beans","id":"0aa66041-820e-49d3-9a44-3a0a86cc7d22","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]}]}]},{"name":"spring-boot-starter-jersey","id":"f59d8211-c1c9-4d7b-9a04-57a1ff36caf3","groupId":"org.springframework.boot","version":"2.6.13","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jersey-container-servlet-core","id":"a1bc12a6-395b-45d9-8808-930033482b48","groupId":"org.glassfish.jersey.containers","version":"2.35","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jersey-common","id":"1a1fe871-2539-40d2-a953-5a9b5ea75876","groupId":"org.glassfish.jersey.core","version":"2.35","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jakarta.inject","id":"31d7f264-ade4-458a-a8b7-4d28c8b6a750","groupId":"org.glassfish.hk2.external","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"#FFA500","problem":["0","0","0"],"children":[]},{"name":"jakarta.ws.rs-api","id":"7dacc5cc-8159-42e5-8bd0-058cbb9f0846","groupId":"jakarta.ws.rs","version":"2.1.6","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jersey-server","id":"ef7ec645-6fbb-4a98-813c-885de0d5b79e","groupId":"org.glassfish.jersey.core","version":"2.35","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"jersey-container-servlet","id":"c56ad68d-9078-4525-8102-f84c4eada91d","groupId":"org.glassfish.jersey.containers","version":"2.35","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jersey-server","id":"bf0235df-1b9a-496a-ad06-969ff3ae73d4","groupId":"org.glassfish.jersey.core","version":"2.35","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jersey-container-servlet-core","id":"31833990-e968-4765-9071-bc3c966bdd8f","groupId":"org.glassfish.jersey.containers","version":"2.35","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jersey-common","id":"3553e631-eb68-41cb-9a4a-09fb3a070c64","groupId":"org.glassfish.jersey.core","version":"2.35","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jakarta.ws.rs-api","id":"190c85c7-2434-4979-97dd-c8f44cb2db31","groupId":"jakarta.ws.rs","version":"2.1.6","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"jersey-media-json-jackson","id":"1dd5cbaf-00f2-45a8-a111-32c3275fa726","groupId":"org.glassfish.jersey.media","version":"2.35","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jackson-annotations","id":"b5ea147e-0d86-471a-b209-5502d75ca21d","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jackson-module-jaxb-annotations","id":"c0ebbecb-d409-4717-a3d1-24ab3597bce8","groupId":"com.fasterxml.jackson.module","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jackson-core","id":"e14ca7eb-0f30-41a4-8006-489a62bb0593","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jackson-annotations","id":"08068230-f232-4882-8797-a44118904241","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jackson-databind","id":"b8f5a21c-d4ca-49e4-8593-1ec0b3fb1df1","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jakarta.xml.bind-api","id":"10c49ea8-a896-4592-80e3-466c86b25639","groupId":"jakarta.xml.bind","version":"2.3.3","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jakarta.activation-api","id":"75e7bf16-421d-4c24-8024-9e66877fdf9b","groupId":"jakarta.activation","version":"1.2.2","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"jakarta.activation-api","id":"beff49c2-eba0-460a-9402-812dad530aaf","groupId":"jakarta.activation","version":"1.2.2","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]}]},{"name":"jersey-common","id":"1e181987-ebaf-427b-a507-e61528f8d3b1","groupId":"org.glassfish.jersey.core","version":"2.35","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jersey-entity-filtering","id":"41f90b6f-ab2a-403b-a375-a8e8b14629f7","groupId":"org.glassfish.jersey.ext","version":"2.35","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jakarta.ws.rs-api","id":"1a0396ba-7f87-4c08-ad1d-17395185e9b2","groupId":"jakarta.ws.rs","version":"2.1.6","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"jackson-databind","id":"15003443-be23-428b-a5aa-cf3c60ba4d2f","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"jersey-bean-validation","id":"a4311cdd-2732-42b3-9726-ae010412d586","groupId":"org.glassfish.jersey.ext","version":"2.35","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jersey-common","id":"601dcdcb-1ed7-47f5-8aac-0a9509a768a2","groupId":"org.glassfish.jersey.core","version":"2.35","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jakarta.ws.rs-api","id":"3f8095b6-b49f-45e2-9ca8-083fcea1b82a","groupId":"jakarta.ws.rs","version":"2.1.6","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jakarta.inject","id":"62ffbeb5-471d-495c-8674-304bf57ae164","groupId":"org.glassfish.hk2.external","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"#FFA500","problem":["0","0","0"],"children":[]},{"name":"jakarta.validation-api","id":"defdefd9-4ee1-4a26-9d23-fae73b2875e8","groupId":"jakarta.validation","version":"2.0.2","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jersey-server","id":"178ce424-d8f4-46c3-9a76-c390aed639ad","groupId":"org.glassfish.jersey.core","version":"2.35","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"hibernate-validator","id":"caa95aa4-6844-406a-9b20-998847393300","groupId":"org.hibernate.validator","version":"6.2.2.Final","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"spring-boot-starter-json","id":"dbb62783-bcfe-4785-9088-3ab4af700cdb","groupId":"org.springframework.boot","version":"2.6.4","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jackson-datatype-jdk8","id":"333e0695-b4e3-467b-83a8-aacafaaf5800","groupId":"com.fasterxml.jackson.datatype","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jackson-databind","id":"745fe14c-db50-4bbf-9930-91fafd83bb2d","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jackson-core","id":"e1635a3e-331f-460f-aaf9-eabc0889eb20","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"jackson-datatype-jsr310","id":"05647f7e-e694-44ce-819d-77954c4e496e","groupId":"com.fasterxml.jackson.datatype","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jackson-annotations","id":"b6eb2aa9-83a3-41fc-a6e9-ae30553107b3","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jackson-core","id":"3f81f3b4-81a8-47ef-897e-30d6cead9636","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jackson-databind","id":"f692dcae-a028-46cf-9d75-8f2a41c17bbd","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"spring-boot-starter","id":"b506ab74-4f4f-42ab-a028-9b9fb9b93f73","groupId":"org.springframework.boot","version":"2.6.4","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jackson-module-parameter-names","id":"5dc4b723-02b5-4909-ad92-b445b619bb8d","groupId":"com.fasterxml.jackson.module","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jackson-databind","id":"e1f165c9-a850-421e-b3e1-6099d30c06c6","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jackson-core","id":"11b5a106-ba4c-4e22-8a3e-54a8af8bf4c6","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"spring-web","id":"c08877c7-7d02-4bd3-b2d2-195129c1d769","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jackson-databind","id":"de24ff1e-13b9-4fe6-a7c5-4c4c3bf684bf","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"spring-boot-starter-validation","id":"131494de-9580-487b-a366-031bd417bf72","groupId":"org.springframework.boot","version":"2.6.4","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"hibernate-validator","id":"2a9e8534-88f6-410f-94de-034ee9d9ef9e","groupId":"org.hibernate.validator","version":"6.2.2.Final","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jakarta.validation-api","id":"6d87d64f-c2dc-4ced-9b75-c7cad1177d48","groupId":"jakarta.validation","version":"2.0.2","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jboss-logging","id":"7028a779-220e-4ff9-a312-aa4cd4d0e474","groupId":"org.jboss.logging","version":"3.4.3.Final","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"classmate","id":"a6ef58e4-60ff-444e-84f7-7d5cb66cdb26","groupId":"com.fasterxml","version":"1.5.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]}]},{"name":"spring-boot-starter","id":"e4df728b-40cf-4994-8050-132a679845ac","groupId":"org.springframework.boot","version":"2.6.4","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"tomcat-embed-el","id":"a381b8da-ebbc-4dd8-acd6-b31cc9ca90f9","groupId":"org.apache.tomcat.embed","version":"9.0.58","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"jersey-server","id":"f0b85679-4883-4e0a-b015-b83ef70da71f","groupId":"org.glassfish.jersey.core","version":"2.35","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jakarta.inject","id":"5e3bfcff-0e5b-45e4-960e-3b47693d51b1","groupId":"org.glassfish.hk2.external","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"#FFA500","problem":["0","0","0"],"children":[]},{"name":"jersey-common","id":"dc666006-1677-470c-862f-ff7dd566f161","groupId":"org.glassfish.jersey.core","version":"2.35","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jakarta.annotation-api","id":"ba9506f6-1476-4243-b134-d530b4f8e1b2","groupId":"jakarta.annotation","version":"1.3.5","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"#FFA500","problem":["0","0","0"],"children":[]},{"name":"jakarta.ws.rs-api","id":"f1ab03e9-82ec-4ec5-a8a5-b033a397a5ad","groupId":"jakarta.ws.rs","version":"2.1.6","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"osgi-resource-locator","id":"a9b59d92-54ff-4531-8263-29c992cbd977","groupId":"org.glassfish.hk2","version":"1.0.3","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"jakarta.inject","id":"448c637a-e46d-4e31-a74e-159dc300b709","groupId":"org.glassfish.hk2.external","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"#FFA500","problem":["0","0","0"],"children":[]}]},{"name":"jakarta.ws.rs-api","id":"07d2b8dd-36fb-4772-8f33-5d4178924482","groupId":"jakarta.ws.rs","version":"2.1.6","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"jakarta.annotation-api","id":"9bfa02b8-76fb-456f-90d5-7b61c93f4316","groupId":"jakarta.annotation","version":"1.3.5","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"#FFA500","problem":["0","0","0"],"children":[]},{"name":"jersey-client","id":"880b6f9b-6c18-4955-8f8e-795a553d9ccd","groupId":"org.glassfish.jersey.core","version":"2.35","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jakarta.inject","id":"c8f159cc-21c6-439c-a0e4-dbf6f5395b38","groupId":"org.glassfish.hk2.external","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"#FFA500","problem":["0","0","0"],"children":[]},{"name":"jakarta.ws.rs-api","id":"76df7c0c-2ecb-4adf-a4e5-2b88db291c62","groupId":"jakarta.ws.rs","version":"2.1.6","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jersey-common","id":"8ce1c3de-5d5c-4bc4-87fc-9a2cf672b40f","groupId":"org.glassfish.jersey.core","version":"2.35","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"jakarta.validation-api","id":"11320b12-2031-4c57-bbc3-c8d788920016","groupId":"jakarta.validation","version":"2.0.2","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]}]},{"name":"spring-web","id":"d2d1e44d-ba6d-4f55-8be0-c6875f4af585","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-core","id":"55aaa5a5-bae8-4223-8d2f-50a7e694a4c1","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-jcl","id":"d7d8524a-5142-4867-aef9-7977a4b46ae2","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]}]},{"name":"spring-beans","id":"fd283eaa-6943-4b65-a92e-b1942db89f99","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-core","id":"73bef69b-a1eb-4e26-a033-5bc80a48110f","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]}]},{"name":"jersey-spring5","id":"4b0f7e42-609b-4b65-a9d3-8025eec92184","groupId":"org.glassfish.jersey.ext","version":"2.35","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jakarta.ws.rs-api","id":"d3baba9e-abd2-4d0f-bcf5-2fef0c8aab0d","groupId":"jakarta.ws.rs","version":"2.1.6","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jersey-container-servlet-core","id":"cd97de8f-5229-4c3c-8197-b438721d7142","groupId":"org.glassfish.jersey.containers","version":"2.35","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"spring-bridge","id":"0bc1f0f8-97f0-4ad5-b12a-0d0381e5b649","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jakarta.inject","id":"93a5e0bc-1b06-4baa-90af-61c80406941a","groupId":"org.glassfish.hk2.external","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"#FFA500","problem":["0","0","0"],"children":[]}]},{"name":"spring-web","id":"dfa8c370-4547-46bf-abb9-5b802a846ed9","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jersey-server","id":"9a265f4b-c906-4a40-bd83-3acb559f3084","groupId":"org.glassfish.jersey.core","version":"2.35","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jersey-hk2","id":"f7be8272-1b9e-4544-bdf9-0b7455dd25a5","groupId":"org.glassfish.jersey.inject","version":"2.35","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"javassist","id":"911489f4-d2d9-4a37-bcb9-9d0eebfb7ba0","groupId":"org.javassist","version":"3.25.0-GA","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"hk2-locator","id":"2c617882-d170-42a7-86d3-18e06ac14c68","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jakarta.inject","id":"a07a0b72-0efa-47ed-a750-a19b5e5514c8","groupId":"org.glassfish.hk2.external","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"#FFA500","problem":["0","0","0"],"children":[]},{"name":"hk2-api","id":"d92e2eb3-a6dd-448f-a127-5c56bbc6deb5","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"hk2-utils","id":"260b85d3-8114-4106-9f82-07dce5c1de97","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"aopalliance-repackaged","id":"4484377b-191a-4563-b0c2-0c219cc9e055","groupId":"org.glassfish.hk2.external","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]}]},{"name":"jersey-common","id":"8c2401b6-5d3e-4147-a806-d588a084be0c","groupId":"org.glassfish.jersey.core","version":"2.35","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"spring-core","id":"bf4122c9-536b-4e5b-8b2d-a5377da1704d","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"spring-beans","id":"3ba4460a-213a-493d-9bde-6c447bb5de8e","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"spring-context","id":"ddb1eccf-77ed-4bdf-b6d8-420e677f8a99","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-aop","id":"4a6d6c78-91f8-4956-b657-17f3c59916ff","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"spring-core","id":"22e435c7-76ab-4237-8ad9-be7a1382e0d3","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"spring-beans","id":"1106489e-f32c-4238-b0c4-36a9018cd7f0","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"spring-expression","id":"f814c08a-3ba1-4552-867a-433fae33e018","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-core","id":"1f432d62-3335-4868-859d-2dd1dab69076","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]}]},{"name":"spring-aop","id":"639e0ca2-f93e-4e3b-8b71-30b4b92803d7","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-beans","id":"89a938d4-821b-4cb0-a0d0-dbaa43ac45f1","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"spring-core","id":"71682ab4-7950-4e37-bc03-4d56a6720790","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"hk2","id":"eebfcb85-ed0a-48be-b576-6c84098447d0","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"hk2-core","id":"c9ddb84b-da29-47d3-b74e-4e181e790d70","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"hk2-utils","id":"0fb0de65-7a6d-44f8-8b7d-fdd0909e1ab3","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"hk2-locator","id":"3c266e7b-7ba5-4418-a5c5-57702305cd4c","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"hk2-locator","id":"fcdfba86-c35c-4fdc-993a-2850258437d7","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"hk2-utils","id":"38e77419-a7be-4ed7-9140-01196892da3c","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jakarta.annotation-api","id":"b7c52c98-d421-42fa-b833-e37217fedbd8","groupId":"jakarta.annotation","version":"1.3.5","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"#FFA500","problem":["0","0","0"],"children":[]},{"name":"jakarta.inject","id":"89dfb630-8699-4810-be66-dcd10828c401","groupId":"org.glassfish.hk2.external","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"#FFA500","problem":["0","0","0"],"children":[]}]},{"name":"hk2-api","id":"8a9fc243-73ca-4c7b-9bba-2ad70b3b0b67","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"hk2-utils","id":"091093ba-0dba-46d1-b629-de3ba6e60a71","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jakarta.inject","id":"81df869b-db65-46be-9621-cf6cd3370d7b","groupId":"org.glassfish.hk2.external","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"#FFA500","problem":["0","0","0"],"children":[]},{"name":"aopalliance-repackaged","id":"89854bcd-1049-42c2-b814-58a21db8be7c","groupId":"org.glassfish.hk2.external","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"hk2-runlevel","id":"4f90ce04-53b5-49e8-862a-717ed750c8ce","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"hk2-locator","id":"2784aa33-cce3-4cd5-9910-ee496a65cb7a","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"hk2-api","id":"167b5c0c-1784-4047-bc69-00a7b1b9a41a","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jakarta.annotation-api","id":"8986ae63-f9a9-4567-a8c5-79dd828cd66e","groupId":"jakarta.annotation","version":"1.3.5","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"#FFA500","problem":["0","0","0"],"children":[]}]},{"name":"class-model","id":"48bf5338-2b08-4351-b20e-73213f62731d","groupId":"org.glassfish.hk2","version":"2.6.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"asm-tree","id":"82cec824-3500-45ac-bff9-7279f3c45810","groupId":"org.ow2.asm","version":"7.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"asm","id":"472477f7-118f-420e-b985-414b0820a808","groupId":"org.ow2.asm","version":"7.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"asm-commons","id":"c611bad9-2e50-4b58-af58-ababc75287f2","groupId":"org.ow2.asm","version":"7.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"asm-analysis","id":"9b3e4d1f-2e89-4bbf-a598-59623a07f081","groupId":"org.ow2.asm","version":"7.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"asm-tree","id":"7660c317-d326-4f88-8aff-1f2002afbc3c","groupId":"org.ow2.asm","version":"7.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"asm","id":"553ded33-617c-4f82-a821-b4ea4bb06eb4","groupId":"org.ow2.asm","version":"7.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"asm-util","id":"18147030-858c-40fc-a940-688569a47ab7","groupId":"org.ow2.asm","version":"7.1","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"asm","id":"6ccc6852-fc8c-4f01-a283-e8db2a5dd923","groupId":"org.ow2.asm","version":"7.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"asm-analysis","id":"702c6dac-30f1-4793-a6e6-6d70880ac1a8","groupId":"org.ow2.asm","version":"7.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"asm-tree","id":"47ed8c7a-e539-4282-874f-401691be019b","groupId":"org.ow2.asm","version":"7.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]}]}]}]}]},{"name":"spring-boot-starter-test","id":"24c092c4-5224-4878-91c9-a69ccb0b50b3","groupId":"org.springframework.boot","version":"2.6.13","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"hamcrest","id":"aa6d640b-5b12-44b5-a07f-866240d2e9ad","groupId":"org.hamcrest","version":"2.2","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"spring-boot-test-autoconfigure","id":"dd99d889-1911-4944-b47e-92dfa91839d2","groupId":"org.springframework.boot","version":"2.6.4","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-boot","id":"297e868e-b635-401c-804e-89f058de5512","groupId":"org.springframework.boot","version":"2.6.4","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"spring-boot-autoconfigure","id":"b533e1ea-c21a-4c32-99aa-0d77359c53c2","groupId":"org.springframework.boot","version":"2.6.4","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"spring-boot-test","id":"00710810-e4c7-44a9-bfad-c629d61bd0d7","groupId":"org.springframework.boot","version":"2.6.4","scope":"test","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"spring-boot-test","id":"2e9d3ce9-d579-43d5-a29a-275876850f7b","groupId":"org.springframework.boot","version":"2.6.4","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-boot","id":"82ad71f7-1f35-4552-a725-3790df39b46c","groupId":"org.springframework.boot","version":"2.6.4","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"mockito-junit-jupiter","id":"1561b789-2f9e-459d-95eb-1f498ef8afca","groupId":"org.mockito","version":"4.0.0","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"junit-jupiter-api","id":"0ef229df-155d-4538-bfa7-aa9b296e3cbb","groupId":"org.junit.jupiter","version":"5.8.2","scope":"test","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"mockito-core","id":"cf76e6e4-2178-426d-a544-8913ef678ed2","groupId":"org.mockito","version":"4.0.0","scope":"test","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"jsonassert","id":"c5b08f55-e801-46d5-a471-59a6e0bce28d","groupId":"org.skyscreamer","version":"1.5.0","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"android-json","id":"b8695da3-ea89-4441-b0fa-b42150af1ee4","groupId":"com.vaadin.external.google","version":"0.0.20131108.vaadin1","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]}]},{"name":"junit-jupiter","id":"899aa4f8-a5b4-42bf-a970-1ca726429f08","groupId":"org.junit.jupiter","version":"5.8.2","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"junit-jupiter-params","id":"b3fbf178-9175-4881-b8af-6afc84b3359e","groupId":"org.junit.jupiter","version":"5.8.2","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"junit-jupiter-api","id":"2f2219b3-26c5-4e8b-824f-d61effea50c9","groupId":"org.junit.jupiter","version":"5.8.2","scope":"test","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"apiguardian-api","id":"31a068f6-40bf-48d2-945d-608fca5f9465","groupId":"org.apiguardian","version":"1.1.2","scope":"test","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"junit-jupiter-engine","id":"71afd7c0-db97-4eef-b68a-f93d2ed7e802","groupId":"org.junit.jupiter","version":"5.8.2","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"junit-platform-engine","id":"4321ad53-56fb-4f51-9265-19161a1a9e29","groupId":"org.junit.platform","version":"1.8.2","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"opentest4j","id":"464590b6-6f4b-446e-ace3-793578076bf8","groupId":"org.opentest4j","version":"1.2.0","scope":"test","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"apiguardian-api","id":"9de509c7-e1cc-4cc7-8836-6f190d0bfb23","groupId":"org.apiguardian","version":"1.1.2","scope":"test","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"junit-platform-commons","id":"0201fa6d-4a8c-421e-9fa4-604f1ccf0ed1","groupId":"org.junit.platform","version":"1.8.2","scope":"test","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"junit-jupiter-api","id":"e3ae9982-6368-48f5-88e8-b40db0ebba66","groupId":"org.junit.jupiter","version":"5.8.2","scope":"test","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"apiguardian-api","id":"59e14dcb-222e-425a-8945-2e3768dce491","groupId":"org.apiguardian","version":"1.1.2","scope":"test","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"junit-jupiter-api","id":"c17aa638-8fdd-44e7-86f4-03ae0a49e103","groupId":"org.junit.jupiter","version":"5.8.2","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"opentest4j","id":"a5564dc3-f3dd-464a-86c1-a9af8d88c504","groupId":"org.opentest4j","version":"1.2.0","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"junit-platform-commons","id":"40e33d16-d9ed-4361-92a8-437d514c29a2","groupId":"org.junit.platform","version":"1.8.2","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"apiguardian-api","id":"d8890295-1f65-484c-b287-c6b337679fd5","groupId":"org.apiguardian","version":"1.1.2","scope":"test","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"apiguardian-api","id":"876f13a4-99ea-4666-a8a9-014173c12317","groupId":"org.apiguardian","version":"1.1.2","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]}]}]},{"name":"spring-boot-starter","id":"234e3599-89d5-41e0-9a66-23b87bfb483c","groupId":"org.springframework.boot","version":"2.6.4","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"spring-core","id":"4a7fabae-f424-4a72-a183-bae0885265b3","groupId":"org.springframework","version":"5.3.16","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jakarta.xml.bind-api","id":"094e4de8-188f-45fa-8a74-968395b4f5c9","groupId":"jakarta.xml.bind","version":"2.3.3","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"mockito-core","id":"009664ca-972f-446e-9784-745f1d3ed795","groupId":"org.mockito","version":"4.0.0","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"byte-buddy-agent","id":"52ffb827-3435-4c3a-b9c2-f51bd87a74bb","groupId":"net.bytebuddy","version":"1.11.22","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"objenesis","id":"6ae76f8f-a79b-4daa-b7f9-0d1934f9d399","groupId":"org.objenesis","version":"3.2","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"byte-buddy","id":"ed1ee476-c3e7-43b2-b264-9d81d927ad0e","groupId":"net.bytebuddy","version":"1.11.22","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]}]},{"name":"assertj-core","id":"27989627-c5dc-47f2-9c50-833e96e6f636","groupId":"org.assertj","version":"3.21.0","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"xmlunit-core","id":"06f2fe26-5bc6-4c36-89be-0ccd0515891c","groupId":"org.xmlunit","version":"2.8.4","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jakarta.xml.bind-api","id":"b05ed61c-5af5-422b-8514-56dc64767def","groupId":"jakarta.xml.bind","version":"2.3.3","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"json-path","id":"08fdf1f7-9cf3-4e58-a047-11bf2da4a124","groupId":"com.jayway.jsonpath","version":"2.6.0","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"slf4j-api","id":"3b9e7ba1-d9f0-4670-88ac-f7b2f9fb1d89","groupId":"org.slf4j","version":"1.7.36","scope":"test","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"json-smart","id":"6aa4e44d-a386-49f8-830f-e9fab32bbd6b","groupId":"net.minidev","version":"2.4.8","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"accessors-smart","id":"c778c350-01df-4383-84d5-2413911c67c2","groupId":"net.minidev","version":"2.4.8","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"asm","id":"65ab3aba-99eb-41c5-96e2-e8907ae6c9fb","groupId":"org.ow2.asm","version":"9.1","scope":"test","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]}]}]},{"name":"spring-test","id":"226dfd93-abc3-4e11-96e6-2e5f407f457e","groupId":"org.springframework","version":"5.3.16","scope":"test","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"spring-core","id":"616d5d03-8341-4874-84d1-b0ab7c432fcb","groupId":"org.springframework","version":"5.3.16","scope":"test","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]}]},{"name":"spring-boot-starter-jetty","id":"47a97146-55b8-47cf-8a20-19c5fa2e4e2f","groupId":"org.springframework.boot","version":"2.6.13","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"javax-websocket-server-impl","id":"1b4ccc6d-3a41-4839-a2b1-8237885d236c","groupId":"org.eclipse.jetty.websocket","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"websocket-server","id":"3ac2b287-2e85-40d0-bdd4-4b2176b70fc3","groupId":"org.eclipse.jetty.websocket","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jetty-annotations","id":"587ef483-e6fb-43ab-b594-2864f597c465","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jetty-plus","id":"3da829eb-0a37-43a5-b1b5-d8f4b9caf8b0","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jetty-webapp","id":"c799b7e1-3d81-4ad2-9787-344871cfc9f2","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"asm-commons","id":"944703b6-cc9e-43c9-8b0d-052aad73c7c5","groupId":"org.ow2.asm","version":"9.2","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"asm-tree","id":"70506e14-8fd3-457d-9f19-17d2c19f37bd","groupId":"org.ow2.asm","version":"9.2","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"asm","id":"2b73c5e8-008b-43a1-8f09-0cdd6e86b737","groupId":"org.ow2.asm","version":"9.2","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"asm-analysis","id":"d44885f3-8760-469e-bd28-264c55d319b2","groupId":"org.ow2.asm","version":"9.2","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"jetty-webapp","id":"42676932-ba44-4315-b3e6-076155a58c6d","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"asm","id":"dba9e8d7-ff3d-46d6-8ff7-fb9c5d93cd08","groupId":"org.ow2.asm","version":"9.2","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]}]},{"name":"javax-websocket-client-impl","id":"391f9424-0a49-4fa3-a8a8-7847aefc5344","groupId":"org.eclipse.jetty.websocket","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"websocket-client","id":"28cb17ae-6656-415e-9db7-a938565aa70a","groupId":"org.eclipse.jetty.websocket","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]}]},{"name":"jetty-servlets","id":"222b87fb-cef0-439e-a63e-495da6137d18","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jetty-util","id":"5efe1e9c-b8dd-4eb1-b894-9e4ba9032d08","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"jetty-io","id":"d33b43a0-7a06-4da6-860e-a5f2e854d5ef","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jetty-util","id":"2e5fda19-ce99-413b-9a1a-3c0cba1b008c","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"jetty-continuation","id":"08e3523b-280c-431c-9199-2bd77cc890bf","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"jetty-http","id":"237df649-c4c2-4659-8f43-a0e46d61c937","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jetty-util","id":"dbdf1fb7-6b37-4a5d-9e51-d09ed438dc48","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jetty-io","id":"acfb9b2e-38f2-48c5-bc2f-2136e1301e6d","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]}]},{"name":"tomcat-embed-el","id":"61fa0af1-634b-48fc-8028-8c040e182c51","groupId":"org.apache.tomcat.embed","version":"9.0.58","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"jakarta.websocket-api","id":"ff432117-8f16-420b-921b-37020c9e0c46","groupId":"jakarta.websocket","version":"1.1.2","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"jetty-webapp","id":"bff27cfc-401b-4706-bbc2-930b79822aba","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jetty-xml","id":"ac05f844-09b3-42e8-85c7-dde47174693d","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jetty-util","id":"e7e09b59-2e1d-46c4-9712-2c1ed837f386","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"jetty-servlet","id":"0d8c1666-fd13-42c5-9537-f31d820094b4","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jetty-security","id":"19779436-6cc5-4b81-8023-84a07d8ca99e","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jetty-server","id":"7655693b-8331-472f-8fad-cb47bdf013f9","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jetty-http","id":"3c840106-d8e8-48ad-ad85-a68a1945e97d","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jetty-io","id":"35f17197-7fa2-482a-9dd4-8c2ad6787d05","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]}]},{"name":"jetty-util-ajax","id":"2c57f2e9-d585-45b1-a358-e223b42bd4a4","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"red","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jetty-util","id":"cf9ecf8c-d3c1-487c-a600-658f3dd06ec1","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]}]}]},{"name":"websocket-server","id":"dd940e5e-3f53-4e8c-9552-ea4668de19da","groupId":"org.eclipse.jetty.websocket","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jetty-servlet","id":"8036c774-e005-44f4-b378-500f4aac2553","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"websocket-common","id":"1b79d476-5ecc-4d27-8744-cbf19905aa90","groupId":"org.eclipse.jetty.websocket","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jetty-io","id":"115ac90e-cf36-44d2-bde8-aecb9f80c1e9","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"websocket-api","id":"c496f093-b661-4ec2-915f-4911d083b218","groupId":"org.eclipse.jetty.websocket","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"jetty-util","id":"7322602c-150f-4100-aad2-3063f1b19cac","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"jetty-http","id":"9c0694f6-cb24-462f-918e-9cd7dff08a98","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"websocket-servlet","id":"90f58ab9-c0e2-462a-92b5-51f96404b787","groupId":"org.eclipse.jetty.websocket","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"websocket-api","id":"95d6d5a7-c957-4532-9da2-2ba3292269b1","groupId":"org.eclipse.jetty.websocket","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"websocket-client","id":"8798d875-0ca0-4d5d-8095-c703193a2b5e","groupId":"org.eclipse.jetty.websocket","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jetty-client","id":"9d635040-c5bb-4707-957b-c440a897393f","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jetty-io","id":"9eb99d12-91cd-4eed-baf9-dd85143fffd3","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jetty-http","id":"02954867-4557-4655-ab78-e95167033375","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]},{"name":"jetty-util","id":"8f4b24f9-74b9-4844-8422-b1e7ba515205","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jetty-io","id":"56de87b2-a896-47b6-a9f4-b521f26bc8c0","groupId":"org.eclipse.jetty","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"websocket-common","id":"9fac09b9-f510-4a99-914a-bb054554ef05","groupId":"org.eclipse.jetty.websocket","version":"9.4.45.v20220203","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]}]},{"name":"jakarta.servlet-api","id":"26313ea9-59a2-4925-bd4b-9f95f1c59864","groupId":"jakarta.servlet","version":"4.0.4","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]}]},{"name":"jackson-annotations","id":"962e6e50-b535-46df-ae1c-817f4d0035cb","groupId":"com.fasterxml.jackson.core","version":"2.13.2","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"jackson-core","id":"c6645ab2-1287-4e39-a04b-a310feccedef","groupId":"com.fasterxml.jackson.core","version":"2.13.2","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[]},{"name":"jackson-databind","id":"c247bc0a-8ad2-45b8-bf39-b75f5ae161bc","groupId":"com.fasterxml.jackson.core","version":"2.13.4.2","scope":"compile","jarType":"jar","fillColor":"","edgeColor":"","problem":["0","0","0"],"children":[{"name":"jackson-annotations","id":"62304842-bef7-4ebc-913c-f8f0f84cfb6e","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]},{"name":"jackson-core","id":"d18a037c-e050-4bf0-a1c4-b7b268df78ce","groupId":"com.fasterxml.jackson.core","version":"2.13.1","scope":"compile","jarType":"jar","fillColor":"gray","edgeColor":"red","problem":["0","0","0"],"children":[]}]}]};
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
			if (!contains || !contains.scrollWidth || !contains.scrollHeight) return;
			graph.changeSize(contains.scrollWidth, contains.scrollHeight);
		};
});

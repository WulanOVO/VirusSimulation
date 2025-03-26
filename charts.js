// 图表处理模块

class ChartManager {
  constructor() {
    this.populationChart = null;
    this.newCasesChart = null;  // 修改为每日新增传播指标图表
    this.healthOutcomesChart = null;  // 添加每日健康结果指标图表
    this.initialized = false;

    Chart.defaults.devicePixelRatio = 3;
    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", Roboto, Helvetica, Arial, sans-serif';
    Chart.defaults.font.weight = '500';
    Chart.defaults.color = '#34495e';
  }

  initialize() {
    // 初始化人口分布图表
    const populationChartCtx = document.getElementById('population-chart').getContext('2d');
    // 设置画布DPI
    const populationCanvas = document.getElementById('population-chart');
    setHighDPI(populationCanvas);

    // 添加渐变背景色
    const gradients = this.createGradients(populationChartCtx);

    this.populationChart = new Chart(populationChartCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: '易感人群',
            data: [],
            borderColor: '#3498db',
            backgroundColor: gradients.susceptible,
            fill: false,
            pointRadius: 0,
            tension: 0.4,
            borderWidth: 2
          },
          {
            label: '潜伏人群',
            data: [],
            borderColor: '#f39c12',
            backgroundColor: gradients.exposed,
            fill: false,
            pointRadius: 0,
            tension: 0.4,
            borderWidth: 2
          },
          {
            label: '感染人群',
            data: [],
            borderColor: '#e74c3c',
            backgroundColor: gradients.infected,
            fill: false,
            pointRadius: 0,
            tension: 0.4,
            borderWidth: 2
          },
          {
            label: '恢复人群',
            data: [],
            borderColor: '#2ecc71',
            backgroundColor: gradients.recovered,
            fill: false,
            pointRadius: 0,
            tension: 0.4,
            borderWidth: 2
          },
          {
            label: '死亡人数',
            data: [],
            borderColor: '#7f8c8d',
            backgroundColor: gradients.dead,
            fill: false,
            pointRadius: 0,
            tension: 0.4,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        plugins: {
          title: {
            display: true,
            text: '人群分布趋势',
            font: {
              size: 18,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 15
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#2c3e50',
            bodyColor: '#2c3e50',
            borderColor: '#ddd',
            borderWidth: 1,
            cornerRadius: 6,
            padding: 10,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += context.parsed.y.toLocaleString() + ' 人';
                return label;
              }
            }
          },
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              padding: 20,
              boxWidth: 10,
              boxHeight: 10,
              font: {
                weight: 'bold',
                size: 13
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '天数',
              font: {
                weight: 'bold',
                size: 14
              },
              padding: { top: 10, bottom: 5 }
            },
            grid: {
              lineWidth: 1,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                weight: '600',
                size: 12
              },
              padding: 8
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: '人数',
              font: {
                weight: 'bold',
                size: 14
              },
              padding: { top: 0, left: 0, right: 10, bottom: 0 }
            },
            min: 0,
            grid: {
              lineWidth: 1,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                weight: '600',
                size: 12
              },
              padding: 8,
              callback: function(value) {
                return value.toLocaleString();
              }
            }
          }
        }
      }
    });

    // 初始化每日新增传播指标图表
    const newCasesChartCtx = document.getElementById('new-cases-chart').getContext('2d');
    const newCasesCanvas = document.getElementById('new-cases-chart');
    setHighDPI(newCasesCanvas);

    this.newCasesChart = new Chart(newCasesChartCtx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: '每日新增暴露',
            data: [],
            backgroundColor: 'rgba(243, 156, 18, 0.8)',
            borderColor: '#f39c12',
            borderWidth: 2,
            borderRadius: 4,
            hoverBackgroundColor: 'rgba(243, 156, 18, 0.95)'
          },
          {
            label: '每日新增发病',
            data: [],
            backgroundColor: 'rgba(231, 76, 60, 0.8)',
            borderColor: '#e74c3c',
            borderWidth: 2,
            borderRadius: 4,
            hoverBackgroundColor: 'rgba(231, 76, 60, 0.95)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          title: {
            display: true,
            text: '每日新增病例数据',
            font: {
              size: 18,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 15
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#2c3e50',
            bodyColor: '#2c3e50',
            borderColor: '#ddd',
            borderWidth: 1,
            cornerRadius: 6,
            padding: 10,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += context.parsed.y.toLocaleString() + ' 人';
                return label;
              }
            }
          },
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              padding: 20,
              boxWidth: 10,
              boxHeight: 10,
              font: {
                weight: 'bold',
                size: 13
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '天数',
              font: {
                weight: 'bold',
                size: 14
              },
              padding: { top: 10, bottom: 5 }
            },
            grid: {
              display: false
            },
            ticks: {
              font: {
                weight: '600',
                size: 12
              },
              padding: 8
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: '人数',
              font: {
                weight: 'bold',
                size: 14
              },
              padding: { top: 0, left: 0, right: 10, bottom: 0 }
            },
            min: 0,
            grid: {
              lineWidth: 1,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                weight: '600',
                size: 12
              },
              padding: 8,
              callback: function(value) {
                return value.toLocaleString();
              }
            }
          }
        }
      }
    });

    // 初始化每日健康结果指标图表
    const healthOutcomesChartCtx = document.getElementById('health-outcomes-chart').getContext('2d');
    const healthOutcomesCanvas = document.getElementById('health-outcomes-chart');
    setHighDPI(healthOutcomesCanvas);

    this.healthOutcomesChart = new Chart(healthOutcomesChartCtx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: '每日康复人数',
            data: [],
            backgroundColor: 'rgba(22, 160, 133, 0.8)',
            borderColor: '#16a085',
            borderWidth: 2,
            borderRadius: 4,
            hoverBackgroundColor: 'rgba(22, 160, 133, 0.95)'
          },
          {
            label: '每日死亡人数',
            data: [],
            backgroundColor: 'rgba(127, 140, 141, 0.8)',
            borderColor: '#7f8c8d',
            borderWidth: 2,
            borderRadius: 4,
            hoverBackgroundColor: 'rgba(127, 140, 141, 0.95)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          title: {
            display: true,
            text: '每日减少病例数据',
            font: {
              size: 18,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 15
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#2c3e50',
            bodyColor: '#2c3e50',
            borderColor: '#ddd',
            borderWidth: 1,
            cornerRadius: 6,
            padding: 10,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += context.parsed.y.toLocaleString() + ' 人';
                return label;
              }
            }
          },
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              padding: 20,
              boxWidth: 10,
              boxHeight: 10,
              font: {
                weight: 'bold',
                size: 13
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '天数',
              font: {
                weight: 'bold',
                size: 14
              },
              padding: { top: 10, bottom: 5 }
            },
            grid: {
              display: false
            },
            ticks: {
              font: {
                weight: '600',
                size: 12
              },
              padding: 8
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: '人数',
              font: {
                weight: 'bold',
                size: 14
              },
              padding: { top: 0, left: 0, right: 10, bottom: 0 }
            },
            min: 0,
            grid: {
              lineWidth: 1,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                weight: '600',
                size: 12
              },
              padding: 8,
              callback: function(value) {
                return value.toLocaleString();
              }
            }
          }
        }
      }
    });

    this.initialized = true;

    // 监听数据更新事件
    document.addEventListener('dataUpdated', (event) => {
      this.updateCharts(event.detail);
    });

    // 监听窗口大小变化，更新图表
    window.addEventListener('resize', () => {
      this.resizeCharts();
    });
  }

  // 创建渐变背景色
  createGradients(ctx) {
    return {
      susceptible: this.createGradient(ctx, '#3498db', 0.3),
      exposed: this.createGradient(ctx, '#f39c12', 0.3),
      infected: this.createGradient(ctx, '#e74c3c', 0.3),
      recovered: this.createGradient(ctx, '#2ecc71', 0.3),
      dead: this.createGradient(ctx, '#7f8c8d', 0.3)
    };
  }

  // 创建渐变对象
  createGradient(ctx, color, alpha) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
    gradient.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'));
    return gradient;
  }

  // 响应窗口大小变化更新图表
  resizeCharts() {
    if (!this.initialized) return;

    const canvases = [
      document.getElementById('population-chart'),
      document.getElementById('new-cases-chart'),
      document.getElementById('health-outcomes-chart')
    ];

    canvases.forEach(canvas => setHighDPI(canvas));

    if (this.populationChart) this.populationChart.resize();
    if (this.newCasesChart) this.newCasesChart.resize();
    if (this.healthOutcomesChart) this.healthOutcomesChart.resize();
  }

  updateCharts(historicalData) {
    if (!this.initialized) return;

    // 提取数据
    const days = historicalData.map(data => data.day);
    const susceptibleData = historicalData.map(data => data.susceptible);
    const exposedData = historicalData.map(data => data.exposed || 0); // 提取潜伏期数据
    const infectedData = historicalData.map(data => data.infected);
    const recoveredData = historicalData.map(data => data.recovered);
    const deadData = historicalData.map(data => data.dead);
    const newExposedData = historicalData.map(data => data.newExposed || 0); // 提取新增潜伏数据
    const newInfectionsData = historicalData.map(data => data.newInfections);
    const newRecoveredData = historicalData.map(data => data.newRecovered || 0);
    const newDeathsData = historicalData.map(data => data.newDeaths || 0); // 提取新增死亡数据

    // 更新人口分布图表
    this.populationChart.data.labels = days;
    this.populationChart.data.datasets[0].data = susceptibleData;
    this.populationChart.data.datasets[1].data = exposedData; // 更新潜伏期数据
    this.populationChart.data.datasets[2].data = infectedData;
    this.populationChart.data.datasets[3].data = recoveredData;
    this.populationChart.data.datasets[4].data = deadData;
    this.populationChart.update();

    // 更新每日新增传播指标图表
    this.newCasesChart.data.labels = days;
    this.newCasesChart.data.datasets[0].data = newExposedData; // 更新新增潜伏数据
    this.newCasesChart.data.datasets[1].data = newInfectionsData;
    this.newCasesChart.update();

    // 更新每日健康结果指标图表
    this.healthOutcomesChart.data.labels = days;
    this.healthOutcomesChart.data.datasets[0].data = newRecoveredData;
    this.healthOutcomesChart.data.datasets[1].data = newDeathsData;
    this.healthOutcomesChart.update();
  }
}

function setHighDPI(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // 设置绘图上下文缩放
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // 重置样式宽度和高度
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
}

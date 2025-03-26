// 图表处理模块

class ChartManager {
  constructor() {
    this.populationChart = null;
    this.newCasesChart = null;  // 修改为每日新增传播指标图表
    this.healthOutcomesChart = null;  // 添加每日健康结果指标图表
    this.initialized = false;

    // 设置更高的设备像素比以提高图表清晰度
    Chart.defaults.devicePixelRatio = 2;
    // 优化字体渲染
    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  }

  initialize() {
    // 初始化人口分布图表
    const populationChartCtx = document.getElementById('population-chart').getContext('2d');
    // 设置画布DPI
    const populationCanvas = document.getElementById('population-chart');
    setHighDPI(populationCanvas);

    this.populationChart = new Chart(populationChartCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: '易感人群',
            data: [],
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            fill: true,
            pointRadius: 0,
            tension: 0.4,
            borderWidth: 2 // 增加线宽使线条更清晰
          },
          {
            label: '潜伏人群',
            data: [],
            borderColor: '#f39c12',
            backgroundColor: 'rgba(243, 156, 18, 0.1)',
            fill: true,
            pointRadius: 0,
            tension: 0.4,
            borderWidth: 2
          },
          {
            label: '感染人群',
            data: [],
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            fill: true,
            pointRadius: 0,
            tension: 0.4,
            borderWidth: 2
          },
          {
            label: '恢复人群',
            data: [],
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
            fill: true,
            pointRadius: 0,
            tension: 0.4,
            borderWidth: 2
          },
          {
            label: '死亡人数',
            data: [],
            borderColor: '#7f8c8d',
            backgroundColor: 'rgba(127, 140, 141, 0.1)',
            fill: true,
            pointRadius: 0,
            tension: 0.4,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 2, // 设置更高的DPI
        plugins: {
          title: {
            display: true,
            text: '人群分布趋势',
            font: {
              size: 18,
              weight: 'bold'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: false,
              padding: 20,
              font: {
                weight: 'bold' // 让图例文字更清晰
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '天数'
            },
            grid: {
              lineWidth: 1.5 // 增加网格线宽度
            },
            ticks: {
              font: {
                weight: '500' // 使刻度更清晰
              }
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: '人数'
            },
            min: 0,
            grid: {
              lineWidth: 1.5
            },
            ticks: {
              font: {
                weight: '500'
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
            backgroundColor: 'rgba(243, 156, 18, 0.7)',
            borderColor: '#f39c12',
            borderWidth: 1.5
          },
          {
            label: '每日新增发病',
            data: [],
            backgroundColor: 'rgba(231, 76, 60, 0.7)',
            borderColor: '#e74c3c',
            borderWidth: 1.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 2,
        plugins: {
          title: {
            display: true,
            text: '每日新增病例数据',
            font: {
              size: 18,
              weight: 'bold'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: false,
              padding: 20,
              font: {
                weight: 'bold'
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '天数'
            },
            grid: {
              lineWidth: 1.5
            },
            ticks: {
              font: {
                weight: '500'
              }
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: '人数'
            },
            min: 0,
            grid: {
              lineWidth: 1.5
            },
            ticks: {
              font: {
                weight: '500'
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
            backgroundColor: 'rgba(22, 160, 133, 0.7)',
            borderColor: '#16a085',
            borderWidth: 1.5
          },
          {
            label: '每日死亡人数',
            data: [],
            backgroundColor: 'rgba(127, 140, 141, 0.7)',
            borderColor: '#7f8c8d',
            borderWidth: 1.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 2,
        plugins: {
          title: {
            display: true,
            text: '每日减少病例数据',
            font: {
              size: 18,
              weight: 'bold'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: false,
              padding: 20,
              font: {
                weight: 'bold'
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '天数'
            },
            grid: {
              lineWidth: 1.5
            },
            ticks: {
              font: {
                weight: '500'
              }
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: '人数'
            },
            min: 0,
            grid: {
              lineWidth: 1.5
            },
            ticks: {
              font: {
                weight: '500'
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
}

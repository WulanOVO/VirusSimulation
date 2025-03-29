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

    this.baseChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        tooltip: {
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
        },
        title: {
          display: true,
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 15
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
    };

    // 基础数据集配置
    this.baseLineDataset = {
      fill: false,
      pointRadius: 0,
      tension: 0.4,
      borderWidth: 2
    };

    this.baseBarDataset = {
      borderWidth: 2,
      borderRadius: 4
    };
  }

  initialize() {
    // 初始化人口分布图表
    const populationChartCtx = document.getElementById('population-chart').getContext('2d');
    // 添加渐变背景色
    const gradients = this.createGradients(populationChartCtx);

    // 克隆基础配置并进行修改
    const populationChartOptions = this.cloneAndExtendOptions({
      interaction: { mode: 'nearest', axis: 'x' },
      plugins: { title: { text: '人群分布趋势' } },
      scales: {
        x: { grid: { lineWidth: 1, color: 'rgba(0, 0, 0, 0.05)' } },
        y: { grid: { lineWidth: 1, color: 'rgba(0, 0, 0, 0.05)' } }
      }
    });

    this.populationChart = new Chart(populationChartCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { ...this.baseLineDataset, label: '易感人群', data: [], borderColor: '#3498db', backgroundColor: gradients.susceptible },
          { ...this.baseLineDataset, label: '潜伏人群', data: [], borderColor: '#f39c12', backgroundColor: gradients.exposed },
          { ...this.baseLineDataset, label: '感染人群', data: [], borderColor: '#e74c3c', backgroundColor: gradients.infected },
          { ...this.baseLineDataset, label: '恢复人群', data: [], borderColor: '#2ecc71', backgroundColor: gradients.recovered },
          { ...this.baseLineDataset, label: '死亡人数', data: [], borderColor: '#7f8c8d', backgroundColor: gradients.dead }
        ]
      },
      options: populationChartOptions
    });

    // 初始化每日新增传播指标图表
    const newCasesChartCtx = document.getElementById('new-cases-chart').getContext('2d');

    const newCasesChartOptions = this.cloneAndExtendOptions({
      plugins: { title: { text: '每日新增病例数据' } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { lineWidth: 1, color: 'rgba(0, 0, 0, 0.05)' } }
      }
    });

    this.newCasesChart = new Chart(newCasesChartCtx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            ...this.baseBarDataset,
            label: '每日新增暴露',
            data: [],
            backgroundColor: 'rgba(243, 156, 18, 0.8)',
            borderColor: '#f39c12',
            hoverBackgroundColor: 'rgba(243, 156, 18, 0.95)'
          },
          {
            ...this.baseBarDataset,
            label: '每日新增发病',
            data: [],
            backgroundColor: 'rgba(231, 76, 60, 0.8)',
            borderColor: '#e74c3c',
            hoverBackgroundColor: 'rgba(231, 76, 60, 0.95)'
          }
        ]
      },
      options: newCasesChartOptions
    });

    // 初始化每日健康结果指标图表
    const healthOutcomesChartCtx = document.getElementById('health-outcomes-chart').getContext('2d');

    const healthOutcomesChartOptions = this.cloneAndExtendOptions({
      plugins: { title: { text: '每日减少病例数据' } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { lineWidth: 1, color: 'rgba(0, 0, 0, 0.05)' } }
      }
    });

    this.healthOutcomesChart = new Chart(healthOutcomesChartCtx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            ...this.baseBarDataset,
            label: '每日康复人数',
            data: [],
            backgroundColor: 'rgba(22, 160, 133, 0.8)',
            borderColor: '#16a085',
            hoverBackgroundColor: 'rgba(22, 160, 133, 0.95)'
          },
          {
            ...this.baseBarDataset,
            label: '每日死亡人数',
            data: [],
            backgroundColor: 'rgba(127, 140, 141, 0.8)',
            borderColor: '#7f8c8d',
            hoverBackgroundColor: 'rgba(127, 140, 141, 0.95)'
          }
        ]
      },
      options: healthOutcomesChartOptions
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

  // 克隆基础配置并添加自定义配置
  cloneAndExtendOptions(customOptions) {
    const baseClone = JSON.parse(JSON.stringify(this.baseChartOptions));
    return this.mergeDeep(baseClone, customOptions);
  }

  // 深度合并两个对象
  mergeDeep(target, source) {
    if (!source) return target;

    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        Object.assign(source[key], this.mergeDeep(target[key], source[key]));
      }
    }

    Object.assign(target, source);
    return target;
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

    // 检查是否为批量模拟结果
    const isBatchResult = historicalData.length > 0 && historicalData[0].hasOwnProperty('simulationCount');
    const titleSuffix = isBatchResult ? '（平均值）' : '';

    // 更新人口分布图表
    this.populationChart.data.labels = days;
    this.populationChart.data.datasets[0].data = susceptibleData;
    this.populationChart.data.datasets[1].data = exposedData; // 更新潜伏期数据
    this.populationChart.data.datasets[2].data = infectedData;
    this.populationChart.data.datasets[3].data = recoveredData;
    this.populationChart.data.datasets[4].data = deadData;
    this.populationChart.options.plugins.title.text = `人群分布趋势${titleSuffix}`;
    this.populationChart.update();

    // 更新每日新增传播指标图表
    this.newCasesChart.data.labels = days;
    this.newCasesChart.data.datasets[0].data = newExposedData; // 更新新增潜伏数据
    this.newCasesChart.data.datasets[1].data = newInfectionsData;
    this.newCasesChart.options.plugins.title.text = `每日新增病例数据${titleSuffix}`;
    this.newCasesChart.update();

    // 更新每日健康结果指标图表
    this.healthOutcomesChart.data.labels = days;
    this.healthOutcomesChart.data.datasets[0].data = newRecoveredData;
    this.healthOutcomesChart.data.datasets[1].data = newDeathsData;
    this.healthOutcomesChart.options.plugins.title.text = `每日减少病例数据${titleSuffix}`;
    this.healthOutcomesChart.update();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const fullscreenChart = document.getElementById('fullscreen-chart');
  const fullscreenCanvas = document.getElementById('fullscreen-canvas');
  const closeBtn = document.querySelector('.close-btn');
  const downloadFullscreenBtn = document.querySelector('.download-fullscreen-btn');
  let currentChart = null;

  // 字体大小默认配置
  const fontSizes = {
    title: 24,
    legend: 16,
    ticksLabel: 14,
    axisTitle: 16
  };

  // 创建增强的字体配置函数
  function createEnhancedFontConfig(originalFont = {}, size = 16, weight = 'bold') {
    return {
      ...originalFont,
      size,
      weight
    };
  }

  // 创建增强的图表配置
  function createEnhancedChartOptions(originalOptions) {
    return {
      ...originalOptions,
      maintainAspectRatio: false,
      responsive: true,
      devicePixelRatio: 3.5,
      plugins: {
        ...originalOptions.plugins,
        title: {
          ...originalOptions.plugins.title,
          font: createEnhancedFontConfig(originalOptions.plugins.title.font, fontSizes.title)
        },
        legend: {
          ...originalOptions.plugins.legend,
          labels: {
            ...originalOptions.plugins.legend.labels,
            font: createEnhancedFontConfig({}, fontSizes.legend)
          }
        }
      },
      scales: {
        x: {
          ...originalOptions.scales.x,
          ticks: {
            ...originalOptions.scales.x.ticks,
            font: createEnhancedFontConfig({}, fontSizes.ticksLabel, '500')
          },
          title: {
            ...originalOptions.scales.x.title,
            font: createEnhancedFontConfig({}, fontSizes.axisTitle)
          }
        },
        y: {
          ...originalOptions.scales.y,
          ticks: {
            ...originalOptions.scales.y.ticks,
            font: createEnhancedFontConfig({}, fontSizes.ticksLabel, '500')
          },
          title: {
            ...originalOptions.scales.y.title,
            font: createEnhancedFontConfig({}, fontSizes.axisTitle)
          }
        }
      }
    };
  }

  // 下载图表函数
  function downloadChart(chartCanvas, filename) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    const width = 1600;
    const height = 900;
    const scale = 2;

    const scaledWidth = Math.round(width / scale);
    const scaledHeight = Math.round(height / scale);

    tempCanvas.width = scaledWidth;
    tempCanvas.height = scaledHeight;

    // 获取原始图表实例
    const chartInstance = Chart.getChart(chartCanvas);
    if (!chartInstance) return;

    // 临时克隆图表配置
    const tempChart = new Chart(tempCtx, {
      type: chartInstance.config.type,
      data: JSON.parse(JSON.stringify(chartInstance.data)),
      options: {
        ...JSON.parse(JSON.stringify(chartInstance.options)),
        devicePixelRatio: scale,
        animation: false,
        responsive: false,
        maintainAspectRatio: false,
      }
    });

    // 渲染临时图表
    tempChart.resize(scaledWidth, scaledHeight);
    tempChart.draw();

    // 创建下载链接
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = tempCanvas.toDataURL('image/png');

    // 模拟点击链接下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 销毁临时图表
    tempChart.destroy();
  }

  // 为所有下载按钮添加点击事件
  document.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const chartTitle = this.dataset.chart;
      const originalCanvas = document.getElementById(`${chartTitle}-chart`);

      // 获取原始图表实例
      const chartInstance = Chart.getChart(originalCanvas);
      if (chartInstance) {
        const title = chartInstance.options.plugins.title.text || chartTitle;
        const time = new Date().toLocaleString();
        downloadChart(originalCanvas, `${title}-${time}`);
      }
    });
  });

  // 下载全屏图表按钮点击事件
  downloadFullscreenBtn.addEventListener('click', function() {
    if (currentChart) {
      const title = currentChart.options.plugins.title.text || 'chart';
      const time = new Date().toLocaleString();
      downloadChart(fullscreenCanvas, `${title}-${time}`);
    }
  });

  // 为所有放大按钮添加点击事件
  document.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const chartType = this.dataset.chart;
      const originalCanvas = document.getElementById(`${chartType}-chart`);

      // 获取原始图表实例
      const chartInstance = Chart.getChart(originalCanvas);
      if (chartInstance) {
        showFullscreenChart(chartInstance);
      }
    });
  });

  // 显示全屏图表
  function showFullscreenChart(chartInstance) {
    // 显示全屏容器
    fullscreenChart.classList.add('active');

    // 创建新的图表实例
    currentChart = new Chart(fullscreenCanvas, {
      type: chartInstance.config.type,
      data: chartInstance.config.data,
      options: createEnhancedChartOptions(chartInstance.config.options)
    });
  }

  // 关闭全屏图表的函数
  function closeFullscreenChart() {
    fullscreenChart.classList.remove('active');
    if (currentChart) {
      currentChart.destroy();
      currentChart = null;
    }
  }

  // 关闭按钮点击事件
  closeBtn.addEventListener('click', closeFullscreenChart);

  // ESC键关闭全屏
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fullscreenChart.classList.contains('active')) {
      closeFullscreenChart();
    }
  });
});
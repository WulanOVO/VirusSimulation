// 图表放大功能
document.addEventListener('DOMContentLoaded', () => {
  const fullscreenChart = document.getElementById('fullscreen-chart');
  const fullscreenCanvas = document.getElementById('fullscreen-canvas');
  const closeBtn = document.querySelector('.close-btn');
  let currentChart = null;

  // 创建增强的字体配置函数 - 使用默认参数
  function createEnhancedFontConfig(originalFont = {}, size = 16, weight = 'bold') {
    return {
      ...originalFont,
      size,
      weight
    };
  }

  // 字体大小默认配置
  const fontSizes = {
    title: 24,
    legend: 16,
    ticksLabel: 14,
    axisTitle: 16
  };

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
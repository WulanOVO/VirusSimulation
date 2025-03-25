// 图表放大功能
document.addEventListener('DOMContentLoaded', function () {
  const fullscreenChart = document.getElementById('fullscreen-chart');
  const fullscreenCanvas = document.getElementById('fullscreen-canvas');
  const fullscreenTitle = document.getElementById('fullscreen-title');
  const closeBtn = document.querySelector('.close-btn');
  let currentChart = null;

  // 为所有放大按钮添加点击事件
  document.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const chartType = this.dataset.chart;
      const originalCanvas = document.getElementById(`${chartType}-chart`);
      const chartTitle = this.parentElement.querySelector('h3').textContent;

      // 显示全屏容器
      fullscreenChart.classList.add('active');
      fullscreenTitle.textContent = chartTitle;

      // 获取原始图表实例
      const chartInstance = Chart.getChart(originalCanvas);
      if (chartInstance) {
        // 创建新的图表实例
        currentChart = new Chart(fullscreenCanvas, {
          type: chartInstance.config.type,
          data: chartInstance.config.data,
          options: {
            ...chartInstance.config.options,
            maintainAspectRatio: false,
            responsive: true
          }
        });
      }
    });
  });

  // 关闭按钮点击事件
  closeBtn.addEventListener('click', function () {
    fullscreenChart.classList.remove('active');
    if (currentChart) {
      currentChart.destroy();
      currentChart = null;
    }
  });

  // ESC键关闭全屏
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && fullscreenChart.classList.contains('active')) {
      fullscreenChart.classList.remove('active');
      if (currentChart) {
        currentChart.destroy();
        currentChart = null;
      }
    }
  });
});
// Script to monitor Core Web Vitals from real users
// Uses the Web Vitals library to capture metrics

const { onCLS, onFID, onLCP, onFCP, onTTFB } = require('web-vitals');

function sendToAnalytics(metric) {
  // Send to analytics endpoint
  fetch('/api/analytics/vitals', {
    method: 'POST',
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
      delta: metric.delta,
      id: metric.id,
      entries: metric.entries,
      navigationType: metric.navigationType,
    }),
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  });
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);

console.log('Web Vitals monitoring active');

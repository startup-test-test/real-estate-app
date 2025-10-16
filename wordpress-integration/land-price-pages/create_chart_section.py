#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
地価推移グラフセクションを生成
"""

# グラフデータ（fetch_historical_data.pyで取得した実データ）
chart_data = {
    "years": ["2021年", "2022年", "2023年", "2024年", "2025年"],
    "prices": [119943, 121428, 124919, 129895, 136982],
    "tsubo_prices": [39.7, 40.1, 41.3, 42.9, 45.3],
    "change_rates": [-0.4, 0.5, 1.4, 1.9, 2.1]
}

# HTML生成
html = f'''
<!-- 日本全国の地価推移グラフ -->
<section style="margin-bottom: 60px;">
    <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">📊 日本全国の地価推移グラフ</h3>

    <div style="background: white; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <canvas id="landPriceChart" style="max-height: 400px;"></canvas>
    </div>

    <p style="font-size: 13px; color: #6b7280; margin: 12px 0 0 0;">※ 2021年〜2025年の全国平均公示地価の推移を表示しています。</p>
</section>

<!-- Chart.js ライブラリの読み込み -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<script>
// グラフデータ
const chartData = {{
    labels: {chart_data["years"]},
    datasets: [{{
        label: '公示地価平均（円/㎡）',
        data: {chart_data["prices"]},
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        yAxisID: 'y'
    }}, {{
        label: '坪単価平均（万円/坪）',
        data: {chart_data["tsubo_prices"]},
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        yAxisID: 'y1'
    }}]
}};

// グラフ設定
const config = {{
    type: 'line',
    data: chartData,
    options: {{
        responsive: true,
        maintainAspectRatio: true,
        interaction: {{
            mode: 'index',
            intersect: false
        }},
        plugins: {{
            legend: {{
                display: true,
                position: 'top',
                labels: {{
                    font: {{
                        size: 14,
                        weight: '600'
                    }},
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }}
            }},
            tooltip: {{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {{
                    size: 14,
                    weight: 'bold'
                }},
                bodyFont: {{
                    size: 13
                }},
                bodySpacing: 8,
                callbacks: {{
                    label: function(context) {{
                        let label = context.dataset.label || '';
                        if (label) {{
                            label += ': ';
                        }}
                        if (context.parsed.y !== null) {{
                            if (context.datasetIndex === 0) {{
                                // 公示地価（円/㎡）
                                label += context.parsed.y.toLocaleString() + '円/㎡';
                            }} else {{
                                // 坪単価（万円/坪）
                                label += context.parsed.y + '万円/坪';
                            }}
                        }}
                        return label;
                    }}
                }}
            }}
        }},
        scales: {{
            y: {{
                type: 'linear',
                display: true,
                position: 'left',
                title: {{
                    display: true,
                    text: '公示地価平均（円/㎡）',
                    font: {{
                        size: 13,
                        weight: '600'
                    }},
                    color: '#667eea'
                }},
                ticks: {{
                    callback: function(value) {{
                        return value.toLocaleString() + '円';
                    }},
                    font: {{
                        size: 12
                    }}
                }},
                grid: {{
                    color: 'rgba(0, 0, 0, 0.05)'
                }}
            }},
            y1: {{
                type: 'linear',
                display: true,
                position: 'right',
                title: {{
                    display: true,
                    text: '坪単価平均（万円/坪）',
                    font: {{
                        size: 13,
                        weight: '600'
                    }},
                    color: '#f59e0b'
                }},
                ticks: {{
                    callback: function(value) {{
                        return value + '万円';
                    }},
                    font: {{
                        size: 12
                    }}
                }},
                grid: {{
                    drawOnChartArea: false
                }}
            }},
            x: {{
                ticks: {{
                    font: {{
                        size: 13,
                        weight: '600'
                    }}
                }},
                grid: {{
                    display: false
                }}
            }}
        }}
    }}
}};

// グラフ描画
const ctx = document.getElementById('landPriceChart');
if (ctx) {{
    new Chart(ctx, config);
}}
</script>
'''

# ファイルに保存
with open('chart_section.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("✅ グラフセクションを生成しました: chart_section.html")
print()
print("グラフの内容:")
print("  - 公示地価平均（円/㎡）の推移（青線）")
print("  - 坪単価平均（万円/坪）の推移（オレンジ線）")
print("  - 2軸表示（左軸: 円/㎡、右軸: 万円/坪）")
print("  - インタラクティブなホバー効果")
print()
print("次のステップ:")
print("  1. chart_section.html の内容を確認")
print("  2. page_1726.html の過去推移テーブルの下に挿入")
print("  3. python quick_edit.py 1726 page_1726.html でアップロード")

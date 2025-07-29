'use client'

import { useState, useEffect } from 'react'
import styles from './AssetFlowDiagram.module.css'

interface AssetClassPerformance {
  name: string
  performance1D: number
  performance1W: number
  performance1M: number
  avgPerformance: number
  trend: 'bullish' | 'bearish' | 'neutral'
  strength: 'strong' | 'moderate' | 'weak'
  color: string
  icon: string
  contracts: string[]
}

interface Flow {
  from: string
  to: string
  strength: number
  direction: 'inflow' | 'outflow'
  magnitude: number
  reason: string
}

interface FlowData {
  assetClasses: Record<string, AssetClassPerformance>
  flows: Flow[]
  marketRegime: {
    current: string
    confidence: number
    description: string
  }
  metadata: {
    calculatedAt: string
    totalFlows: number
    strongFlows: number
  }
}

export default function AssetFlowDiagram() {
  const [flowData, setFlowData] = useState<FlowData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null)

  useEffect(() => {
    fetchFlowData()
  }, [])

  const fetchFlowData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/asset-flows')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setFlowData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flow data')
      console.error('Flow data error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getFlowPath = (flow: Flow): string => {
    // Simple curved path between asset classes
    const positions = {
      stocks: { x: 20, y: 20 },
      bonds: { x: 80, y: 20 },
      commodities: { x: 20, y: 80 },
      currencies: { x: 80, y: 80 }
    }
    
    const from = positions[flow.from as keyof typeof positions]
    const to = positions[flow.to as keyof typeof positions]
    
    if (!from || !to) return ''
    
    // Create curved path
    const midX = (from.x + to.x) / 2
    const midY = (from.y + to.y) / 2 + (Math.random() - 0.5) * 20
    
    return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`
  }

  const getFlowColor = (strength: number): string => {
    if (strength > 0.7) return '#ef4444' // Strong flow - red
    if (strength > 0.4) return '#f59e0b' // Moderate flow - orange
    return '#64748b' // Weak flow - gray
  }

  const getPerformanceColor = (performance: number): string => {
    if (performance > 0.01) return '#10b981' // Strong positive - green
    if (performance > 0) return '#84cc16' // Weak positive - light green
    if (performance < -0.01) return '#ef4444' // Strong negative - red
    if (performance < 0) return '#f97316' // Weak negative - orange
    return '#6b7280' // Neutral - gray
  }

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`
  }

  const getRegimeIcon = (regime: string): string => {
    switch (regime) {
      case 'risk_off': return '🛡️'
      case 'risk_on': return '🚀'
      case 'inflation_hedge': return '🔥'
      default: return '⚖️'
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Calculating cross-asset flows...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>Unable to load flow data</h3>
          <p>{error}</p>
          <button onClick={fetchFlowData} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!flowData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>No flow data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Market Regime Header */}
      <div className={styles.regimeHeader}>
        <div className={styles.regimeIndicator}>
          <span className={styles.regimeIcon}>
            {getRegimeIcon(flowData.marketRegime.current)}
          </span>
          <div className={styles.regimeInfo}>
            <h3 className={styles.regimeTitle}>
              Market Regime: {flowData.marketRegime.current.replace('_', ' ').toUpperCase()}
            </h3>
            <p className={styles.regimeDescription}>
              {flowData.marketRegime.description}
            </p>
            <div className={styles.regimeConfidence}>
              Confidence: {Math.round(flowData.marketRegime.confidence * 100)}%
            </div>
          </div>
        </div>
        <div className={styles.flowStats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{flowData.metadata.totalFlows}</span>
            <span className={styles.statLabel}>Total Flows</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{flowData.metadata.strongFlows}</span>
            <span className={styles.statLabel}>Strong Flows</span>
          </div>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className={styles.diagramContainer}>
        <div className={styles.diagram}>
          {/* Asset Class Nodes */}
          {Object.entries(flowData.assetClasses).map(([key, assetClass]) => (
            <div
              key={key}
              className={`${styles.assetNode} ${styles[key]}`}
              style={{
                borderColor: getPerformanceColor(assetClass.avgPerformance),
                backgroundColor: `${assetClass.color}15`
              }}
            >
              <div className={styles.assetIcon}>{assetClass.icon}</div>
              <div className={styles.assetInfo}>
                <h4 className={styles.assetName}>{assetClass.name}</h4>
                <div className={styles.assetPerformance}>
                  <span 
                    className={styles.performanceValue}
                    style={{ color: getPerformanceColor(assetClass.avgPerformance) }}
                  >
                    {formatPercentage(assetClass.avgPerformance)}
                  </span>
                  <span className={styles.performanceTrend}>
                    {assetClass.trend === 'bullish' ? '↗️' : 
                     assetClass.trend === 'bearish' ? '↘️' : '→'}
                  </span>
                </div>
                <div className={styles.assetStrength}>
                  {assetClass.strength.toUpperCase()}
                </div>
              </div>
            </div>
          ))}

          {/* Flow Arrows */}
          <svg className={styles.flowSvg} viewBox="0 0 100 100">
            {flowData.flows.map((flow, index) => (
              <g key={index}>
                {/* Flow Path */}
                <path
                  d={getFlowPath(flow)}
                  stroke={getFlowColor(flow.strength)}
                  strokeWidth={Math.max(flow.strength * 3, 0.5)}
                  fill="none"
                  strokeDasharray="5,5"
                  className={styles.flowPath}
                  onClick={() => setSelectedFlow(flow)}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;10"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </path>
                
                {/* Flow Arrow */}
                <circle
                  r="1"
                  fill={getFlowColor(flow.strength)}
                  className={styles.flowArrow}
                >
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    path={getFlowPath(flow)}
                  />
                </circle>
              </g>
            ))}
          </svg>
        </div>

        {/* Flow Details Panel */}
        {selectedFlow && (
          <div className={styles.flowDetails}>
            <div className={styles.flowDetailsHeader}>
              <h4>Capital Flow Details</h4>
              <button 
                onClick={() => setSelectedFlow(null)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div className={styles.flowDetailsContent}>
              <div className={styles.flowDirection}>
                <span className={styles.fromAsset}>
                  {flowData.assetClasses[selectedFlow.from].icon} {flowData.assetClasses[selectedFlow.from].name}
                </span>
                <span className={styles.flowArrowText}>→</span>
                <span className={styles.toAsset}>
                  {flowData.assetClasses[selectedFlow.to].icon} {flowData.assetClasses[selectedFlow.to].name}
                </span>
              </div>
              <div className={styles.flowMetrics}>
                <div className={styles.flowMetric}>
                  <span className={styles.metricLabel}>Flow Strength:</span>
                  <span className={styles.metricValue}>
                    {Math.round(selectedFlow.strength * 100)}%
                  </span>
                </div>
                <div className={styles.flowMetric}>
                  <span className={styles.metricLabel}>Performance Gap:</span>
                  <span className={styles.metricValue}>
                    {formatPercentage(selectedFlow.magnitude)}
                  </span>
                </div>
              </div>
              <div className={styles.flowReason}>
                <strong>Why this flow is happening:</strong>
                <p>{selectedFlow.reason}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Breakdown */}
      <div className={styles.performanceBreakdown}>
        <h4>Asset Class Performance Breakdown</h4>
        <div className={styles.performanceGrid}>
          {Object.entries(flowData.assetClasses).map(([key, assetClass]) => (
            <div key={key} className={styles.performanceCard}>
              <div className={styles.performanceHeader}>
                <span className={styles.performanceIcon}>{assetClass.icon}</span>
                <span className={styles.performanceName}>{assetClass.name}</span>
              </div>
              <div className={styles.performanceMetrics}>
                <div className={styles.performanceRow}>
                  <span>1D:</span>
                  <span style={{ color: getPerformanceColor(assetClass.performance1D) }}>
                    {formatPercentage(assetClass.performance1D)}
                  </span>
                </div>
                <div className={styles.performanceRow}>
                  <span>1W:</span>
                  <span style={{ color: getPerformanceColor(assetClass.performance1W) }}>
                    {formatPercentage(assetClass.performance1W)}
                  </span>
                </div>
                <div className={styles.performanceRow}>
                  <span>1M:</span>
                  <span style={{ color: getPerformanceColor(assetClass.performance1M) }}>
                    {formatPercentage(assetClass.performance1M)}
                  </span>
                </div>
              </div>
              <div className={styles.contractList}>
                {assetClass.contracts.map(contract => (
                  <span key={contract} className={styles.contractTag}>
                    {contract}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Context */}
      <div className={styles.educationalContext}>
        <h4>💡 Understanding Cross-Asset Flows</h4>
        <div className={styles.contextContent}>
          <p>
            This diagram shows how capital moves between different asset classes in real-time. 
            When one asset class outperforms another, money tends to flow from the underperformer 
            to the outperformer.
          </p>
          <div className={styles.contextTips}>
            <div className={styles.tip}>
              <strong>Risk-On Flows:</strong> Money moves from bonds → stocks/commodities
            </div>
            <div className={styles.tip}>
              <strong>Risk-Off Flows:</strong> Money flees stocks → bonds/gold
            </div>
            <div className={styles.tip}>
              <strong>Inflation Flows:</strong> Capital rotates into commodities and real assets
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
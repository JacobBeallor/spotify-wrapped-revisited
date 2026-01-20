interface MetricFilterProps {
  metric: 'hours' | 'plays'
  setMetric: (metric: 'hours' | 'plays') => void
}

export default function MetricFilter({
  metric,
  setMetric
}: MetricFilterProps) {
  return (
    <div className="radio-group">
      <div className="slider"></div>
      <div className="radio-option">
        <input
          type="radio"
          name="metric"
          id="metric-hours"
          checked={metric === 'hours'}
          onChange={() => setMetric('hours')}
        />
        <label htmlFor="metric-hours" className="radio-label">Hours</label>
      </div>
      <div className="radio-option">
        <input
          type="radio"
          name="metric"
          id="metric-plays"
          checked={metric === 'plays'}
          onChange={() => setMetric('plays')}
        />
        <label htmlFor="metric-plays" className="radio-label">Plays</label>
      </div>

      <style jsx>{`
        .radio-group {
          display: flex;
          gap: 0;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          padding: 4px;
          border-radius: 25px;
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          position: relative;
          height: 40px;
          min-width: 180px;
        }

        .slider {
          position: absolute;
          top: 4px;
          bottom: 4px;
          background: linear-gradient(135deg, rgba(30, 215, 96, 0.9), #1db954);
          border-radius: 25px;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow:
            0 3px 12px rgba(30, 215, 96, 0.3),
            0 1px 4px rgba(0, 0, 0, 0.1);
          z-index: 0;
        }

        .radio-option {
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .radio-option input[type="radio"] {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }

        .radio-label {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 0 16px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          user-select: none;
          border-radius: 25px;
          position: relative;
          white-space: nowrap;
          letter-spacing: 0.3px;
        }

        .radio-option input[type="radio"]:checked + .radio-label {
          color: #000;
          text-shadow: none;
        }

        .radio-label:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        .radio-label::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.05);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .radio-label:hover::before {
          opacity: 1;
        }

        /* Slider positioning for 2 options */
        .radio-group:has(#metric-hours:checked) .slider {
          left: 4px;
          width: calc(50% - 4px);
        }

        .radio-group:has(#metric-plays:checked) .slider {
          left: calc(50% + 2px);
          width: calc(50% - 6px);
        }
      `}</style>
    </div>
  )
}


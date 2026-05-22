import ourServiesStyle from "./ourservices.module.css";

const OurServices = () => {
  return (
    <section className={ourServiesStyle.container}>
      <h3 className={ourServiesStyle.title}>Our Services</h3>
      <div className={ourServiesStyle.content}>
        <h4 className={ourServiesStyle.contentTitle}>
          Portfolio Intelligence & Financial Analytics
        </h4>
        <div className={ourServiesStyle.contentSubTitle}>
          Powerful analytical tools designed to help investors understand
          portfolio performance, allocation behavior, and market exposure.
        </div>

        <div className={ourServiesStyle.featureContainer}>
          <h4 className={ourServiesStyle.featureContainerTitle}>
            1. Portfolio Analytics
          </h4>
          <div className={ourServiesStyle.featureContainerDiscription}>
            Analyze portfolio performance using historical returns, allocation
            analysis, benchmark comparison, and portfolio-level metrics.
          </div>
          <div className={ourServiesStyle.featureList}>
            <h3 className={ourServiesStyle.featureListTitle}>Features :</h3>
            <ol className={ourServiesStyle.featureListItemsContainer}>
              <li>
                <span>✅</span>Portfolio performance tracking
              </li>
              <li>
                <span>✅</span>Historical portfolio analysis
              </li>
              <li>
                <span>✅</span>Benchmark-relative comparison
              </li>
              <li>
                <span>✅</span>Portfolio composition breakdown
              </li>
              <li>
                <span>✅</span>Xirr Computation and Comparisons
              </li>
              <li>
                <span>✅</span>Rolling Returns
              </li>
              <li>
                <span>✅</span>SIP allocation logic
              </li>
            </ol>
          </div>
        </div>

        <div className={ourServiesStyle.featureContainer}>
          <h4 className={ourServiesStyle.featureContainerTitle}>
            2. Drawdown & Risk Analysis
          </h4>
          <div className={ourServiesStyle.featureContainerDiscription}>
            Understand downside risk using drawdown analysis and historical
            portfolio behavior tracking.
          </div>
          <div className={ourServiesStyle.featureList}>
            <h3 className={ourServiesStyle.featureListTitle}>Features :</h3>
            <ol className={ourServiesStyle.featureListItemsContainer}>
              <li>
                <span>✅</span>Maximum drawdown analysis
              </li>
              <li>
                <span>✅</span>Current drawdown tracking
              </li>
              <li>
                <span>✅</span>Recovery period analysis
              </li>
              <li>
                <span>✅</span>Historical downside comparison
              </li>
              <li>
                <span>✅</span>Volatility-aware analytics
              </li>
            </ol>
          </div>
        </div>

        <div className={ourServiesStyle.featureContainer}>
          <h4 className={ourServiesStyle.featureContainerTitle}>
            3. Smart Rebalancing System
          </h4>
          <div className={ourServiesStyle.featureContainerDiscription}>
            Monitor allocation drift and rebalance portfolios using structured
            allocation logic and deployment strategies.
          </div>
          <div className={ourServiesStyle.featureList}>
            <h3 className={ourServiesStyle.featureListTitle}>Features :</h3>
            <ol className={ourServiesStyle.featureListItemsContainer}>
              <li>
                <span>✅</span>Allocation drift tracking
              </li>
              <li>
                <span>✅</span>Dynamic rebalance calculations
              </li>
              <li>
                <span>✅</span>Asset weight monitoring
              </li>
              <li>
                <span>✅</span>SIP distribution logic
              </li>
              <li>
                <span>✅</span>Market-fall deployment planning
              </li>
            </ol>
          </div>
        </div>

        <div className={ourServiesStyle.featureContainer}>
          <h4 className={ourServiesStyle.featureContainerTitle}>
            4. Historical Market Analysis
          </h4>
          <div className={ourServiesStyle.featureContainerDiscription}>
            Track historical security performance using long-term market price
            analysis and comparison tools.
          </div>
          <div className={ourServiesStyle.featureList}>
            <h3 className={ourServiesStyle.featureListTitle}>Features :</h3>
            <ol className={ourServiesStyle.featureListItemsContainer}>
              <li>
                <span>✅</span>Multi-year historical charts
              </li>
              <li>
                <span>✅</span>Price comparison systems
              </li>
              <li>
                <span>✅</span>Market trend visibility
              </li>
              <li>
                <span>✅</span>Historical performance analysis
              </li>
              <li>
                <span>✅</span>Asset behavior tracking
              </li>
            </ol>
          </div>
        </div>

        <div className={ourServiesStyle.featureContainer}>
          <h4 className={ourServiesStyle.featureContainerTitle}>
            5. Benchmark Comparison Engine
          </h4>
          <div className={ourServiesStyle.featureContainerDiscription}>
            Compare portfolio and asset performance against market benchmarks
            for deeper investment evaluation.
          </div>
          <div className={ourServiesStyle.featureList}>
            <h3 className={ourServiesStyle.featureListTitle}>Features :</h3>
            <ol className={ourServiesStyle.featureListItemsContainer}>
              <li>
                <span>✅</span>Benchmark-relative return analysis
              </li>
              <li>
                <span>✅</span>Relative drawdown comparison
              </li>
              <li>
                <span>✅</span>Performance gap analysis
              </li>
              <li>
                <span>✅</span>Market-relative behavior tracking
              </li>
            </ol>
          </div>
        </div>

        <div className={ourServiesStyle.featureContainer}>
          <h4 className={ourServiesStyle.featureContainerTitle}>
            6. Portfolio Synchronization Engine
          </h4>
          <div className={ourServiesStyle.featureContainerDiscription}>
            Synchronize portfolio states using historical reconstruction and
            analytical computation systems.
          </div>
          <div className={ourServiesStyle.featureList}>
            <h3 className={ourServiesStyle.featureListTitle}>Features :</h3>
            <ol className={ourServiesStyle.featureListItemsContainer}>
              <li>
                <span>✅</span>Historical NAV reconstruction
              </li>
              <li>
                <span>✅</span>Portfolio state propagation
              </li>
              <li>
                <span>✅</span>Hierarchical asset synchronization
              </li>
              <li>
                <span>✅</span>Derived portfolio calculations
              </li>
              <li>
                <span>✅</span>Missing data recovery systems
              </li>
            </ol>
          </div>
        </div>

        <div className={ourServiesStyle.featureContainer}>
          <h4 className={ourServiesStyle.featureContainerTitle}>
            7. Security Research Dashboard
          </h4>
          <div className={ourServiesStyle.featureContainerDiscription}>
            Explore securities using market data, analytics, classifications,
            and historical performance systems.
          </div>
          <div className={ourServiesStyle.featureList}>
            <h3 className={ourServiesStyle.featureListTitle}>Features :</h3>
            <ol className={ourServiesStyle.featureListItemsContainer}>
              <li>
                <span>✅</span>Security metadata
              </li>
              <li>
                <span>✅</span>Historical charts
              </li>
              <li>
                <span>✅</span>Asset classifications
              </li>
              <li>
                <span>✅</span>Market snapshots
              </li>
              <li>
                <span>✅</span>Performance insights
              </li>
            </ol>
          </div>
        </div>

        <div className={ourServiesStyle.featureContainer}>
          <h4 className={ourServiesStyle.featureContainerTitle}>
            8. Market Discovery System
          </h4>
          <div className={ourServiesStyle.featureContainerDiscription}>
            Discover market opportunities using categorized market filters and
            structured market exploration tools.
          </div>
          <div className={ourServiesStyle.featureList}>
            <h3 className={ourServiesStyle.featureListTitle}>Features :</h3>
            <ol className={ourServiesStyle.featureListItemsContainer}>
              <li>
                <span>✅</span>Top gainers/losers
              </li>
              <li>
                <span>✅</span>Near 52-week high/low tracking
              </li>
              <li>
                <span>✅</span>ETF discovery
              </li>
              <li>
                <span>✅</span>Mutual fund exploration
              </li>
              <li>
                <span>✅</span>Market segmentation systems
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurServices;

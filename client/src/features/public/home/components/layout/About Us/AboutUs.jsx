import aboutUsStyle from "./aboutUs.module.css";

const AboutUs = () => {
  return (
    <section className={aboutUsStyle.container}>
      <h3 className={aboutUsStyle.title}>About Us</h3>
      <div className={aboutUsStyle.content}>
        <h4 className={aboutUsStyle.contentTitle}>
          Built for Investors Who Want More Than Basic Portfolio Tracking.
        </h4>
        <div className={aboutUsStyle.contentSubTitle}>
          FolioScope is a portfolio analytics and financial intelligence
          platform designed to help investors understand portfolio behavior,
          risk exposure, allocation drift, drawdowns, benchmark performance, and
          long-term capital deployment decisions using data-driven analytics.
        </div>

        <div className={aboutUsStyle.problemStatement}>
          <span>Problem : </span>Most portfolio tools focus only on showing
          holdings and current profit/loss.
          <div className={aboutUsStyle.solutionStatement}>
            <span>Solution :</span> FolioScope was built to solve this problem
            by Understanding how a portfolio actually behaves over time.
          </div>
        </div>

        <div className={aboutUsStyle.contentOverview}>
          <div className={aboutUsStyle.paragrap}>
            The platform combines <span>portfolio tracking</span>,
            <span> analytical computation</span>,
            <span> historical reconstruction</span>,
            <span> benchmark comparison</span>, <span>risk analysis</span>, and
            <span> allocation intelligence</span> into a unified financial
            analytics system.
          </div>
          <div className={aboutUsStyle.paragrapCard}>
            Instead of relying on spreadsheets and manual calculations,
            FolioScope automates portfolio-level analysis using custom-built
            analytical infrastructure.
          </div>
        </div>

        <div className={aboutUsStyle.featureList}>
          <h3 className={aboutUsStyle.featureListTitle}>
            The system processes :
          </h3>
          <ol className={aboutUsStyle.featureListItemsContainer}>
            <li>
              <span>✅</span>Historical asset prices
            </li>
            <li>
              <span>✅</span>Portfolio allocations
            </li>
            <li>
              <span>✅</span>Benchmark comparisons
            </li>
            <li>
              <span>✅</span>Drawdown analysis
            </li>
            <li>
              <span>✅</span>Asset category drift
            </li>
            <li>
              <span>✅</span>Rebalancing conditions
            </li>
            <li>
              <span>✅</span>SIP allocation logic
            </li>
            <li>
              <span>✅</span>Portfolio synchronization
            </li>
            <li>
              <span>✅</span>Historical NAV reconstruction
            </li>
          </ol>
          <div className={aboutUsStyle.featureHeroText}>
            FolioScope is designed around real investment decision workflows
            rather than generic dashboard templates.
          </div>
        </div>

        <div className={aboutUsStyle.missonVision}>
          <div className={aboutUsStyle.misson}>
            <span>Misson : </span> To help investors make more informed
            portfolio decisions through transparent analytics, structured
            portfolio intelligence, and data-driven financial insights.
          </div>
          <div className={aboutUsStyle.vision}>
            <span>Vision : </span> To build a modern portfolio intelligence
            platform that transforms raw market data into actionable investment
            understanding.
          </div>
        </div>

        <div className={aboutUsStyle.philosophyContainer}>
          <h3 className={aboutUsStyle.philosophyTitle}>
            Investment Philosophy Behind FolioScope
          </h3>
          <div className={aboutUsStyle.philosophyContent}>
            <div className={aboutUsStyle.philosophyContentHead}>
              FolioScope is built on the belief that portfolio management should
              not depend on emotional decisions or fragmented spreadsheets.
            </div>
            <div className={aboutUsStyle.featureList}>
              <h4 className={aboutUsStyle.featureListTitle}>
                A well-structured investment process requires :
              </h4>
              <ol className={aboutUsStyle.featureListItemsContainer}>
                <li>
                  <span>✅</span>Consistent allocation discipline
                </li>
                <li>
                  <span>✅</span>Risk awareness
                </li>
                <li>
                  <span>✅</span>Benchmark comparison
                </li>
                <li>
                  <span>✅</span>Historical context
                </li>
                <li>
                  <span>✅</span>Data-backed deployment decisions
                </li>
              </ol>
            </div>
          </div>
          <div className={aboutUsStyle.philosophyfooter}>
            The platform focuses on analytical clarity instead of speculative
            prediction.
          </div>
        </div>
      </div>

      <div className={aboutUsStyle.endline}>
        FolioScope is continuously evolving as a long-term financial analytics
        platform focused on portfolio intelligence, investment discipline, and
        analytical infrastructure.
      </div>
    </section>
  );
};

export default AboutUs;

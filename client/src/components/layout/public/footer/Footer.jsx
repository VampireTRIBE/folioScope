import { Link } from "react-router-dom";

import footerStyles from "./footer.module.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={footerStyles.footerContainer}>
      <div className={footerStyles.footerInner}>
        <section className={footerStyles.brandSection}>
          <Link to="/" className={footerStyles.brand}>
            <img
              className={footerStyles.brandLogo}
              src="/assets/icons/logo.png"
              alt="FolioScope logo"
            />
            <span className={footerStyles.brandName}>FolioScope</span>
          </Link>
          <p className={footerStyles.brandText}>
            Portfolio intelligence for tracking securities, holdings, risk, and
            long-term performance in one focused workspace.
          </p>
        </section>

        <nav className={footerStyles.linkGroup} aria-label="FolioScope links">
          <h2 className={footerStyles.groupTitle}>Platform</h2>
          <Link to="/" className={footerStyles.footerLink}>
            Market Overview
          </Link>
          <Link to="/dashboard/holdings" className={footerStyles.footerLink}>
            Holdings
          </Link>
          <Link
            to="/dashboard/rebalencer/list"
            className={footerStyles.footerLink}>
            Rebalancer
          </Link>
        </nav>

        <nav className={footerStyles.linkGroup} aria-label="Account links">
          <h2 className={footerStyles.groupTitle}>Account</h2>
          <Link to="/auth/login" className={footerStyles.footerLink}>
            Login
          </Link>
          <Link to="/auth/signup" className={footerStyles.footerLink}>
            Sign Up
          </Link>
          <Link to="/dashboard/profile" className={footerStyles.footerLink}>
            Profile
          </Link>
        </nav>

        <section className={footerStyles.linkGroup}>
          <h2 className={footerStyles.groupTitle}>Contact</h2>
          <a
            href="mailto:support@folioscope.com"
            className={footerStyles.footerLink}>
            support@folioscope.com
          </a>
          <p className={footerStyles.footerText}>
            Built for informed portfolio decisions.
          </p>
          <p className={footerStyles.footerText}>Data-driven, not advice.</p>
        </section>
      </div>

      <div className={footerStyles.footerBottom}>
        <p>Copyright {year} FolioScope. All rights reserved.</p>
        <p>Research tools for personal portfolio analysis.</p>
      </div>
    </footer>
  );
};

export default Footer;

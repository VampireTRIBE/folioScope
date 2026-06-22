// ! UI Component
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";

// ! Styles
import holdingCardStyles from "./holdingcard.module.css";

const HoldingCard = ({ holding = {} }) => {
  const {
    name = "Name",
    ltp = {
      price: 0,
      today: "0.00%",
    },
    oneDayPrice = 0,
    oneDayPercentage = "0.00%",
    qty = 0,
    avg = 0,

    profitLoss = 0,
    profitLossPercentage = "0.00%",

    invested = 0,
    current = 0,
  } = holding;

  return (
    <div className={holdingCardStyles.container}>
      <div className={holdingCardStyles.head}>
        <div className={holdingCardStyles.headSub}>
          <div className={holdingCardStyles.assetName}>{name}</div>
          <div className={holdingCardStyles.ltpContainer}>
            <span className={holdingCardStyles.ltp}>LTP</span>
            <PriceBadge price={ltp} priceValue={true} percentage={true} />
          </div>
        </div>

        <div className={holdingCardStyles.oneDayPrice}>
          <PriceBadge
            price={{
              price: oneDayPrice,
              today: oneDayPercentage,
            }}
            currency={true}
          />
        </div>
      </div>

      <div className={holdingCardStyles.content}>
        <div className={holdingCardStyles.leftContent}>
          <div className={holdingCardStyles.qty}>
            Qty - <span>{qty}</span>
          </div>

          <div className={holdingCardStyles.avg}>
            Avg - <span>{avg}</span>
          </div>
        </div>

        <div className={holdingCardStyles.oneDayPrice}>
          <PriceBadge
            price={{
              price: profitLoss,
              today: profitLossPercentage,
            }}
            currency={true}
          />
        </div>
      </div>

      <div className={holdingCardStyles.contentValue}>
        <div className={holdingCardStyles.valueWrapper}>
          <div className={holdingCardStyles.invested}>Invested :</div>

          <div className={holdingCardStyles.oneDayPrice}>
            <PriceBadge
              price={{ price: invested }}
              priceValue={true}
              percentage={false}
              currency={true}
            />
          </div>
        </div>

        <div className={holdingCardStyles.valueWrapper}>
          <div className={holdingCardStyles.current}>Current :</div>

          <div className={holdingCardStyles.oneDayPrice}>
            <PriceBadge
              price={{ price: current }}
              priceValue={true}
              percentage={false}
              currency={true}
            />
          </div>
        </div>
        <div className={holdingCardStyles.expenseRatio}>
          <div>Expense Ratio : </div>
          <span>0.25</span>
          <div className={holdingCardStyles.alert}>Alert</div>
        </div>
      </div>
    </div>
  );
};

export default HoldingCard;

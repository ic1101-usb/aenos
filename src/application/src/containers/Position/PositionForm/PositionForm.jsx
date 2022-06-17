import React, { useCallback, useRef, useMemo } from 'react';
import Slider from 'rc-slider';
import cn from 'classnames';

import Input from 'Components/Input';
import Button from 'Components/Button';
import { useCoins } from 'Services/coins';
import { formatDollars, formatPercent } from 'Utils/formatters';
import styleVars from 'Styles/variables.scss';

import { ONE_MILLION, MIN_RATIO } from '../constants';
import styles from './PositionForm.scss';

const PositionForm = ({
  collateralAmount,
  setCollateralAmount,
  collateralRatio,
  setCollateralRatio,
  liquidationPrice,
  collateralPrice,
  stableAmount,
  onSubmit,
  marks,
  maxRatio,
  minRatio,
  isDeposit,
  setIsDeposit,
}) => {
  const collateralInputRef = useRef();
  const { iUsd, btc } = useCoins();

  const handleCollateralSign = useCallback(() => {
    setIsDeposit(current => !current);
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit();
    collateralInputRef.current.value = '';
  }, [onSubmit]);

  const handleBalanceClick = useCallback(() => {
    setCollateralAmount(btc.balance);
    collateralInputRef.current.value = btc.balance;
  }, [btc]);

  const buttonLabel = useMemo(() => {
    if (stableAmount > 0) {
      return `Generate ${stableAmount.toFixed(2)} ${iUsd.symbol}`;
    } else if (collateralRatio === 0 && collateralAmount > 0) {
      return `Repay ${(stableAmount * -1).toFixed(2)} ${iUsd.symbol} & Close position`;
    } else if (stableAmount < 0) {
      return `Repay ${(stableAmount * -1).toFixed(2)} ${iUsd.symbol}`;
    } else if (stableAmount === 0 && collateralAmount) {
      return isDeposit ? 'Deposit' : 'Withdraw';
    }
  }, [stableAmount, collateralAmount, isDeposit, collateralRatio]);

  const handleCollateralAmountChange = useCallback((e) => {
    const value = Number(e.target.value) * (isDeposit ? 1 : -1);

    setCollateralAmount(value);
  }, [isDeposit]);

  return (
    <div className={styles.positionForm}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>
            Configure your Vault
          </div>

          <div className={styles.intro}>
            {isDeposit ? 'Deposit BTC - generate iUSD' : 'Withdraw BTC - repay iUSD'}
          </div>
        </div>

        <Button
          onClick={handleCollateralSign}
        >
          {isDeposit ? 'Withdraw' : 'Deposit'}
        </Button>
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.inputDetails}>
          <div className={styles.inputLabel}>
            {isDeposit ? 'Deposit' : 'Withdraw'} BTC
          </div>

          <div
            className={styles.balance}
            onClick={handleBalanceClick}
          >
            {btc.balance} BTC
          </div>
        </div>
        <Input
          className={styles.input}
          onChange={handleCollateralAmountChange}
          placeholder="0.00"
          max={ONE_MILLION}
          type="number"
          ref={collateralInputRef}
        />
        <div className={styles.usdAmount}>
          ~{formatDollars(collateralPrice)}
        </div>
      </div>

      <div className={styles.slider}>

        <div className={styles.sliderInfo}>
          <div className={styles.group}>
            <div className={styles.label}>
              Liquidation Price
            </div>
            <div className={styles.amount}>
              {formatDollars(liquidationPrice)}
            </div>
          </div>

          <div className={styles.group}>
            <div className={styles.label}>
              Collateral Ratio
            </div>
            <div
              className={cn([
                styles.amount,
                collateralRatio < MIN_RATIO && collateralRatio > 0 ? styles.redAmount : null
              ])}
            >
              {formatPercent(collateralRatio)}
            </div>
          </div>
        </div>

        <div className={styles.sliderHints}>
          <div className={styles.hint}>
            Lowest Risk
          </div>
          <div className={styles.hint}>
            Highest Risk
          </div>
        </div>

        <Slider
          className={styles.sliderHandler}
          min={minRatio}
          max={maxRatio}
          reverse
          step={(maxRatio - minRatio) / 100}
          value={collateralRatio}
          defaultValue={collateralRatio}
          onChange={setCollateralRatio}
          marks={marks}
          railStyle={{
            backgroundColor: styleVars.primaryColor,
          }}
          trackStyle={{
            backgroundColor: styleVars.elementBackground,
          }}
        />

      </div>

      <Button
        onClick={handleSubmit}
        disabled={!buttonLabel || (collateralRatio < MIN_RATIO && collateralRatio !== 0)}
      >
        {buttonLabel ?? 'Update your configuration'}
      </Button>
    </div>
  );
};

export default PositionForm;

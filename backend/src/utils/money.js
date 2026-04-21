const toMinorUnits = (value, decimals = 2) => {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) return NaN;
    const factor = 10 ** decimals;
    return Math.round(numberValue * factor);
};

const fromMinorUnits = (value, decimals = 2) => {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) return NaN;
    const factor = 10 ** decimals;
    return numberValue / factor;
};

const roundMoney = (value, decimals = 2) => fromMinorUnits(toMinorUnits(value, decimals), decimals);

const amountsMatch = (left, right, decimals = 2) => {
    const normalizedLeft = toMinorUnits(left, decimals);
    const normalizedRight = toMinorUnits(right, decimals);

    if (Number.isNaN(normalizedLeft) || Number.isNaN(normalizedRight)) {
        return false;
    }

    return normalizedLeft === normalizedRight;
};

const formatMoney = (value, decimals = 2) => {
    const rounded = roundMoney(value, decimals);
    if (Number.isNaN(rounded)) return String(value);
    return rounded.toFixed(decimals);
};

module.exports = {
    toMinorUnits,
    fromMinorUnits,
    roundMoney,
    amountsMatch,
    formatMoney,
};


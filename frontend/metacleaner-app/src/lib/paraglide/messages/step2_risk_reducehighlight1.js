/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_Reducehighlight1Inputs */

const en_step2_risk_reducehighlight1 = /** @type {(inputs: Step2_Risk_Reducehighlight1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`reduce risk to 0`)
};

const cs_step2_risk_reducehighlight1 = /** @type {(inputs: Step2_Risk_Reducehighlight1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`snižte riziko na 0`)
};

/**
* | output |
* | --- |
* | "reduce risk to 0" |
*
* @param {Step2_Risk_Reducehighlight1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_reducehighlight1 = /** @type {((inputs?: Step2_Risk_Reducehighlight1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Reducehighlight1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_reducehighlight1(inputs)
	return cs_step2_risk_reducehighlight1(inputs)
});
export { step2_risk_reducehighlight1 as "step2.risk.reduceHighlight" }
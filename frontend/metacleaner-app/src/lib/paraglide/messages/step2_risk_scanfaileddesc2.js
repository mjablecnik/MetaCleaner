/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_Scanfaileddesc2Inputs */

const en_step2_risk_scanfaileddesc2 = /** @type {(inputs: Step2_Risk_Scanfaileddesc2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not analyze the uploaded files. Remove them and try again.`)
};

const cs_step2_risk_scanfaileddesc2 = /** @type {(inputs: Step2_Risk_Scanfaileddesc2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Soubory se nepodařilo analyzovat. Odeberte je a zkuste znovu.`)
};

/**
* | output |
* | --- |
* | "Could not analyze the uploaded files. Remove them and try again." |
*
* @param {Step2_Risk_Scanfaileddesc2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_scanfaileddesc2 = /** @type {((inputs?: Step2_Risk_Scanfaileddesc2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Scanfaileddesc2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_scanfaileddesc2(inputs)
	return cs_step2_risk_scanfaileddesc2(inputs)
});
export { step2_risk_scanfaileddesc2 as "step2.risk.scanFailedDesc" }
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Actions_Viewreport1Inputs */

const en_step5_actions_viewreport1 = /** @type {(inputs: Step5_Actions_Viewreport1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View report`)
};

const cs_step5_actions_viewreport1 = /** @type {(inputs: Step5_Actions_Viewreport1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zobrazit report`)
};

/**
* | output |
* | --- |
* | "View report" |
*
* @param {Step5_Actions_Viewreport1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_actions_viewreport1 = /** @type {((inputs?: Step5_Actions_Viewreport1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Actions_Viewreport1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_actions_viewreport1(inputs)
	return cs_step5_actions_viewreport1(inputs)
});
export { step5_actions_viewreport1 as "step5.actions.viewReport" }
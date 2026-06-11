/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Viewreport1Inputs */

const en_common_viewreport1 = /** @type {(inputs: Common_Viewreport1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View report`)
};

const cs_common_viewreport1 = /** @type {(inputs: Common_Viewreport1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zobrazit report`)
};

/**
* | output |
* | --- |
* | "View report" |
*
* @param {Common_Viewreport1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_viewreport1 = /** @type {((inputs?: Common_Viewreport1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Viewreport1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_viewreport1(inputs)
	return cs_common_viewreport1(inputs)
});
export { common_viewreport1 as "common.viewReport" }
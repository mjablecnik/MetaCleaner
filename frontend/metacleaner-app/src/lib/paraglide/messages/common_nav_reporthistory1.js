/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Nav_Reporthistory1Inputs */

const en_common_nav_reporthistory1 = /** @type {(inputs: Common_Nav_Reporthistory1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Report history`)
};

const cs_common_nav_reporthistory1 = /** @type {(inputs: Common_Nav_Reporthistory1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Historie reportů`)
};

/**
* | output |
* | --- |
* | "Report history" |
*
* @param {Common_Nav_Reporthistory1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_nav_reporthistory1 = /** @type {((inputs?: Common_Nav_Reporthistory1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Nav_Reporthistory1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_common_nav_reporthistory1(inputs)
	return cs_common_nav_reporthistory1(inputs)
});
export { common_nav_reporthistory1 as "common.nav.reportHistory" }
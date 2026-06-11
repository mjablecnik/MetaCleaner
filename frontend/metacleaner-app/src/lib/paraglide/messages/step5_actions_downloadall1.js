/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Actions_Downloadall1Inputs */

const en_step5_actions_downloadall1 = /** @type {(inputs: Step5_Actions_Downloadall1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Download all (ZIP)`)
};

const cs_step5_actions_downloadall1 = /** @type {(inputs: Step5_Actions_Downloadall1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stáhnout vše (ZIP)`)
};

/**
* | output |
* | --- |
* | "Download all (ZIP)" |
*
* @param {Step5_Actions_Downloadall1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_actions_downloadall1 = /** @type {((inputs?: Step5_Actions_Downloadall1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Actions_Downloadall1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_actions_downloadall1(inputs)
	return cs_step5_actions_downloadall1(inputs)
});
export { step5_actions_downloadall1 as "step5.actions.downloadAll" }
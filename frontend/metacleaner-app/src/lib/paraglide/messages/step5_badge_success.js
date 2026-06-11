/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Badge_SuccessInputs */

const en_step5_badge_success = /** @type {(inputs: Step5_Badge_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`100% Successfully completed`)
};

const cs_step5_badge_success = /** @type {(inputs: Step5_Badge_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`100% Úspěšně dokončeno`)
};

/**
* | output |
* | --- |
* | "100% Successfully completed" |
*
* @param {Step5_Badge_SuccessInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_badge_success = /** @type {((inputs?: Step5_Badge_SuccessInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Badge_SuccessInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_badge_success(inputs)
	return cs_step5_badge_success(inputs)
});
export { step5_badge_success as "step5.badge.success" }